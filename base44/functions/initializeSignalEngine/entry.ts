import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Initialize Signal Engine with default sources and settings
 * Call once per app setup
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const results = {
      sources_created: 0,
      sources_existing: 0,
      settings_created: 0,
      settings_existing: 0
    };

    // Check if sources already exist
    const existingSources = await base44.asServiceRole.entities.SignalSource.list();
    if (existingSources.length === 0) {
      // Create default sources
      const sources = [
        {
          name: 'NOAA Weather Alerts',
          source_type: 'weather_noaa',
          api_endpoint: 'https://api.weather.gov/alerts/active',
          api_key: '',
          poll_interval_minutes: 15,
          is_enabled: false,
          consecutive_failures: 0,
          circuit_breaker_open: false
        },
        {
          name: 'NWS Storm Reports',
          source_type: 'hail_reports',
          api_endpoint: 'https://www.spc.noaa.gov/climo/reports/',
          api_key: '',
          poll_interval_minutes: 30,
          is_enabled: false,
          consecutive_failures: 0,
          circuit_breaker_open: false
        },
        {
          name: 'USGS Earthquakes',
          source_type: 'earthquake_usgs',
          api_endpoint: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_week.geojson',
          api_key: '',
          poll_interval_minutes: 30,
          is_enabled: false,
          consecutive_failures: 0,
          circuit_breaker_open: false
        },
        {
          name: 'NASA FIRMS Wildfires',
          source_type: 'wildfire_firms',
          api_endpoint: 'https://firms.modaps.eosdis.nasa.gov/api/v1/data/',
          api_key: '',
          poll_interval_minutes: 60,
          is_enabled: false,
          consecutive_failures: 0,
          circuit_breaker_open: false
        },
        {
          name: 'NHC Hurricanes',
          source_type: 'hurricane_nhc',
          api_endpoint: 'https://www.nhc.noaa.gov/CurrentStorms.json',
          api_key: '',
          poll_interval_minutes: 30,
          is_enabled: false,
          consecutive_failures: 0,
          circuit_breaker_open: false
        },
        {
          name: 'EPA AirNow',
          source_type: 'air_quality_epa',
          api_endpoint: 'https://docs.airnowapi.org/',
          api_key: '',
          poll_interval_minutes: 60,
          is_enabled: false,
          consecutive_failures: 0,
          circuit_breaker_open: false
        },
        {
          name: 'FEMA Disasters',
          source_type: 'fema_disaster',
          api_endpoint: 'https://www.fema.gov/openfema-data-page/disaster-declarations-summaries-v2',
          api_key: '',
          poll_interval_minutes: 240,
          is_enabled: false,
          consecutive_failures: 0,
          circuit_breaker_open: false
        },
        {
          name: 'PowerOutage Tracking',
          source_type: 'power_outage',
          api_endpoint: 'https://poweroutage.us/api/',
          api_key: '',
          poll_interval_minutes: 60,
          is_enabled: false,
          consecutive_failures: 0,
          circuit_breaker_open: false
        }
      ];

      for (const source of sources) {
        await base44.asServiceRole.entities.SignalSource.create(source);
        results.sources_created++;
      }
    } else {
      results.sources_existing = existingSources.length;
    }

    // Check if settings exist
    const existingSettings = await base44.asServiceRole.entities.SignalEngineSettings.list();
    if (existingSettings.length === 0) {
      // Create default settings
      await base44.asServiceRole.entities.SignalEngineSettings.create({
        alert_recipients: [user.email],
        alert_threshold_composite_score: 60,
        urgent_threshold_composite_score: 80,
        digest_email_enabled: true,
        digest_send_time: '08:00',
        digest_recipients: [user.email],
        slack_webhook_url: '',
        sms_alert_recipients: [],
        notification_quiet_hours_start: '22:00',
        notification_quiet_hours_end: '06:00',
        scoring_weights: {
          severity: 0.30,
          population: 0.25,
          wealth: 0.20,
          urgency: 0.15,
          competition: 0.10
        },
        auto_dismiss_age_days: 7,
        enabled: false
      });
      results.settings_created = 1;
    } else {
      results.settings_existing = 1;
    }

    return Response.json({
      message: 'Signal Engine initialized',
      results
    });
  } catch (error) {
    console.error('Init error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});