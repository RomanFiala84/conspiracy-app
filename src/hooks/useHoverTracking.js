// src/hooks/useHoverTracking.js
// FINÁLNA VERZIA - s containerDimensions a percentuálnymi pozíciami

import { useEffect, useRef, useState } from 'react';

/**
 * Detekuje či je mobile zariadenie
 */
const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

/**
 * Custom hook pre sledovanie hover a mouse movements
 * VYPNUTÉ NA MOBILE ZARIADENIACH
 * ✅ Ukladá containerDimensions a percentuálne pozície pre štandardizáciu
 * @param {string} contentId - ID príspevku/intervencie/prevencie
 * @param {string} contentType - 'post', 'intervention', 'prevention'
 * @param {string} userId - ID používateľa (z UserStatsContext)
 */
export const useHoverTracking = (contentId, contentType, userId) => {
  const containerRef = useRef(null);
  const positionsRef = useRef([]);
  const hoverStartTimeRef = useRef(null);
  const totalHoverTimeRef = useRef(0);
  const containerDimensionsRef = useRef(null); // ✅ Ukladá rozmery containera
  
  const [trackingData, setTrackingData] = useState({
    contentId,
    contentType,
    userId,
    mousePositions: [],
    hoverStartTime: null,
    totalHoverTime: 0,
    isTracking: false,
    isMobile: isMobileDevice(),
    containerDimensions: null, // ✅ NOVÉ
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
      
      // ✅ Ulož rozmery containera pri vstupe myši
      const rect = container.getBoundingClientRect();
      containerDimensionsRef.current = {
        width: rect.width,
        height: rect.height,
        timestamp: Date.now(),
      };
      
      setTrackingData(prev => ({
        ...prev,
        hoverStartTime: hoverStartTimeRef.current,
        isTracking: true,
        mousePositions: [],
        containerDimensions: containerDimensionsRef.current,
      }));
      
      console.log('🖱️ Mouse entered - tracking started', {
        containerWidth: rect.width,
        containerHeight: rect.height,
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
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
        return;
      }
      
      // ✅ Ukladaj aj percentuálnu pozíciu pre presnejší scaling
      positionsRef.current.push({
        x: Math.round(x),
        y: Math.round(y),
        // ✅ Percentuálne pozície (0-100) - presné bez ohľadu na rozmery
        xPercent: (x / rect.width) * 100,
        yPercent: (y / rect.height) * 100,
        timestamp: currentTime,
        relativeTime: currentTime - hoverStartTimeRef.current,
      });
      
      lastRecordedTime = currentTime;
    };

    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);
    container.addEventListener('mousemove', handleMouseMove);

    console.log('🖱️ Desktop tracking enabled (16ms interval = 60 FPS)');

    return () => {
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
      container.removeEventListener('mousemove', handleMouseMove);
    };
  }, [contentId, contentType, userId]);

  // ✅ Getter pre finálne sync dáta
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