// src/utils/trackingHelpers.js
// FINÁLNA OPRAVENÁ VERZIA - Správna konverzia percent → pixels + High-quality template

import { generateVisualization } from './visualizationGenerator';

/**
 * ✅ KONŠTANTY
 */
const STANDARD_WIDTH = 1920;
const MAX_HEIGHT = 10000;
const MIN_HEIGHT = 600;

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
 * ✅ Vypočítaj proportional výšku
 */
function calculateProportionalHeight(originalWidth, originalHeight, targetWidth) {
  const scale = targetWidth / originalWidth;
  const targetHeight = Math.round(originalHeight * scale);
  
  return Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, targetHeight));
}

/**
 * ✅ OPRAVENÁ FUNKCIA - High-quality resize s Bicubic interpoláciou
 */
async function resizeImageToStandardHighQuality(blob, targetWidth = STANDARD_WIDTH) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);
    
    img.onload = () => {
      const targetHeight = calculateProportionalHeight(img.width, img.height, targetWidth);
      
      console.log('📏 High-quality image resize:', {
        original: `${img.width}×${img.height}`,
        target: `${targetWidth}×${targetHeight}`,
        scale: (targetWidth / img.width).toFixed(4)
      });
      
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d', { alpha: false });
      
      // ✅ OPRAVA - High-quality settings
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, targetWidth, targetHeight);
      
      // ✅ OPRAVA - Lepšie nastavenia pre rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';  // ✅ HIGH quality interpolation
      
      // ✅ OPRAVA - Priama konverzia z original rozmerov
      ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, targetWidth, targetHeight);
      
      canvas.toBlob((resizedBlob) => {
        URL.revokeObjectURL(url);
        resolve({ 
          blob: resizedBlob, 
          width: targetWidth,
          height: targetHeight 
        });
      }, 'image/png', 0.98);  // ✅ OPRAVA - Vyššia kvalita (0.98)
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    
    img.src = url;
  });
}

/**
 * ✅ Normalizuj tracking pozície ako PERCENTÁ
 */
function normalizeTrackingPositionsAsPercent(positions, originalWidth, originalHeight) {
  if (!positions || positions.length === 0) return [];
  
  return positions.map(pos => {
    const normalized = {
      x: Number(((pos.x / originalWidth) * 100).toFixed(4)),
      y: Number(((pos.y / originalHeight) * 100).toFixed(4)),
      timestamp: pos.timestamp
    };
    
    if (pos.nearestLandmark) {
      normalized.nearestLandmark = {
        id: pos.nearestLandmark.id,
        type: pos.nearestLandmark.type,
        offsetX: Number(((pos.nearestLandmark.offsetX / originalWidth) * 100).toFixed(4)),
        offsetY: Number(((pos.nearestLandmark.offsetY / originalHeight) * 100).toFixed(4)),
        landmarkPosition: {
          top: Number(((pos.nearestLandmark.landmarkPosition.top / originalHeight) * 100).toFixed(4)),
          left: Number(((pos.nearestLandmark.landmarkPosition.left / originalWidth) * 100).toFixed(4)),
          width: Number(((pos.nearestLandmark.landmarkPosition.width / originalWidth) * 100).toFixed(4)),
          height: Number(((pos.nearestLandmark.landmarkPosition.height / originalHeight) * 100).toFixed(4))
        }
      };
    }
    
    return normalized;
  });
}

/**
 * ✅ Normalizuj landmarks ako PERCENTÁ
 */
function normalizeLandmarksAsPercent(landmarks, originalWidth, originalHeight) {
  if (!landmarks || landmarks.length === 0) return [];
  
  return landmarks.map(landmark => ({
    id: landmark.id,
    type: landmark.type,
    position: {
      top: Number(((landmark.position.top / originalHeight) * 100).toFixed(4)),
      left: Number(((landmark.position.left / originalWidth) * 100).toFixed(4)),
      width: Number(((landmark.position.width / originalWidth) * 100).toFixed(4)),
      height: Number(((landmark.position.height / originalHeight) * 100).toFixed(4))
    }
  }));
}

/**
 * ✅ OPRAVENÁ KONVERZIA - Konvertuj percentá na pixely (používa TEMPLATE rozmery)
 */
export function convertPercentToPixels(positions, templateWidth, templateHeight) {
  if (!positions || positions.length === 0) return [];
  
  console.log('🔄 Converting percent to pixels:', {
    positionsCount: positions.length,
    templateSize: `${templateWidth}×${templateHeight}`,
    sampleBefore: positions[0]
  });
  
  const converted = positions.map(pos => {
    const pixel = {
      x: Math.round((pos.x / 100) * templateWidth),
      y: Math.round((pos.y / 100) * templateHeight),
      timestamp: pos.timestamp
    };
    
    if (pos.nearestLandmark) {
      pixel.nearestLandmark = {
        id: pos.nearestLandmark.id,
        type: pos.nearestLandmark.type,
        offsetX: Math.round((pos.nearestLandmark.offsetX / 100) * templateWidth),
        offsetY: Math.round((pos.nearestLandmark.offsetY / 100) * templateHeight),
        landmarkPosition: {
          top: Math.round((pos.nearestLandmark.landmarkPosition.top / 100) * templateHeight),
          left: Math.round((pos.nearestLandmark.landmarkPosition.left / 100) * templateWidth),
          width: Math.round((pos.nearestLandmark.landmarkPosition.width / 100) * templateWidth),
          height: Math.round((pos.nearestLandmark.landmarkPosition.height / 100) * templateHeight)
        }
      };
    }
    
    return pixel;
  });
  
  console.log('✅ Conversion complete:', {
    sampleAfter: converted[0]
  });
  
  return converted;
}

/**
 * ✅ OPRAVENÁ KONVERZIA - Konvertuj landmarks percentá na pixely
 */
