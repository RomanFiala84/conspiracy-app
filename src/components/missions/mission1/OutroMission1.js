// src/components/missions/mission1/OutroMission1.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Layout from '../../../styles/Layout';
import StyledButton from '../../../styles/StyledButton';
import DetectiveTipSmall from '../../shared/DetectiveTipSmall';
import { useUserStats } from '../../../contexts/UserStatsContext';
import { useContext } from 'react';
import { ThemeContext } from 'styled-components';

const Container = styled.div`
  padding: 24px 16px;
  max-width: 900px;
  margin: 0 auto;
  min-height: calc(100vh - 80px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  
  @media (max-width: 768px) {
    padding: 20px 12px;
  }
`;

const MissionCard = styled.div`
  background: linear-gradient(135deg, 
    ${p => p.theme.ACCENT_COLOR}45, 
    ${p => p.theme.ACCENT_COLOR_2}45
  );
  border: 2px solid ${p => p.theme.ACCENT_COLOR};
  border-radius: 16px;
  padding: 24px 40px;
  margin: 20px 0;
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  transition: all 0.3s ease;
  min-width: 280px;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(
      circle at top right,
      ${p => p.theme.ACCENT_COLOR}15 0%,
      transparent 70%
    );
    pointer-events: none;
  }
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 24px ${p => p.theme.ACCENT_COLOR}45;
    border-color: ${p => p.theme.ACCENT_COLOR_2};
  }
  
  @media (max-width: 480px) {
    padding: 20px 28px;
    min-width: auto;
    width: 100%;
  }
`;

const MissionLabel = styled.div`
  font-size: 25px;
  color: ${p => p.theme.PRIMARY_TEXT_COLOR};
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin-bottom: 8px;
  text-align: center;
  font-weight: 600;
  position: relative;
  z-index: 1;
  
  @media (max-width: 480px) {
    font-size: 25px;
  }
`;

const SuccessBox = styled.div`
  background: ${p => p.theme.CARD_BACKGROUND};
  border: 2px solid ${p => p.theme.ACCENT_COLOR};
  border-radius: 16px;
  padding: 32px;
  margin: 20px 0;
  max-width: 400px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px ${p => p.theme.ACCENT_COLOR}35;
  }
  
  @media (max-width: 480px) {
    padding: 24px;
    width: 100%;
  }
`;

const PointsEarned = styled.div`
  font-size: 50px;
  font-weight: 700;
  color: ${p => p.theme.ACCENT_COLOR};
  margin: 20px 0;
  animation: scaleIn 0.5s ease;
  text-align: center;
  
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
    font-size: 50px;
  }
`;

const PointsLabel = styled.div`
  font-size: 15px;
  color: ${p => p.theme.PRIMARY_TEXT_COLOR};
  margin-bottom: 8px;
  text-align: center;
  font-weight: 600;
`;

const LevelUpText = styled.div`
  font-size: 15px;
  color: ${p => p.theme.PRIMARY_TEXT_COLOR};
  margin-top: 20px;
  font-weight: 600;
  padding-top: 16px;
  border-top: 2px solid ${p => p.theme.BORDER_COLOR};
  text-align: center;
`;

const InfoSection = styled.div`
  background: ${p => p.theme.CARD_BACKGROUND};
  border: 2px solid ${p => p.theme.BORDER_COLOR};
  border-radius: 12px;
  padding: 20px;
  margin: 16px 0;
  max-width: 700px;
  width: 100%;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${p => p.theme.ACCENT_COLOR}60;
  }
  
  @media (max-width: 480px) {
    padding: 16px;
  }
`;

const InfoTitle = styled.h3`
  font-size: 15px;
  color: ${p => p.theme.ACCENT_COLOR};
  margin-bottom: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  
  @media (max-width: 480px) {
    font-size: 15px;
  }
`;

const InfoList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 20px 0;
  display: grid;
  gap: 8px;
