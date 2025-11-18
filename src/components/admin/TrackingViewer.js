// src/components/admin/TrackingViewer.js
// FINÁLNA OPRAVENÁ VERZIA - S canvas wait loop

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Layout from '../../styles/Layout';
import StyledButton from '../../styles/StyledButton';
import { convertPercentToPixels, convertLandmarksPercentToPixels } from '../../utils/trackingHelpers';

// ✅ KONŠTANTY
const STANDARD_WIDTH = 1920;
const STANDARD_HEIGHT = 2000;

const Container = styled.div`
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  flex-wrap: wrap;
  gap: 16px;
`;

const Title = styled.h1`
  color: ${p => p.theme.PRIMARY_TEXT_COLOR};
  font-size: 32px;
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

const Section = styled.div`
  background: ${p => p.theme.CARD_BACKGROUND};
  border: 2px solid ${p => p.theme.BORDER_COLOR};
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
`;

const ComponentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  margin-top: 16px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ComponentCard = styled.div`
  background: ${p => p.theme.CARD_BACKGROUND};
  border: 2px solid ${p => p.selected ? p.theme.ACCENT_COLOR : p.theme.BORDER_COLOR};
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    border-color: ${p => p.theme.ACCENT_COLOR};
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
`;

const ComponentTitle = styled.div`
  font-weight: 600;
  color: ${p => p.theme.PRIMARY_TEXT_COLOR};
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
`;

const Badge = styled.span`
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  background: ${p => {
    if (p.type === 'post') return p.theme.ACCENT_COLOR + '22';
    if (p.type === 'intervention') return '#00C85322';
    if (p.type === 'prevention') return '#FF980022';
    return '#99999922';
  }};
  color: ${p => {
    if (p.type === 'post') return p.theme.ACCENT_COLOR;
    if (p.type === 'intervention') return '#00C853';
    if (p.type === 'prevention') return '#FF9800';
    return '#999999';
  }};
`;

const MetaInfo = styled.div`
  font-size: 12px;
  color: ${p => p.theme.SECONDARY_TEXT_COLOR};
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const HeatmapContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 100%;
  margin: 20px auto;
  border: 2px solid ${p => p.theme.BORDER_COLOR};
  border-radius: 8px;
  overflow: auto;
  background: #f5f5f5;
`;

const CanvasWrapper = styled.div`
  position: relative;
  width: fit-content;
  min-width: 100%;
`;

const HeatmapCanvas = styled.canvas`
  display: block;
  width: 100%;
  height: auto;
`;

const LoadingText = styled.div`
  text-align: center;
  padding: 40px;
  color: ${p => p.theme.SECONDARY_TEXT_COLOR};
  font-size: 16px;
`;

const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
  margin: 20px 0;
`;

const StatBox = styled.div`
  background: linear-gradient(135deg, 
    ${p => p.theme.ACCENT_COLOR}11, 
    ${p => p.theme.ACCENT_COLOR_2}11
  );
  padding: 16px;
  border-radius: 8px;
  text-align: center;
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: ${p => p.theme.SECONDARY_TEXT_COLOR};
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: ${p => p.theme.ACCENT_COLOR};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 16px;
  justify-content: center;
  flex-wrap: wrap;
`;

const PerformanceInfo = styled.div`
  font-size: 12px;
  color: ${p => p.theme.SECONDARY_TEXT_COLOR};
  margin-top: 12px;
  padding: 12px;
  background: ${p => p.theme.ACCENT_COLOR}11;
  border-radius: 6px;
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
`;

const SectionSubtitle = styled.p`
  font-size: 14px;
  color: ${p => p.theme.SECONDARY_TEXT_COLOR};
  margin-bottom: 16px;
  line-height: 1.5;
`;

const DebugToggle = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: ${p => p.theme.SECONDARY_TEXT_COLOR};
  cursor: pointer;
  margin-top: 12px;
  
  input {
    cursor: pointer;
  }
