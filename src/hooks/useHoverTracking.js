// src/hooks/useHoverTracking.js
// FULL-PAGE TRACKING - Zachytáva absolute pozície vrátane scrollu

import { useEffect, useRef, useState } from 'react';

/**
 * Detekuje či je mobile zariadenie
 */
const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

/**
 * Custom hook pre sledovanie hover a mouse movements
 * ✅ Zachytáva ABSOLUTE pozície vrátane scroll offsetu
 */
export const useHoverTracking = (contentId, contentType, userId) => {
  const containerRef = useRef(null);
  const positionsRef = useRef([]);
  const hoverStartTimeRef = useRef(null);
  const totalHoverTimeRef = useRef(0);
  const containerDimensionsRef = useRef(null);
  
  const [trackingData, setTrackingData] = useState({
    contentId,
    contentType,
    userId,
    mousePositions: [],
    hoverStartTime: null,
    totalHoverTime: 0,
    isTracking: false,
    isMobile: isMobileDevice(),
    containerDimensions: null,
  });

  useEffect(() => {
    const container = containerRef.current;
    
    if (isMobileDevice()) {
      console.log('📱 Mobile device detected - tracking disabled');
      return;
    }
    
    if (!container || !userId) return;

    let lastRecordedTime = 0;
    const RECORD_INTERVAL = 16; // 60 FPS

    const handleMouseEnter = () => {
      hoverStartTimeRef.current = Date.now();
      positionsRef.current = [];
      
      // ✅ Ulož CELÉ rozmery (vrátane scrollu)
      containerDimensionsRef.current = {
        width: container.scrollWidth,
        height: container.scrollHeight,
        timestamp: Date.now(),
      };
      
      setTrackingData(prev => ({
        ...prev,
        hoverStartTime: hoverStartTimeRef.current,
        isTracking: true,
        mousePositions: [],
        containerDimensions: containerDimensionsRef.current,
      }));
      
      console.log('🖱️ Mouse entered - FULL-PAGE tracking started', {
        fullWidth: container.scrollWidth,
        fullHeight: container.scrollHeight,
      });
    };

    const handleMouseLeave = () => {
      if (!hoverStartTimeRef.current) return;
      
      const duration = Date.now() - hoverStartTimeRef.current;
      totalHoverTimeRef.current += duration;
      
      setTrackingData(prev => ({
        ...prev,
        totalHoverTime: totalHoverTimeRef.current,
        hoverStartTime: null,
        isTracking: false,
        mousePositions: positionsRef.current,
        containerDimensions: containerDimensionsRef.current,
      }));
      
      console.log(`🖱️ Mouse left - tracked ${positionsRef.current.length} positions in ${duration}ms`);
      hoverStartTimeRef.current = null;
    };

    const handleMouseMove = (e) => {
      if (!hoverStartTimeRef.current) return;
      
      const currentTime = Date.now();
      
      if (currentTime - lastRecordedTime < RECORD_INTERVAL) {
        return;
      }
      
      const rect = container.getBoundingClientRect();
      
      // ✅ ABSOLUTE pozícia vrátane scrollu
      const x = e.clientX - rect.left + container.scrollLeft;
      const y = e.clientY - rect.top + container.scrollTop;
      
      // Validácia
      if (x < 0 || y < 0 || x > container.scrollWidth || y > container.scrollHeight) {
        return;
      }
      
      // ✅ Ukladaj absolute + percentuálnu pozíciu
      positionsRef.current.push({
        x: Math.round(x), // ← Absolute pozícia
        y: Math.round(y), // ← Absolute pozícia
        xPercent: (x / container.scrollWidth) * 100,
        yPercent: (y / container.scrollHeight) * 100,
        timestamp: currentTime,
        relativeTime: currentTime - hoverStartTimeRef.current,
      });
      
      lastRecordedTime = currentTime;
    };

    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);
    container.addEventListener('mousemove', handleMouseMove);

    console.log('🖱️ FULL-PAGE tracking enabled (16ms interval = 60 FPS)');

    return () => {
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
      container.removeEventListener('mousemove', handleMouseMove);
    };
  }, [contentId, contentType, userId]);

  // Getter pre finálne sync dáta
  const getFinalData = () => {
    return {
      ...trackingData,
      mousePositions: positionsRef.current,
      totalHoverTime: totalHoverTimeRef.current,
      containerDimensions: containerDimensionsRef.current,
    };
  };

  return { 
    containerRef, 
    trackingData,
    getFinalData
  };
};
