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

          // Trigger scoring
          await base44.asServiceRole.functions.invoke('signalScorer', {
            raw_signal_id: rawSignal.id
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