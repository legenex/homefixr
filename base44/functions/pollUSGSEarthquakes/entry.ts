import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * USGS Earthquake Feed Adapter
 * Polls significant earthquakes from the past week
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const sources = await base44.asServiceRole.entities.SignalSource.filter({
      source_type: 'earthquake_usgs'
    });
    if (sources.length === 0) {
      return Response.json({ error: 'USGS source not configured' }, { status: 400 });
    }

    const source = sources[0];
    if (!source.is_enabled) {
      return Response.json({ message: 'USGS source disabled' }, { status: 200 });
    }

    const runStartedAt = new Date().toISOString();
    let signalsIngested = 0, skipped = 0, failed = 0;
    let errorSummary = '';

    try {
      const resp = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_week.geojson');
      if (!resp.ok) throw new Error(`USGS returned ${resp.status}`);

      const data = await resp.json();
      const quakes = data.features || [];

      for (const quake of quakes) {
        try {
          const props = quake.properties || {};
          const coords = quake.geometry?.coordinates || [0, 0];
          const magnitude = props.mag || 0;

          if (magnitude < 4.5) {
            skipped++;
            continue;
          }

          const sourceEventId = `usgs-${props.code}`;
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
            event_type: `Earthquake M${magnitude}`,
            event_subtype: `${magnitude}`,
            severity_raw: String(magnitude),
            affected_area_geojson: {
              type: 'Point',
              coordinates: coords
            },
            event_started_at: new Date(props.time).toISOString(),
            title: `${props.place} - Magnitude ${magnitude}`,
            description: props.title || '',
            source_url: props.url || 'https://earthquake.usgs.gov',
            raw_payload: props,
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
      errorSummary = e.message;
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
      signals_failed: failed,
      error_summary: errorSummary
    });

    return Response.json({ source: 'USGS', signals_ingested: signalsIngested, signals_skipped: skipped, signals_failed: failed });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});