# Signal Engine — Quick Reference Card

## Admin Dashboard Routes
| Path | Purpose |
|------|---------|
| `/admin/signals` | Live dashboard: active signals, filters, quick actions |
| `/admin/signals/:id` | Signal detail: scores, recommendations, brief generation |
| `/admin/signals/briefs` | Campaign briefs: list, approve, manage |
| `/admin/signals/briefs/:id` | Brief detail: edit, review, stage 2/3 placeholders |
| `/admin/signals/settings` | Configuration: thresholds, weights, recipients, integrations |

## Scoring Formula
```
composite_score = (
  severity × 0.30 +
  population × 0.25 +
  wealth × 0.20 +
  urgency × 0.15 +
  competition × 0.10
) × 10
```
**Range:** 1-100 | **Alert:** ≥60 | **Urgent:** ≥80

## Event Type → Campaign Mapping
| Event | Campaigns |
|-------|-----------|
| Hail, Tornado, Severe Storm | roofing, home-improvement, windows, gutters, siding |
| Hurricane | roofing, home-improvement |
| Flood | plumbing, home-improvement |
| Earthquake | home-improvement |
| Wildfire | home-improvement, hvac |
| Heat Warning | hvac |
| Cold/Freeze | hvac, plumbing |
| High AQI | hvac |

## Scoring Ranges
| Score | Action | Budget |
|-------|--------|--------|
| <60 | No alert | — |
| 60-70 | Email alert | $500-1.5K/day |
| 70-85 | Email alert | $1.5K-5K/day |
| 80+ | 🚨 URGENT (Slack, SMS, email) | $5K-20K/day |

## Backend Functions
| Function | Purpose | Trigger |
|----------|---------|---------|
| `pollNoaaAlerts` | Fetch NOAA alerts → ingest as RawSignal | Every 15 min (scheduled) |
| `signalScorer` | Score RawSignal → ScoredSignal | Auto (after pollNoaaAlerts) |
| `initializeSignalEngine` | One-time setup (sources + settings) | Manual (once) |

## Entity Schema Quick Ref
- **SignalSource** — api_endpoint, api_key, poll_interval_minutes, is_enabled, circuit_breaker_open
- **RawSignal** — event_type, affected_states, affected_zip_codes, severity_raw, raw_payload
- **ScoredSignal** — composite_score (1-100), recommended_campaigns[], recommended_creative_angles[]
- **CampaignBrief** — recommended_campaign_slug, brief_summary, suggested_ad_copy_headlines[], status
- **SignalEngineSettings** — alert_threshold_composite_score, urgent_threshold_composite_score, scoring_weights{}
- **SignalAlert** — scored_signal_id, alert_type (email/sms/slack), delivery_status
- **SignalRunLog** — signals_ingested, signals_skipped_duplicate, error_summary

## Setup Checklist
- [ ] Call `initializeSignalEngine()` function once
- [ ] Go to `/admin/signals/settings`
- [ ] Toggle "Signal Engine enabled" ✅
- [ ] Add email recipients
- [ ] (Optional) Add Slack webhook URL
- [ ] (Optional) Adjust alert thresholds
- [ ] Create scheduled function to call `pollNoaaAlerts` every 15 min
- [ ] Check `/admin/signals` for live signals

## Common Tasks

### Enable a Data Source
1. Database: Update `SignalSource.is_enabled = true` for source
2. Create scheduled Base44 function for polling on source's cadence
3. (Future) UI: Admin dashboard source management page

### Generate a Campaign Brief
1. Go to `/admin/signals`
2. Click signal → detail page
3. Click "Generate Campaign Brief"
4. Brief created in draft status
5. Go to `/admin/signals/briefs` to review/edit/approve

### Adjust Scoring Weights
1. Go to `/admin/signals/settings`
2. Scroll to "Scoring Weights"
3. Drag sliders to adjust (must sum ~1.0)
4. Click "Save Settings"
5. Next signals scored with new weights

### Reset Circuit Breaker
(When a source fails 5× and auto-disables)
1. Database: Update `SignalSource` where id='...'
   - `circuit_breaker_open = false`
   - `consecutive_failures = 0`
2. (Future) UI: Admin dashboard source management page, "Reset" button

## Notifications
| Condition | Recipient | Channel | Frequency |
|-----------|-----------|---------|-----------|
| score ≥ 60 | alert_recipients | Email | On signal creation |
| score ≥ 80 | alert_recipients + sms_recipients + Slack | Email + SMS + Slack | On signal creation |
| Previous day summary | digest_recipients | Email | Daily at digest_send_time (08:00 ET) |
| After quiet hours | Queued (score <80) | — | Sent on quiet hours end |

## Quiet Hours
**Default:** 22:00 - 06:00 ET
- Between these hours, only URGENT (score ≥80) trigger immediate notification
- Others queue until quiet hours end
- Configurable in `/admin/signals/settings`

## Stage 2 Roadmap (Coming Soon)
- [ ] "Generate AI Creatives" button on brief detail
- [ ] Integration with DALL-E / Midjourney for images
- [ ] Integration with Runway ML / Synthesia for videos
- [ ] ai_generated_image_urls, ai_generated_video_urls fields

## Stage 3 Roadmap (Coming Soon)
- [ ] "Launch via Meta Ads" button on brief detail
- [ ] "Launch via Google Ads" button on brief detail
- [ ] "Launch via TikTok Ads" button on brief detail
- [ ] Meta Marketing API integration (OAuth)
- [ ] Google Ads API integration (OAuth)
- [ ] TikTok Ads API integration (OAuth)
- [ ] Automatic lead routing to specified buyers post-launch

## Troubleshooting
| Problem | Solution |
|---------|----------|
| No signals appearing | Check: engine enabled? source enabled? NOAA has active alerts in your region? |
| Notifications not sending | Check: alert_recipients set? Slack webhook valid? Not in quiet hours (if score <80)? |
| Circuit breaker open | Source failed 5×; reset manually via database or wait for admin UI |
| Scores seem wrong | Check: weights in settings. Re-run signalScorer on suspect signal. |
| Old signals still showing | Mark as "expired" or "dismissed" in detail view |

## File Locations
- **Entities:** `entities/SignalSource.json`, `entities/RawSignal.json`, etc.
- **Functions:** `functions/signalScorer.js`, `functions/pollNoaaAlerts.js`, `functions/initializeSignalEngine.js`
- **Pages:** `pages/admin/SignalsDashboard.jsx`, `pages/admin/SignalDetail.jsx`, `pages/admin/SignalBriefs.jsx`, `pages/admin/SignalBriefDetail.jsx`, `pages/admin/SignalsSettings.jsx`
- **Docs:** `lib/signalEngineGuide.md`, `SIGNAL_ENGINE_IMPLEMENTATION.md`, `SIGNAL_ENGINE_QUICK_REFERENCE.md`

---

**Need more detail?** See `lib/signalEngineGuide.md` or `SIGNAL_ENGINE_IMPLEMENTATION.md