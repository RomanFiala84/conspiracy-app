// src/utils/visualizationGenerator.js
// HYBRID VERZIA - Screenshot + Heatmap overlay s opravou pre grid layout

import html2canvas from 'html2canvas';

const STANDARD_WIDTH = 1200;

/**
 * Generuje vizualizáciu S POZADÍM komponentu + heatmap overlay
 * ✅ Opravený screenshot pre grid layout
 */
export const generateVisualization = async (trackingData, width, height, containerElement) => {
  if (!trackingData.mousePositions || trackingData.mousePositions.length < 5) {
    console.log('Insufficient tracking data for visualization');
    return null;
  }

  try {
    const originalWidth = trackingData.containerDimensions?.width || width;
    const originalHeight = trackingData.containerDimensions?.height || height;
    
    const aspectRatio = originalHeight / originalWidth;
    const targetWidth = STANDARD_WIDTH;
    const targetHeight = Math.round(targetWidth * aspectRatio);
    
    console.log('📸 Creating screenshot + heatmap overlay:', {
      original: `${originalWidth}x${originalHeight}px`,
      target: `${targetWidth}x${targetHeight}px`,
    });
    
    // ✅ 1️⃣ OPRAVENÝ SCREENSHOT - capture celého containera
    console.log('📸 Capturing full component screenshot...');
    
    const screenshotCanvas = await html2canvas(containerElement, {
      backgroundColor: '#ffffff',
      scale: 1,
      logging: false,
      useCORS: true,
      allowTaint: true,
      // ✅ KRITICKÉ - použiť scrollHeight pre celý obsah
      width: containerElement.scrollWidth,
      height: containerElement.scrollHeight,
      windowWidth: containerElement.scrollWidth,
      windowHeight: containerElement.scrollHeight,
      scrollX: 0,
      scrollY: 0,
      x: 0,
      y: 0,
    });

    // 2️⃣ Vytvor finálny canvas
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = targetWidth;
    finalCanvas.height = targetHeight;
    const ctx = finalCanvas.getContext('2d');

    // 3️⃣ Nakresli screenshot (scaled)
    ctx.drawImage(screenshotCanvas, 0, 0, targetWidth, targetHeight);

    // 4️⃣ Semi-transparent overlay
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.fillRect(0, 0, targetWidth, targetHeight);

    const positions = trackingData.mousePositions;

    // 5️⃣ HEATMAP
    console.log('🔥 Generating heatmap...');
    const heatmapData = generateHeatmapData(positions, targetWidth, targetHeight);
    drawHeatmap(ctx, heatmapData, targetWidth, targetHeight);

    // 6️⃣ Trajektória
    drawTrajectory(ctx, positions, targetWidth, targetHeight);

    // 7️⃣ Markers
    drawMarkers(ctx, positions, targetWidth, targetHeight);

    // 8️⃣ Info panel
    drawInfoPanel(ctx, trackingData, targetWidth, targetHeight);

    console.log('✅ Screenshot + heatmap generated');
    return finalCanvas.toDataURL('image/png', 0.95);

  } catch (error) {
    console.error('❌ Error generating visualization:', error);
    return null;
  }
};

/**
 * Trajektória
 */
function drawTrajectory(ctx, positions, width, height) {
  ctx.beginPath();
  ctx.strokeStyle = 'rgba(74, 144, 226, 0.6)';
  ctx.lineWidth = 2.5;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
  ctx.shadowBlur = 4;

  const firstPos = {
    x: (positions[0].xPercent / 100) * width,
    y: (positions[0].yPercent / 100) * height,
  };
  
  ctx.moveTo(firstPos.x, firstPos.y);

  positions.forEach((pos, index) => {
    if (index === 0) return;
    
    const point = {
      x: (pos.xPercent / 100) * width,
      y: (pos.yPercent / 100) * height,
    };
    
    ctx.lineTo(point.x, point.y);
  });

  ctx.stroke();
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
}

/**
 * Markers
 */
