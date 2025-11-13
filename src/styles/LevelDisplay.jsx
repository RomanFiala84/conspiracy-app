// src/components/LevelDisplay.jsx
// VYLEPŠENÁ VERZIA - Lepšie zobrazenie bonus bodov

import React from 'react';
import styled from 'styled-components';
import { useUserStats } from '../contexts/UserStatsContext';

const Container = styled.div`
  position: fixed;
  top: 20%;
  right: 0;
  transform: translateY(-10%);
  background: ${props => props.theme.CARD_BACKGROUND};
  padding: 8px 4px;
  border-radius: 8px 0 0 8px;
  box-shadow: -2px 2px 8px rgba(0,0,0,0.3);
  text-align: center;
  font-weight: bold;
  color: ${props => props.theme.PRIMARY_TEXT_COLOR};
  user-select: none;
  z-index: 1000;
  cursor: default;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const LevelText = styled.div`
  font-size: 14px;
  color: ${props => props.theme.PRIMARY_TEXT_COLOR};
  margin-bottom: 8px;
  writing-mode: vertical-rl;
  text-orientation: upright;
  font-weight: normal;
  letter-spacing: 0.05em;
  line-height: 1.3;
  user-select: none;
`;

const PointsText = styled.div`
  font-size: 12px;
  color: ${props => props.theme.SECONDARY_TEXT_COLOR};
  margin-bottom: 8px;
  writing-mode: vertical-rl;
  text-orientation: upright;
  font-weight: normal;
  letter-spacing: 0.05em;
  line-height: 1.3;
  user-select: none;
`;

// ✅ Body z misií - zvýraznené
const MissionPointsText = styled.div`
  font-size: 11px;
  color: ${props => props.theme.ACCENT_COLOR};
  margin-bottom: 4px;
  writing-mode: vertical-rl;
  text-orientation: upright;
  font-weight: bold;
  letter-spacing: 0.05em;
  line-height: 1.3;
  user-select: none;
`;

// ✅ VYLEPŠENÉ - Bonus body zvýraznené inak
const BonusPointsText = styled.div`
  font-size: 11px;
  color: ${props => props.theme.ACCENT_COLOR_2};
  margin-bottom: 4px;
  writing-mode: vertical-rl;
  text-orientation: upright;
  font-weight: bold;
  letter-spacing: 0.05em;
  line-height: 1.3;
  user-select: none;
  
  /* ✅ NOVÝ - Pridaný border pre zvýraznenie */
  padding: 4px 2px;
  background: ${props => `${props.theme.ACCENT_COLOR_2}22`};
  border-radius: 4px;
`;

// ✅ NOVÝ - Separator medzi sekciami
const Separator = styled.div`
  width: 100%;
  height: 1px;
  background: ${props => props.theme.BORDER_COLOR};
  margin: 8px 0;
  opacity: 0.5;
`;

const ProgressBar = styled.div`
  width: 18px;
  height: 120px;
  background: #333;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 8px;
  display: flex;
  flex-direction: column-reverse;
  position: relative;
