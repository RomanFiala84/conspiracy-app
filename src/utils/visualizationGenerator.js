import html2canvas from 'html2canvas';

/**
 * Generuje canvas vizualizáciu pohybu myši S POZADÍM A HEATMAPOU
 * OPRAVENÁ VERZIA - správne zarovnanie screenshot + tracking
 * @param {object} trackingData - Tracking dáta s mousePositions
 * @param {number} width - Šírka canvas
 * @param {number} height - Výška canvas
 * @param {HTMLElement} containerElement - DOM element komponentu na screenshot
 * @returns {Promise<string|null>} - Base64 data URL alebo null
 */
export const generateVisualization = async (trackingData, width, height, containerElement) => {
  // Minimálne 5 bodov pre zmysluplnú vizualizáciu
  if (!trackingData.mousePositions || trackingData.mousePositions.length < 5) {
    console.log('Insufficient tracking data for visualization');
    return null;
  }

  try {
    // 1️⃣ Vytvor screenshot komponentu pomocou html2canvas
    console.log('📸 Creating screenshot of component...');
    
    // ✅ OPRAVA: Získaj presné rozmery containera
    const rect = containerElement.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    
    const screenshotCanvas = await html2canvas(containerElement, {
      backgroundColor: '#ffffff',
      scale: 1,
      logging: false,
      useCORS: true,
      allowTaint: true,
      // ✅ KRITICKÉ - presné rozmery
      width: rect.width,
      height: rect.height,
      windowWidth: rect.width,
      windowHeight: rect.height,
      // ✅ KRITICKÉ - scroll offset
      scrollX: -scrollLeft,
      scrollY: -scrollTop,
      x: 0,
      y: 0,
    });

    // 2️⃣ Vytvor nový canvas pre finálnu vizualizáciu
    // ✅ OPRAVA: Použiť presné rozmery containera
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = rect.width;
    finalCanvas.height = rect.height;
    const ctx = finalCanvas.getContext('2d');

    // 3️⃣ Nakresli screenshot ako pozadie
    ctx.drawImage(screenshotCanvas, 0, 0, rect.width, rect.height);

    // 4️⃣ Pridaj semi-transparent overlay pre lepšiu viditeľnosť
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.fillRect(0, 0, rect.width, rect.height);

    const positions = trackingData.mousePositions;

    // 🔥 5️⃣ HEATMAP - Vytvor heatmap z pozícií myši
    console.log('🔥 Generating heatmap...');
    const heatmapData = generateHeatmapData(positions, rect.width, rect.height);
    
    // Nakresli heatmap ako pozadie
    drawHeatmap(ctx, heatmapData, rect.width, rect.height);

    // 6️⃣ Nakresliť trajektóriu pohybu myši (voliteľné - môžeš zakomentovať)
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(74, 144, 226, 0.6)';
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 3;

    const firstPos = positions[0];
    ctx.moveTo(firstPos.x, firstPos.y);

    // Nakresliť cestu
    positions.forEach((pos, index) => {
      if (index === 0) return;
      ctx.lineTo(pos.x, pos.y);
    });

    ctx.stroke();

    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    // 7️⃣ Označiť začiatok (zelený kruh)
    ctx.beginPath();
    ctx.arc(firstPos.x, firstPos.y, 8, 0, 2 * Math.PI);
    ctx.fillStyle = '#00C853';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Pridať text "START"
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('START', firstPos.x, firstPos.y);

    // 8️⃣ Označiť koniec (červený kruh)
    const lastPos = positions[positions.length - 1];
    ctx.beginPath();
    ctx.arc(lastPos.x, lastPos.y, 8, 0, 2 * Math.PI);
    ctx.fillStyle = '#E53935';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Pridať text "END"
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('END', lastPos.x, lastPos.y);

    // 9️⃣ Pridať info panel v rohu
    const padding = 15;
    const panelWidth = 220;
    const panelHeight = 90;
    const panelX = rect.width - panelWidth - padding;
    const panelY = rect.height - panelHeight - padding;

    // Pozadie info panelu
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.roundRect(panelX, panelY, panelWidth, panelHeight, 8);
    ctx.fill();

    // Text v info paneli
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    const hoverTime = (trackingData.totalHoverTime / 1000).toFixed(1);
    const pointsCount = positions.length;

    ctx.fillText(`⏱️ Hover time: ${hoverTime}s`, panelX + 10, panelY + 10);
    ctx.fillText(`📍 Points: ${pointsCount}`, panelX + 10, panelY + 30);
    ctx.fillText(`🔥 Heatmap enabled`, panelX + 10, panelY + 50);
    ctx.fillText(`📐 ${rect.width}x${rect.height}px`, panelX + 10, panelY + 70);

    // 🔟 Vrátiť ako WebP base64
    console.log('✅ Visualization with heatmap generated');
    return finalCanvas.toDataURL('image/webp', 0.85);

  } catch (error) {
    console.error('❌ Error generating visualization:', error);
    return null;
  }
};

