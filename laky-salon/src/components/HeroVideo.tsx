"use client";

import { useEffect, useRef, useState } from "react";

// Pozadinski video za hero. Fajlove stavite u /public:
//   hero.mp4        – video (preporuka: 1920px širina, 10–20 s, bez zvuka, < 8 MB)
//   hero-poster.jpg – prvi kadar, prikazuje se dok se video učitava
export default function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    // Poštujemo podešavanje "smanji pokrete" – video ne kreće sam
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      v.pause();
      setPlaying(false);
      return;
    }
    v.play().catch(() => setPlaying(false));
  }, []);

  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) {
      v.play().then(() => setPlaying(true)).catch(() => undefined);
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  return (
    <>
      <video
        ref={ref}
        className="hero__video"
        muted
        loop
        playsInline
        preload="auto"
        poster="/hero-poster.jpg"
        aria-hidden="true"
      >
        <source src="/hero.mp4" type="video/mp4" />
      </video>
      <button
        type="button"
        className="hero__toggle"
        onClick={toggle}
        aria-label={playing ? "Pauziraj pozadinski video" : "Pusti pozadinski video"}
        aria-pressed={!playing}
      >
        {playing ? (
          <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
            <rect x="3" y="2" width="3.5" height="12" fill="currentColor" />
            <rect x="9.5" y="2" width="3.5" height="12" fill="currentColor" />
          </svg>
        ) : (
          <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
            <path d="M4 2l10 6-10 6z" fill="currentColor" />
          </svg>
        )}
      </button>
    </>
  );
}
