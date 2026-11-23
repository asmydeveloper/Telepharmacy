'use client';

import { useEffect, useRef, useState } from 'react';
import { preload } from 'react-dom';
import Script from 'next/script';

// Runtime engines own DOM/listeners: restart the document when their source changes.
export default function Runtime({ src, prelude = [] }) {
  const [loaded, setLoaded] = useState(0);
  const next = prelude[loaded];
  const loadedSource = useRef(src);
  const changed = loadedSource.current !== src;
  useEffect(() => {
    if (loadedSource.current !== src) window.location.reload();
  }, [src]);
  if (changed) return null;
  // Fetch scripts together. The loader still evaluates them in dependency order.
  for (const script of prelude) preload(script, { as: 'script' });
  preload(src, { as: 'script' });
  return (
    <>
      {next ? (
        <Script
          key={next}
          src={next}
          strategy="afterInteractive"
          onReady={() => setLoaded((index) => (index === loaded ? index + 1 : index))}
        />
      ) : (
        <Script src={src} strategy="afterInteractive" />
      )}
    </>
  );
}
