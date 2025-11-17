// src/utils/trackingHelpers.js
// FINÁLNA VERZIA - S fixnými rozmermi a landmarks

import { generateVisualization } from './visualizationGenerator';

/**
 * ✅ KONŠTANTY - Štandardné rozmery pre všetky komponenty
 */
const STANDARD_WIDTH = 1200;
const STANDARD_HEIGHT = 2000;

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
 * ✅ NOVÁ FUNKCIA - Resize image na štandardné rozmery
 */
async function resizeImageToStandard(blob, targetWidth = STANDARD_WIDTH, targetHeight = STANDARD_HEIGHT) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);
    
    img.onload = () => {
      // Vytvor canvas so štandardnými rozmermi
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      
      // Biele pozadie
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, targetWidth, targetHeight);
      
      // Vypočítaj scaling aby sa obrázok zmestil
      const scale = Math.min(
        targetWidth / img.width,
        targetHeight / img.height
      );
      
      const scaledWidth = img.width * scale;
      const scaledHeight = img.height * scale;
      
      // Centrovať obrázok
      const x = (targetWidth - scaledWidth) / 2;
      const y = (targetHeight - scaledHeight) / 2;
      
      // Vykresli obrázok
      ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
      
      // Konvertuj na blob
      canvas.toBlob((resizedBlob) => {
        URL.revokeObjectURL(url);
        resolve(resizedBlob);
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
 * ✅ NOVÁ FUNKCIA - Normalizuj tracking pozície na štandardné rozmery
 */
function normalizeTrackingPositions(positions, originalWidth, originalHeight, targetWidth = STANDARD_WIDTH, targetHeight = STANDARD_HEIGHT) {
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
 * ✅ NOVÁ FUNKCIA - Normalizuj landmarks na štandardné rozmery
 */
function normalizeLandmarks(landmarks, originalWidth, originalHeight, targetWidth = STANDARD_WIDTH, targetHeight = STANDARD_HEIGHT) {
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
    const originalHeight = trackingData.containerDimensions?.height || STANDARD_HEIGHT;

    // ✅ 1. Normalizuj tracking pozície na štandardné rozmery
    const normalizedPositions = normalizeTrackingPositions(
      trackingData.mousePositions,
      originalWidth,
      originalHeight,
      STANDARD_WIDTH,
      STANDARD_HEIGHT
    );

    // ✅ 2. Normalizuj landmarks na štandardné rozmery
    const normalizedLandmarks = normalizeLandmarks(
      trackingData.landmarks || [],
      originalWidth,
      originalHeight,
      STANDARD_WIDTH,
      STANDARD_HEIGHT
    );

    // ✅ 3. Ulož tracking dáta do MongoDB (s normalizovanými pozíciami)
    const normalizedTrackingData = {
      ...trackingData,
      mousePositions: normalizedPositions,
      landmarks: normalizedLandmarks,
      containerDimensions: {
        width: STANDARD_WIDTH,
        height: STANDARD_HEIGHT,
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

    // ✅ 4. Vygeneruj heatmap overlay (už s normalizovanými pozíciami)
    const visualization = await generateVisualization(
      normalizedTrackingData,
      STANDARD_WIDTH,
      STANDARD_HEIGHT,
      containerElement
    );

    if (!visualization || !visualization.blob) {
      console.warn('⚠️ No visualization generated, skipping Cloudinary upload');
      return { success: true, tracking: trackingResult };
    }

    // ✅ 5. Konvertuj Blob na base64
    const base64Image = await blobToBase64(visualization.blob);

    // ✅ 6. Upload heatmap overlay do Cloudinary
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

    // ✅ 7. Aktualizuj tracking záznam s Cloudinary URL
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
 * ✅ NOVÁ FUNKCIA - Vygeneruje a uploaduje component template screenshot (fixné rozmery)
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

    console.log('📏 Original size:', {
      width: screenshot.width,
      height: screenshot.height,
      size: `${(originalBlob.size / 1024).toFixed(2)}KB`
    });

    // ✅ Resize na štandardné rozmery
    const resizedBlob = await resizeImageToStandard(originalBlob, STANDARD_WIDTH, STANDARD_HEIGHT);

    console.log('📏 Resized to standard:', {
      width: STANDARD_WIDTH,
      height: STANDARD_HEIGHT,
      size: `${(resizedBlob.size / 1024).toFixed(2)}KB`
    });

    // Konvertuj na base64
    const base64Image = await blobToBase64(resizedBlob);

    // Upload do Cloudinary
    const response = await fetch('/api/upload-component-template', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageBase64: base64Image,
        contentId: contentId,
        contentType: contentType,
        dimensions: {
          width: STANDARD_WIDTH,
          height: STANDARD_HEIGHT
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
