'use client';
import { useState, useEffect, useRef } from 'react';

export const useFPS = () => {
  const [fps, setFps] = useState(0);
  const lastTimeRef = useRef(performance.now());
  const frameRef = useRef(0);

  useEffect(() => {
    const loop = (time: number) => {
      const delta = time - lastTimeRef.current;
      lastTimeRef.current = time;
      const currentFps = 1000 / delta;
      setFps((prevFps) => (prevFps * 0.9 + currentFps * 0.1));

      frameRef.current = requestAnimationFrame(loop);
    };

    frameRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return Math.round(fps);
};