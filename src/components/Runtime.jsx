'use client';

import { useEffect, useRef } from 'react';
import Script from 'next/script';

// Runtime engines own DOM/listeners: restart the document when their source changes.
export default function Runtime({ src }) {
  const loadedSource = useRef(src);
  const changed = loadedSource.current !== src;
  useEffect(() => {
    if (loadedSource.current !== src) window.location.reload();
  }, [src]);
  if (changed) return null;
  return <Script src={src} strategy="afterInteractive" />;
}
