import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const sources = await base44.asServiceRole.entities.SignalSource.filter({
      source_type: 'air_quality_epa'
    });
    if (sources.length === 0) {
      return Response.json({ error: 'EPA source not configured' }, { status: 400 });
    }

    const source = sources[0];
    if (!source.is_enabled) {
      return Response.json({ message: 'EPA source disabled' }, { status: 200 });
    }

    const runStartedAt = new Date().toISOString();
    let signalsIngested = 0, skipped = 0, failed = 0;

    try {
      if (!source.api_key) {
        throw new Error('EPA API key not configured');
      }

      // AirNow API returns current conditions
      const resp = await fetch(`https://api.airnowapi.org/aqi/observation/latLong/current/?format=JSON&latitude=37.7749&longitude=-122.4194&distance=25&API_KEY=${source.api_key}`);
      if (!resp.ok) throw new Error(`EPA returned ${resp.status}`);

      const data = await resp.json();
      
      for (const obs of data) {
        try {
          if (obs.AQI < 150) {
            skipped++;
            continue;
          }

          const sourceEventId = `epa-${obs.ReportingArea}-${Date.now()}`;
          const existing = await base44.asServiceRole.entities.RawSignal.filter({
            source_id: source.id,
            source_event_id: sourceEventId
          });

          if (existing.length > 0) {
            skipped++;
            continue;
          }

          await base44.asServiceRole.entities.RawSignal.create({
            source_id: source.id,
            source_event_id: sourceEventId,
            event_type: 'Air Quality Alert',
            event_subtype: obs.Category || 'Unhealthy',
            severity_raw: String(obs.AQI),
            event_started_at: new Date().toISOString(),
            title: `${obs.ReportingArea} - AQI ${obs.AQI}`,
            description: `Air quality index: ${obs.AQI}`,
            source_url: 'https://www.airnow.gov',
            raw_payload: obs,
            ingested_at: new Date().toISOString()
          });

          signalsIngested++;
        } catch (e) {
          failed++;
        }
      }

      await base44.asServiceRole.entities.SignalSource.update(source.id, {
        last_polled_at: new Date().toISOString(),
        last_success_at: new Date().toISOString(),
        consecutive_failures: 0
      });
    } catch (e) {
      const newFailures = (source.consecutive_failures || 0) + 1;
      await base44.asServiceRole.entities.SignalSource.update(source.id, {
        last_polled_at: new Date().toISOString(),
        last_error_at: new Date().toISOString(),
        last_error_message: e.message,
        consecutive_failures: newFailures,
        circuit_breaker_open: newFailures >= 5
      });
    }

    await base44.asServiceRole.entities.SignalRunLog.create({
      source_id: source.id,
      run_started_at: runStartedAt,
      run_finished_at: new Date().toISOString(),
      signals_ingested: signalsIngested,
      signals_skipped_duplicate: skipped,
      signals_failed: failed
    });

    return Response.json({ source: 'EPA', signals_ingested: signalsIngested });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});