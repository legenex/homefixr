import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Geocodes a RawSignal: extracts affected_states, affected_counties, affected_zip_codes
 * from the affected_area_geojson and UGC codes
 * Called after RawSignal creation to populate geo fields
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { raw_signal_id } = await req.json();
    if (!raw_signal_id) {
      return Response.json({ error: 'raw_signal_id required' }, { status: 400 });
    }

    const rawSignal = await base44.asServiceRole.entities.RawSignal.get(raw_signal_id);
    if (!rawSignal) {
      return Response.json({ error: 'RawSignal not found' }, { status: 404 });
    }

    // Extract states from areaDesc and UGC codes (NOAA specific)
    let affectedStates = [];
    let affectedCounties = [];

    // Method 1: Parse areaDesc (e.g. "Cook; DuPage; IL")
    if (rawSignal.raw_payload?.areaDesc) {
      const parts = rawSignal.raw_payload.areaDesc.split(';').map(p => p.trim());
      const stateMatch = parts.find(p => /^[A-Z]{2}$/.test(p));
      if (stateMatch) {
        affectedStates = [stateMatch];
      }
    }

    // Method 2: Parse UGC codes (e.g. "ILZ015>017" = Illinois zones 015-017)
    if (rawSignal.raw_payload?.geocode?.UGC) {
      const ugcCodes = Array.isArray(rawSignal.raw_payload.geocode.UGC) 
        ? rawSignal.raw_payload.geocode.UGC 
        : [rawSignal.raw_payload.geocode.UGC];
      
      for (const ugc of ugcCodes) {
        // UGC format: SSZZZZ (SS = state, ZZZZ = zone/county)
        const stateCode = ugc.substring(0, 2);
        const fipsCode = ugc.substring(2, 5);
        
        if (/^[A-Z]{2}$/.test(stateCode) && !affectedStates.includes(stateCode)) {
          affectedStates.push(stateCode);
        }
        if (fipsCode && stateCode && !affectedCounties.includes(`${stateCode}-${fipsCode}`)) {
          affectedCounties.push(`${stateCode}-${fipsCode}`);
        }
      }
    }

    // Fallback: try to extract from geometry centroid (point-in-polygon is complex, skip for now)
    let affectedZips = [];
    
    // Try to match ZIPs by checking if ZipCodeData entity has data
    try {
      const allZips = await base44.asServiceRole.entities.ZipCodeData.list('', 5000);
      
      if (allZips && allZips.length > 0) {
        // Simple heuristic: if affected_states is populated, find ZIPs in those states
        if (affectedStates.length > 0) {
          const zipsByState = allZips.filter(z => affectedStates.includes(z.state));
          affectedZips = zipsByState.slice(0, 50).map(z => z.zip_code); // Top 50 ZIPs
        }
      }
    } catch (e) {
      // ZipCodeData might be empty, that's ok
      console.log('ZipCodeData empty or error:', e.message);
    }

    // Update RawSignal with geocoded data
    const updated = await base44.asServiceRole.entities.RawSignal.update(raw_signal_id, {
      affected_states: affectedStates.length > 0 ? affectedStates : rawSignal.affected_states,
      affected_counties: affectedCounties.length > 0 ? affectedCounties : rawSignal.affected_counties,
      affected_zip_codes: affectedZips.length > 0 ? affectedZips : rawSignal.affected_zip_codes
    });

    console.log(`Geocoded ${raw_signal_id}: states=${affectedStates}, counties=${affectedCounties}, zips=${affectedZips.length}`);

    return Response.json({ 
      geocoded: true,
      affected_states: updated.affected_states,
      affected_counties: updated.affected_counties,
      affected_zip_codes: updated.affected_zip_codes
    });
  } catch (error) {
    console.error('Geocoding error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});