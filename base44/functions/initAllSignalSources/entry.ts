import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Initialize all 8 signal sources with proper configuration
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const SOURCES = [
      {
        name: 'NOAA Weather Alerts',
        source_type: 'weather_noaa',
        api_endpoint: 'https://api.weather.gov/alerts/active',
        poll_interval_minutes: 30,
        is_enabled: true
      },
      {
        name: 'USGS Earthquake Feed',
        source_type: 'earthquake_usgs',
        api_endpoint: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_week.geojson',
        poll_interval_minutes: 30,
        is_enabled: false
      },
      {
        name: 'NASA FIRMS (Wildfire)',
        source_type: 'wildfire_firms',
        api_endpoint: 'https://firms.modaps.eosdis.nasa.gov/api/',
        poll_interval_minutes: 60,
        is_enabled: false
      },
      {
        name: 'NHC Hurricane Center',
        source_type: 'hurricane_nhc',
        api_endpoint: 'https://www.nhc.noaa.gov/CurrentStorms.json',
        poll_interval_minutes: 30,
        is_enabled: false
      },
      {
        name: 'EPA AirNow',
        source_type: 'air_quality_epa',
        api_endpoint: 'https://docs.airnowapi.org/',
        poll_interval_minutes: 60,
        is_enabled: false
      },
      {
        name: 'FEMA Disaster Declarations',
        source_type: 'fema_disaster',
        api_endpoint: 'https://www.fema.gov/openfema-data-page/disaster-declarations-summaries-v2',
        poll_interval_minutes: 240,
        is_enabled: false
      },
      {
        name: 'PowerOutage.us',
        source_type: 'power_outage',
        api_endpoint: 'https://poweroutage.us/map/data/',
        poll_interval_minutes: 60,
        is_enabled: false
      }
    ];

    let created = [];
    let updated = [];

    for (const sourceConfig of SOURCES) {
      const existing = await base44.asServiceRole.entities.SignalSource.filter({
        source_type: sourceConfig.source_type
      });

      if (existing.length === 0) {
        const newSource = await base44.asServiceRole.entities.SignalSource.create({
          ...sourceConfig,
          consecutive_failures: 0,
          circuit_breaker_open: false
        });
        created.push(newSource.id);
      } else {
        // Update existing to ensure settings are correct
        await base44.asServiceRole.entities.SignalSource.update(existing[0].id, {
          ...sourceConfig,
          consecutive_failures: 0,
          circuit_breaker_open: false
        });
        updated.push(existing[0].id);
      }
    }

    // Ensure SignalEngineSettings exists
    const settings = await base44.asServiceRole.entities.SignalEngineSettings.list();
    if (settings.length === 0) {
      await base44.asServiceRole.entities.SignalEngineSettings.create({
        alert_recipients: [],
        alert_threshold_composite_score: 60,
        urgent_threshold_composite_score: 80,
        digest_email_enabled: true,
        digest_send_time: '08:00',
        digest_recipients: [],
        sms_alert_recipients: [],
        notification_quiet_hours_start: '22:00',
        notification_quiet_hours_end: '06:00',
        scoring_weights: {
          severity: 0.3,
          population: 0.25,
          wealth: 0.2,
          urgency: 0.15,
          competition: 0.1
        },
        auto_dismiss_age_days: 7,
        enabled: true
      });
    }

    return Response.json({
      message: 'Signal sources initialized',
      created: created.length,
      updated: updated.length
    });
  } catch (error) {
    console.error('Init error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});