// src/hooks/useHoverTracking.js
// FINÁLNA VERZIA - S landmark detection (bez ESLint chýb)

import { useState, useEffect, useRef, useCallback } from 'react';

export const useHoverTracking = (containerRef, contentId, contentType) => {
  const [isTracking, setIsTracking] = useState(false);
  const mousePositions = useRef([]);
  const startTime = useRef(null);
  const lastCaptureTime = useRef(0);
  const landmarksCache = useRef(null);

  // ✅ NOVÁ FUNKCIA - Detekcia landmarks v komponente
  const detectLandmarks = useCallback(() => {
    if (!containerRef.current) return [];

    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    
    // Nájdi všetky elementy s data-landmark atribútom
    const landmarkElements = container.querySelectorAll('[data-landmark]');
    
    const landmarks = Array.from(landmarkElements).map(el => {
      const rect = el.getBoundingClientRect();
      
      return {
        id: el.getAttribute('data-landmark-id'),
        type: el.getAttribute('data-landmark'),
        position: {
          top: Math.round(rect.top - containerRect.top + container.scrollTop),
          left: Math.round(rect.left - containerRect.left + container.scrollLeft),
          width: Math.round(rect.width),
          height: Math.round(rect.height)
        }
      };
    });

    console.log(`🎯 Detected ${landmarks.length} landmarks:`, landmarks);
    return landmarks;
  }, [containerRef]);

  // ✅ NOVÁ FUNKCIA - Nájdi najbližší landmark
  const findNearestLandmark = useCallback((x, y, landmarks) => {
    if (!landmarks || landmarks.length === 0) return null;

    let nearest = null;
    let minDistance = Infinity;

    landmarks.forEach(landmark => {
      // Check if point is inside landmark
      const { left, top, width, height } = landmark.position;
      
      if (x >= left && x <= left + width && y >= top && y <= top + height) {
        // Point is inside this landmark
        nearest = landmark;
        return;
      }

      // Calculate distance to center
      const centerX = left + width / 2;
      const centerY = top + height / 2;
      
      const distance = Math.sqrt(
        Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
      );

      if (distance < minDistance) {
        minDistance = distance;
        nearest = landmark;
      }
    });

    return nearest;
  }, []);

  // Mouse tracking s landmark info
  const handleMouseMove = useCallback((e) => {
    if (!isTracking || !containerRef.current) return;

    const now = Date.now();
    const timeSinceLastCapture = now - lastCaptureTime.current;
    
    // Adaptívne FPS (10-30 FPS) - viac bodov na začiatku, menej neskôr
    const captureInterval = mousePositions.current.length < 100 ? 33 : 100;
    
    if (timeSinceLastCapture < captureInterval) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    
    // Pozícia relatívna ku containeru (vrátane scrollu)
    const x = e.clientX - rect.left + container.scrollLeft;
    const y = e.clientY - rect.top + container.scrollTop;

    // Cache landmarks ak ešte nie sú
    if (!landmarksCache.current) {
      landmarksCache.current = detectLandmarks();
    }

    // Nájdi najbližší landmark
    const nearestLandmark = findNearestLandmark(x, y, landmarksCache.current);

    const position = {
      x: Math.round(x),
      y: Math.round(y),
      timestamp: now,
    };

    // ✅ PRIDAJ landmark info ak existuje
    if (nearestLandmark) {
      position.nearestLandmark = {
        id: nearestLandmark.id,
        type: nearestLandmark.type,
        offsetX: Math.round(x - nearestLandmark.position.left),
        offsetY: Math.round(y - nearestLandmark.position.top),
        landmarkPosition: nearestLandmark.position
      };
    }

    mousePositions.current.push(position);
    lastCaptureTime.current = now;
    
  }, [isTracking, containerRef, detectLandmarks, findNearestLandmark]);

  // Start tracking
  const startTracking = useCallback(() => {
    if (isTracking) return;
    
    console.log('🖱️ OPTIMALIZED tracking enabled (adaptive FPS with memory management)');
    
    mousePositions.current = [];
    startTime.current = Date.now();
    lastCaptureTime.current = 0;
    
    // Detekuj landmarks pri štarte
    landmarksCache.current = detectLandmarks();
    
    setIsTracking(true);
  }, [isTracking, detectLandmarks]);

  // Stop tracking
  const stopTracking = useCallback(() => {
    if (!isTracking) return;
    
    const totalTime = Date.now() - (startTime.current || 0);
    console.log(`🖱️ Mouse left - tracked ${mousePositions.current.length} positions in ${totalTime}ms`);
    
    setIsTracking(false);
  }, [isTracking]);

  // Get final data s landmarks
  const getFinalData = useCallback(() => {
    const endTime = Date.now();
    const totalHoverTime = startTime.current ? endTime - startTime.current : 0;

    const containerDimensions = containerRef.current ? {
      width: containerRef.current.scrollWidth,
      height: containerRef.current.scrollHeight
    } : { width: 1200, height: 2000 };

    return {
      userId: null, // Bude nastavené v komponente
      contentId,
      contentType,
      mousePositions: mousePositions.current,
      totalHoverTime,
      hoverStartTime: startTime.current,
      containerDimensions,
      // ✅ PRIDAJ landmarks do final data
      landmarks: landmarksCache.current || [],
      timestamp: new Date().toISOString(),
      isMobile: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    };
  }, [contentId, contentType, containerRef]);

  // ✅ OPRAVA - Event listeners bez rafId
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !isTracking) return;

    container.addEventListener('mousemove', handleMouseMove, { passive: true });

    // ✅ Cleanup bez rafId.current (už sa nepoužíva)
    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isTracking, handleMouseMove, containerRef]);

  return {
    isTracking,
    startTracking,
    stopTracking,
    getFinalData,
    positionsCount: mousePositions.current.length
  };
};
