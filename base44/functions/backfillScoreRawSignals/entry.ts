import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Fetch all RawSignals
    const allRawSignals = await base44.asServiceRole.entities.RawSignal.list('-created_date', 5000);
    let scored = 0;
    let failed = 0;

    for (const raw of allRawSignals) {
      try {
        // Check if already scored
        const existing = await base44.asServiceRole.entities.ScoredSignal.filter({
          raw_signal_id: raw.id
        });

        if (existing.length > 0) {
          continue;
        }

        // Score inline to avoid rate limiting
        const scoreResult = scoreRawSignalInline(raw);

        await base44.asServiceRole.entities.ScoredSignal.create({
          raw_signal_id: raw.id,
          severity_score: scoreResult.severityScore,
          population_impact_score: scoreResult.populationScore,
          wealth_score: scoreResult.wealthScore,
          urgency_score: scoreResult.urgencyScore,
          competition_score: scoreResult.competitionScore,
          composite_score: scoreResult.compositeScore,
          recommended_campaigns: scoreResult.campaigns,
          recommended_geo_targeting: scoreResult.recommendedGeoTargeting,
          recommended_creative_angles: scoreResult.recommendedCreativeAngles,
          recommended_buyer_types: [],
          recommended_daily_budget_low: scoreResult.recommendedDailyBudgetLow,
          recommended_daily_budget_high: scoreResult.recommendedDailyBudgetHigh,
          brief_summary: scoreResult.briefSummary,
          status: 'new'
        });

        scored++;
      } catch (e) {
        console.error(`Backfill scoring failed for ${raw.id}: ${e.message}`);
        failed++;
      }
    }

    return Response.json({
      message: 'Backfill complete',
      scored,
      failed,
      total_processed: allRawSignals.length
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function scoreRawSignalInline(rawSignal) {
  const eventType = rawSignal.event_type || '';

  const severityMap = {
    'Tornado Warning': 10,
    'Hurricane Warning': 10,
    'Flash Flood Warning': 8,
    'Severe Thunderstorm Warning': 7,
    'Flood Warning': 6,
    'Excessive Heat Warning': 6,
    'Hard Freeze Warning': 6,
    'Winter Storm Warning': 6,
    'Wildfire': 8,
    'Earthquake': 7,
    'Air Quality': 5
  };

  const severityScore = severityMap[eventType] || 5;
  const populationScore = 5;
  const wealthScore = 5;
  const urgencyScore = 6;
  const competitionScore = 5;

  const compositeScore = Math.round(
    (severityScore * 0.30 + populationScore * 0.25 + wealthScore * 0.20 + urgencyScore * 0.15 + competitionScore * 0.10) * 10
  );

  let campaigns = ['home-improvement'];
  if (eventType.includes('Tornado') || eventType.includes('Severe Thunderstorm') || eventType.includes('Hurricane')) {
    campaigns = ['roofing', 'home-improvement'];
  } else if (eventType.includes('Flood') || eventType.includes('Flash Flood')) {
    campaigns = ['plumbing', 'home-improvement'];
  } else if (eventType.includes('Heat') || eventType.includes('Hard Freeze') || eventType.includes('Winter')) {
    campaigns = ['hvac', 'plumbing'];
  } else if (eventType.includes('Wildfire')) {
    campaigns = ['hvac'];
  } else if (eventType.includes('Earthquake')) {
    campaigns = ['plumbing', 'home-improvement'];
  }

  const states = new Set();
  const titleMatch = rawSignal.title || '';
  const parts = titleMatch.split('-').slice(1).join('-').split(';');
  for (const part of parts) {
    const stateMatch = part.match(/([A-Z]{2})\s*$/);
    if (stateMatch) {
      states.add(stateMatch[1]);
    }
  }
  const recommendedGeoTargeting = Array.from(states);

  const stateStr = recommendedGeoTargeting.length > 0 ? recommendedGeoTargeting.join('/') : 'your area';
  const recommendedCreativeAngles = [
    `Damage from ${eventType} in ${stateStr}? Get free repair quotes.`,
    `Protect your home after ${eventType} — vetted local pros available.`,
    `${eventType} just hit your area — act fast on repairs.`
  ];

  const briefSummary = `${eventType} in ${stateStr}. Composite score: ${compositeScore}/100. Recommended campaigns: ${campaigns.join(', ')}. Act quickly to connect homeowners with contractors for emergency repairs.`;

  return {
    severityScore,
    populationScore,
    wealthScore,
    urgencyScore,
    competitionScore,
    compositeScore,
    campaigns,
    recommendedGeoTargeting,
    recommendedCreativeAngles,
    recommendedDailyBudgetLow: 500,
    recommendedDailyBudgetHigh: 2000,
    briefSummary
  };
}