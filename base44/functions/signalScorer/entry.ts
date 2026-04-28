import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Scoring engine — converts RawSignal to ScoredSignal
 * Called after every raw signal ingestion
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { raw_signal_id } = await req.json();
    if (!raw_signal_id) {
      return Response.json({ error: 'raw_signal_id required' }, { status: 400 });
    }

    // Fetch the raw signal (use service role for backend function invocation)
    const rawSignal = await base44.asServiceRole.entities.RawSignal.get(raw_signal_id);
    if (!rawSignal) {
      return Response.json({ error: 'RawSignal not found' }, { status: 404 });
    }

    // Fetch settings for weights
    const settings = await base44.asServiceRole.entities.SignalEngineSettings.list();
    const config = settings.length > 0 ? settings[0] : getDefaultSettings();

    // Score components (1-10)
    const severity = scoreSeverity(rawSignal.event_type, rawSignal.severity_raw);
    const population = scorePopulation(rawSignal.affected_zip_codes); // Mock for now
    const wealth = scoreWealth(rawSignal.affected_zip_codes); // Mock for now
    const urgency = scoreUrgency(rawSignal.event_type);
    const competition = scoreCompetition(rawSignal.affected_states, severity);

    // Composite score (weighted 1-100)
    const weights = config.scoring_weights || {
      severity: 0.30,
      population: 0.25,
      wealth: 0.20,
      urgency: 0.15,
      competition: 0.10
    };

    const composite = Math.round(
      (severity * weights.severity +
        population * weights.population +
        wealth * weights.wealth +
        urgency * weights.urgency +
        competition * weights.competition) * 10
    );

    // Map to campaigns
    const campaigns = mapEventToCampaigns(rawSignal.event_type);

    // Generate creative angles
    const angles = generateCreativeAngles(rawSignal.event_type, rawSignal.affected_states, rawSignal.title);

    // Budget recommendation
    const { budgetLow, budgetHigh } = budgetFromScore(composite);

    // Summary
    const briefSummary = generateBriefSummary(rawSignal, composite, severity, population, wealth, urgency, competition);

    // Create ScoredSignal
    const scoredSignal = await base44.asServiceRole.entities.ScoredSignal.create({
      raw_signal_id,
      severity_score: severity,
      population_impact_score: population,
      wealth_score: wealth,
      urgency_score: urgency,
      competition_score: competition,
      composite_score: composite,
      recommended_campaigns: campaigns,
      recommended_geo_targeting: rawSignal.affected_zip_codes || [],
      recommended_creative_angles: angles,
      recommended_buyer_types: buyerTypesForCampaigns(campaigns),
      recommended_daily_budget_low: budgetLow,
      recommended_daily_budget_high: budgetHigh,
      brief_summary: briefSummary,
      status: 'new'
    });

    console.log(`Scored signal ${raw_signal_id} → composite ${composite}`);

    return Response.json({
      scored_signal_id: scoredSignal.id,
      composite_score: composite,
      severity,
      population,
      wealth,
      urgency,
      competition
    });
  } catch (error) {
    console.error('Scoring error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function getDefaultSettings() {
  return {
    scoring_weights: {
      severity: 0.30,
      population: 0.25,
      wealth: 0.20,
      urgency: 0.15,
      competition: 0.10
    }
  };
}

function scoreSeverity(eventType, severityRaw) {
  const type = eventType.toLowerCase();
  if (type.includes('tornado') || type.includes('hurricane') || type.includes('typhoon')) {
    return 9;
  }
  if (type.includes('severe thunderstorm') && type.includes('hail') && type.includes('1 inch')) {
    return 8;
  }
  if (type.includes('flood') || type.includes('flash flood')) {
    return 8;
  }
  if (type.includes('winter storm') || type.includes('ice storm')) {
    return 7;
  }
  if (type.includes('earthquake') || type.includes('wildfire')) {
    return 7;
  }
  if (type.includes('heat warning') || type.includes('excessive heat')) {
    return 6;
  }
  if (type.includes('wind') || type.includes('thunderstorm')) {
    return 5;
  }
  return 3;
}

function scorePopulation(zips) {
  // Mock: would integrate with Census data
  // For now, return middle-range score
  return 5;
}

function scoreWealth(zips) {
  // Mock: would integrate with ACS income data
  return 6;
}

function scoreUrgency(eventType) {
  const type = eventType.toLowerCase();
  if (type.includes('hail') || type.includes('tornado') || type.includes('flood')) {
    return 9;
  }
  if (type.includes('hurricane') || type.includes('earthquake')) {
    return 8;
  }
  if (type.includes('wildfire')) {
    return 6;
  }
  if (type.includes('heat') || type.includes('cold')) {
    return 6;
  }
  return 5;
}

function scoreCompetition(states, severity) {
  // Inverted: lower = less competition = better
  if (severity >= 8) {
    // Major events attract competition
    return 3;
  }
  // Smaller events = less crowded
  return 7;
}

function mapEventToCampaigns(eventType) {
  const type = eventType.toLowerCase();
  const campaigns = [];

  if (type.includes('hail') || type.includes('tornado') || type.includes('severe thunderstorm')) {
    campaigns.push('roofing', 'home-improvement');
  }
  if (type.includes('hurricane') || type.includes('tropical storm')) {
    campaigns.push('roofing', 'home-improvement');
  }
  if (type.includes('flood') || type.includes('water')) {
    campaigns.push('plumbing', 'home-improvement');
  }
  if (type.includes('earthquake')) {
    campaigns.push('home-improvement');
  }
  if (type.includes('wildfire') || type.includes('fire')) {
    campaigns.push('home-improvement', 'hvac');
  }
  if (type.includes('heat warning') || type.includes('excessive heat')) {
    campaigns.push('hvac');
  }
  if (type.includes('cold') || type.includes('freeze') || type.includes('winter')) {
    campaigns.push('hvac', 'plumbing');
  }

  return campaigns.length > 0 ? campaigns : ['home-improvement'];
}

function buyerTypesForCampaigns(campaigns) {
  // Map campaign slugs to buyer types
  const buyerMap = {
    roofing: 'roofing-contractors',
    hvac: 'hvac-networks',
    plumbing: 'plumbing-contractors',
    'home-improvement': 'general-contractors'
  };
  return campaigns.map(c => buyerMap[c] || c).filter(Boolean);
}

function generateCreativeAngles(eventType, states, title) {
  const stateStr = (states || []).join('/') || 'your area';
  const type = eventType.toLowerCase();
  const angles = [];

  if (type.includes('hail') || type.includes('roof')) {
    angles.push(
      `🚨 Hail damage in ${stateStr}? File your insurance claim before the deadline.`,
      `Free roof inspection for hail damage — insurance may cover it.`,
      `Local roofers available NOW for emergency damage assessment.`,
      `Don't wait — hail damage claims have time limits. Get quotes today.`,
      `Roof damage from hail? We'll match you with licensed local roofers.`
    );
  } else if (type.includes('flood') || type.includes('water')) {
    angles.push(
      `Flood damage in your area? Mold sets in fast. Get restoration quotes now.`,
      `Water damage from flooding? Licensed restoration pros available.`,
      `Act fast — water damage remediation is time-critical.`,
      `Flooded basement? Local remediation teams available immediately.`,
      `Prevent mold — get water damage assessment and quotes today.`
    );
  } else if (type.includes('wildfire') || type.includes('smoke')) {
    angles.push(
      `Smoke damage in ${stateStr}? HVAC and air filter experts standing by.`,
      `Wildfire smoke affecting your air quality? Get air purification quotes.`,
      `Protect your family — professional HVAC cleaning after fire/smoke.`,
      `Air quality emergency — HVAC professionals available for emergency service.`,
      `Smoke damage to HVAC? Get professional remediation quotes today.`
    );
  } else if (type.includes('heat')) {
    angles.push(
      `Excessive heat warning in ${stateStr} — HVAC pros available for repairs.`,
      `AC breakdown during heat wave? Emergency cooling systems available.`,
      `Beat the heat — get AC repair or upgrade quotes from local pros.`,
      `Heat wave hitting — don't delay AC repair. Find pros now.`,
      `Stay cool — emergency HVAC service available in your area.`
    );
  } else if (type.includes('cold') || type.includes('freeze')) {
    angles.push(
      `Hard freeze warning — pipe burst prevention and emergency heating.`,
      `Frozen pipes in ${stateStr}? Plumbers available for emergency service.`,
      `Winter storm approaching — get HVAC and heating quotes now.`,
      `Freeze warning — protect your pipes. Licensed plumbers available.`,
      `Ice storm damage? Emergency heating and plumbing pros standing by.`
    );
  }

  return angles.slice(0, 5);
}

function budgetFromScore(score) {
  if (score >= 85) {
    return { budgetLow: 5000, budgetHigh: 20000 };
  } else if (score >= 70) {
    return { budgetLow: 1500, budgetHigh: 5000 };
  } else {
    return { budgetLow: 500, budgetHigh: 1500 };
  }
}

function generateBriefSummary(signal, composite, severity, population, wealth, urgency, competition) {
  return `
**${signal.event_type} in ${(signal.affected_states || []).join(', ')}**

Composite Score: ${composite}/100 | Severity: ${severity}/10 | Urgency: ${urgency}/10

This ${signal.event_type.toLowerCase()} event in ${(signal.affected_states || []).join('/')} presents a ${composite >= 85 ? 'CRITICAL' : composite >= 70 ? 'HIGH' : 'MODERATE'} opportunity.
Affected areas: ${(signal.affected_zip_codes || []).slice(0, 5).join(', ')}${(signal.affected_zip_codes || []).length > 5 ? '...' : ''}.

The quick turnaround (${urgency >= 8 ? '24-48 hours' : urgency >= 6 ? '3-7 days' : '1-2 weeks'}) and targeted geography make this ideal for focused campaign deployment.
`.trim();
}