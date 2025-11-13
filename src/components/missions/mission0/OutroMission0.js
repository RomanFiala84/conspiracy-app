// src/components/missions/mission0/OutroMission0.js
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

// ✅ NOVÝ - Gratulačný box
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

const OutroMission0 = () => {
  const navigate = useNavigate();
  const { dataManager, userId, addMissionPoints } = useUserStats(); // ✅ Použiť addMissionPoints

  useEffect(() => {
    const completeMission = async () => {
      if (!userId) return;

      try {
        const prog = await dataManager.loadUserProgress(userId);
        
        // ✅ Pridaj 25 bodov za misiu
        const pointsAdded = await addMissionPoints('mission0');
        
        if (pointsAdded) {
          console.log('✅ Mission 0 dokončená a body pridané');
        }
        
        // Označ misiu ako dokončenú
        prog.mission0_completed = true;
        prog.mission0_timestamp_end = new Date().toISOString();
        await dataManager.saveProgress(userId, prog);
        
      } catch (error) {
        console.error('❌ Chyba pri dokončovaní Mission 0:', error);
      }
    };

    completeMission();
  }, [dataManager, userId, addMissionPoints]);

  return (
    <Layout>
      <Container>
        <Title>🎉 Úspešne ukončené!</Title>
        
        <Text>
          Ďakujeme za vyplnenie dotazníka. Získali ste cenné body za dokončenie prvej misie!
        </Text>

        {/* ✅ NOVÝ - Zobrazenie získaných bodov */}
        <SuccessBox>
          <PointsLabel>Získané body za misiu:</PointsLabel>
          <PointsEarned>+25</PointsEarned>
          <LevelUpText>⭐ Misia 0 dokončená!</LevelUpText>
        </SuccessBox>

        <Text>
          Pokračujte do hlavného menu a pripravte sa na ďalšie výzvy.
        </Text>

        <StyledButton accent onClick={() => navigate('/mainmenu')}>
          🏠 Hlavné menu
        </StyledButton>
      </Container>
    </Layout>
  );
};

export default OutroMission0;