`;

const ProgressFill = styled.div`
  width: 100%;
  background: linear-gradient(180deg, #33ff00, #ca0000);
  height: ${props => props.$progress}%;
  transition: height 0.3s ease;
  position: relative;
  overflow: hidden;
`;

const LevelMarker = styled.div`
  position: absolute;
  width: 100%;
  height: 1px;
  background: rgba(255, 255, 255, 0.3);
  bottom: ${props => props.$position}%;
  
  &::after {
    content: '';
    position: absolute;
    right: -4px;
    top: -1px;
    width: 6px;
    height: 3px;
    background: rgba(255, 255, 255, 0.5);
  }
`;

// ✅ NOVÝ - Tooltip pre vysvetlenie bodov
const TooltipWrapper = styled.div`
  position: relative;
  
  &:hover .tooltip {
    opacity: 1;
    visibility: visible;
  }
`;

const Tooltip = styled.div`
  position: absolute;
  right: 30px;
  top: 50%;
  transform: translateY(-50%);
  background: ${props => props.theme.CARD_BACKGROUND};
  border: 2px solid ${props => props.theme.ACCENT_COLOR};
  padding: 12px 16px;
  border-radius: 8px;
  white-space: nowrap;
  font-size: 12px;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s ease;
  z-index: 10;
  box-shadow: -4px 4px 12px rgba(0,0,0,0.4);
  
  &::after {
    content: '';
    position: absolute;
    right: -8px;
    top: 50%;
    transform: translateY(-50%);
    border: 4px solid transparent;
    border-left-color: ${props => props.theme.ACCENT_COLOR};
  }
`;

const TooltipRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin: 4px 0;
  
  span:first-child {
    color: ${props => props.theme.SECONDARY_TEXT_COLOR};
  }
  
  span:last-child {
    color: ${props => props.theme.PRIMARY_TEXT_COLOR};
    font-weight: bold;
  }
`;

const LevelDisplay = () => {
  const { userStats } = useUserStats();
  
  // Progress sa počíta len z mission points (max 100)
  const maxMissionPoints = 100;
  const missionPoints = userStats.missionPoints || 0;
  const progress = Math.min((missionPoints / maxMissionPoints) * 100, 100);
  
  // Celkový počet bodov (misie + bonus)
  const totalPoints = userStats.totalPoints || 0;
  
  // Bonus body zo zdieľania
  const bonusPoints = userStats.bonusPoints || 0;
  
  // Počet referralov
  const referralsCount = userStats.referrals || 0;

  return (
    <Container>
      <LevelText>Level {userStats.level}</LevelText>
      
      <ProgressBar>
        {/* Indikátory levelov (každých 25%) */}
        <LevelMarker $position={25} />
        <LevelMarker $position={50} />
        <LevelMarker $position={75} />
        
        <ProgressFill $progress={progress} />
      </ProgressBar>
      
      {/* ✅ Body z misií (max 100) */}
      <TooltipWrapper>
        <MissionPointsText>
          Misie: {missionPoints}
        </MissionPointsText>
        <Tooltip className="tooltip">
          <TooltipRow>
            <span>Body z misií:</span>
            <span>{missionPoints}/100</span>
          </TooltipRow>
          <TooltipRow>
            <span>Progress:</span>
            <span>{Math.round(progress)}%</span>
          </TooltipRow>
        </Tooltip>
      </TooltipWrapper>
      
      {/* ✅ Bonus body (ak existujú) - VYLEPŠENÉ */}
      {bonusPoints > 0 && (
        <>
          <Separator />
          <TooltipWrapper>
            <BonusPointsText>
              🎁 +{bonusPoints}
            </BonusPointsText>
            <Tooltip className="tooltip">
              <TooltipRow>
                <span>Zdieľania:</span>
                <span>{referralsCount}×</span>
              </TooltipRow>
              <TooltipRow>
                <span>Body za zdieľanie:</span>
                <span>+{bonusPoints}</span>
              </TooltipRow>
              <TooltipRow>
                <span>(10 bodov × {referralsCount})</span>
              </TooltipRow>
            </Tooltip>
          </TooltipWrapper>
        </>
      )}
      
      <Separator />
      
      {/* ✅ Celkový počet bodov */}
      <TooltipWrapper>
        <PointsText>
          Spolu: {totalPoints}
        </PointsText>
        <Tooltip className="tooltip">
          <TooltipRow>
            <span>Misie:</span>
            <span>{missionPoints}</span>
          </TooltipRow>
          <TooltipRow>
            <span>Bonus:</span>
            <span>+{bonusPoints}</span>
          </TooltipRow>
          <TooltipRow>
            <span>━━━━━━</span>
            <span>━━━━━</span>
          </TooltipRow>
          <TooltipRow>
            <span>Celkom:</span>
            <span>{totalPoints}</span>
          </TooltipRow>
        </Tooltip>
      </TooltipWrapper>
    </Container>
  );
};

export default LevelDisplay;
