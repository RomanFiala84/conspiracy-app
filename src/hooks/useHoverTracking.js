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
 * ✅ OPRAVA: Vysokofrekvenčný tracking bez throttling
 * @param {string} contentId - ID príspevku/intervencie/prevencie
 * @param {string} contentType - 'post', 'intervention', 'prevention'
 * @param {string} userId - ID používateľa (z UserStatsContext)
 */
export const useHoverTracking = (contentId, contentType, userId) => {
  const containerRef = useRef(null);
  const positionsRef = useRef([]); // ✅ OPRAVA: Použiť ref namiesto state
  const [trackingData, setTrackingData] = useState({
    contentId,
    contentType,
    userId,
    mousePositions: [],
    hoverStartTime: null,
    totalHoverTime: 0,
    isTracking: false,
    isMobile: isMobileDevice(),
  });


  useEffect(() => {
    const container = containerRef.current;
    
    // ✅ Netrackujeme na mobile!
    if (isMobileDevice()) {
      console.log('📱 Mobile device detected - tracking disabled');
      return;
    }
    
    if (!container || !userId) return;


    let hoverStartTime = null;
    let rafId = null;
    let lastRecordedTime = 0;
    
    // ✅ OPRAVA: 50ms → 16ms (60 FPS = smooth tracking)
    const RECORD_INTERVAL = 16; // ~60 bodov/sekundu


    // Handler pre vstup myši do oblasti
    const handleMouseEnter = () => {
      hoverStartTime = Date.now();
      positionsRef.current = []; // Reset pozícií
      
      setTrackingData(prev => ({
        ...prev,
        hoverStartTime: hoverStartTime,
        isTracking: true,
        mousePositions: [],
      }));
      
      console.log('🖱️ Mouse entered - tracking started');
    };


    // Handler pre opustenie myši
    const handleMouseLeave = () => {
      if (!hoverStartTime) return;
      
      const duration = Date.now() - hoverStartTime;
      
      setTrackingData(prev => ({
        ...prev,
        totalHoverTime: prev.totalHoverTime + duration,
        hoverStartTime: null,
        isTracking: false,
        mousePositions: positionsRef.current, // ✅ Commit pozícií
      }));
      
      console.log(`🖱️ Mouse left - tracked ${positionsRef.current.length} positions in ${duration}ms`);
      hoverStartTime = null;
    };


    // ✅ OPRAVA: Handler pre pohyb myši BEZ throttling v handleru
    const handleMouseMove = (e) => {
      if (!hoverStartTime) return;
      
      const currentTime = Date.now();
      
      // ✅ Throttling ale menej agressívny
      if (currentTime - lastRecordedTime < RECORD_INTERVAL) {
        return;
      }
      
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // ✅ KRITICKÉ: Kontrola či je pozícia v rámci containera
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
        return; // Ignoruj pozície mimo containera
      }
      
      // ✅ Uložiť do ref (rýchlejšie ako state update)
      positionsRef.current.push({
        x: Math.round(x),
        y: Math.round(y),
        timestamp: currentTime,
        relativeTime: currentTime - hoverStartTime,
      });
      
      lastRecordedTime = currentTime;
    };


    // Pridať event listeners
    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);
    container.addEventListener('mousemove', handleMouseMove);


    console.log('🖱️ Desktop tracking enabled (16ms interval = 60 FPS)');


    // Cleanup
    return () => {
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
      container.removeEventListener('mousemove', handleMouseMove);
      
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [contentId, contentType, userId]);


  return { containerRef, trackingData };
};