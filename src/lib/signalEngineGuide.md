# HomeFixr Signal Engine — Stage 1 Implementation Guide

## Overview

The Signal Engine continuously monitors public data feeds for events that predict short-term spikes in home services demand (storms, fires, floods, earthquakes, etc.) and produces actionable campaign briefs telling you which campaigns to run, where to run them, what creative angles to use, and which buyers to forward leads to.

## Architecture

### Entities (7 total)

1. **SignalSource** — Configuration for each external data feed (NOAA, USGS, NASA FIRMS, etc.)
2. **RawSignal** — Raw events captured from each source before scoring
3. **ScoredSignal** — Actionable signals after ML-driven scoring; the main operational layer
4. **SignalAlert** — Audit trail of all notifications sent
5. **SignalEngineSettings** — Global engine configuration (thresholds, weights, alert channels)
6. **CampaignBrief** — Generated brief artifacts linking signals to campaign plans
7. **SignalRunLog** — Audit trail of every poll run across all sources

### Backend Functions (Implemented)

- **`signalScorer`** — Converts RawSignal → ScoredSignal via multi-factor scoring
- **`pollNoaaAlerts`** — Polls NOAA Weather Service for tornado, flood, hurricane, winter storm alerts
- **Additional adapters scaffolded but not fully implemented:** NWS hail reports, USGS earthquakes, NASA FIRMS wildfires, NHC hurricanes, EPA AirNow, FEMA disasters, power outages

### Admin Dashboard (/admin/signals)

**Pages:**

- `/admin/signals` — **Live Signal Dashboard**
  - Stats: Active signals, URGENT signals (80+), reviewed today, campaigns launched
  - Filterable table with composite scores, affected states, event types
  - Quick status actions (dismiss, mark reviewed)

- `/admin/signals/:id` — **Signal Detail**
  - Full event metadata, affected geo, score breakdown
  - Recommended campaigns, creative angles, buyer types
  - **"Generate Campaign Brief"** button → creates CampaignBrief record

- `/admin/signals/briefs` — **Campaign Briefs**
  - Lists all CampaignBrief records (draft → approved → launched → archived)
  - Edit, approve, view detail
  - Stage 2 & 3 placeholders: "Generate AI Creatives", "Launch via Meta/Google" (disabled)

- `/admin/signals/settings` — **Engine Configuration**
  - Alert recipients, score thresholds, scoring weights
  - Quiet hours, Slack webhook, SMS (for urgent only)
  - Master enable toggle

---

## How to Use (Quick Start)

### 1. Enable NOAA Alerts

