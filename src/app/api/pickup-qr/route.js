import qrcode from 'qrcode-generator';

export function GET(request) {
  const code = new URL(request.url).searchParams.get('code');
  if (!code || !/^[A-Za-z0-9_-]{1,64}$/.test(code)) {
    return new Response(null, { status: 400 });
  }

  const qr = qrcode(0, 'M');
  qr.addData(code, 'Byte');
  qr.make();
  return new Response(qr.createSvgTag({ cellSize: 4, margin: 16, scalable: true }), {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'no-store',
    },
  });
}
