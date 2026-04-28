import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get NOAA source
    const sources = await base44.asServiceRole.entities.SignalSource.filter({
      source_type: 'weather_noaa'
    });

    if (sources.length === 0) {
      return Response.json({ error: 'NOAA source not found' }, { status: 404 });
    }

    const source = sources[0];

    // Get recent SignalRunLogs for NOAA
    const runLogs = await base44.asServiceRole.entities.SignalRunLog.filter({
      source_id: source.id
    }, '-created_date', 5);

    return Response.json({
      source: {
        id: source.id,
        name: source.name,
        last_polled_at: source.last_polled_at,
        last_success_at: source.last_success_at,
        last_error_at: source.last_error_at,
        consecutive_failures: source.consecutive_failures
      },
      recent_run_logs: runLogs.map(log => ({
        id: log.id,
        run_started_at: log.run_started_at,
        run_finished_at: log.run_finished_at,
        signals_ingested: log.signals_ingested,
        signals_skipped_duplicate: log.signals_skipped_duplicate,
        signals_failed: log.signals_failed
      }))
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});