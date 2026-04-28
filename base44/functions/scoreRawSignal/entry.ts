import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { raw_signal_id } = await req.json();

    if (!raw_signal_id) {
      return Response.json({ error: 'raw_signal_id required' }, { status: 400 });
    }

    // Fetch the RawSignal
    const rawSignal = await base44.asServiceRole.entities.RawSignal.get(raw_signal_id);
    if (!rawSignal) {
      return Response.json({ error: 'RawSignal not found' }, { status: 404 });
    }

    const eventType = rawSignal.event_type || '';

    // 1. Compute severity_score
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

    // 2-4. Static defaults and composite score
    const populationScore = 5;
    const wealthScore = 5;
    const urgencyScore = 6;
    const competitionScore = 5;

    const compositeScore = Math.round(
      (severityScore * 0.30 + populationScore * 0.25 + wealthScore * 0.20 + urgencyScore * 0.15 + competitionScore * 0.10) * 10
    );

    // 5. Recommended campaigns by event type
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

    // 6. Extract state codes from title
    // Format: "Event - County, ST; County, ST"
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

    // 7. Generate creative angles
    const stateStr = recommendedGeoTargeting.length > 0 ? recommendedGeoTargeting.join('/') : 'your area';
    const recommendedCreativeAngles = [
      `Damage from ${eventType} in ${stateStr}? Get free repair quotes.`,
      `Protect your home after ${eventType} — vetted local pros available.`,
      `${eventType} just hit your area — act fast on repairs.`
    ];

    // 8. Budget
    const recommendedDailyBudgetLow = 500;
    const recommendedDailyBudgetHigh = 2000;

    // 9. Brief summary
    const briefSummary = `${eventType} in ${stateStr}. Composite score: ${compositeScore}/100. Recommended campaigns: ${campaigns.join(', ')}. Act quickly to connect homeowners with contractors for emergency repairs.`;

    // 10-11. Create ScoredSignal
    const scoredSignal = await base44.asServiceRole.entities.ScoredSignal.create({
      raw_signal_id,
      severity_score: severityScore,
      population_impact_score: populationScore,
      wealth_score: wealthScore,
      urgency_score: urgencyScore,
      competition_score: competitionScore,
      composite_score: compositeScore,
      recommended_campaigns: campaigns,
      recommended_geo_targeting: recommendedGeoTargeting,
      recommended_creative_angles: recommendedCreativeAngles,
      recommended_buyer_types: [],
      recommended_daily_budget_low: recommendedDailyBudgetLow,
      recommended_daily_budget_high: recommendedDailyBudgetHigh,
      brief_summary: briefSummary,
      status: 'new'
    });

    return Response.json({
      scored_signal_id: scoredSignal.id,
      composite_score: compositeScore,
      campaigns
    });
  } catch (error) {
    console.error('Scoring error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});