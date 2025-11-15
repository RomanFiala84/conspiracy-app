// src/components/missions/mission2/PostsB2.js
// OPRAVENÁ VERZIA - používa getFinalData() z useHoverTracking

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Layout from '../../../styles/Layout';
import StyledButton from '../../../styles/StyledButton';
import { useUserStats } from '../../../contexts/UserStatsContext';
import { getResponseManager } from '../../../utils/ResponseManager';
import { useHoverTracking } from '../../../hooks/useHoverTracking';
import { generateVisualization } from '../../../utils/visualizationGenerator';
import { sendTrackingData } from '../../../utils/trackingApi';

const Container = styled.div`
  padding: 20px;
  max-width: 935px;
  margin: 0 auto;
`;

const Title = styled.h2`
  color: ${p => p.theme.PRIMARY_TEXT_COLOR};
  text-align: center;
  margin-bottom: 24px;
  font-size: 20px;
  font-weight: 600;
`;

const PostsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const PostCard = styled.div`
  background: ${p => p.theme.CARD_BACKGROUND};
  border: 1px solid ${p => p.theme.BORDER_COLOR};
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s ease;
  border: ${p => p.hasError ? `2px solid ${p.theme.ACCENT_COLOR_2}` : `1px solid ${p.theme.BORDER_COLOR}`};
  
  &:hover {
    transform: translateY(-2px);
  }
`;

const PostHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid ${p => p.theme.BORDER_COLOR};
`;

const Avatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
  margin-right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &::after {
    content: '';
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: ${p => p.theme.CARD_BACKGROUND};
  }
`;

const Username = styled.span`
  font-weight: 600;
  font-size: 14px;
  color: ${p => p.theme.PRIMARY_TEXT_COLOR};
`;

const PostImage = styled.img`
  width: 100%;
  height: 280px;
  object-fit: cover;
  display: block;
`;

const PostContent = styled.div`
  padding: 16px;
`;

const ContentText = styled.p`
  line-height: 1.5;
  color: ${p => p.theme.PRIMARY_TEXT_COLOR};
  font-size: 14px;
  margin-bottom: 16px;
`;

const RatingSection = styled.div`
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid ${p => p.theme.BORDER_COLOR};
`;

const RatingLabel = styled.div`
  font-size: 12px;
  color: ${p => p.theme.SECONDARY_TEXT_COLOR};
  margin-bottom: 8px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const RatingScale = styled.div`
  display: flex;
  gap: 8px;
  justify-content: space-between;
`;

const RatingButton = styled.label`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  border: 1px solid ${p => p.theme.BORDER_COLOR};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${p => p.checked ? p.theme.ACCENT_COLOR : 'transparent'};
  color: ${p => p.checked ? '#FFFFFF' : p.theme.PRIMARY_TEXT_COLOR};
  font-weight: 600;
  font-size: 14px;
  
  &:hover {
    background: ${p => p.checked ? p.theme.ACCENT_COLOR : p.theme.HOVER_OVERLAY};
  }
  
  input {
    display: none;
  }
`;

const ErrorText = styled.div`
  color: ${p => p.theme.ACCENT_COLOR_2};
  font-size: 12px;
  margin-top: 8px;
  text-align: center;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 24px;
`;

const ProgressIndicator = styled.div`
  text-align: center;
  font-size: 12px;
  color: ${p => p.theme.SECONDARY_TEXT_COLOR};
  margin-top: 16px;
