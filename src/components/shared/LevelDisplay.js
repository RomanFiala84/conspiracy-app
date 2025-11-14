// src/components/shared/LevelDisplay.js
// HORIZONTÁLNA LIŠTA - Všetko v jednom riadku

import React from 'react';
import styled from 'styled-components';
import { useUserStats } from '../../contexts/UserStatsContext';

const Wrapper = styled.div`
  position: fixed;
  top: 20px;
  left: 20px;
  right: 20px;
  z-index: 1200;
  background: ${p => p.theme.CARD_BACKGROUND};
  border: 3px solid ${p => p.theme.ACCENT_COLOR};
  border-radius: 16px;
  box-shadow: 0 6px 24px rgba(0,0,0,0.2);
  padding: 16px 24px;
  display: flex;
  align-items: center;
  gap: 32px;
  
  @media (max-width: 1024px) {
    gap: 24px;
    padding: 14px 20px;
  }
  
  @media (max-width: 768px) {
    flex-wrap: wrap;
    gap: 16px;
    padding: 12px 16px;
  }
  
  @media (max-width: 480px) {
    flex-direction: column;
    gap: 12px;
    padding: 12px;
  }
`;

const Section = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding-right: ${p => p.$divider ? '32px' : '0'};
  border-right: ${p => p.$divider ? `2px solid ${p.theme.BORDER_COLOR}` : 'none'};
  
  @media (max-width: 1024px) {
    padding-right: ${p => p.$divider ? '24px' : '0'};
  }
  
  @media (max-width: 768px) {
    padding-right: ${p => p.$divider ? '16px' : '0'};
    gap: 8px;
  }
  
  @media (max-width: 480px) {
    border-right: none;
    border-bottom: ${p => p.$divider ? `2px solid ${p.theme.BORDER_COLOR}` : 'none'};
    padding-right: 0;
    padding-bottom: ${p => p.$divider ? '12px' : '0'};
    width: 100%;
    justify-content: space-between;
  }
`;

const LevelSection = styled(Section)`
  min-width: 100px;
  
  @media (max-width: 480px) {
    min-width: auto;
  }
`;

const LevelIcon = styled.div`
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, 
    ${p => p.theme.ACCENT_COLOR}, 
    ${p => p.theme.ACCENT_COLOR_2}
  );
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 700;
  color: white;
  box-shadow: 0 4px 12px ${p => p.theme.ACCENT_COLOR}44;
  
  @media (max-width: 768px) {
    width: 44px;
    height: 44px;
    font-size: 24px;
  }
`;

const LevelInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const LevelLabel = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: ${p => p.theme.SECONDARY_TEXT_COLOR};
  text-transform: uppercase;
  letter-spacing: 1px;
  line-height: 1;
  margin-bottom: 4px;
`;

const LevelValue = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: ${p => p.theme.ACCENT_COLOR};
  line-height: 1;
  
  @media (max-width: 768px) {
    font-size: 18px;
  }
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 80px;
  
  @media (max-width: 768px) {
    min-width: 70px;
  }
  
  @media (max-width: 480px) {
    min-width: auto;
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
  }
`;

const StatLabel = styled.div`
  font-size: 11px;
  color: ${p => p.theme.SECONDARY_TEXT_COLOR};
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
  text-align: center;
  
  @media (max-width: 480px) {
    margin-bottom: 0;
    text-align: left;
  }
`;

const StatValue = styled.div`
  font-size: ${p => p.$large ? '22px' : '18px'};
  font-weight: 700;
  color: ${p => p.$highlight ? p.theme.ACCENT_COLOR : p.theme.PRIMARY_TEXT_COLOR};
  line-height: 1;
  
  @media (max-width: 768px) {
    font-size: ${p => p.$large ? '20px' : '16px'};
  }
`;

const ProgressSection = styled.div`
  flex: 1;
  min-width: 180px;
  
  @media (max-width: 480px) {
    width: 100%;
    min-width: auto;
  }
`;

const ProgressLabel = styled.div`
  font-size: 11px;
  color: ${p => p.theme.SECONDARY_TEXT_COLOR};
  margin-bottom: 6px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ProgressBar = styled.div`
  height: 12px;
  background: ${p => p.theme.BORDER_COLOR};
  border-radius: 8px;
  overflow: hidden;
  position: relative;
`;

const Progress = styled.div`
  height: 100%;
  width: ${p => p.$progress || 0}%;
  background: linear-gradient(90deg, 
    ${p => p.theme.ACCENT_COLOR}, 
    ${p => p.theme.ACCENT_COLOR_2}
  );
  border-radius: 8px;
  transition: width 0.4s ease;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.3) 50%,
      rgba(255, 255, 255, 0) 100%
    );
    animation: shimmer 2s infinite;
  }
  
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
`;

const LevelDisplay = () => {
  const { userStats } = useUserStats();

  const mission = userStats?.missionPoints ?? 0;
  const bonus = userStats?.bonusPoints ?? 0;
  const referrals = userStats?.referrals ?? 0;
  const total = userStats?.totalPoints ?? 0;
  const level = userStats?.level ?? 1;

  const progress = Math.min((mission / 100) * 100, 100);

  return (
    <Wrapper>
      {/* Level */}
      <LevelSection $divider>
        <LevelIcon>{level}</LevelIcon>
        <LevelInfo>
          <LevelLabel>Level</LevelLabel>
          <LevelValue>Detektív</LevelValue>
        </LevelInfo>
      </LevelSection>

      {/* Points */}
      <Section $divider>
        <StatItem>
          <StatLabel>Misie</StatLabel>
          <StatValue $highlight>{mission}</StatValue>
        </StatItem>
        
        <StatItem>
          <StatLabel>Bonus</StatLabel>
          <StatValue>{bonus}</StatValue>
        </StatItem>
        
        <StatItem>
          <StatLabel>Referrals</StatLabel>
          <StatValue>{referrals}</StatValue>
        </StatItem>
      </Section>

      {/* Total */}
      <Section $divider>
        <StatItem>
          <StatLabel>Spolu</StatLabel>
          <StatValue $large $highlight>{total}</StatValue>
        </StatItem>
      </Section>

      {/* Progress */}
      <ProgressSection>
        <ProgressLabel>
          <span>Progress</span>
          <span>{mission}/100</span>
        </ProgressLabel>
        <ProgressBar>
          <Progress $progress={progress} />
        </ProgressBar>
      </ProgressSection>
    </Wrapper>
  );
};

export default LevelDisplay;
