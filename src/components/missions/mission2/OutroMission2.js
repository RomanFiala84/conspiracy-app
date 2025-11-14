// src/components/missions/mission2/OutroMission2.js
// OPRAVENÁ VERZIA - Správne pridávanie bodov

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Layout from '../../../styles/Layout';
import StyledButton from '../../../styles/StyledButton';
import { useUserStats } from '../../../contexts/UserStatsContext';

const Container = styled.div`
  padding: 40px 20px;
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
  
  @media (max-width: 768px) {
    padding: 30px 15px;
  }
`;

const Title = styled.h2`
  font-size: 36px;
  color: ${p => p.theme.ACCENT_COLOR};
  margin-bottom: 20px;
  font-weight: 700;
  
  @media (max-width: 480px) {
    font-size: 28px;
  }
`;

const Text = styled.p`
  color: ${p => p.theme.SECONDARY_TEXT_COLOR};
  font-size: 16px;
  line-height: 1.8;
  margin-bottom: 30px;
  
  @media (max-width: 480px) {
    font-size: 15px;
  }
`;

const SuccessBox = styled.div`
  background: ${p => p.theme.CARD_BACKGROUND};
  border: 2px solid ${p => p.theme.ACCENT_COLOR};
  border-radius: 16px;
  padding: 32px;
  margin: 30px auto;
  max-width: 400px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
  
  @media (max-width: 480px) {
    padding: 24px;
  }
`;

const PointsEarned = styled.div`
  font-size: 56px;
  font-weight: 700;
  color: ${p => p.theme.ACCENT_COLOR};
  margin: 20px 0;
  animation: scaleIn 0.5s ease;
  
  @keyframes scaleIn {
    from {
      transform: scale(0);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }
  
  @media (max-width: 480px) {
    font-size: 42px;
  }
`;

const PointsLabel = styled.div`
  font-size: 16px;
  color: ${p => p.theme.PRIMARY_TEXT_COLOR};
  margin-bottom: 8px;
  font-weight: 600;
`;

const LevelUpText = styled.div`
  font-size: 15px;
  color: ${p => p.theme.ACCENT_COLOR_2};
  margin-top: 20px;
  font-weight: 600;
  padding-top: 16px;
  border-top: 2px solid ${p => p.theme.BORDER_COLOR};
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 32px;
  
  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

const OutroMission2 = () => {
  const navigate = useNavigate();
  const { addMissionPoints, refreshUserStats } = useUserStats();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleContinue = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      console.log('🎯 Completing mission2...');
      
      // ✅ Pridaj body za misiu
      const success = await addMissionPoints('mission2');
      
      if (success) {
        console.log('✅ Mission2 points added successfully');
        
        // ✅ Refresh stats po pridaní bodov
        await refreshUserStats();
        
        // ✅ Navigate po krátkej pauze
        setTimeout(() => {
          navigate('/mainmenu');
        }, 500);
      } else {
        console.warn('⚠️ Mission2 already completed or error');
        navigate('/mainmenu');
      }
    } catch (error) {
      console.error('❌ Error completing mission2:', error);
      navigate('/mainmenu');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Layout>
      <Container>
        <Title>🎉 Misia 2 dokončená!</Title>
        
        <Text>
          Bravó! Úspešne ste dokončili druhú detektívnu misiu a vaše analytické schopnosti sa neustále zlepšujú!
        </Text>

        <SuccessBox>
          <PointsLabel>Získané body za misiu:</PointsLabel>
          <PointsEarned>+25 🔍</PointsEarned>
          <LevelUpText>🎯 Misia 2 dokončená!</LevelUpText>
        </SuccessBox>

        <Text>
          Pokračujte vo svojom výcviku! Ďalšie výzvy už na vás čakajú v hlavnom menu.
        </Text>

        <ButtonContainer>
          <StyledButton 
            variant="accent"
            size="large"
            onClick={handleContinue}
            disabled={isProcessing}
          >
            {isProcessing ? '⏳ Ukladám...' : '🏠 Hlavné menu'}
          </StyledButton>
        </ButtonContainer>
      </Container>
    </Layout>
  );
};

export default OutroMission2;
