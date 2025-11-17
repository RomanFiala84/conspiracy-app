// src/components/missions/mission1/PostsA1.js
// FINÁLNA VERZIA - Pôvodný dizajn + landmarks

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Layout from '../../../styles/Layout';
import StyledButton from '../../../styles/StyledButton';
import { useUserStats } from '../../../contexts/UserStatsContext';
import { getResponseManager } from '../../../utils/ResponseManager';
import { useHoverTracking } from '../../../hooks/useHoverTracking';
import { saveTrackingWithVisualization } from '../../../utils/trackingHelpers';

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
  { id: 'post_a1_1', username: 'user1', content: 'Obsah príspevku A1-1.', image: null },
  { id: 'post_a1_2', username: 'user2', content: 'Obsah príspevku A1-2.', image: '/img/a1-2.jpg' },
  { id: 'post_a1_3', username: 'user3', content: 'Obsah príspevku A1-3.', image: '/img/a1-3.jpg' }
];

const COMPONENT_ID = 'mission1_postsa';

const PostsA1 = () => {
  const navigate = useNavigate();
  const { dataManager, userId } = useUserStats();
  const responseManager = getResponseManager(dataManager);
  
  const containerRef = useRef(null);
  const trackingSentRef = useRef(false);
  const refs = useRef({});
  
  // ✅ Tracking hook s novými landmarks
  const { startTracking, stopTracking, getFinalData } = useHoverTracking(
    containerRef,
    'postsA1_mission1',
    'post'
  );
  
  const [ratings, setRatings] = useState({});
  const [errors, setErrors] = useState({});
  const [startTime] = useState(Date.now());
  const [postStartTimes] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ Start tracking pri mount
  useEffect(() => {
    startTracking();
    
    return () => {
      stopTracking();
    };
  }, [startTracking, stopTracking]);

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
    
    await responseManager.saveAnswer(
      userId,
      COMPONENT_ID,
      postId,
      value,
      { [`time_on_${postId}`]: timeOnPost }
    );
  };

  const isComplete = () => {
    return POSTS.every(post => ratings[post.id] !== undefined && ratings[post.id] !== null);
  };

  // ✅ UPRAVENÝ tracking flow s landmarks
  const sendTracking = useCallback(async () => {
    if (trackingSentRef.current) {
      console.log('⏭️ Tracking already sent, skipping');
      return;
    }

    const finalData = getFinalData();
    finalData.userId = userId; // Pridaj userId

    if (finalData.isMobile) {
      console.log('📱 Skipping tracking - mobile device');
      return;
    }

    console.log('📊 Tracking check:', {
      userId: userId,
      mousePositionsCount: finalData.mousePositions?.length || 0,
      totalHoverTime: finalData.totalHoverTime,
      landmarksCount: finalData.landmarks?.length || 0
    });

    // ✅ ZNÍŽENÝ THRESHOLD (3 pozície, 200ms)
    if (
      !userId ||
      !finalData.mousePositions ||
      finalData.mousePositions.length < 3 ||
      finalData.totalHoverTime < 200
    ) {
      console.log('⏭️ Skipping tracking - insufficient data');
      return;
    }

    try {
      console.log('📊 Saving tracking with visualization...');
      
      await saveTrackingWithVisualization(finalData, containerRef.current);
      
      console.log('✅ Tracking saved successfully with Cloudinary heatmap');
      trackingSentRef.current = true;

    } catch (error) {
      console.error('❌ Failed to save tracking:', error);
    }
  }, [userId, getFinalData, containerRef]);

  const handleContinue = async () => {
    const missing = POSTS.filter(post => !ratings[post.id]);
    
    if (missing.length) {
      const newErrors = {};
      missing.forEach(post => {
        newErrors[post.id] = true;
      });
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
      
      const progress = await dataManager.loadUserProgress(userId);
      const group = progress.group_assignment;
      
      if (group === '1') {
        navigate('/mission1/intervention');
      } else {
        navigate('/mission1/postsb');
      }
      
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
        {/* ✅ LANDMARK - Title */}
        <div data-landmark="header" data-landmark-id="header_postsa1">
          <Title>Hodnotenie príspevkov A</Title>
        </div>

        <PostsGrid>
          {POSTS.map((post, index) => (
            // ✅ LANDMARK - Post card
            <PostCard 
              key={post.id} 
              ref={el => { refs.current[post.id] = el; }}
              hasError={errors[post.id]}
              data-landmark="post"
              data-landmark-id={post.id}
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
        
        {/* ✅ LANDMARK - Button */}
        <ButtonContainer data-landmark="button" data-landmark-id="button_continue_postsa1">
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
      </Container>
    </Layout>
  );
};

export default PostsA1;
