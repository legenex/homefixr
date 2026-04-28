import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Generate realistic test signals for dashboard demo
 * Creates sample RawSignal and ScoredSignal records
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get or create NOAA source
    let sources = await base44.asServiceRole.entities.SignalSource.filter({
      source_type: 'weather_noaa'
    });

    let sourceId;
    if (sources.length === 0) {
      const newSource = await base44.asServiceRole.entities.SignalSource.create({
        name: 'NOAA Weather Alerts',
        source_type: 'weather_noaa',
        api_endpoint: 'https://api.weather.gov/alerts/active',
        poll_interval_minutes: 30,
        is_enabled: true
      });
      sourceId = newSource.id;
    } else {
      sourceId = sources[0].id;
    }

    // Test data
    const testAlerts = [
      {
        title: 'Tornado Warning - Texas',
        event_type: 'Tornado Warning',
        severity_raw: 'Extreme',
        affected_states: ['TX'],
        affected_zip_codes: ['75001', '75002', '75201', '75202', '75203'],
        description: 'A tornado warning is in effect for parts of North Texas.'
      },
      {
        title: 'Severe Thunderstorm Warning - Oklahoma',
        event_type: 'Severe Thunderstorm Warning',
        severity_raw: 'Severe',
        affected_states: ['OK'],
        affected_zip_codes: ['73119', '73120', '73121'],
        description: 'Severe thunderstorms with large hail and damaging winds expected.'
      },
      {
        title: 'Flood Warning - Missouri',
        event_type: 'Flood Warning',
        severity_raw: 'Moderate',
        affected_states: ['MO'],
        affected_zip_codes: ['64101', '64102', '64103'],
        description: 'Flash flooding occurring in low-lying areas.'
      },
      {
        title: 'Hurricane Warning - Florida',
        event_type: 'Hurricane Warning',
        severity_raw: 'Extreme',
        affected_states: ['FL'],
        affected_zip_codes: ['33101', '33102', '33103', '33104', '33105'],
        description: 'Hurricane conditions expected to arrive within 24 hours.'
      },
      {
        title: 'Winter Storm Warning - Colorado',
        event_type: 'Winter Storm Warning',
        severity_raw: 'Moderate',
        affected_states: ['CO'],
        affected_zip_codes: ['80202', '80203', '80204'],
        description: 'Heavy snow and strong winds expected.'
      }
    ];

    let created = 0;

    for (const alert of testAlerts) {
      const sourceEventId = `test-${alert.event_type.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}`;

      // Create RawSignal
      const rawSignal = await base44.asServiceRole.entities.RawSignal.create({
        source_id: sourceId,
        source_event_id: sourceEventId,
        event_type: alert.event_type,
        event_subtype: alert.severity_raw,
        severity_raw: alert.severity_raw,
        affected_states: alert.affected_states,
        affected_zip_codes: alert.affected_zip_codes,
        affected_counties: [],
        affected_area_geojson: { type: 'Feature', geometry: { type: 'Point', coordinates: [0, 0] } },
        event_started_at: new Date().toISOString(),
        event_ended_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        title: alert.title,
        description: alert.description,
        source_url: 'https://api.weather.gov/alerts/active',
        raw_payload: { severity: alert.severity_raw },
        ingested_at: new Date().toISOString()
      });

      // Map severity to score
      const severityMap = { Extreme: 9, Severe: 7, Moderate: 5 };
      const severity = severityMap[alert.severity_raw] || 5;

      // Create ScoredSignal
      await base44.asServiceRole.entities.ScoredSignal.create({
        raw_signal_id: rawSignal.id,
        severity_score: severity,
        population_impact_score: Math.random() * 4 + 6,
        wealth_score: Math.random() * 3 + 5,
        competition_score: Math.random() * 5 + 3,
        urgency_score: severity,
        composite_score: Math.round((severity * 0.3 + (Math.random() * 4 + 6) * 0.25 + (Math.random() * 3 + 5) * 0.2 + severity * 0.15 + (Math.random() * 5 + 3) * 0.1) * 10),
        recommended_campaigns: ['roofing', 'hvac', 'home-improvement'],
        recommended_geo_targeting: alert.affected_zip_codes,
        recommended_creative_angles: [
          `Storm damage? We help homeowners with ${alert.event_type.toLowerCase()} cleanup.`,
          `Protect your home from ${alert.event_type.toLowerCase()} damage.`,
          `Fast, reliable repairs after weather events.`
        ],
        recommended_buyer_types: ['general-contractor', 'roofer', 'hvac'],
        recommended_daily_budget_low: 500,
        recommended_daily_budget_high: 1500,
        brief_summary: `${alert.title}\n\n${alert.description}\n\nAffected areas: ${alert.affected_zip_codes.join(', ')}\n\nRecommended campaigns: roofing, HVAC, general home improvement.`,
        status: 'new'
      });

      created++;
    }

    return Response.json({
      message: 'Test signals generated',
      created,
      source_id: sourceId
    });
  } catch (error) {
    console.error('Test signal error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});