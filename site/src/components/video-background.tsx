"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Полноэкранный HLS-видеофон: Safari играет HLS нативно, остальные через hls.js
 * (подгружается динамически, чтобы не тащить его в общий бандл).
 * Под prefers-reduced-motion видео не грузится вовсе: показываем постер.
 */
export function VideoBackground({ src, poster }: { src: string; poster: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [reduceMotion, setReduceMotion] = useState<boolean | null>(null);

  useEffect(() => {
    setReduceMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || reduceMotion !== false) return;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      return;
    }

    let hls: { destroy: () => void } | undefined;
    let cancelled = false;
    import("hls.js").then(({ default: Hls }) => {
      if (cancelled || !Hls.isSupported()) return;
      const instance = new Hls({ capLevelToPlayerSize: true });
      instance.loadSource(src);
      instance.attachMedia(video);
      hls = instance;
    });

    return () => {
      cancelled = true;
      hls?.destroy();
    };
  }, [src, reduceMotion]);

  if (reduceMotion !== false) {
    return (
      <img src={poster} alt="" aria-hidden className="ph absolute inset-0 h-full w-full object-cover" />
    );
  }

  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      loop
      playsInline
      poster={poster}
      aria-hidden
      className="absolute inset-0 h-full w-full object-cover"
    />
  );
}
