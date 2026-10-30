'use client';

import Script from 'next/script';

// Run the existing prototype engine after React hydrates the page shell.
// Cross-app links use full navigation to isolate each engine's globals and listeners.
export default function Runtime({ src }) {
  return <Script src={src} strategy="afterInteractive" />;
}
