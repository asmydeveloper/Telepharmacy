'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';

// Runtime engines own DOM/listeners: restart the document when their source changes.
export default function Runtime({ src, prelude }) {
  const [ready, setReady] = useState(!prelude);
  const loadedSource = useRef(src);
  const changed = loadedSource.current !== src;
  useEffect(() => {
    if (loadedSource.current !== src) window.location.reload();
  }, [src]);
  if (changed) return null;
  return <>{prelude && <Script src={prelude} strategy="afterInteractive" onReady={() => setReady(true)} />}{ready && <Script src={src} strategy="afterInteractive" />}</>;
}