/**
 * Vytvorí heatmap dáta z pozícií myši
 * @param {Array} positions - Array mouse positions
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @returns {Array} - 2D array s intenzitou pre každý pixel
 */
function generateHeatmapData(positions, width, height) {
  // Vytvor 2D grid s počítadlami
  const gridSize = 20; // Veľkosť grid bunky v pixeloch
  const cols = Math.ceil(width / gridSize);
  const rows = Math.ceil(height / gridSize);
  
  const heatmap = Array(rows).fill(0).map(() => Array(cols).fill(0));
  
  // Spočítaj výskyty v každej bunke
  positions.forEach(pos => {
    const col = Math.floor(pos.x / gridSize);
    const row = Math.floor(pos.y / gridSize);
    
    if (row >= 0 && row < rows && col >= 0 && col < cols) {
      heatmap[row][col]++;
    }
  });
  
  // Nájdi maximum pre normalizáciu
  let maxValue = 0;
  heatmap.forEach(row => {
    row.forEach(val => {
      if (val > maxValue) maxValue = val;
    });
  });
  
  // Normalizuj hodnoty na 0-1
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
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Object} heatmapData - Heatmap data
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 */
function drawHeatmap(ctx, heatmapData, width, height) {
  const { heatmap, gridSize } = heatmapData;
  
  heatmap.forEach((row, r) => {
    row.forEach((intensity, c) => {
      if (intensity > 0.05) { // Iba ak je aspoň 5% intenzita
        const x = c * gridSize;
        const y = r * gridSize;
        
        // Farba podľa intenzity (modrá -> zelená -> žltá -> červená)
        const color = getHeatmapColor(intensity);
        
        // Nakresli obdĺžnik s alpha kanálom
        ctx.fillStyle = color;
        ctx.fillRect(x, y, gridSize, gridSize);
      }
    });
  });
}

/**
 * Vráti farbu pre heatmap podľa intenzity
 * @param {number} intensity - Hodnota 0-1
 * @returns {string} - RGBA farba
 */
function getHeatmapColor(intensity) {
  // Modrá (nízka intenzita) -> Červená (vysoká intenzita)
  
  if (intensity < 0.25) {
    // Modrá -> Azúrová
    const alpha = 0.2 + (intensity * 0.8);
    return `rgba(0, 120, 255, ${alpha})`;
  } else if (intensity < 0.5) {
    // Azúrová -> Zelená
    const alpha = 0.3 + (intensity * 0.8);
    return `rgba(0, 200, 150, ${alpha})`;
  } else if (intensity < 0.75) {
    // Zelená -> Žltá
    const alpha = 0.4 + (intensity * 0.8);
    return `rgba(255, 200, 0, ${alpha})`;
  } else {
    // Žltá -> Červená
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