export function convertLandmarksPercentToPixels(landmarks, templateWidth, templateHeight) {
  if (!landmarks || landmarks.length === 0) return [];
  
  console.log('🔄 Converting landmarks percent to pixels:', {
    landmarksCount: landmarks.length,
    templateSize: `${templateWidth}×${templateHeight}`,
    sampleBefore: landmarks[0]
  });
  
  const converted = landmarks.map(landmark => ({
    id: landmark.id,
    type: landmark.type,
    position: {
      top: Math.round((landmark.position.top / 100) * templateHeight),
      left: Math.round((landmark.position.left / 100) * templateWidth),
      width: Math.round((landmark.position.width / 100) * templateWidth),
      height: Math.round((landmark.position.height / 100) * templateHeight)
    }
  }));
  
  console.log('✅ Landmarks conversion complete:', {
    sampleAfter: converted[0]
  });
  
  return converted;
}

/**
 * ✅ HLAVNÁ FUNKCIA - Uloží tracking + vygeneruje individuálnu heatmap (1920px)
 */
export const saveTrackingWithVisualization = async (trackingData, containerElement) => {
  try {
    console.log('💾 Saving tracking data with individual heatmap...');

    const originalWidth = trackingData.containerDimensions?.width || STANDARD_WIDTH;
    const originalHeight = trackingData.containerDimensions?.height || MIN_HEIGHT;

    console.log('📐 Original dimensions:', { originalWidth, originalHeight });

    // ✅ Normalizuj tracking pozície ako PERCENTÁ
    const normalizedPositions = normalizeTrackingPositionsAsPercent(
      trackingData.mousePositions,
      originalWidth,
      originalHeight
    );

    // ✅ Normalizuj landmarks ako PERCENTÁ
    const normalizedLandmarks = normalizeLandmarksAsPercent(
      trackingData.landmarks || [],
      originalWidth,
      originalHeight
    );

    // Ulož tracking dáta do MongoDB (s percentami)
    const normalizedTrackingData = {
      ...trackingData,
      mousePositions: normalizedPositions,
      landmarks: normalizedLandmarks,
      containerDimensions: {
        originalWidth: originalWidth,
        originalHeight: originalHeight,
        storageFormat: 'percent'
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
    console.log('✅ Tracking data saved (percent format):', trackingResult);

    // ✅ Vygeneruj INDIVIDUÁLNU heatmap pre Cloudinary (1920px template)
    const targetWidth = STANDARD_WIDTH;
    const targetHeight = calculateProportionalHeight(originalWidth, originalHeight, targetWidth);

    console.log('📐 Target dimensions for heatmap:', { targetWidth, targetHeight });

    // ✅ Konvertuj percentá na pixely (pre 1920px template)
    const pixelPositions = convertPercentToPixels(
      normalizedPositions,
      targetWidth,
      targetHeight
    );

    const pixelLandmarks = convertLandmarksPercentToPixels(
      normalizedLandmarks,
      targetWidth,
      targetHeight
    );

    // Vygeneruj individuálnu heatmap overlay
    const visualization = await generateVisualization(
      {
        ...trackingData,
        mousePositions: pixelPositions,
        landmarks: pixelLandmarks
      },
      targetWidth,
      targetHeight,
      containerElement
    );

    if (!visualization || !visualization.blob) {
      console.warn('⚠️ No visualization generated, skipping Cloudinary upload');
      return { success: true, tracking: trackingResult };
    }

    console.log('✅ Individual heatmap generated:', {
      size: `${(visualization.blob.size / 1024).toFixed(2)}KB`,
      dimensions: `${targetWidth}×${targetHeight}`
    });

    // Konvertuj Blob na base64
    const base64Image = await blobToBase64(visualization.blob);

    // Upload individuálnej heatmap do Cloudinary
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
    console.log('✅ Individual heatmap uploaded to Cloudinary:', cloudinaryResult.data?.url);

    // Aktualizuj tracking záznam s Cloudinary URL
    await fetch('/api/update-tracking-cloudinary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        trackingId: trackingResult.trackingId,
        cloudinaryData: cloudinaryResult.data,
      }),
    });

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
 * ✅ OPRAVENÁ FUNKCIA - Template generation (1920px, bez scale:2, high-quality)
 */
export const generateAndUploadComponentTemplate = async (containerElement, contentId, contentType) => {
  if (!containerElement) {
    console.warn('⚠️ No container element for template');
    return null;
  }

  try {
    console.log('📸 Generating component template screenshot (1920px)...');

    const html2canvas = (await import('html2canvas')).default;
    
    // ✅ OPRAVA - Bez scale: 2, používame scale: 1 pre presnosť
    const screenshot = await html2canvas(containerElement, {
      width: containerElement.scrollWidth,
      height: containerElement.scrollHeight,
      scrollX: 0,
      scrollY: 0,
      windowWidth: containerElement.scrollWidth,
      windowHeight: containerElement.scrollHeight,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#FFFFFF',
      scale: 1,  // ✅ OPRAVA - Bez scale: 2
      logging: false,
      removeContainer: false,
      foreignObjectRendering: false,
      imageTimeout: 0,
      letterRendering: true,
    });

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

    // ✅ OPRAVENÁ FUNKCIA - Lepší resample algoritmus
    const resizeResult = await resizeImageToStandardHighQuality(originalBlob, STANDARD_WIDTH);

    console.log('📏 Resized to 1920px (high quality):', {
      width: resizeResult.width,
      height: resizeResult.height,
      size: `${(resizeResult.blob.size / 1024).toFixed(2)}KB`
    });

    const base64Image = await blobToBase64(resizeResult.blob);

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
    console.log('✅ Component template uploaded (1920px):', result.data?.url);

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