`;

const POSTS = [
  { id: 'post_b2_1', username: 'user4', content: 'Obsah príspevku B2-1.', image: null },
  { id: 'post_b2_2', username: 'user5', content: 'Obsah príspevku B2-2.', image: '/img/b2-2.jpg' },
  { id: 'post_b2_3', username: 'user6', content: 'Obsah príspevku B2-3.', image: '/img/b2-3.jpg' }
];

const COMPONENT_ID = 'mission2_postsb';

const PostsB2 = () => {
  const navigate = useNavigate();
  const { dataManager, userId } = useUserStats();
  const responseManager = getResponseManager(dataManager);
  
  // ✅ OPRAVA: Destrukturuj getFinalData
  const { containerRef, trackingData, getFinalData } = useHoverTracking(
    'postsB2_mission2',
    'post',
    userId
  );
  
  const [ratings, setRatings] = useState({});
  const [errors, setErrors] = useState({});
  const [startTime] = useState(Date.now());
  const [postStartTimes] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const trackingSentRef = useRef(false);
  const refs = useRef({});

  useEffect(() => {
    const loadSaved = async () => {
      if (!userId) return;
      const saved = await responseManager.loadResponses(userId, COMPONENT_ID);
      if (saved.answers && Object.keys(saved.answers).length > 0) {
        setRatings(saved.answers);
      }
    };
    loadSaved();
  }, [userId, responseManager]);

  useEffect(() => {
    POSTS.forEach(post => {
      if (!postStartTimes[post.id]) {
        postStartTimes[post.id] = Date.now();
      }
    });
  }, [postStartTimes]);

  const handleRating = async (postId, value) => {
    setRatings(prev => ({ ...prev, [postId]: value }));
    setErrors(prev => { const copy = { ...prev }; delete copy[postId]; return copy; });
    
    const timeOnPost = Math.floor((Date.now() - postStartTimes[postId]) / 1000);
    await responseManager.saveAnswer(userId, COMPONENT_ID, postId, value, { [`time_on_${postId}`]: timeOnPost });
  };

  const isComplete = () => POSTS.every(post => ratings[post.id] !== undefined && ratings[post.id] !== null);

  // ✅ OPRAVA: Použiť getFinalData()
  const sendTracking = useCallback(async () => {
    if (trackingSentRef.current) {
      console.log('⏭️ Tracking already sent, skipping');
      return;
    }

    // ✅ Získaj finálne sync dáta
    const finalData = getFinalData();

    if (finalData.isMobile) {
      console.log('📱 Skipping tracking - mobile device');
      return;
    }

    console.log('📊 Tracking check:', {
      userId: userId,
      mousePositionsCount: finalData.mousePositions?.length || 0,
      totalHoverTime: finalData.totalHoverTime,
    });

    if (
      !userId ||
      !finalData.mousePositions ||
      finalData.mousePositions.length < 3 ||
      finalData.totalHoverTime < 500
    ) {
      console.log('⏭️ Skipping tracking - insufficient data');
      return;
    }

    try {
      const container = containerRef.current;
      if (!container) return;

      console.log('📊 Generating visualization...');
      
      const visualization = await generateVisualization(
        finalData,  // ← Použiť finalData!
        container.offsetWidth,
        container.offsetHeight,
        container
      );

      if (!visualization) {
        console.log('⚠️ No visualization generated');
        return;
      }

      console.log('📤 Sending tracking data...');

      const dataToSend = {
        userId: userId,
        contentId: 'postsB2_mission2',
        contentType: 'post',
        hoverMetrics: {
          totalHoverTime: finalData.totalHoverTime,
          hoverStartTime: finalData.hoverStartTime ? new Date(finalData.hoverStartTime).toISOString() : null,
          hoverEndTime: new Date().toISOString(),
        },
        mousePositions: finalData.mousePositions,
        containerDimensions: {
          width: container.offsetWidth,
          height: container.offsetHeight,
        },
        visualization: visualization,
      };

      const result = await sendTrackingData(dataToSend);
      console.log('✅ Tracking data sent successfully:', result);
      
      trackingSentRef.current = true;

    } catch (error) {
      console.error('❌ Failed to send tracking data:', error);
    }
  }, [userId, getFinalData, containerRef]);

  const handleContinue = async () => {
    const missing = POSTS.filter(post => !ratings[post.id]);
    
    if (missing.length) {
      const newErrors = {};
      missing.forEach(post => newErrors[post.id] = true);
      setErrors(newErrors);
      refs.current[missing[0].id]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const totalTime = Math.floor((Date.now() - startTime) / 1000);
      const postTimes = {};
      POSTS.forEach(post => {
        postTimes[`time_on_${post.id}`] = Math.floor((Date.now() - postStartTimes[post.id]) / 1000);
      });
      
      await responseManager.saveMultipleAnswers(
        userId,
        COMPONENT_ID,
        ratings,
        {
          total_time_spent_seconds: totalTime,
          posts_count: POSTS.length,
          ...postTimes,
          device: /Mobile|Android|iPhone/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
          completed_at: new Date().toISOString()
        }
      );

      console.log('📊 Sending final tracking data...');
      await sendTracking();
      
      navigate('/mission2/questionnaire2b');
      
    } catch (error) {
      console.error('Error submitting posts:', error);
      alert('Chyba pri ukladaní hodnotení. Skús to znova.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <Container ref={containerRef}>
        <Title>Hodnotenie príspevkov B</Title>
        <PostsGrid>
          {POSTS.map(post => (
            <PostCard 
              key={post.id} 
              ref={el => refs.current[post.id] = el} 
              hasError={errors[post.id]}
            >
              <PostHeader>
                <Avatar />
                <Username>{post.username}</Username>
              </PostHeader>
              
              {post.image && <PostImage src={post.image} alt="" />}
              
              <PostContent>
                <ContentText>{post.content}</ContentText>
                
                <RatingSection>
                  <RatingLabel>Ohodnotiť príspevok</RatingLabel>
                  <RatingScale>
                    {[1, 2, 3, 4, 5].map(v => (
                      <RatingButton key={v} checked={ratings[post.id] === v}>
                        <input
                          type="radio"
                          checked={ratings[post.id] === v}
                          onChange={() => handleRating(post.id, v)}
                        />
                        {v}
                      </RatingButton>
                    ))}
                  </RatingScale>
                  {errors[post.id] && <ErrorText>Prosím označte rating.</ErrorText>}
                </RatingSection>
              </PostContent>
            </PostCard>
          ))}
        </PostsGrid>
        
        <ButtonContainer>
          <StyledButton 
            accent 
            onClick={handleContinue}
            disabled={!isComplete() || isSubmitting}
          >
            {isSubmitting ? 'Ukladám...' : 'Pokračovať'}
          </StyledButton>
        </ButtonContainer>
        
        <ProgressIndicator>
          Ohodnotené: {Object.keys(ratings).length} / {POSTS.length}
        </ProgressIndicator>

        {process.env.NODE_ENV === 'development' && trackingData.isTracking && (
          <div style={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            background: 'rgba(74, 144, 226, 0.95)',
            color: 'white',
            padding: '10px 16px',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            zIndex: 9999,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}>
            🎯 Tracking: {trackingData.mousePositions.length} points | {(trackingData.totalHoverTime / 1000).toFixed(1)}s
          </div>
        )}
      </Container>
    </Layout>
  );
};

export default PostsB2;