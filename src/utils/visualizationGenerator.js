// src/utils/visualizationGenerator.js
// FULL-PAGE TRACKING VERZIA - Zachytí celú stránku vrátane scrollovaného obsahu

import html2canvas from 'html2canvas';

const STANDARD_WIDTH = 1200;

/**
 * Generuje vizualizáciu CELEJ STRÁNKY + heatmap overlay
 * ✅ Zachytí celý scrollovateľný obsah
 */
export const generateVisualization = async (trackingData, width, height, containerElement) => {
  if (!trackingData.mousePositions || trackingData.mousePositions.length < 5) {
    console.log('Insufficient tracking data for visualization');
    return null;
  }

  try {
    // ✅ Získaj CELÚ výšku a šírku (vrátane scrollu)
    const fullWidth = containerElement.scrollWidth;
    const fullHeight = containerElement.scrollHeight;
    
    const aspectRatio = fullHeight / fullWidth;
    const targetWidth = STANDARD_WIDTH;
    const targetHeight = Math.round(targetWidth * aspectRatio);
    
    console.log('📸 Creating FULL-PAGE screenshot + heatmap:', {
      fullSize: `${fullWidth}x${fullHeight}px`,
      target: `${targetWidth}x${targetHeight}px`,
    });
    
    // ✅ 1️⃣ FULL-PAGE SCREENSHOT
    console.log('📸 Capturing FULL PAGE screenshot...');
    
    const screenshotCanvas = await html2canvas(containerElement, {
      backgroundColor: '#ffffff',
      scale: 1,
      logging: false,
      useCORS: true,
      allowTaint: true,
      // ✅ FULL PAGE - scrollHeight/scrollWidth
      width: fullWidth,
      height: fullHeight,
      windowWidth: fullWidth,
      windowHeight: fullHeight,
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
    const heatmapData = generateHeatmapData(positions, targetWidth, targetHeight, fullWidth, fullHeight);
    drawHeatmap(ctx, heatmapData, targetWidth, targetHeight);

    // 6️⃣ Trajektória
    drawTrajectory(ctx, positions, targetWidth, targetHeight, fullWidth, fullHeight);

    // 7️⃣ Markers
    drawMarkers(ctx, positions, targetWidth, targetHeight, fullWidth, fullHeight);

    // 8️⃣ Info panel
    drawInfoPanel(ctx, trackingData, targetWidth, targetHeight);

    console.log('✅ FULL-PAGE screenshot + heatmap generated');
    return finalCanvas.toDataURL('image/png', 0.95);

  } catch (error) {
    console.error('❌ Error generating visualization:', error);
    return null;
  }
};

/**
 * Trajektória - ✅ S absolute pozíciami (vrátane scrollu)
 */
function drawTrajectory(ctx, positions, targetWidth, targetHeight, originalWidth, originalHeight) {
  ctx.beginPath();
  ctx.strokeStyle = 'rgba(74, 144, 226, 0.6)';
  ctx.lineWidth = 2.5;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
  ctx.shadowBlur = 4;

  // ✅ Absolute pozície s scrollom
  const firstPos = positions[0];
  const scaledX = (firstPos.x / originalWidth) * targetWidth;
  const scaledY = (firstPos.y / originalHeight) * targetHeight;
  
  ctx.moveTo(scaledX, scaledY);

  positions.forEach((pos, index) => {
    if (index === 0) return;
    
    const x = (pos.x / originalWidth) * targetWidth;
    const y = (pos.y / originalHeight) * targetHeight;
    
    ctx.lineTo(x, y);
  });

  ctx.stroke();
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
}

/**
 * Markers - ✅ OPRAVENÉ
 */
function drawMarkers(ctx, positions, targetWidth, targetHeight, originalWidth, originalHeight) {
  const firstPos = positions[0];
  const startX = (firstPos.x / originalWidth) * targetWidth;
  const startY = (firstPos.y / originalHeight) * targetHeight;
  
  ctx.beginPath();
  ctx.arc(startX, startY, 12, 0, 2 * Math.PI);
  ctx.fillStyle = '#00C853';
  ctx.fill();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 11px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('START', startX, startY);

  const lastPos = positions[positions.length - 1];
  const endX = (lastPos.x / originalWidth) * targetWidth;
  const endY = (lastPos.y / originalHeight) * targetHeight;
  
  ctx.beginPath();
  ctx.arc(endX, endY, 12, 0, 2 * Math.PI);
  ctx.fillStyle = '#E53935';
  ctx.fill();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 11px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('END', endX, endY);
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
 * Heatmap generation - ✅ OPRAVENÁ
 */
function generateHeatmapData(positions, targetWidth, targetHeight, originalWidth, originalHeight) {
  const gridSize = 25;
  const cols = Math.ceil(targetWidth / gridSize);
  const rows = Math.ceil(targetHeight / gridSize);
  
  const heatmap = Array(rows).fill(0).map(() => Array(cols).fill(0));
  
  // ✅ Absolute pozície scaled
  positions.forEach(pos => {
    const x = (pos.x / originalWidth) * targetWidth;
    const y = (pos.y / originalHeight) * targetHeight;
    
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

// ✅ OPRAVENÝ Helper - 'this' namiesto 'ctx'
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
