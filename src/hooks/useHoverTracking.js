// src/hooks/useHoverTracking.js
// FINÁLNA OPRAVENÁ VERZIA - Page-relative tracking + fixed return values

import { useEffect, useRef, useCallback } from 'react';
import { saveTrackingWithVisualization, generateAndUploadComponentTemplate } from '../utils/trackingHelpers';
import { useUserStats } from '../contexts/UserStatsContext';

const TRACKING_SAMPLE_INTERVAL = 100;
const LANDMARK_THRESHOLD = 200;

export const useHoverTracking = (contentId, contentType, containerRef, options = {}) => {
  const { userId } = useUserStats();
  
  const mousePositions = useRef([]);
  const startTime = useRef(null);
  const lastSampleTime = useRef(0);
  const totalHoverTime = useRef(0);
  const landmarks = useRef([]);
  const containerDimensions = useRef(null);
  const isTracking = useRef(false);
  const templateGenerated = useRef(false);

  const { 
    enableTracking = true,
    detectLandmarks = true,
    landmarkSelectors = [
      '[data-landmark]',
      '[class*="Post"]',
      'button',
      'input',
      '[role="button"]'
    ]
  } = options;

  // ✅ Detekuj landmarks s page-relative pozíciami
  const detectPageLandmarks = useCallback(() => {
    if (!containerRef.current || !detectLandmarks) return;

    const detectedLandmarks = [];
    
    landmarkSelectors.forEach(selector => {
      const elements = containerRef.current.querySelectorAll(selector);
      
      elements.forEach((el, index) => {
        const rect = el.getBoundingClientRect();
        const landmarkId = el.getAttribute('data-landmark') || 
                          el.getAttribute('data-testid') || 
                          `${selector.replace(/[[\]]/g, '')}_${index}`;
        
        const pageTop = rect.top + window.scrollY;
        const pageLeft = rect.left + window.scrollX;
        
        detectedLandmarks.push({
          id: landmarkId,
          type: el.tagName.toLowerCase(),
          position: {
            top: pageTop,
            left: pageLeft,
            width: rect.width,
            height: rect.height
          }
        });
      });
    });

    landmarks.current = detectedLandmarks;
    
    console.log(`🎯 Detected ${detectedLandmarks.length} landmarks (page-relative)`);
  }, [containerRef, detectLandmarks, landmarkSelectors]);

  // ✅ Nájdi nearest landmark
  const findNearestLandmark = useCallback((pageX, pageY) => {
    if (landmarks.current.length === 0) return null;

    let nearest = null;
    let minDistance = LANDMARK_THRESHOLD;

    landmarks.current.forEach(landmark => {
      const { top, left, width, height } = landmark.position;
      
      const landmarkCenterX = left + width / 2;
      const landmarkCenterY = top + height / 2;
      
      const dx = pageX - landmarkCenterX;
      const dy = pageY - landmarkCenterY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < minDistance) {
        minDistance = distance;
        nearest = {
          id: landmark.id,
          type: landmark.type,
          offsetX: pageX - left,
          offsetY: pageY - top,
          landmarkPosition: { top, left, width, height }
        };
      }
    });

    return nearest;
  }, []);

  // ✅ Record mouse position (PAGE coordinates)
  const recordMousePosition = useCallback((e) => {
    if (!isTracking.current || !containerRef.current) return;

    const now = Date.now();
    if (now - lastSampleTime.current < TRACKING_SAMPLE_INTERVAL) return;

    lastSampleTime.current = now;

    const pageX = e.pageX;
    const pageY = e.pageY;

    const position = {
      x: pageX,
      y: pageY,
      timestamp: now
    };

    const nearestLandmark = findNearestLandmark(pageX, pageY);
    if (nearestLandmark) {
      position.nearestLandmark = nearestLandmark;
    }

    mousePositions.current.push(position);

  }, [containerRef, findNearestLandmark]);

  // ✅ Start tracking
  const startTracking = useCallback(async () => {
    if (!enableTracking || isTracking.current) {
      return;
    }

    // ✅ OPRAVA - Počkaj na container
    let attempts = 0;
    while (!containerRef.current && attempts < 20) {
      console.log(`⏳ Waiting for container... attempt ${attempts + 1}/20`);
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }

    if (!containerRef.current) {
      console.error('❌ Container not found after waiting');
      return;
    }

    console.log('🎬 Starting hover tracking:', { contentId, contentType, userId });

    startTime.current = Date.now();
    isTracking.current = true;

    // ✅ Ulož FULL PAGE dimensions
    containerDimensions.current = {
      width: document.documentElement.scrollWidth,
      height: document.documentElement.scrollHeight,
      containerWidth: containerRef.current.scrollWidth,
      containerHeight: containerRef.current.scrollHeight,
      containerOffsetTop: containerRef.current.getBoundingClientRect().top + window.scrollY,
      containerOffsetLeft: containerRef.current.getBoundingClientRect().left + window.scrollX
    };

    console.log('📐 Page dimensions:', containerDimensions.current);

    detectPageLandmarks();

    // Generate template
    if (!templateGenerated.current) {
      try {
        console.log('📸 Generating component template...');
        await generateAndUploadComponentTemplate(containerRef.current, contentId, contentType);
        templateGenerated.current = true;
        console.log('✅ Template generated successfully');
      } catch (error) {
        console.error('❌ Template generation failed:', error);
      }
    }

    document.addEventListener('mousemove', recordMousePosition);
    console.log('✅ Tracking started');

  }, [enableTracking, containerRef, contentId, contentType, userId, detectPageLandmarks, recordMousePosition]);

  // ✅ Stop tracking
  const stopTracking = useCallback(async () => {
    if (!isTracking.current) {
      console.warn('⚠️ Tracking already stopped');
      return;
    }

    console.log('🛑 Stopping tracking...');
    
    document.removeEventListener('mousemove', recordMousePosition);
    isTracking.current = false;

    const endTime = Date.now();
    totalHoverTime.current = endTime - startTime.current;

    if (mousePositions.current.length === 0) {
      console.warn('⚠️ No mouse positions recorded');
      return;
    }

    const trackingData = {
      userId,
      contentId,
      contentType,
      mousePositions: mousePositions.current,
      landmarks: landmarks.current,
      containerDimensions: containerDimensions.current,
      totalHoverTime: totalHoverTime.current,
      timestamp: new Date().toISOString()
    };

    console.log('💾 Saving tracking data:', {
      positions: mousePositions.current.length,
      landmarks: landmarks.current.length,
      time: `${(totalHoverTime.current / 1000).toFixed(1)}s`
    });

    try {
      await saveTrackingWithVisualization(trackingData, containerRef.current);
      console.log('✅ Tracking data saved successfully');
    } catch (error) {
      console.error('❌ Failed to save tracking data:', error);
    }

    // Reset
    mousePositions.current = [];
    landmarks.current = [];
    startTime.current = null;
    totalHoverTime.current = 0;

  }, [userId, contentId, contentType, containerRef, recordMousePosition]);

  // Lifecycle
  useEffect(() => {
    if (!enableTracking) return;

    startTracking();

    return () => {
      if (isTracking.current) {
        stopTracking();
      }
    };
  }, [enableTracking, startTracking, stopTracking]);

  // Window unload
  useEffect(() => {
    const handleUnload = () => {
      if (isTracking.current) {
        stopTracking();
      }
    };

    window.addEventListener('beforeunload', handleUnload);

    return () => {
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [stopTracking]);

  // ✅ OPRAVA - Return správne hodnoty
  return {
    startTracking,
    stopTracking,
    isTracking: isTracking.current,
    positionsCount: mousePositions.current.length,
    landmarksCount: landmarks.current.length,
    totalHoverTime: totalHoverTime.current
  };
};

export default useHoverTracking;
