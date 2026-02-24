"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface ImageSliderProps {
  before: string;
  after: string;
}

export default function ImageSlider({ before, after }: ImageSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setSliderPosition((x / rect.width) * 100);
  }, []);

  useEffect(() => {
    const handleUp = () => setIsDragging(false);
    window.addEventListener("mouseup", handleUp);
    window.addEventListener("touchend", handleUp);
    return () => {
      window.removeEventListener("mouseup", handleUp);
      window.removeEventListener("touchend", handleUp);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="group relative aspect-4/3 w-full cursor-ew-resize overflow-hidden rounded-xl"
      onMouseDown={(e) => {
        setIsDragging(true);
        handleMove(e.clientX);
      }}
      onMouseMove={(e) => isDragging && handleMove(e.clientX)}
      onTouchStart={(e) => {
        setIsDragging(true);
        handleMove(e.touches[0].clientX);
      }}
      onTouchMove={(e) =>
        isDragging && handleMove(e.touches[0].clientX)
      }
    >
      <img
        src={after}
        className="absolute inset-0 h-full w-full object-contain"
        alt="修复后"
      />
      <img
        src={before}
        className="absolute inset-0 h-full w-full object-contain"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        alt="原图"
      />
      <div
        className="absolute top-0 bottom-0 z-10 w-0.5 bg-white"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="absolute top-1/2 left-1/2 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-lg">
          <div className="flex gap-0.5">
            <div className="h-2.5 w-0.5 rounded bg-zinc-400" />
            <div className="h-2.5 w-0.5 rounded bg-zinc-400" />
          </div>
        </div>
      </div>
      <div className="absolute bottom-3 left-3 rounded px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-zinc-300 bg-black/60 backdrop-blur-sm">
        实拍原图
      </div>
      <div className="absolute bottom-3 right-3 rounded px-2 py-1 text-[10px] font-medium uppercase tracking-wider bg-sky-500/80 backdrop-blur-sm text-white">
        AI 裁剪修复
      </div>
    </div>
  );
}
