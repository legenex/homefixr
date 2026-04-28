import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Initialize Signal Sources for the Signal Engine
 * Creates default NOAA, USGS, and other sources if they don't exist
 * Run once to set up the system
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Check if NOAA source exists
    const sources = await base44.asServiceRole.entities.SignalSource.filter({
      source_type: 'weather_noaa'
    });

    if (sources.length === 0) {
      // Create NOAA source
      const noaaSource = await base44.asServiceRole.entities.SignalSource.create({
        name: 'NOAA Weather Alerts',
        source_type: 'weather_noaa',
        api_endpoint: 'https://api.weather.gov/alerts/active',
        poll_interval_minutes: 30,
        is_enabled: true,
        consecutive_failures: 0,
        circuit_breaker_open: false
      });

      return Response.json({
        message: 'Signal sources initialized',
        created: {
          noaa: noaaSource.id
        }
      });
    }

    // Update to enabled if disabled
    if (!sources[0].is_enabled) {
      await base44.asServiceRole.entities.SignalSource.update(sources[0].id, {
        is_enabled: true,
        circuit_breaker_open: false,
        consecutive_failures: 0
      });
    }

    return Response.json({
      message: 'NOAA source already configured',
      source: sources[0].id
    });
  } catch (error) {
    console.error('Init error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});