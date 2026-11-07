'use client';
import { useEffect, useRef, useState } from 'react';

export default function CardPreview({ state, label }) {
  const frame = useRef(null);
  const observer = useRef(null);
  const visible = useRef(false);
  const mountObserver = useRef(null);
  const [expanded, setExpanded] = useState(false);
  const [reset, setReset] = useState(0);
  const closeButton = useRef(null);
  const clickCleanup = useRef(null);
  function close() {
    setExpanded(false);
    setReset((value) => value + 1);
  }
  useEffect(() => {
    if (!expanded) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButton.current?.focus();
    const escape = (event) => {
      if (event.key === 'Escape') close();
    };
    window.addEventListener('keydown', escape);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', escape);
    };
  }, [expanded]);
  const [loaded, setLoaded] = useState(false);
  const [height, setHeight] = useState(320);
  useEffect(() => {
    const intersection = new IntersectionObserver(([entry]) => {
      visible.current = entry.isIntersecting;
      if (entry.isIntersecting) setLoaded(true);
      frame.current?.contentWindow?.postMessage(
        { type: 'telepharmacy:preview-visibility', visible: entry.isIntersecting },
        window.location.origin,
      );
    });
    intersection.observe(frame.current);
    return () => {
      intersection.disconnect();
      mountObserver.current?.disconnect();
      observer.current?.disconnect();
      clickCleanup.current?.();
    };
  }, []);
  function onLoad() {
    const document = frame.current?.contentDocument;
    if (!document) return;
    clickCleanup.current?.();
    const openAction = (event) => {
      if (!event.target.closest?.('.case-progress-card button, .case-progress-card a')) return;
      setExpanded(true);
    };
    document.addEventListener('click', openAction, true);
    const escape = (event) => {
      if (event.key === 'Escape') close();
    };
    document.addEventListener('keydown', escape);
    clickCleanup.current = () => {
      document.removeEventListener('click', openAction, true);
      document.removeEventListener('keydown', escape);
    };
    observer.current?.disconnect();
    mountObserver.current?.disconnect();
    const bindCard = () => {
      const card = document.querySelector('.consultation-card-preview');
      if (!card) return;
      mountObserver.current?.disconnect();
      const resize = () => setHeight(Math.ceil(card.getBoundingClientRect().height) + 32);
      observer.current = new ResizeObserver(resize);
      observer.current.observe(card);
      resize();
    };
    mountObserver.current = new MutationObserver(bindCard);
    mountObserver.current.observe(document.body, { childList: true, subtree: true });
    bindCard();
    frame.current?.contentWindow?.postMessage(
      { type: 'telepharmacy:preview-visibility', visible: visible.current },
      window.location.origin,
    );
  }
  return (
    <div className="card-status-preview-slot">
      <div
        className={expanded ? 'card-status-stage card-status-expanded' : 'card-status-stage'}
        role={expanded ? 'dialog' : undefined}
        aria-modal={expanded ? true : undefined}
        aria-label={expanded ? 'พรีวิว ' + label : undefined}
      >
        {expanded && (
          <>
            <button
              className="card-status-backdrop"
              onClick={close}
              aria-label="ปิดพรีวิว"
              tabIndex={-1}
            />
            <button
              ref={closeButton}
              className="card-status-close"
              onClick={close}
              aria-label="ปิดพรีวิว"
            >
              ×
            </button>
          </>
        )}
        <iframe
          ref={frame}
          title={label}
          style={{ height }}
          onLoad={onLoad}
          src={
            loaded
              ? '/?screen=home&state=case-' +
                state +
                '&splash=0&cardPreview=1&bare=1&chrome=0&flowPreview=1&galleryReset=' +
                reset
              : undefined
          }
        />
      </div>
    </div>
  );
}
