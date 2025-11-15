// src/utils/visualizationGenerator.js
// FINÁLNA VERZIA - štandardizované rozmery + percentuálne pozície

import html2canvas from 'html2canvas';

// ✅ ŠTANDARDNÉ ROZMERY - všetky vizualizácie v rovnakom rozlíšení
const STANDARD_WIDTH = 1200;
const STANDARD_HEIGHT = 900;

/**
 * Generuje canvas vizualizáciu pohybu myši S POZADÍM A HEATMAPOU
 * ✅ ŠTANDARDIZOVANÉ ROZMERY - všetky vizualizácie sú v rovnakom rozlíšení
 * @param {object} trackingData - Tracking dáta s mousePositions a containerDimensions
 * @param {number} width - DEPRECATED - používa sa trackingData.containerDimensions
 * @param {number} height - DEPRECATED - používa sa trackingData.containerDimensions
 * @param {HTMLElement} containerElement - DOM element komponentu na screenshot
 * @returns {Promise<string|null>} - Base64 data URL alebo null
 */
export const generateVisualization = async (trackingData, width, height, containerElement) => {
  if (!trackingData.mousePositions || trackingData.mousePositions.length < 5) {
    console.log('Insufficient tracking data for visualization');
    return null;
  }

  try {
    // ✅ POUŽIŤ ŠTANDARDNÉ ROZMERY
    const targetWidth = STANDARD_WIDTH;
    const targetHeight = STANDARD_HEIGHT;
    
    const originalWidth = trackingData.containerDimensions?.width || width;
    const originalHeight = trackingData.containerDimensions?.height || height;
    
    console.log('📸 Creating standardized visualization:', {
      standard: `${targetWidth}x${targetHeight}px`,
      original: `${originalWidth}x${originalHeight}px`,
      scalingRatio: {
        x: (targetWidth / originalWidth).toFixed(2),
        y: (targetHeight / originalHeight).toFixed(2),
      },
    });
    
    // 1️⃣ Vytvor screenshot komponentu
    const rect = containerElement.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    
    const screenshotCanvas = await html2canvas(containerElement, {
      backgroundColor: '#ffffff',
      scale: 1,
      logging: false,
      useCORS: true,
      allowTaint: true,
      width: rect.width,
      height: rect.height,
      windowWidth: rect.width,
      windowHeight: rect.height,
      scrollX: -scrollLeft,
      scrollY: -scrollTop,
      x: 0,
      y: 0,
    });

    // 2️⃣ Vytvor štandardný canvas
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = targetWidth;
    finalCanvas.height = targetHeight;
    const ctx = finalCanvas.getContext('2d');

    // 3️⃣ Nakresli screenshot (scaled na štandardné rozmery)
    ctx.drawImage(screenshotCanvas, 0, 0, targetWidth, targetHeight);

    // 4️⃣ Pridaj semi-transparent overlay
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.fillRect(0, 0, targetWidth, targetHeight);

    const positions = trackingData.mousePositions;

    // 🔥 5️⃣ HEATMAP
    console.log('🔥 Generating heatmap...');
    const heatmapData = generateHeatmapData(positions, targetWidth, targetHeight);
    drawHeatmap(ctx, heatmapData, targetWidth, targetHeight);

    // 6️⃣ Nakresliť trajektóriu pohybu myši
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(74, 144, 226, 0.6)';
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 3;

    // ✅ VŽDY POUŽIŤ PERCENTUÁLNE POZÍCIE
    const firstPos = {
      x: (positions[0].xPercent / 100) * targetWidth,
      y: (positions[0].yPercent / 100) * targetHeight,
    };
    
    ctx.moveTo(firstPos.x, firstPos.y);

    positions.forEach((pos, index) => {
      if (index === 0) return;
      
      const point = {
        x: (pos.xPercent / 100) * targetWidth,
        y: (pos.yPercent / 100) * targetHeight,
      };
      
      ctx.lineTo(point.x, point.y);
    });

    ctx.stroke();
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    // 7️⃣ Označiť začiatok (zelený kruh)
    ctx.beginPath();
    ctx.arc(firstPos.x, firstPos.y, 10, 0, 2 * Math.PI);
    ctx.fillStyle = '#00C853';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('START', firstPos.x, firstPos.y);

    // 8️⃣ Označiť koniec (červený kruh)
    const lastPos = {
      x: (positions[positions.length - 1].xPercent / 100) * targetWidth,
      y: (positions[positions.length - 1].yPercent / 100) * targetHeight,
    };
    
    ctx.beginPath();
    ctx.arc(lastPos.x, lastPos.y, 10, 0, 2 * Math.PI);
    ctx.fillStyle = '#E53935';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('END', lastPos.x, lastPos.y);

    // 9️⃣ Pridať info panel
    const padding = 20;
    const panelWidth = 280;
    const panelHeight = 120;
    const panelX = targetWidth - panelWidth - padding;
    const panelY = targetHeight - panelHeight - padding;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.roundRect(panelX, panelY, panelWidth, panelHeight, 10);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    const hoverTime = (trackingData.totalHoverTime / 1000).toFixed(1);
    const pointsCount = positions.length;

    ctx.fillText(`⏱️ Hover time: ${hoverTime}s`, panelX + 15, panelY + 15);
    ctx.fillText(`📍 Points: ${pointsCount}`, panelX + 15, panelY + 40);
    ctx.fillText(`🔥 Heatmap enabled`, panelX + 15, panelY + 65);
    
    ctx.font = '12px Arial';
    ctx.fillText(`📐 Standard: ${targetWidth}x${targetHeight}px`, panelX + 15, panelY + 90);

    console.log('✅ Standardized visualization generated');
    return finalCanvas.toDataURL('image/webp', 0.9);

  } catch (error) {
    console.error('❌ Error generating visualization:', error);
    return null;
  }
};

/**
 * Vytvorí heatmap dáta z pozícií myši
 * ✅ VŽDY POUŽÍVA PERCENTUÁLNE POZÍCIE
 */
function generateHeatmapData(positions, width, height) {
  const gridSize = 25;
  const cols = Math.ceil(width / gridSize);
  const rows = Math.ceil(height / gridSize);
  
  const heatmap = Array(rows).fill(0).map(() => Array(cols).fill(0));
  
  positions.forEach(pos => {
    // ✅ Použiť percentuálne pozície
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
 * Nakreslí heatmap na canvas
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
 * Vráti farbu pre heatmap podľa intenzity
 */
function getHeatmapColor(intensity) {
  if (intensity < 0.25) {
    const alpha = 0.2 + (intensity * 0.8);
    return `rgba(0, 120, 255, ${alpha})`;
  } else if (intensity < 0.5) {
    const alpha = 0.3 + (intensity * 0.8);
    return `rgba(0, 200, 150, ${alpha})`;
  } else if (intensity < 0.75) {
    const alpha = 0.4 + (intensity * 0.8);
    return `rgba(255, 200, 0, ${alpha})`;
  } else {
    const alpha = 0.5 + (intensity * 0.8);
    return `rgba(255, 50, 0, ${alpha})`;
  }
}

// Helper funkcia pre rounded rectangles
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