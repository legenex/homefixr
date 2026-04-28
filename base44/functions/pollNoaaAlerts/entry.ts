import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * NOAA Weather Alerts Adapter
 * Polls https://api.weather.gov/alerts/active
 * Filters for home-service-relevant alert types
 * Dedupes by alert ID and creates RawSignals
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Fetch NOAA source config
    const sources = await base44.asServiceRole.entities.SignalSource.filter({
      source_type: 'weather_noaa'
    });
    if (sources.length === 0) {
      return Response.json({ error: 'NOAA source not configured' }, { status: 400 });
    }

    const source = sources[0];
    if (!source.is_enabled) {
      return Response.json({ message: 'NOAA source disabled' }, { status: 200 });
    }

    if (source.circuit_breaker_open) {
      return Response.json({ error: 'Circuit breaker open, manual reset required' }, { status: 400 });
    }

    const runStartedAt = new Date().toISOString();
    let signalsIngested = 0,
      skipped = 0,
      failed = 0;
    let errorSummary = '';

    try {
      // Fetch alerts from NOAA
      const noaaResp = await fetch('https://api.weather.gov/alerts/active', {
        headers: { 'User-Agent': 'HomeFixr Signal Engine (admin@homefixr.com)' }
      });
      if (!noaaResp.ok) {
        throw new Error(`NOAA API returned ${noaaResp.status}`);
      }

      const noaaData = await noaaResp.json();
      const alerts = noaaData.features || [];

      // Relevant alert types for home services
      const RELEVANT_ALERT_TYPES = [
        'Tornado Warning',
        'Severe Thunderstorm Warning',
        'Flood Warning',
        'Flash Flood Warning',
        'Winter Storm Warning',
        'Ice Storm Warning',
        'High Wind Warning',
        'Hurricane Warning',
        'Tropical Storm Warning',
        'Excessive Heat Warning',
        'Hard Freeze Warning'
      ];

      for (const alert of alerts) {
        try {
          const props = alert.properties || {};
          const alertType = props.event || '';

          // Skip non-relevant alerts
          if (!RELEVANT_ALERT_TYPES.includes(alertType)) {
            skipped++;
            continue;
          }

          const sourceEventId = props.id || `noaa-${props.areaDesc}-${Date.now()}`;

          // Dedupe check
          const existing = await base44.asServiceRole.entities.RawSignal.filter({
            source_id: source.id,
            source_event_id: sourceEventId
          });

          if (existing.length > 0) {
            skipped++;
            continue;
          }

          // Extract geo
          const geometry = alert.geometry || {};
          const coordinates = geometry.coordinates || [];
          let affectedStates = [];
          try {
            affectedStates = (props.areaDesc || '').split(';').map(s => {
              const match = s.trim().match(/^([A-Z]{2})/);
              return match ? match[1] : null;
            }).filter(Boolean);
          } catch (e) {
            // noop
          }

          // Create RawSignal
          const rawSignal = await base44.asServiceRole.entities.RawSignal.create({
            source_id: source.id,
            source_event_id: sourceEventId,
            event_type: alertType,
            event_subtype: props.severity || '',
            severity_raw: props.severity || '',
            affected_area_geojson: geometry,
            affected_states: affectedStates,
            affected_counties: [],
            affected_zip_codes: [],
            event_started_at: props.effective || new Date().toISOString(),
            event_ended_at: props.expires || null,
            title: `${alertType} - ${props.areaDesc || 'Active'}`,
            description: props.description || props.headline || '',
            source_url: props.url || 'https://api.weather.gov/alerts/active',
            raw_payload: props,
            ingested_at: new Date().toISOString()
          });

          signalsIngested++;

          // Score the signal
          const score = scoreSignal(rawSignal);
          
          // Create ScoredSignal directly
          await base44.asServiceRole.entities.ScoredSignal.create({
            raw_signal_id: rawSignal.id,
            severity_score: score.severity,
            population_impact_score: score.population,
            wealth_score: score.wealth,
            urgency_score: score.urgency,
            competition_score: score.competition,
            composite_score: score.composite,
            recommended_campaigns: score.campaigns,
            recommended_geo_targeting: rawSignal.affected_zip_codes || [],
            recommended_creative_angles: score.angles.slice(0, 5),
            recommended_buyer_types: score.buyers,
            recommended_daily_budget_low: score.budgetLow,
            recommended_daily_budget_high: score.budgetHigh,
            brief_summary: score.summary,
            status: 'new'
          });
        } catch (e) {
          console.error(`Alert processing error: ${e.message}`);
          failed++;
        }
      }

      // Update source
      await base44.asServiceRole.entities.SignalSource.update(source.id, {
        last_polled_at: new Date().toISOString(),
        last_success_at: new Date().toISOString(),
        consecutive_failures: 0
      });
    } catch (e) {
      console.error(`Poll error: ${e.message}`);
      errorSummary = e.message;
      failed++;

      // Increment circuit breaker
      const newFailures = (source.consecutive_failures || 0) + 1;
      const breaker = newFailures >= 5;

      await base44.asServiceRole.entities.SignalSource.update(source.id, {
        last_polled_at: new Date().toISOString(),
        last_error_at: new Date().toISOString(),
        last_error_message: e.message,
        consecutive_failures: newFailures,
        circuit_breaker_open: breaker
      });

      if (breaker) {
        console.error('Circuit breaker opened after 5 failures');
      }
    }

    // Log run
    await base44.asServiceRole.entities.SignalRunLog.create({
      source_id: source.id,
      run_started_at: runStartedAt,
      run_finished_at: new Date().toISOString(),
      signals_ingested: signalsIngested,
      signals_skipped_duplicate: skipped,
      signals_failed: failed,
      error_summary: errorSummary
    });

    return Response.json({
      source: 'NOAA',
      signals_ingested: signalsIngested,
      signals_skipped: skipped,
      signals_failed: failed
    });
  } catch (error) {
    console.error('Poll function error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function scoreSignal(rawSignal) {
  const type = rawSignal.event_type?.toLowerCase() || '';
  
  // Severity (1-10)
  let severity = 3;
  if (type.includes('tornado') || type.includes('hurricane') || type.includes('typhoon')) severity = 9;
  else if (type.includes('flood') || type.includes('flash flood')) severity = 8;
  else if (type.includes('winter storm') || type.includes('ice storm')) severity = 7;
  else if (type.includes('earthquake') || type.includes('wildfire')) severity = 7;
  else if (type.includes('heat warning') || type.includes('excessive heat')) severity = 6;
  else if (type.includes('wind') || type.includes('thunderstorm')) severity = 5;

  const population = 5; // Mock
  const wealth = 6; // Mock
  
  let urgency = 5;
  if (type.includes('hail') || type.includes('tornado') || type.includes('flood')) urgency = 9;
  else if (type.includes('hurricane') || type.includes('earthquake')) urgency = 8;
  else if (type.includes('wildfire')) urgency = 6;
  
  const competition = severity >= 8 ? 3 : 7; // Inverted

  const composite = Math.round((severity * 0.3 + population * 0.25 + wealth * 0.2 + urgency * 0.15 + competition * 0.1) * 10);

  const campaigns = [];
  if (type.includes('hail') || type.includes('tornado') || type.includes('severe')) campaigns.push('roofing', 'home-improvement');
  if (type.includes('hurricane') || type.includes('tropical')) campaigns.push('roofing', 'home-improvement');
  if (type.includes('flood') || type.includes('water')) campaigns.push('plumbing', 'home-improvement');
  if (type.includes('wildfire') || type.includes('fire')) campaigns.push('home-improvement', 'hvac');
  if (type.includes('heat')) campaigns.push('hvac');
  if (type.includes('cold') || type.includes('freeze') || type.includes('winter')) campaigns.push('hvac', 'plumbing');
  if (campaigns.length === 0) campaigns.push('home-improvement');

  const states = (rawSignal.affected_states || []).join('/') || 'your area';
  const angles = [];
  if (type.includes('hail') || type.includes('roof')) {
    angles.push(`Hail damage in ${states}? Get free roof inspection & insurance claim help.`, `Licensed roofers available NOW for emergency assessment.`);
  } else if (type.includes('flood')) {
    angles.push(`Flood damage? Act fast — mold sets in quick. Get restoration quotes.`, `Water damage remediation available 24/7.`);
  } else if (type.includes('hurricane')) {
    angles.push(`Hurricane damage in ${states}? Emergency repairs available.`, `Storm damage? Licensed contractors ready for restoration.`);
  } else if (type.includes('heat')) {
    angles.push(`Heat wave? AC breakdown? Emergency HVAC service available.`, `Beat the heat — AC repair & upgrades from local pros.`);
  } else if (type.includes('cold') || type.includes('freeze')) {
    angles.push(`Frozen pipes? Emergency plumbing service available.`, `Winter storm? HVAC & heating pros standing by.`);
  } else {
    angles.push(`Emergency home repairs available in your area.`, `Licensed contractors ready to help with storm damage.`);
  }

  const budgetLow = composite >= 85 ? 5000 : composite >= 70 ? 1500 : 500;
  const budgetHigh = composite >= 85 ? 20000 : composite >= 70 ? 5000 : 1500;

  const summary = `**${rawSignal.event_type}** in ${states}\n\nComposite Score: ${composite}/100\n\nAffected areas: ${(rawSignal.affected_zip_codes || []).slice(0, 5).join(', ')}`;

  return {
    severity,
    population,
    wealth,
    urgency,
    competition,
    composite,
    campaigns,
    angles,
    buyers: campaigns.map(c => ({ roofing: 'roofing-contractors', hvac: 'hvac-networks', plumbing: 'plumbing-contractors', 'home-improvement': 'general-contractors' }[c] || c)).filter(Boolean),
    budgetLow,
    budgetHigh,
    summary
  };
}