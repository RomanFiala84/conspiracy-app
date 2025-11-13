// src/components/shared/LevelDisplay.js
// OPRAVENÁ VERZIA - Bez zbytočného refreshu

import React from 'react';
import styled from 'styled-components';
import { useUserStats } from '../../contexts/UserStatsContext';

const Wrapper = styled.div`
  position: fixed;
  top: 18px;
  left: 18px;
  z-index: 1200;
  background: ${p => p.theme.CARD_BACKGROUND};
  border: 2.5px solid ${p => p.theme.ACCENT_COLOR};
  border-radius: 12px;
  box-shadow: 0 4px 18px rgba(0,0,0,0.13);
  padding: 16px 22px 14px 22px;
  min-width: 175px;

  @media (max-width: 600px) {
    top: 8px;
    left: 5px;
    padding: 10px 7px 8px 10px;
    min-width: 130px;
  }
`;

const TopRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 10px;
`;

const Level = styled.div`
  font-size: 28px;
  font-weight: bold;
  color: ${p => p.theme.ACCENT_COLOR};
  letter-spacing: 1px;
`;

const Label = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: ${p => p.theme.SECONDARY_TEXT_COLOR};
  margin-top: 2px;
`;

const StatTable = styled.div`
  display: grid;
  grid-template-columns: auto auto;
  gap: 7px 19px;
  font-size: 15px;

  @media (max-width: 600px) {
    font-size: 12px;
  }
`;

const StatLabel = styled.span`
  color: ${p => p.theme.SECONDARY_TEXT_COLOR};
  text-align: left;
`;

const StatValue = styled.span`
  color: ${p => (p.$highlight ? p.theme.ACCENT_COLOR : p.theme.PRIMARY_TEXT_COLOR)};
  font-weight: ${p => (p.$bold ? 700 : 400)};
  text-align: right;
`;

const ProgressBar = styled.div`
  grid-column: 1 / -1;
  margin-top: 10px;
  height: 8px;
  background: ${p => p.theme.BORDER_COLOR};
  border-radius: 5px;
  overflow: hidden;
`;

const Progress = styled.div`
  height: 100%;
  width: ${p => p.$progress || 0}%;
  background: linear-gradient(90deg, ${p => p.theme.ACCENT_COLOR}, ${p => p.theme.ACCENT_COLOR_2});
  border-radius: 5px;
  transition: width 0.35s;
`;

const LevelDisplay = () => {
  const { userStats } = useUserStats(); // ✅ Iba userStats, bez refreshUserStats

  const mission = userStats?.missionPoints ?? 0;
  const bonus = userStats?.bonusPoints ?? 0;
  const referrals = userStats?.referrals ?? 0;
  const total = userStats?.totalPoints ?? 0;
  const level = userStats?.level ?? 1;

  // Progress based on missions (max 100)
  const progress = Math.min((mission / 100) * 100, 100);

  return (
    <Wrapper>
      <TopRow>
        <Label>LEVEL</Label>
        <Level>{level}</Level>
      </TopRow>
      <StatTable>
        <StatLabel>Bodov za misie:</StatLabel>
        <StatValue $highlight>{mission}</StatValue>

        <StatLabel>Bonus ({referrals}×):</StatLabel>
        <StatValue>{bonus > 0 ? `+${bonus}` : '0'}</StatValue>

        <StatLabel><b>SPOLU:</b></StatLabel>
        <StatValue $bold $highlight>{total}</StatValue>

        <ProgressBar>
          <Progress $progress={progress} />
        </ProgressBar>
      </StatTable>
    </Wrapper>
  );
};

export default LevelDisplay;
