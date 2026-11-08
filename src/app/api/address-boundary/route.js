import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
export async function GET(request) {
  const params = new URL(request.url).searchParams,
    code = params.get('code');
  if (!/^\d{6}$/.test(code || '')) return Response.json({ error: 'Invalid code' }, { status: 400 });
  const identity = {
    PROV_NAM_T: params.get('province'),
    AMP_NAM_T: params.get('amphoe'),
    TAM_NAM_T: params.get('district'),
  };
  const named = Object.values(identity).some(Boolean);
  if (
    named &&
    !Object.values(identity).every(
      (v) => v && v.length <= 100 && /^[\p{L}\p{M}\p{N}\s.()-]+$/u.test(v),
    )
  )
    return Response.json({ error: 'Invalid administrative identity' }, { status: 400 });
  const matches = (f) =>
    /^\d{6}$/.test(String(f.properties?.TAM_CODE)) &&
    ['Polygon', 'MultiPolygon'].includes(f.geometry?.type) &&
    (named
      ? Object.entries(identity).every(([k, v]) => f.properties[k] === v)
      : String(f.properties.TAM_CODE) === code);
  // Match names as well as codes: postal datasets contain legacy subdistrict codes.
  for (const localCode of new Set([code, ...(named ? ['104801', '104802', '103301'] : [])])) {
    try {
      const cached = JSON.parse(
        await readFile(
          join(process.cwd(), 'public/assets/data/thailand/boundaries', localCode + '.json'),
          'utf8',
        ),
      );
      const features = cached.features?.filter(matches);
      if (features?.length)
        return Response.json(
          { type: 'FeatureCollection', features },
          { headers: { 'Cache-Control': 'public,max-age=86400' } },
        );
    } catch {}
  }
  try {
    const where = named
      ? Object.entries(identity)
          .map(([k, v]) => `${k}='${v.replaceAll("'", "''")}'`)
          .join(' AND ')
      : `TAM_CODE='${code}'`;
    const q = new URLSearchParams({
      where,
      outFields: 'TAM_CODE,TAM_NAM_T,AMP_NAM_T,PROV_NAM_T,Centroid_x,Centroid_y',
      outSR: '4326',
      returnGeometry: 'true',
      f: 'geojson',
    });
    const r = await fetch(
      'https://gis-portal.disaster.go.th/arcgis/rest/services/MapDX/DPM_TH_Boundary/MapServer/3/query?' +
        q,
      { signal: AbortSignal.timeout(12000), next: { revalidate: 86400 } },
    );
    if (!r.ok) throw Error();
    const data = await r.json(),
      features = data.features?.filter(matches);
    if (!features?.length || new Set(features.map((f) => String(f.properties.TAM_CODE))).size !== 1)
      throw Error();
    return Response.json(
      { type: 'FeatureCollection', features },
      { headers: { 'Cache-Control': 'public,max-age=86400' } },
    );
  } catch {
    return Response.json({ error: 'Boundary unavailable' }, { status: 503 });
  }
}
