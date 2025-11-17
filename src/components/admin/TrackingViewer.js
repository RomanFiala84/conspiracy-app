// src/components/admin/TrackingViewer.js
// OPRAVENÁ VERZIA - Dynamický canvas namiesto fixného

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Layout from '../../styles/Layout';
import StyledButton from '../../styles/StyledButton';

// ✅ UPRAVENÉ KONŠTANTY - len fallback
const STANDARD_WIDTH = 1200;
const STANDARD_HEIGHT = 2000; // Používa sa len ako fallback

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

    // Vytvor gradient template
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

    // Nájdi max count
    const maxCount = Math.max(...positions.map(p => p.count || 1));

    // Vykresli všetky body
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
      
      // Vykresli boundary box
      ctx.strokeRect(left, top, width, height);
      
      // Vykresli label s pozadím
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

  // ✅ UPRAVENÁ FUNKCIA - Načítať tracking dáta a vykresliť composite heatmap
  useEffect(() => {
    if (!selectedComponent) return;

    const renderCompositeHeatmap = async (data) => {
      const canvas = canvasRef.current;
      if (!canvas || !data) return;

      const startTime = performance.now();
      const ctx = canvas.getContext('2d', { alpha: false });
      
      // ✅ OPRAVA - Použi rozmery z containerDimensions namiesto fixných
      const canvasWidth = data.containerDimensions?.width || STANDARD_WIDTH;
      const canvasHeight = data.containerDimensions?.height || STANDARD_HEIGHT;
      
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      console.log('🎨 Rendering composite heatmap:', {
        positions: data.aggregatedPositions?.length,
        landmarks: data.landmarks?.length,
        templateUrl: data.componentTemplateUrl,
        size: `${canvasWidth}×${canvasHeight}` // ✅ Dynamické rozmery
      });

      // ✅ 1. Načítaj component template (ak existuje)
      if (data.componentTemplateUrl) {
        try {
          await new Promise((resolve) => {
            const templateImg = new Image();
            templateImg.crossOrigin = 'anonymous';
            
            templateImg.onload = () => {
              ctx.drawImage(templateImg, 0, 0, canvasWidth, canvasHeight);
              console.log('✅ Component template loaded');
              resolve();
            };
            
            templateImg.onerror = (error) => {
              console.error('❌ Failed to load template:', error);
              // Fallback - sivé pozadie s info textom
              ctx.fillStyle = '#f5f5f5';
              ctx.fillRect(0, 0, canvasWidth, canvasHeight);
              
              ctx.fillStyle = '#999999';
              ctx.font = '16px Arial';
              ctx.textAlign = 'center';
              ctx.fillText('⚠️ Background template not loaded', canvasWidth / 2, canvasHeight / 2 - 20);
              ctx.font = '14px Arial';
              ctx.fillText('Showing heatmap overlay only', canvasWidth / 2, canvasHeight / 2 + 10);
              
              resolve();
            };
            
            templateImg.src = data.componentTemplateUrl;
          });
        } catch (error) {
          console.error('❌ Template error:', error);
          ctx.fillStyle = '#f5f5f5';
          ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        }
      } else {
        // ⚠️ Žiadny template - sivé pozadie s info textom
        console.warn('⚠️ No component template URL available');
        ctx.fillStyle = '#f5f5f5';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        
        ctx.fillStyle = '#666666';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('📊 Heatmap Data', canvasWidth / 2, 80);
        
        ctx.font = '14px Arial';
        ctx.fillStyle = '#999999';
        ctx.fillText(`${data.contentId}`, canvasWidth / 2, 110);
        ctx.fillText(`${data.aggregatedPositions?.length || 0} tracking points`, canvasWidth / 2, 140);
        ctx.fillText(`${data.usersCount} users`, canvasWidth / 2, 170);
        
        ctx.fillStyle = '#cccccc';
        ctx.font = '12px Arial';
        ctx.fillText('⚠️ Component screenshot not available', canvasWidth / 2, canvasHeight - 40);
      }

      // ✅ 2. Vykresli heatmap overlay
      if (data.aggregatedPositions && data.aggregatedPositions.length > 0) {
        const aggregated = aggregatePositions(data.aggregatedPositions, 10);
        await drawHeatmapOverlay(ctx, aggregated, canvasWidth, canvasHeight);
        console.log(`✅ Drew heatmap with ${aggregated.length} aggregated points`);
      } else {
        console.warn('⚠️ No tracking positions to draw');
        
        // Zobraz warning text
        ctx.fillStyle = '#ff9800';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('⚠️ No tracking data available', canvasWidth / 2, canvasHeight / 2);
      }

      // ✅ 3. Vykresli landmarks (ak je debug mode)
      if (showLandmarks && data.landmarks && data.landmarks.length > 0) {
        drawLandmarkBoundaries(ctx, data.landmarks);
      }

      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      setPerformanceMetrics({
        renderTime: renderTime.toFixed(2),
        pointsCount: data.aggregatedPositions?.length || 0,
        usersCount: data.usersCount || 0,
        landmarksCount: data.landmarks?.length || 0,
        canvasSize: `${canvasWidth}×${canvasHeight}`, // ✅ Dynamické rozmery
      });

      console.log(`✅ Composite heatmap rendered in ${renderTime.toFixed(2)}ms`);
    };

    const loadAndRenderHeatmap = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/get-tracking-by-component?contentId=${selectedComponent.contentId}&contentType=${selectedComponent.contentType}`
        );
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
          setTrackingData(data.data);
          await renderCompositeHeatmap(data.data);
        } else {
          console.error('API returned error:', data.error);
          alert(`Chyba: ${data.error}`);
        }
      } catch (error) {
        console.error('Error loading tracking data:', error);
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
    link.download = `heatmap_${selectedComponent.contentId}_${Date.now()}.png`;
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
                Component template (šírka {STANDARD_WIDTH}px, dynamická výška) s agregovanou heatmap zo všetkých používateľov
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
                      💾 Stiahnuť Heatmap
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
