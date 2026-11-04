'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';

// Runtime engines own DOM/listeners: restart the document when their source changes.
export default function Runtime({ src, prelude }) {
  const scripts = ['/runtime/consultation-data.js', ...(Array.isArray(prelude) ? prelude : prelude ? [prelude] : [])];
  const [loaded, setLoaded] = useState(0);
  const ready = loaded >= scripts.length;
  const loadedSource = useRef(src);
  const changed = loadedSource.current !== src;
  useEffect(() => {
    if (loadedSource.current !== src) window.location.reload();
  }, [src]);
  if (changed) return null;
  return <>{!ready && <Script key={scripts[loaded]} src={scripts[loaded]} strategy="afterInteractive" onReady={() => setLoaded(index => index + 1)} />}{ready && <Script src={src} strategy="afterInteractive" />}</>;
}
