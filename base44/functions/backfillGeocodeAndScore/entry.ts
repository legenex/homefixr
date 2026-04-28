import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Backfill geocoding and scoring for existing RawSignals
 * One-time operation to populate ScoredSignals from existing RawSignals
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get all RawSignals
    const allRawSignals = await base44.asServiceRole.entities.RawSignal.list('-created_date', 5000);
    let geocoded = 0, scored = 0, failed = 0;

    for (const raw of allRawSignals) {
      try {
        // Check if already scored
        const existingScored = await base44.asServiceRole.entities.ScoredSignal.filter({
          raw_signal_id: raw.id
        });

        if (existingScored.length > 0) {
          continue;
        }

        // Simple inline geocoding from areaDesc
        if (raw.raw_payload?.areaDesc && (!raw.affected_states || raw.affected_states.length === 0)) {
          const parts = raw.raw_payload.areaDesc.split(';').map(p => p.trim());
          const stateMatch = parts.find(p => /^[A-Z]{2}$/.test(p));
          if (stateMatch) {
            await base44.asServiceRole.entities.RawSignal.update(raw.id, {
              affected_states: [stateMatch]
            });
            geocoded++;
          }
        }

        // Fetch updated signal
        const updated = await base44.asServiceRole.entities.RawSignal.get(raw.id);

        // Score it
        const score = scoreSignal(updated);
        await base44.asServiceRole.entities.ScoredSignal.create({
          raw_signal_id: updated.id,
          severity_score: score.severity,
          population_impact_score: score.population,
          wealth_score: score.wealth,
          urgency_score: score.urgency,
          competition_score: score.competition,
          composite_score: score.composite,
          recommended_campaigns: score.campaigns,
          recommended_geo_targeting: updated.affected_zip_codes || updated.affected_states || [],
          recommended_creative_angles: score.angles,
          recommended_buyer_types: score.buyers,
          recommended_daily_budget_low: score.budgetLow,
          recommended_daily_budget_high: score.budgetHigh,
          brief_summary: score.summary,
          status: 'new'
        });
        scored++;
      } catch (e) {
        console.error(`Backfill failed for ${raw.id}: ${e.message}`);
        failed++;
      }
    }

    return Response.json({
      message: 'Backfill complete',
      geocoded,
      scored,
      failed,
      total_processed: allRawSignals.length
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function scoreSignal(rawSignal) {
  const type = rawSignal.event_type?.toLowerCase() || '';
  
  let severity = 3;
  if (type.includes('tornado') || type.includes('hurricane') || type.includes('typhoon')) severity = 9;
  else if (type.includes('flood') || type.includes('flash flood')) severity = 8;
  else if (type.includes('winter storm') || type.includes('ice storm')) severity = 7;
  else if (type.includes('earthquake')) severity = 7;
  else if (type.includes('wildfire')) severity = 7;
  else if (type.includes('heat warning') || type.includes('excessive heat')) severity = 6;
  else if (type.includes('severe thunderstorm') || type.includes('hail')) severity = 6;
  else if (type.includes('wind') || type.includes('high wind')) severity = 5;

  const population = 5;
  const wealth = 6;
  
  let urgency = 4;
  if (type.includes('tornado') || type.includes('flood') || type.includes('flash flood')) urgency = 9;
  else if (type.includes('hurricane') || type.includes('tropical storm')) urgency = 8;
  else if (type.includes('earthquake') || type.includes('wildfire')) urgency = 7;
  else if (type.includes('severe thunderstorm') || type.includes('hail')) urgency = 7;
  else if (type.includes('winter storm') || type.includes('ice storm')) urgency = 6;
  else if (type.includes('excessive heat') || type.includes('heat warning')) urgency = 5;
  
  const competition = severity >= 8 ? 3 : severity >= 6 ? 5 : 7;
  const composite = Math.round((severity * 0.3 + population * 0.25 + wealth * 0.2 + urgency * 0.15 + competition * 0.1) * 10);

  const campaigns = [];
  if (type.includes('flood warning') || type.includes('flash flood warning')) campaigns.push('plumbing', 'home-improvement');
  if (type.includes('tornado warning') || type.includes('severe thunderstorm warning')) campaigns.push('roofing', 'home-improvement');
  if (type.includes('hail') && severity >= 6) campaigns.push('roofing');
  if (type.includes('hurricane warning') || type.includes('tropical storm warning')) campaigns.push('roofing', 'home-improvement', 'electrical');
  if (type.includes('excessive heat warning') || type.includes('heat advisory')) campaigns.push('hvac');
  if (type.includes('hard freeze warning') || type.includes('winter storm warning')) campaigns.push('plumbing', 'hvac');
  if (type.includes('wildfire')) campaigns.push('hvac', 'home-improvement');
  if (type.includes('earthquake') && severity >= 7) campaigns.push('home-improvement', 'plumbing');
  if (campaigns.length === 0) campaigns.push('home-improvement');

  const uniqueCampaigns = [...new Set(campaigns)];

  const states = (rawSignal.affected_states || []).join('/') || 'your area';
  const angles = [`Emergency ${type} repairs needed`, `Licensed contractors ready`, `Get free assessment today`];

  const budgetLow = composite >= 85 ? 5000 : composite >= 70 ? 1500 : 500;
  const budgetHigh = composite >= 85 ? 20000 : composite >= 70 ? 5000 : 1500;

  const summary = `**${rawSignal.event_type}** in ${states}\n\n**Score:** ${composite}/100`;

  const buyerMap = {
    'roofing': 'roofing-contractors',
    'hvac': 'hvac-networks',
    'plumbing': 'plumbing-contractors',
    'home-improvement': 'general-contractors',
    'electrical': 'electrical-contractors'
  };

  return {
    severity,
    population,
    wealth,
    urgency,
    competition,
    composite,
    campaigns: uniqueCampaigns,
    angles,
    buyers: uniqueCampaigns.map(c => buyerMap[c] || c).filter(Boolean),
    budgetLow,
    budgetHigh,
    summary
  };
}