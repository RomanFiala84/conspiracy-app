// src/utils/trackingHelpers.js
// OPRAVENÁ VERZIA - Dynamická výška namiesto fixnej

import { generateVisualization } from './visualizationGenerator';

/**
 * ✅ UPRAVENÉ KONŠTANTY - Fixná šírka, dynamická výška
 */
const STANDARD_WIDTH = 1200;
const MAX_HEIGHT = 10000; // Maximum (bezpečnostný limit)
const MIN_HEIGHT = 600;   // Minimum

/**
 * Helper: Konvertuje Blob na base64 string
 */
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * ✅ NOVÁ FUNKCIA - Vypočítaj proportional výšku
 */
function calculateProportionalHeight(originalWidth, originalHeight, targetWidth) {
  const scale = targetWidth / originalWidth;
  const targetHeight = Math.round(originalHeight * scale);
  
  // Clamp medzi MIN a MAX
  return Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, targetHeight));
}

/**
 * ✅ UPRAVENÁ FUNKCIA - Resize s proporcionálnou výškou
 */
async function resizeImageToStandard(blob, targetWidth = STANDARD_WIDTH) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);
    
    img.onload = () => {
      // ✅ Vypočítaj proportional height
      const targetHeight = calculateProportionalHeight(img.width, img.height, targetWidth);
      
      console.log('📏 Image resize:', {
        original: `${img.width}×${img.height}`,
        target: `${targetWidth}×${targetHeight}`,
        scale: (targetWidth / img.width).toFixed(2)
      });
      
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight; // ✅ Dynamická výška
      const ctx = canvas.getContext('2d');
      
      // Biele pozadie
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, targetWidth, targetHeight);
      
      // Vykresli obrázok (fit to width, maintain aspect ratio)
      const scale = targetWidth / img.width;
      const scaledHeight = img.height * scale;
      
      ctx.drawImage(img, 0, 0, targetWidth, scaledHeight);
      
      canvas.toBlob((resizedBlob) => {
        URL.revokeObjectURL(url);
        resolve({ 
          blob: resizedBlob, 
          width: targetWidth,
          height: targetHeight 
        });
      }, 'image/png', 0.95);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    
    img.src = url;
  });
}

/**
 * ✅ UPRAVENÁ FUNKCIA - Normalizuj tracking pozície (len X-os, Y zostáva proportional)
 */
function normalizeTrackingPositions(positions, originalWidth, originalHeight, targetWidth, targetHeight) {
  if (!positions || positions.length === 0) return [];
  
  const scaleX = targetWidth / originalWidth;
  const scaleY = targetHeight / originalHeight;
  
  return positions.map(pos => {
    const normalized = {
      x: Math.round(pos.x * scaleX),
      y: Math.round(pos.y * scaleY),
      timestamp: pos.timestamp
    };
    
    // ✅ Normalizuj aj landmark pozície
    if (pos.nearestLandmark) {
      normalized.nearestLandmark = {
        id: pos.nearestLandmark.id,
        type: pos.nearestLandmark.type,
        offsetX: Math.round(pos.nearestLandmark.offsetX * scaleX),
        offsetY: Math.round(pos.nearestLandmark.offsetY * scaleY),
        landmarkPosition: {
          top: Math.round(pos.nearestLandmark.landmarkPosition.top * scaleY),
          left: Math.round(pos.nearestLandmark.landmarkPosition.left * scaleX),
          width: Math.round(pos.nearestLandmark.landmarkPosition.width * scaleX),
          height: Math.round(pos.nearestLandmark.landmarkPosition.height * scaleY)
        }
      };
    }
    
    return normalized;
  });
}

/**
 * ✅ UPRAVENÁ FUNKCIA - Normalizuj landmarks
 */
function normalizeLandmarks(landmarks, originalWidth, originalHeight, targetWidth, targetHeight) {
  if (!landmarks || landmarks.length === 0) return [];
  
  const scaleX = targetWidth / originalWidth;
  const scaleY = targetHeight / originalHeight;
  
  return landmarks.map(landmark => ({
    id: landmark.id,
    type: landmark.type,
    position: {
      top: Math.round(landmark.position.top * scaleY),
      left: Math.round(landmark.position.left * scaleX),
      width: Math.round(landmark.position.width * scaleX),
      height: Math.round(landmark.position.height * scaleY)
    }
  }));
}

/**
 * ✅ UPRAVENÁ FUNKCIA - Uloží tracking + vygeneruje heatmap overlay
 */
