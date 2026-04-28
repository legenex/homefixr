import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Fetch all RawSignals
    const allRawSignals = await base44.asServiceRole.entities.RawSignal.list('-created_date', 5000);
    let updated = 0;
    let skipped = 0;

    for (const raw of allRawSignals) {
      try {
        // Skip if already has affected_states populated
        if (raw.affected_states && raw.affected_states.length > 0) {
          skipped++;
          continue;
        }

        // Parse state codes from title
        const title = raw.title || '';
        const afterDash = title.split('-').slice(1).join('-');
        const stateMatches = afterDash.match(/,\s*([A-Z]{2})(?:;|$)/g);
        let affectedStates = [];
        
        if (stateMatches) {
          affectedStates = [...new Set(stateMatches.map(m => m.match(/([A-Z]{2})/)[1]))];
        }

        if (affectedStates.length > 0) {
          await base44.asServiceRole.entities.RawSignal.update(raw.id, {
            affected_states: affectedStates
          });
          updated++;
        } else {
          skipped++;
        }
      } catch (e) {
        console.error(`Backfill failed for ${raw.id}: ${e.message}`);
        skipped++;
      }
    }

    return Response.json({
      message: 'Backfill complete',
      updated,
      skipped,
      total_processed: allRawSignals.length
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});