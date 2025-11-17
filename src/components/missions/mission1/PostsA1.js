// src/components/missions/mission1/PostsA1.js
// FINÁLNA VERZIA - S data-landmark atribútmi

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
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 24px;
`;

const PostCard = styled.div`
  background: ${p => p.theme.CARD_BACKGROUND};
  border: 2px solid ${p => p.theme.BORDER_COLOR};
  border-radius: 12px;
  padding: 16px;
  transition: border-color 0.2s ease;

  &:hover {
    border-color: ${p => p.theme.ACCENT_COLOR};
  }
`;

const PostHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${p => p.$color || p.theme.ACCENT_COLOR};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 18px;
`;

const Username = styled.div`
  font-weight: 600;
  color: ${p => p.theme.PRIMARY_TEXT_COLOR};
  font-size: 14px;
`;

const PostMeta = styled.div`
  color: ${p => p.theme.SECONDARY_TEXT_COLOR};
  font-size: 12px;
`;

const PostContent = styled.p`
  color: ${p => p.theme.PRIMARY_TEXT_COLOR};
  line-height: 1.6;
  margin-bottom: 16px;
  font-size: 14px;
`;

const RatingSection = styled.div`
  border-top: 1px solid ${p => p.theme.BORDER_COLOR};
  padding-top: 12px;
`;

const RatingLabel = styled.div`
  color: ${p => p.theme.SECONDARY_TEXT_COLOR};
  font-size: 13px;
  margin-bottom: 8px;
  font-weight: 500;
`;

const RatingButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const RatingButton = styled.button`
  flex: 1;
  padding: 10px;
  border: 2px solid ${p => p.$selected ? p.theme.ACCENT_COLOR : p.theme.BORDER_COLOR};
  background: ${p => p.$selected ? p.theme.ACCENT_COLOR + '22' : 'transparent'};
  color: ${p => p.$selected ? p.theme.ACCENT_COLOR : p.theme.PRIMARY_TEXT_COLOR};
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${p => p.theme.ACCENT_COLOR};
    background: ${p => p.theme.ACCENT_COLOR}11;
  }
`;

const mockPosts = [
  {
    username: 'user4',
    avatarColor: '#FF6B6B',
    time: 'Pred 2 hodinami',
    content: 'Obsah príspevku B3-1. Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
  },
  {
    username: 'user5',
    avatarColor: '#4ECDC4',
    time: 'Pred 3 hodinami',
    content: 'Obsah príspevku B3-2. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
  },
  {
    username: 'user6',
    avatarColor: '#95E1D3',
    time: 'Pred 5 hodinami',
    content: 'Obsah príspevku B3-3. Ut enim ad minim veniam, quis nostrud exercitation ullamco.'
  }
];

const PostsA1 = () => {
  const navigate = useNavigate();
  const { userId } = useUserStats();
  const containerRef = useRef(null);
  const trackingSentRef = useRef(false);

  const [ratings, setRatings] = useState({});

  // ✅ Hover tracking hook
  const { startTracking, stopTracking, getFinalData } = useHoverTracking(
    containerRef,
    'postsA1_mission1',
    'post'
  );

  // Start tracking pri mount
  useEffect(() => {
    startTracking();
    
    return () => {
      stopTracking();
    };
  }, [startTracking, stopTracking]);

  const handleRating = (postId, value) => {
    setRatings(prev => ({ ...prev, [postId]: value }));
  };

  const allRated = Object.keys(ratings).length === mockPosts.length;

  // ✅ Odoslanie tracking dát
  const sendTracking = useCallback(async () => {
    if (trackingSentRef.current) {
      console.log('⏭️ Tracking already sent, skipping');
      return;
    }

    const finalData = getFinalData();

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
      
      // Pridaj userId do tracking dát
      finalData.userId = userId;
      
      await saveTrackingWithVisualization(finalData, containerRef.current);
      
      console.log('✅ Tracking saved successfully with Cloudinary heatmap');
      trackingSentRef.current = true;

    } catch (error) {
      console.error('❌ Failed to save tracking:', error);
    }
  }, [userId, getFinalData, containerRef]);

  const handleContinue = async () => {
    if (!allRated) return;

    console.log('📊 Sending final tracking data...');
    await sendTracking();

    const responseManager = getResponseManager();
    await responseManager.saveAnswers('mission1_postsa', ratings);

    navigate('/mission1/questionnaire1b');
  };

  return (
    <Layout showLevelDisplay={true}>
      <Container ref={containerRef}>
        {/* ✅ LANDMARK - Header */}
        <div data-landmark="header" data-landmark-id="header_postsa1">
          <Title>Hodnotenie príspevkov A</Title>
        </div>

        <PostsGrid>
          {mockPosts.map((post, index) => (
            // ✅ LANDMARK - Post card
            <PostCard 
              key={index}
              data-landmark="post"
              data-landmark-id={`post_a1_${index + 1}`}
            >
              <PostHeader>
                <UserInfo>
                  <Avatar $color={post.avatarColor}>
                    {post.username.charAt(0)}
                  </Avatar>
                  <Username>{post.username}</Username>
                </UserInfo>
                <PostMeta>{post.time}</PostMeta>
              </PostHeader>

              <PostContent>{post.content}</PostContent>

              <RatingSection>
                <RatingLabel>Ohodnoť príspevok:</RatingLabel>
                <RatingButtons>
                  {[1, 2, 3, 4, 5].map((value) => (
                    <RatingButton
                      key={value}
                      $selected={ratings[`post_a1_${index + 1}`] === value}
                      onClick={() => handleRating(`post_a1_${index + 1}`, value)}
                    >
                      {value}
                    </RatingButton>
                  ))}
                </RatingButtons>
              </RatingSection>
            </PostCard>
          ))}
        </PostsGrid>

        {/* ✅ LANDMARK - Button */}
        <div data-landmark="button" data-landmark-id="button_continue_postsa1">
          <StyledButton
            variant="accent"
            onClick={handleContinue}
            disabled={!allRated}
            fullWidth
          >
            Pokračovať
          </StyledButton>
        </div>
      </Container>
    </Layout>
  );
};

export default PostsA1;