function drawMarkers(ctx, positions, width, height) {
  const firstPos = {
    x: (positions[0].xPercent / 100) * width,
    y: (positions[0].yPercent / 100) * height,
  };
  
  ctx.beginPath();
  ctx.arc(firstPos.x, firstPos.y, 12, 0, 2 * Math.PI);
  ctx.fillStyle = '#00C853';
  ctx.fill();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 11px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('START', firstPos.x, firstPos.y);

  const lastPos = {
    x: (positions[positions.length - 1].xPercent / 100) * width,
    y: (positions[positions.length - 1].yPercent / 100) * height,
  };
  
  ctx.beginPath();
  ctx.arc(lastPos.x, lastPos.y, 12, 0, 2 * Math.PI);
  ctx.fillStyle = '#E53935';
  ctx.fill();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 11px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('END', lastPos.x, lastPos.y);
}

/**
 * Info panel
 */
function drawInfoPanel(ctx, trackingData, width, height) {
  const padding = 20;
  const panelWidth = 300;
  const panelHeight = 130;
  const panelX = width - panelWidth - padding;
  const panelY = height - panelHeight - padding;

  // Background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
  ctx.roundRect(panelX, panelY, panelWidth, panelHeight, 12);
  ctx.fill();

  // Border
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 18px Arial';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  const hoverTime = (trackingData.totalHoverTime / 1000).toFixed(1);
  const pointsCount = trackingData.mousePositions.length;

  ctx.fillText(`⏱️ Hover time: ${hoverTime}s`, panelX + 15, panelY + 15);
  ctx.fillText(`📍 Points: ${pointsCount}`, panelX + 15, panelY + 45);
  ctx.fillText(`🔥 Heatmap enabled`, panelX + 15, panelY + 75);
  
  ctx.font = '13px Arial';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.fillText(`📐 ${width}×${height}px`, panelX + 15, panelY + 105);
}

/**
 * Heatmap generation
 */
function generateHeatmapData(positions, width, height) {
  const gridSize = 25;
  const cols = Math.ceil(width / gridSize);
  const rows = Math.ceil(height / gridSize);
  
  const heatmap = Array(rows).fill(0).map(() => Array(cols).fill(0));
  
  positions.forEach(pos => {
    const x = (pos.xPercent / 100) * width;
    const y = (pos.yPercent / 100) * height;
    
    const col = Math.floor(x / gridSize);
    const row = Math.floor(y / gridSize);
    
    if (row >= 0 && row < rows && col >= 0 && col < cols) {
      heatmap[row][col]++;
    }
  });
  
  let maxValue = 0;
  heatmap.forEach(row => {
    row.forEach(val => {
      if (val > maxValue) maxValue = val;
    });
  });
  
  if (maxValue > 0) {
    heatmap.forEach((row, r) => {
      row.forEach((val, c) => {
        heatmap[r][c] = val / maxValue;
      });
    });
  }
  
  return { heatmap, gridSize, cols, rows, maxValue };
}

/**
 * Draw heatmap
 */
function drawHeatmap(ctx, heatmapData, width, height) {
  const { heatmap, gridSize } = heatmapData;
  
  heatmap.forEach((row, r) => {
    row.forEach((intensity, c) => {
      if (intensity > 0.05) {
        const x = c * gridSize;
        const y = r * gridSize;
        
        const color = getHeatmapColor(intensity);
        
        ctx.fillStyle = color;
        ctx.fillRect(x, y, gridSize, gridSize);
      }
    });
  });
}

/**
 * Heatmap color
 */
function getHeatmapColor(intensity) {
  if (intensity < 0.25) {
    const alpha = 0.3 + (intensity * 0.8);
    return `rgba(0, 120, 255, ${alpha})`;
  } else if (intensity < 0.5) {
    const alpha = 0.4 + (intensity * 0.9);
    return `rgba(0, 200, 150, ${alpha})`;
  } else if (intensity < 0.75) {
    const alpha = 0.5 + (intensity * 0.9);
    return `rgba(255, 200, 0, ${alpha})`;
  } else {
    const alpha = 0.6 + (intensity * 0.9);
    return `rgba(255, 50, 0, ${alpha})`;
  }
}

// Helper
CanvasRenderingContext2D.prototype.roundRect = function (x, y, width, height, radius) {
  this.beginPath();
  this.moveTo(x + radius, y);
  this.lineTo(x + width - radius, y);
  this.quadraticCurveTo(x + width, y, x + width, y + radius);
  this.lineTo(x + width, y + height - radius);
  this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  this.lineTo(x + radius, y + height);
  this.quadraticCurveTo(x, y + height, x, y + height - radius);
  this.lineTo(x, y + radius);
  this.quadraticCurveTo(x, y, x + radius, y);
  this.closePath();
  return this;
};