`;

const InfoItem = styled.li`
  font-size: 15px;
  color: ${p => p.theme.PRIMARY_TEXT_COLOR};
  padding: 8px 12px 8px 32px;
  position: relative;
  line-height: 1.5;
  background: ${p => p.theme.ACCENT_COLOR}15;
  border-radius: 8px;
  transition: all 0.2s ease;
  
  &::before {
    content: '✓';
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: ${p => p.theme.ACCENT_COLOR};
    font-weight: bold;
    font-size: 15px;
  }
  
  &:hover {
    background: ${p => p.theme.ACCENT_COLOR}45;
    transform: translateX(4px);
  }
  
  @media (max-width: 480px) {
    font-size: 15px;
    padding: 7px 10px 7px 28px;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
  
  @media (max-width: 480px) {
    flex-direction: column;
    width: 100%;
    max-width: 400px;
  }
`;

const OutroMission1 = () => {
  const navigate = useNavigate();
  const { addMissionPoints, refreshUserStats } = useUserStats();
  const [isProcessing, setIsProcessing] = useState(false);
  const theme = useContext(ThemeContext);

  const handleContinue = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    
    try {
      console.log('🎯 Completing mission1...');
      
      const success = await addMissionPoints('mission1');
      
      if (success) {
        console.log('✅ Mission1 points added successfully');
        await refreshUserStats();
        setTimeout(() => {
          navigate('/mainmenu');
        }, 500);
      } else {
        console.warn('⚠️ Mission1 already completed or error');
        navigate('/mainmenu');
      }
    } catch (error) {
      console.error('❌ Error completing mission1:', error);
      navigate('/mainmenu');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Layout 
      showLevelDisplay={true} 
      showAnimatedBackground={true}
      cubeCount={50}
      animationSpeed="normal"
      complexity="medium"
    >
      <Container>
        <MissionCard>
          <MissionLabel><strong>Gratulujeme!</strong></MissionLabel>
        </MissionCard>

        <SuccessBox>
          <PointsLabel><strong>ZÍSKALI STE:</strong></PointsLabel>
          <PointsEarned>+25 🌟</PointsEarned>
          <LevelUpText><strong>BODOV</strong></LevelUpText>
        </SuccessBox>

        <InfoSection>
          <InfoTitle><strong>Čo ste dosiahli?</strong></InfoTitle>
          <InfoList>
            <InfoItem><strong>Úspešne ste dokončili Misiu 1 a zvýšili detektívnu úroveň</strong></InfoItem>
            <InfoItem><strong>Získali ste 25 bodov do súťaže</strong></InfoItem>
            <InfoItem><strong>Môžete pokračovať Misiou 2 a úspešne tak dokončiť prvú časť hlavného výskumu</strong></InfoItem>
          </InfoList>

          <DetectiveTipSmall
            style={{ textAlign: "justify" }}
            tip={`
              <p style="font-size: 15px; font-weight: bold; margin-bottom: 10px; line-height: 1.6; color: ${theme.PRIMARY_TEXT_COLOR};">
                <strong>Výborne! Úspešne ste dokončili úvodný dotazník.</strong>
              </p>
              <p style="font-size: 15px; font-weight: bold; margin-bottom: 10px; line-height: 1.6; color: ${theme.PRIMARY_TEXT_COLOR};">
                <strong>Teraz sa môžete vrátiť do hlavného menu a spustiť Misiu 2 pre dokončenie prvej časti hlavného výskumu.</strong>
              </p>
            `}
            detectiveName="Inšpektor Kritan"
            autoOpen={true}
          />
        </InfoSection>

        <ButtonContainer>
          <StyledButton 
            variant="accent"
            size="large"
            onClick={handleContinue}
            disabled={isProcessing}
          >
            {isProcessing ? 'Ukladám...' : 'Pokračovať do hlavného menu'}
          </StyledButton>
        </ButtonContainer>
      </Container>
    </Layout>
  );
};

export default OutroMission1;
