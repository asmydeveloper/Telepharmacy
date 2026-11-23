import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const codePattern = /^\d{6}$/;
const namePattern = /^[\p{L}\p{M}\p{N}\s.()-]+$/u;
const legacyBoundaryCodes = ['104801', '104802', '103301'];
const boundaryService =
  'https://gis-portal.disaster.go.th/arcgis/rest/services/MapDX/DPM_TH_Boundary/MapServer/3/query';

function matchingFeatures(data, matches) {
  if (!Array.isArray(data?.features)) return [];
  const features = data.features.filter((feature) => {
    const properties = feature?.properties;
    const geometry = feature?.geometry;
    return (
      codePattern.test(String(properties?.TAM_CODE)) &&
      ['Polygon', 'MultiPolygon'].includes(geometry?.type) &&
      Array.isArray(geometry.coordinates) &&
      geometry.coordinates.length > 0 &&
      matches(properties)
    );
  });
  return new Set(features.map(({ properties }) => String(properties.TAM_CODE))).size === 1
    ? features
    : [];
}

function boundaryResponse(features) {
  return Response.json(
    { type: 'FeatureCollection', features },
    { headers: { 'Cache-Control': 'public,max-age=86400' } },
  );
}

export async function GET(request) {
  const params = new URL(request.url).searchParams;
  const code = params.get('code');
  if (!codePattern.test(code || ''))
    return Response.json({ error: 'Invalid code' }, { status: 400 });

  const names = [
    ['PROV_NAM_T', params.get('province')],
    ['AMP_NAM_T', params.get('amphoe')],
    ['TAM_NAM_T', params.get('district')],
  ];
  const named = names.some(([, value]) => value !== null);
  if (
    named &&
    !names.every(([, value]) => value && value.length <= 100 && namePattern.test(value))
  ) {
    return Response.json({ error: 'Invalid administrative identity' }, { status: 400 });
  }

  // Postal datasets can point to an older subdistrict code.
  const matches = named
    ? (properties) => names.every(([key, value]) => properties[key] === value)
    : (properties) => String(properties.TAM_CODE) === code;
  for (const localCode of new Set([code, ...(named ? legacyBoundaryCodes : [])])) {
    try {
      const file = join(
        process.cwd(),
        'public/assets/data/thailand/boundaries',
        localCode + '.json',
      );
      const features = matchingFeatures(JSON.parse(await readFile(file, 'utf8')), matches);
      if (features.length) return boundaryResponse(features);
    } catch {
      // Missing or unreadable bundled data falls back to the boundary service.
    }
  }

  const query = new URLSearchParams({
    where: named
      ? names.map(([key, value]) => `${key}='${value}'`).join(' AND ')
      : `TAM_CODE='${code}'`,
    outFields: 'TAM_CODE,TAM_NAM_T,AMP_NAM_T,PROV_NAM_T,Centroid_x,Centroid_y',
    outSR: '4326',
    returnGeometry: 'true',
    f: 'geojson',
  });
  try {
    const response = await fetch(boundaryService + '?' + query, {
      signal: AbortSignal.timeout(12000),
      next: { revalidate: 86400 },
    });
    if (response.ok) {
      const features = matchingFeatures(await response.json(), matches);
      if (features.length) return boundaryResponse(features);
    }
  } catch {
    // The client handles 503 and lets the user retry.
  }
  return Response.json({ error: 'Boundary unavailable' }, { status: 503 });
}