export const saveTrackingWithVisualization = async (trackingData, containerElement) => {
  try {
    console.log('💾 Saving tracking data with visualization...');

    const originalWidth = trackingData.containerDimensions?.width || STANDARD_WIDTH;
    const originalHeight = trackingData.containerDimensions?.height || MIN_HEIGHT;

    console.log('📐 Original dimensions:', { originalWidth, originalHeight });

    // ✅ 1. Vypočítaj target rozmery (proportional height)
    const targetWidth = STANDARD_WIDTH;
    const targetHeight = calculateProportionalHeight(originalWidth, originalHeight, targetWidth);

    console.log('📐 Target dimensions:', { targetWidth, targetHeight });

    // ✅ 2. Normalizuj tracking pozície
    const normalizedPositions = normalizeTrackingPositions(
      trackingData.mousePositions,
      originalWidth,
      originalHeight,
      targetWidth,
      targetHeight
    );

    // ✅ 3. Normalizuj landmarks
    const normalizedLandmarks = normalizeLandmarks(
      trackingData.landmarks || [],
      originalWidth,
      originalHeight,
      targetWidth,
      targetHeight
    );

    // ✅ 4. Ulož tracking dáta do MongoDB (s normalizovanými pozíciami a landmarks)
    const normalizedTrackingData = {
      ...trackingData,
      mousePositions: normalizedPositions,
      landmarks: normalizedLandmarks,
      containerDimensions: {
        width: targetWidth,
        height: targetHeight,
        original: {
          width: originalWidth,
          height: originalHeight
        }
      }
    };

    const trackingResponse = await fetch('/api/save-tracking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(normalizedTrackingData),
    });

    if (!trackingResponse.ok) {
      throw new Error(`Failed to save tracking: ${trackingResponse.status}`);
    }

    const trackingResult = await trackingResponse.json();
    console.log('✅ Tracking data saved:', trackingResult);

    // ✅ 5. Vygeneruj heatmap overlay (už s normalizovanými pozíciami)
    const visualization = await generateVisualization(
      normalizedTrackingData,
      targetWidth,
      targetHeight,
      containerElement
    );

    if (!visualization || !visualization.blob) {
      console.warn('⚠️ No visualization generated, skipping Cloudinary upload');
      return { success: true, tracking: trackingResult };
    }

    // ✅ 6. Konvertuj Blob na base64
    const base64Image = await blobToBase64(visualization.blob);

    // ✅ 7. Upload heatmap overlay do Cloudinary
    const cloudinaryResponse = await fetch('/api/upload-heatmap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageBase64: base64Image,
        contentId: trackingData.contentId,
        contentType: trackingData.contentType,
        userId: trackingData.userId,
        trackingId: trackingResult.trackingId || 'unknown',
      }),
    });

    if (!cloudinaryResponse.ok) {
      console.warn('⚠️ Cloudinary upload failed:', cloudinaryResponse.status);
      return { success: true, tracking: trackingResult };
    }

    const cloudinaryResult = await cloudinaryResponse.json();
    console.log('✅ Heatmap uploaded to Cloudinary:', cloudinaryResult.data?.url);

    // ✅ 8. Aktualizuj tracking záznam s Cloudinary URL
    await fetch('/api/update-tracking-cloudinary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        trackingId: trackingResult.trackingId,
        cloudinaryData: cloudinaryResult.data,
      }),
    });

    // Cleanup
    URL.revokeObjectURL(visualization.objectUrl);

    return {
      success: true,
      tracking: trackingResult,
      cloudinary: cloudinaryResult.data,
    };

  } catch (error) {
    console.error('❌ Failed to save tracking with visualization:', error);
    throw error;
  }
};

/**
 * ✅ UPRAVENÁ FUNKCIA - Vygeneruje a uploaduje component template (dynamická výška)
 */
export const generateAndUploadComponentTemplate = async (containerElement, contentId, contentType) => {
  if (!containerElement) {
    console.warn('⚠️ No container element for template');
    return null;
  }

  try {
    console.log('📸 Generating component template screenshot...');

    // Dynamicky načítaj html2canvas
    const html2canvas = (await import('html2canvas')).default;
    
    const screenshot = await html2canvas(containerElement, {
      width: containerElement.scrollWidth,
      height: containerElement.scrollHeight,
      scrollX: 0,
      scrollY: 0,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      scale: 1,
      logging: false,
    });

    // Konvertuj na Blob
    const originalBlob = await new Promise((resolve) => {
      screenshot.toBlob((blob) => resolve(blob), 'image/png', 0.95);
    });

    if (!originalBlob) {
      throw new Error('Failed to create blob from screenshot');
    }

    console.log('📏 Original screenshot size:', {
      width: screenshot.width,
      height: screenshot.height,
      size: `${(originalBlob.size / 1024).toFixed(2)}KB`
    });

    // ✅ Resize na štandardnú šírku s proporcionálnou výškou
    const resizeResult = await resizeImageToStandard(originalBlob, STANDARD_WIDTH);

    console.log('📏 Resized to standard:', {
      width: resizeResult.width,
      height: resizeResult.height,
      size: `${(resizeResult.blob.size / 1024).toFixed(2)}KB`
    });

    // Konvertuj na base64
    const base64Image = await blobToBase64(resizeResult.blob);

    // Upload do Cloudinary
    const response = await fetch('/api/upload-component-template', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageBase64: base64Image,
        contentId: contentId,
        contentType: contentType,
        dimensions: {
          width: resizeResult.width,
          height: resizeResult.height
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Template upload failed: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Component template uploaded:', result.data?.url);

    return result.data?.url;

  } catch (error) {
    console.error('❌ Failed to generate/upload component template:', error);
    return null;
  }
};

/**
 * Odošle tracking dáta na server
 */
export const sendTrackingData = async (trackingData) => {
  try {
    const response = await fetch('/api/save-tracking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(trackingData),
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Tracking data saved:', result);
    return result;
  } catch (error) {
    console.error('❌ Failed to send tracking data:', error);
    throw error;
  }
};

/**
 * Získa tracking dáta z servera
 */
export const fetchTrackingData = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await fetch(`/api/get-tracking?${queryParams}`);

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('❌ Failed to fetch tracking data:', error);
    throw error;
  }
};
