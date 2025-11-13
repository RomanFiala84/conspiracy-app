// src/components/missions/mission2/OutroMission2.js
// UPRAVENÁ VERZIA - 25 bodov za misiu

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Layout from '../../../styles/Layout';
import StyledButton from '../../../styles/StyledButton';
import { useUserStats } from '../../../contexts/UserStatsContext';

const Container = styled.div`
  padding: 40px;
  text-align: center;
`;

const Title = styled.h2`
  color: ${p => p.theme.ACCENT_COLOR};
  margin-bottom: 20px;
`;

const Text = styled.p`
  color: ${p => p.theme.SECONDARY_TEXT_COLOR};
  margin-bottom: 30px;
  line-height: 1.6;
`;

const SuccessBox = styled.div`
  background: ${p => p.theme.CARD_BACKGROUND};
  border: 2px solid ${p => p.theme.ACCENT_COLOR};
  border-radius: 12px;
  padding: 24px;
  margin: 30px auto;
  max-width: 400px;
`;

const PointsEarned = styled.div`
  font-size: 48px;
  font-weight: bold;
  color: ${p => p.theme.ACCENT_COLOR};
  margin: 16px 0;
  
  @media (max-width: 480px) {
    font-size: 36px;
  }
`;

const PointsLabel = styled.div`
  font-size: 16px;
  color: ${p => p.theme.PRIMARY_TEXT_COLOR};
  margin-bottom: 8px;
`;

const LevelUpText = styled.div`
  font-size: 14px;
  color: ${p => p.theme.ACCENT_COLOR_2};
  margin-top: 16px;
  font-weight: 600;
`;

const OutroMission2 = () => {
  const navigate = useNavigate();
  const { dataManager, userId, addMissionPoints } = useUserStats(); // ✅ Použiť addMissionPoints

  useEffect(() => {
    const completeMission = async () => {
      if (!userId) return;

      try {
        const progress = await dataManager.loadUserProgress(userId);
        
        // ✅ Pridaj 25 bodov za misiu
        const pointsAdded = await addMissionPoints('mission2');
        
        if (pointsAdded) {
          console.log('✅ Mission 2 dokončená a body pridané');
        }
        
        // Označ misiu ako dokončenú
        progress.mission2_completed = true;
        progress.mission2_timestamp_end = new Date().toISOString();
        await dataManager.saveProgress(userId, progress);
        
      } catch (error) {
        console.error('❌ Chyba pri dokončovaní Mission 2:', error);
      }
    };

    completeMission();
  }, [dataManager, userId, addMissionPoints]);

  return (
    <Layout>
      <Container>
        <Title>🎉 Debriefing dokončený!</Title>
        
        <Text>
          Bravó! Úspešne ste dokončili Misiu 2 a pokročili ďalej v detektívnom výcviku!
        </Text>

        {/* ✅ Zobrazenie získaných bodov */}
        <SuccessBox>
          <PointsLabel>Získané body za misiu:</PointsLabel>
          <PointsEarned>+25</PointsEarned>
          <LevelUpText>⭐ Misia 2 dokončená!</LevelUpText>
        </SuccessBox>

        <Text>
          Ďakujeme za ukončenie Misie 2. Pripravte sa na ďalšie výzvy!
        </Text>

        <StyledButton accent onClick={() => navigate('/mainmenu')}>
          🏠 Hlavné menu
        </StyledButton>
      </Container>
    </Layout>
  );
};

export default OutroMission2;
