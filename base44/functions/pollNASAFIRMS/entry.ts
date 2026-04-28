import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const sources = await base44.asServiceRole.entities.SignalSource.filter({
      source_type: 'wildfire_firms'
    });
    if (sources.length === 0) {
      return Response.json({ error: 'FIRMS source not configured' }, { status: 400 });
    }

    const source = sources[0];
    if (!source.is_enabled) {
      return Response.json({ message: 'FIRMS source disabled' }, { status: 200 });
    }

    const runStartedAt = new Date().toISOString();
    let signalsIngested = 0, skipped = 0, failed = 0;

    try {
      if (!source.api_key) {
        throw new Error('FIRMS API key not configured');
      }

      const resp = await fetch(`${source.api_endpoint}?key=${source.api_key}&format=json`);
      if (!resp.ok) throw new Error(`FIRMS returned ${resp.status}`);

      const fires = await resp.json();
      for (const fire of fires) {
        try {
          const sourceEventId = `firms-${fire.id}`;
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
            event_type: 'Wildfire',
            severity_raw: 'active',
            affected_area_geojson: {
              type: 'Point',
              coordinates: [fire.longitude, fire.latitude]
            },
            event_started_at: new Date().toISOString(),
            title: `Active wildfire - ${fire.latitude}, ${fire.longitude}`,
            source_url: source.api_endpoint,
            raw_payload: fire,
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

    return Response.json({ source: 'FIRMS', signals_ingested: signalsIngested });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});