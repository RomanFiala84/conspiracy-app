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
 * VYSOKÁ FREKVENCIA ZAZNAMENÁVANIA (50ms interval)
 * @param {string} contentId - ID príspevku/intervencie/prevencie
 * @param {string} contentType - 'post', 'intervention', 'prevention'
 * @param {string} userId - ID používateľa (z UserStatsContext)
 */
export const useHoverTracking = (contentId, contentType, userId) => {
  const containerRef = useRef(null);
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
    
    // ✅ NOVÉ - Netrackujeme na mobile!
    if (isMobileDevice()) {
      console.log('📱 Mobile device detected - tracking disabled');
      return;
    }
    
    // Netrackujeme ak:
    // - container neexistuje
    // - používateľ nie je prihlásený
    if (!container || !userId) return;

    let lastRecordedTime = 0;
    // ✅ OPRAVA: 200ms → 50ms (4x viac bodov!)
    const RECORD_INTERVAL = 50; // Zaznamenať každých 50ms (20 bodov/sekundu)

    // Handler pre vstup myši do oblasti
    const handleMouseEnter = () => {
      setTrackingData(prev => ({
        ...prev,
        hoverStartTime: Date.now(),
        isTracking: true,
        mousePositions: [], // Reset pozícií
      }));
    };

    // Handler pre opustenie myši
    const handleMouseLeave = () => {
      setTrackingData(prev => {
        if (!prev.hoverStartTime) return prev;
        
        const duration = Date.now() - prev.hoverStartTime;
        return {
          ...prev,
          totalHoverTime: prev.totalHoverTime + duration,
          hoverStartTime: null,
          isTracking: false,
        };
      });
    };

    // Handler pre pohyb myši
    const handleMouseMove = (e) => {
      const currentTime = Date.now();
      
      // Throttling - zaznamenať iba každých 50ms
      if (currentTime - lastRecordedTime < RECORD_INTERVAL) {
        return;
      }
      
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      setTrackingData(prev => {
        // Ignorovať ak nie je hover active
        if (!prev.hoverStartTime) return prev;
        
        return {
          ...prev,
          mousePositions: [...prev.mousePositions, {
            x: Math.round(x),
            y: Math.round(y),
            timestamp: currentTime,
            relativeTime: currentTime - prev.hoverStartTime,
          }],
        };
      });
      
      lastRecordedTime = currentTime;
    };

    // Pridať event listeners
    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);
    container.addEventListener('mousemove', handleMouseMove);

    console.log('🖱️ Desktop tracking enabled (50ms interval)');

    // Cleanup
    return () => {
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
      container.removeEventListener('mousemove', handleMouseMove);
    };
  }, [contentId, contentType, userId]);

  return { containerRef, trackingData };
};