`;

const TrackingViewer = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  
  const [components, setComponents] = useState([]);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [performanceMetrics, setPerformanceMetrics] = useState(null);
  const [showLandmarks, setShowLandmarks] = useState(false);

  // Načítať zoznam komponentov
  useEffect(() => {
    const loadComponents = async () => {
      try {
        const response = await fetch('/api/admin-tracking-components');
        const data = await response.json();
        
        if (data.success) {
          setComponents(data.components || []);
        }
      } catch (error) {
        console.error('Error loading components:', error);
      } finally {
        setLoading(false);
      }
    };

    loadComponents();
  }, []);

  // Agregácia pozícií do gridu
  const aggregatePositions = (positions, gridSize = 10) => {
    if (!positions || positions.length === 0) return [];
    
    const grid = new Map();
    
    positions.forEach(pos => {
      const gridX = Math.floor(pos.x / gridSize) * gridSize;
      const gridY = Math.floor(pos.y / gridSize) * gridSize;
      const key = `${gridX},${gridY}`;
      
      if (!grid.has(key)) {
        grid.set(key, { x: gridX + gridSize / 2, y: gridY + gridSize / 2, count: 0 });
      }
      grid.get(key).count++;
    });
    
    return Array.from(grid.values());
  };

  // Vykresli heatmap overlay
  const drawHeatmapOverlay = async (ctx, positions, width, height) => {
    if (!positions || positions.length === 0) return;

    const gradientCanvas = document.createElement('canvas');
    gradientCanvas.width = 50;
    gradientCanvas.height = 50;
    const gradientCtx = gradientCanvas.getContext('2d');
    
    const gradient = gradientCtx.createRadialGradient(25, 25, 0, 25, 25, 25);
    gradient.addColorStop(0, 'rgba(255, 0, 0, 0.7)');
    gradient.addColorStop(0.4, 'rgba(255, 165, 0, 0.5)');
    gradient.addColorStop(0.7, 'rgba(255, 255, 0, 0.3)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    gradientCtx.fillStyle = gradient;
    gradientCtx.fillRect(0, 0, 50, 50);

    const maxCount = Math.max(...positions.map(p => p.count || 1));

    ctx.save();
    ctx.globalCompositeOperation = 'source-over';

    positions.forEach(pos => {
      const intensity = (pos.count || 1) / maxCount;
      ctx.globalAlpha = Math.min(0.4 + intensity * 0.6, 1);
      ctx.drawImage(gradientCanvas, pos.x - 25, pos.y - 25);
    });

    ctx.restore();
    
    console.log(`✅ Heatmap overlay drawn (${positions.length} aggregated points)`);
  };

  // Vykresli landmark boundaries (debug)
  const drawLandmarkBoundaries = (ctx, landmarks) => {
    if (!landmarks || landmarks.length === 0) return;

    ctx.save();
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.6)';
    ctx.lineWidth = 2;
    ctx.font = 'bold 14px Arial';
    ctx.fillStyle = 'rgba(0, 255, 0, 0.9)';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 3;

    landmarks.forEach(landmark => {
      const { left, top, width, height } = landmark.position;
      
      ctx.strokeRect(left, top, width, height);
      
      const label = `${landmark.type}: ${landmark.id}`;
      const textWidth = ctx.measureText(label).width;
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(left, top - 20, textWidth + 10, 20);
      
      ctx.fillStyle = 'rgba(0, 255, 0, 1)';
      ctx.fillText(label, left + 5, top - 6);
    });

    ctx.restore();
    console.log(`✅ Drew ${landmarks.length} landmark boundaries`);
  };

  // ✅ OPRAVENÁ HLAVNÁ FUNKCIA - S canvas wait loop
  useEffect(() => {
    if (!selectedComponent) return;

    const renderCompositeHeatmap = async (data) => {
      // ✅ OPRAVA - Počkaj na canvas (môže byť null pri prvom renderi)
      let attempts = 0;
      while (!canvasRef.current && attempts < 10) {
        console.log(`⏳ Waiting for canvas... attempt ${attempts + 1}/10`);
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }

      const canvas = canvasRef.current;
      if (!canvas || !data) {
        console.error('❌ No canvas or data after waiting');
        return;
      }

      console.log('✅ Canvas found!');

      const startTime = performance.now();
      const ctx = canvas.getContext('2d', { alpha: false });
      
      // ✅ DEBUG - Log celé data
      console.log('🔍 DEBUG - Raw data from API:', {
        containerDimensions: data.containerDimensions,
        aggregatedPositions: data.aggregatedPositions?.slice(0, 3),
        positionsCount: data.aggregatedPositions?.length,
        landmarks: data.landmarks,
        templateUrl: data.componentTemplateUrl
      });

      // ✅ Zisti template rozmery
      let canvasWidth = STANDARD_WIDTH;
      let canvasHeight = STANDARD_HEIGHT;

      if (data.containerDimensions) {
        if (data.containerDimensions.originalWidth && data.containerDimensions.originalHeight) {
          canvasWidth = STANDARD_WIDTH;
          const scale = STANDARD_WIDTH / data.containerDimensions.originalWidth;
          canvasHeight = Math.round(data.containerDimensions.originalHeight * scale);
          canvasHeight = Math.max(600, Math.min(10000, canvasHeight));
          
          console.log('✅ Using NEW format (percent):', {
            originalWidth: data.containerDimensions.originalWidth,
            originalHeight: data.containerDimensions.originalHeight,
            canvasWidth,
            canvasHeight,
            scale: scale.toFixed(2)
          });
        } else if (data.containerDimensions.width && data.containerDimensions.height) {
          canvasWidth = data.containerDimensions.width;
          canvasHeight = data.containerDimensions.height;
          
          console.log('⚠️ Using OLD format (pixels):', {
            canvasWidth,
            canvasHeight
          });
        }
      } else {
        console.warn('⚠️ No containerDimensions, using fallback');
      }
      
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      console.log('🎨 Canvas setup:', {
        canvasWidth,
        canvasHeight,
        storageFormat: data.containerDimensions?.storageFormat
      });

      // ✅ KROK 1: Načítaj template
      let templateLoaded = false;
      
      if (data.componentTemplateUrl) {
        try {
          console.log('📥 Loading template from:', data.componentTemplateUrl);
          
          templateLoaded = await new Promise((resolve) => {
            const templateImg = new Image();
            templateImg.crossOrigin = 'anonymous';
            
            templateImg.onload = () => {
              ctx.drawImage(templateImg, 0, 0, canvasWidth, canvasHeight);
              console.log('✅ Template loaded successfully');
              resolve(true);
            };
            
            templateImg.onerror = (error) => {
              console.error('❌ Template load error:', error);
              console.error('❌ Template URL:', data.componentTemplateUrl);
              resolve(false);
            };
            
            templateImg.src = data.componentTemplateUrl;
          });
        } catch (error) {
          console.error('❌ Template exception:', error);
          templateLoaded = false;
        }
      } else {
        console.warn('⚠️ No template URL');
      }

      // Fallback pozadie
      if (!templateLoaded) {
        ctx.fillStyle = '#f5f5f5';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        
        ctx.fillStyle = '#666666';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('📊 Composite Heatmap', canvasWidth / 2, 80);
        ctx.font = '14px Arial';
        ctx.fillStyle = '#999999';
        ctx.fillText(`${data.contentId}`, canvasWidth / 2, 110);
        ctx.fillText('⚠️ Component screenshot not available', canvasWidth / 2, 140);
      }

      // ✅ KROK 2: Konvertuj pozície
      let pixelPositions = data.aggregatedPositions;
      let pixelLandmarks = data.landmarks;

      console.log('🔍 DEBUG - Before conversion:', {
        storageFormat: data.containerDimensions?.storageFormat,
        firstPosition: pixelPositions?.[0],
        positionsCount: pixelPositions?.length
      });

      if (data.containerDimensions?.storageFormat === 'percent') {
        console.log('🔄 Converting percent to pixels...');
        pixelPositions = convertPercentToPixels(data.aggregatedPositions, canvasWidth, canvasHeight);
        pixelLandmarks = convertLandmarksPercentToPixels(data.landmarks, canvasWidth, canvasHeight);
        
        console.log('✅ Converted positions:', {
          firstPositionBefore: data.aggregatedPositions[0],
          firstPositionAfter: pixelPositions[0],
          count: pixelPositions.length
        });
      } else {
        console.warn('⚠️ StorageFormat is NOT percent, using positions as-is');
      }

      // ✅ KROK 3: Vykresli heatmap
      if (pixelPositions && pixelPositions.length > 0) {
        const aggregated = aggregatePositions(pixelPositions, 10);
        
        console.log('🎨 Drawing heatmap:', {
          originalPositions: pixelPositions.length,
          aggregatedPoints: aggregated.length,
          firstAggregated: aggregated[0]
        });
        
        await drawHeatmapOverlay(ctx, aggregated, canvasWidth, canvasHeight);
      } else {
        console.error('❌ No positions to draw!');
        
        ctx.fillStyle = '#ff9800';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('⚠️ No tracking data available', canvasWidth / 2, canvasHeight / 2);
      }

      // ✅ KROK 4: Landmarks (debug)
      if (showLandmarks && pixelLandmarks && pixelLandmarks.length > 0) {
        drawLandmarkBoundaries(ctx, pixelLandmarks);
      }

      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      setPerformanceMetrics({
        renderTime: renderTime.toFixed(2),
        pointsCount: pixelPositions?.length || 0,
        usersCount: data.usersCount || 0,
        landmarksCount: pixelLandmarks?.length || 0,
        canvasSize: `${canvasWidth}×${canvasHeight}`,
        storageFormat: data.containerDimensions?.storageFormat || 'unknown',
        renderMode: 'client-side'
      });

      console.log(`✅ Render complete in ${renderTime.toFixed(2)}ms`);
    };

    const loadAndRenderHeatmap = async () => {
      setLoading(true);
      try {
        const url = `/api/get-tracking-by-component?contentId=${selectedComponent.contentId}&contentType=${selectedComponent.contentType}`;
        console.log('📡 Fetching from:', url);
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        console.log('📥 API Response:', data);
        
        if (data.success) {
          setTrackingData(data.data);
          await renderCompositeHeatmap(data.data);
        } else {
          console.error('❌ API returned error:', data.error);
          alert(`Chyba: ${data.error}`);
        }
      } catch (error) {
        console.error('❌ Fetch error:', error);
        alert(`Nepodarilo sa načítať tracking dáta: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadAndRenderHeatmap();
  }, [selectedComponent, showLandmarks]);

  const handleDownloadHeatmap = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `composite_heatmap_${selectedComponent.contentId}_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  if (loading && components.length === 0) {
    return (
      <Layout showLevelDisplay={false}>
        <Container>
          <LoadingText>Načítavam tracking dáta...</LoadingText>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout showLevelDisplay={false}>
      <Container>
        <Header>
          <Title>🔥 Tracking Heatmap Viewer</Title>
          <StyledButton variant="outline" onClick={() => navigate('/admin')}>
            ← Späť na Admin Panel
          </StyledButton>
        </Header>

        {!selectedComponent ? (
          <Section>
            <h2 style={{ color: 'inherit', marginBottom: '16px' }}>
              Vyberte komponent na zobrazenie
            </h2>
            <ComponentGrid>
              {components.map((comp, idx) => (
                <ComponentCard
                  key={idx}
                  onClick={() => setSelectedComponent(comp)}
                >
                  <ComponentTitle>
                    <Badge type={comp.contentType}>{comp.contentType}</Badge>
                    {comp.contentId}
                  </ComponentTitle>
                  <MetaInfo>
                    <div>👥 {comp.usersCount} users</div>
                    <div>📍 {comp.totalPoints?.toLocaleString()} points</div>
                    <div>⏱️ {(comp.avgHoverTime / 1000).toFixed(1)}s avg</div>
                    <div>📊 {comp.recordsCount} records</div>
                  </MetaInfo>
                </ComponentCard>
              ))}
            </ComponentGrid>
          </Section>
        ) : (
          <>
            <Section>
              <ComponentTitle>
                <Badge type={selectedComponent.contentType}>
                  {selectedComponent.contentType}
                </Badge>
                {selectedComponent.contentId}
              </ComponentTitle>
              
              <StatsRow>
                <StatBox>
                  <StatLabel>Users</StatLabel>
                  <StatValue>{trackingData?.usersCount || 0}</StatValue>
                </StatBox>
                <StatBox>
                  <StatLabel>Total Points</StatLabel>
                  <StatValue>{trackingData?.totalPositions?.toLocaleString() || 0}</StatValue>
                </StatBox>
                <StatBox>
                  <StatLabel>Avg Hover Time</StatLabel>
                  <StatValue>
                    {trackingData ? (trackingData.avgHoverTime / 1000).toFixed(1) : 0}s
                  </StatValue>
                </StatBox>
                <StatBox>
                  <StatLabel>Records</StatLabel>
                  <StatValue>{trackingData?.recordsCount || 0}</StatValue>
                </StatBox>
                <StatBox>
                  <StatLabel>Landmarks</StatLabel>
                  <StatValue>{trackingData?.landmarks?.length || 0}</StatValue>
                </StatBox>
              </StatsRow>
            </Section>

            <Section>
              <h2 style={{ color: 'inherit', marginBottom: '8px' }}>
                🎨 Composite Heatmap
              </h2>
              <SectionSubtitle>
                Component template (šírka 1920px, dynamická výška) s agregovanou heatmap zo všetkých používateľov (rendered client-side)
              </SectionSubtitle>
              
              {loading ? (
                <LoadingText>Renderujem composite heatmap...</LoadingText>
              ) : (
                <>
                  <HeatmapContainer>
                    <CanvasWrapper>
                      <HeatmapCanvas ref={canvasRef} />
                    </CanvasWrapper>
                  </HeatmapContainer>
                  
                  {performanceMetrics && (
                    <PerformanceInfo>
                      <div>⚡ Render time: {performanceMetrics.renderTime}ms</div>
                      <div>📍 Points: {performanceMetrics.pointsCount}</div>
                      <div>👥 Users: {performanceMetrics.usersCount}</div>
                      <div>🎯 Landmarks: {performanceMetrics.landmarksCount}</div>
                      <div>📐 Size: {performanceMetrics.canvasSize}</div>
                      <div>💾 Format: {performanceMetrics.storageFormat}</div>
                      <div>🖥️ Mode: {performanceMetrics.renderMode}</div>
                    </PerformanceInfo>
                  )}
                  
                  <DebugToggle>
                    <input 
                      type="checkbox" 
                      checked={showLandmarks}
                      onChange={(e) => setShowLandmarks(e.target.checked)}
                    />
                    🔍 Show Landmark Boundaries (Debug Mode)
                  </DebugToggle>
                  
                  <ButtonGroup>
                    <StyledButton variant="success" onClick={handleDownloadHeatmap}>
                      💾 Stiahnuť Composite Heatmap
                    </StyledButton>
                    <StyledButton variant="outline" onClick={() => setSelectedComponent(null)}>
                      ← Späť na zoznam
                    </StyledButton>
                  </ButtonGroup>
                </>
              )}
            </Section>
          </>
        )}
      </Container>
    </Layout>
  );
};

export default TrackingViewer;