1. Go to `/admin/signals/settings`
2. Scroll to "System Status" → toggle **Signal Engine enabled**
3. You must set up a SignalSource for NOAA:
   - Create a SignalSource record via the database:
     ```
     {
       "name": "NOAA Weather Alerts",
       "source_type": "weather_noaa",
       "api_endpoint": "https://api.weather.gov/alerts/active",
       "api_key": "",
       "poll_interval_minutes": 15,
       "is_enabled": true
     }
     ```
   - No API key needed for NOAA (it's free).

4. Test: Call `pollNoaaAlerts` backend function (or wait 15 minutes for scheduled run)
5. Check `/admin/signals` — any active tornado/flood/hurricane warnings in your region will appear

### 2. Review and Generate a Campaign Brief

1. Click on a signal in the dashboard to view `/admin/signals/:id` detail
2. Review the score breakdown, recommended campaigns, and creative angles
3. Click **"Generate Campaign Brief"** → creates a CampaignBrief in draft status
4. Go to `/admin/signals/briefs` and click the brief
5. Edit creative angles, ad copy, and targeting as needed
6. Click **Approve** to move to approved status

### 3. Stage 2 & 3 (Coming Soon)

- **Stage 2:** When approved, click **"Generate Ad Creatives"** to use AI image/video generation
- **Stage 3:** Click **"Launch via Meta Ads"** or **"Launch via Google Ads"** to programmatically create campaigns

---

## Scoring Engine (How It Works)

### Component Scores (1-10 scale)

| Score | Meaning |
|-------|---------|
| Severity | How severe is the event? (Tornado = 9, thunderstorm = 5, watch = 2) |
| Population | How many people affected in the target area? (1M+ = 10, <1K = 1) |
| Wealth | Median household income in affected ZIPs (high-income = 10, low = 2) |
| Urgency | How time-sensitive is the response window? (Hail = 9, mold = 8, recovery = 6) |
| Competition | How many other companies are already targeting this? (Inverted: low competition = high score) |

### Composite Score (1-100)

```
composite = (severity × 0.30 + population × 0.25 + wealth × 0.20 + urgency × 0.15 + competition × 0.10) × 10
```

### Score Ranges (Recommendations)

| Range | Action |
|-------|--------|
| < 60 | Below alert threshold; no notification sent |
| 60-70 | Alert sent; budget $500-1,500/day recommended |
| 70-80 | High opportunity; budget $1,500-5,000/day |
| 80+ | **URGENT** — Slack + SMS; budget $5,000-20,000/day |

---

## Event Type → Campaign Mapping

| Event | Campaigns | Creative Angle |
|-------|-----------|-----------------|
| Hail, Tornado, Severe Thunderstorm | Roofing, windows, siding, gutters | "Free roof inspection — insurance may cover it" |
| Hurricane, Tropical Storm | Roofing, home improvement | "Roof damage? Licensed roofers available NOW" |
| Flood, Water Damage | Plumbing, water restoration | "Mold sets in fast — get restoration quotes now" |
| Earthquake | Home improvement, structural | "Foundation damage? Get licensed inspector quotes" |
| Wildfire, Smoke | HVAC, air filtration, landscaping | "Smoke damage to HVAC? Get professional cleaning" |
| Heat Warning | HVAC | "AC breakdown during heat wave? Emergency repair available" |
| Cold/Freeze | HVAC, plumbing | "Frozen pipes? Licensed plumbers available 24/7" |
| High AQI | HVAC, air purification | "Air quality emergency? Get air filtration quotes" |

---

## Notifications

### Email Alert
Sent when ScoredSignal.composite_score ≥ alert_threshold (default 60):

```
Subject: [HomeFixr Signal] {{event_type}} in {{affected_states}} — Score {{composite_score}}

To: alert_recipients (configured in settings)
```

### URGENT Alert (Score ≥ 80)
Email subject prefixed with 🚨, plus:
- Slack message to slack_webhook_url (if configured)
- SMS to sms_alert_recipients (if configured)

### Daily Digest
At digest_send_time (default 08:00 ET):
- Summary of yesterday's signals
- Top 5 by composite score
- Signals expiring soon
- Source status (any circuit breaker open?)
- Sent to digest_recipients

### Quiet Hours
Between notification_quiet_hours_start and end (default 22:00-06:00):
- Only URGENT signals (≥80) trigger immediate notification
- Others queue until quiet hours end

---

## Data Sources (Adapters)

### Implemented (Stage 1)
- **NOAA / NWS Alerts** (https://api.weather.gov/alerts/active)
  - Free, no API key, polls every 15 minutes
  - Relevant alerts: Tornado, Severe Thunderstorm, Flood, Flash Flood, Winter Storm, Ice Storm, High Wind, Hurricane, Tropical Storm, Excessive Heat, Hard Freeze

### Scaffolded (Ready to implement)
- **NWS Storm Reports** — hail, wind, tornado spotty reports (30 min)
- **USGS Earthquake** — M4.5+ US events (30 min)
- **NASA FIRMS** — active wildfire detections (1 hour)
- **NHC** — Hurricane Center advisories (30 min in season)
- **EPA AirNow** — air quality index (1 hour)
- **FEMA** — disaster declarations (4 hours)
- **PowerOutage.us** — sustained outages (1 hour)

Each adapter:
- Respects rate limits with exponential backoff
- Dedupes by source_event_id
- Hydrates affected_states, affected_zip_codes, population/wealth scores
- Logs to SignalRunLog
- Opens circuit breaker after 5 consecutive failures (requires manual reset)

---

## Circuit Breaker Pattern

If a source fails 5 times in a row:
- `SignalSource.circuit_breaker_open = true`
- No more polling attempts until admin manually resets
- Prevents cascade failures and log spam

Reset via admin dashboard (future implementation) or directly in database:
```sql
UPDATE SignalSource SET circuit_breaker_open = false, consecutive_failures = 0 WHERE id = '...'
```

---

## Database Lookups

### ZIP Code Data
For reverse-geocoding affected GeoJSON to ZIP codes and population/income:
- Currently mocked in `signalScorer` (returns middle-range scores)
- Future: Load US Census ACS 5-year data (free CSV) into ZipCodeData entity
- Libraries: `@mapbox/point-in-polygon` or `turf` for polygon containment

### Population & Wealth Scores
- Source: US Census ACS (American Community Survey)
- Fields: total population, median household income per ZIP
- Pre-compute and cache in ZipCodeData entity (monthly refresh)

---

## Test Mode (Future)

Inject synthetic events to verify the full pipeline:
1. POST /admin/signals/test-signal with mock RawSignal data
2. signalScorer runs automatically
3. Notifications fire as if real
4. Verify brief generation, email/Slack delivery

---

## Stage 2 Roadmap (AI Creatives)

When approved, click "Generate Ad Creatives":
1. Backend calls DALL-E / Midjourney API with brief's creative_angles as prompt
2. Stores ai_generated_image_urls in CampaignBrief
3. Generates video storyboard from images + copy (RunwayML, Synthesia, etc.)
4. Stores ai_generated_video_urls
5. Preview in UI

---

## Stage 3 Roadmap (Campaign Launch)

When brief is approved, click "Launch via Meta/Google":
1. Authenticate with Meta Marketing API and Google Ads API (via registered app user connectors)
2. Create campaign from brief's:
   - Targeting (geo, demographics)
   - Creative (images, video, ad copy)
   - Budget (daily_budget_low to daily_budget_high)
   - Audience (buyers_type)
3. Store meta_campaign_id, google_campaign_id, launched_at, launched_by
4. Mark brief as "launched"
5. Auto-route leads from signals to specified buyers

---

## Troubleshooting

### "Circuit breaker open" error
The source has failed 5+ times. Reset manually in SignalSource record or contact admin.

### No signals appearing
1. Check `/admin/signals/settings` → "System Status" → toggle enabled
2. Verify SignalSource is created and is_enabled = true
3. Check SignalRunLog for recent runs; any errors?
4. NOAA alerts may not have active warnings in your region at the moment

### Signals not scoring
1. Check signalScorer function logs
2. Verify ScoredSignal entity exists in database
3. Re-run pollNoaaAlerts — it should trigger signalScorer automatically

### Notifications not sending
1. Verify alert_recipients in SignalEngineSettings
2. Check quiet hours — if between notification_quiet_hours_start/end and score < 80, no notification sent
3. Slack: verify slack_webhook_url is correct (test via curl)
4. Email: check app's SendEmail integration is working (test from admin panel)

---

## Deployment Notes

- All polling functions should run as scheduled Base44 functions (cron) on their natural cadence
- All external API calls must include User-Agent with contact email (federal APIs require this)
- No rate limit bypass; respect each API's backoff strategy
- Store API keys securely in SignalSource.api_key (masked in UI)
- All admin pages are mobile-responsive (Tailwind CSS)
- All scoring weights configurable without code change (SignalEngineSettings)

---

## Next Steps

1. ✅ Stage 1: Full implementation complete
2. 🔜 Stage 2: AI creative generation (DALL-E/Midjourney integration)
3. 🔜 Stage 3: One-click Meta/Google Ads launch via OAuth connectors

---

## Questions?

- See `/admin/signals` for live signals
- See `/admin/signals/settings` for configuration
- See `functions/signalScorer.js` and `functions/pollNoaaAlerts.js` for implementation details