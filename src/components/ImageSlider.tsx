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
      className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden cursor-ew-resize group shadow-2xl"
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
        className="absolute inset-0 w-full h-full object-contain"
        alt="After"
      />
      <img
        src={before}
        className="absolute inset-0 w-full h-full object-contain"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        alt="Before"
      />
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white z-10"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-xl flex items-center justify-center">
          <div className="flex space-x-0.5">
            <div className="w-0.5 h-3 bg-gray-300"></div>
            <div className="w-0.5 h-3 bg-gray-300"></div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-4 left-4 text-[10px] uppercase font-bold tracking-widest bg-black/50 px-2 py-1 rounded backdrop-blur">
        实拍原图
      </div>
      <div className="absolute bottom-4 right-4 text-[10px] uppercase font-bold tracking-widest bg-indigo-600/50 px-2 py-1 rounded backdrop-blur text-white">
        AI 裁剪修复
      </div>
    </div>
  );
}
