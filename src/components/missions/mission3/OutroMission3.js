// src/components/missions/mission3/OutroMission3.js
// UPRAVENÁ VERZIA - 25 bodov za misiu (finálna misia!)

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

// ✅ ŠPECIÁLNY box pre finálnu misiu
const FinalMissionBox = styled.div`
  background: linear-gradient(135deg, 
    ${p => p.theme.ACCENT_COLOR}22, 
    ${p => p.theme.ACCENT_COLOR_2}22
  );
  border: 3px solid ${p => p.theme.ACCENT_COLOR};
  border-radius: 16px;
  padding: 32px;
  margin: 40px auto;
  max-width: 500px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.3);
`;

const FinalTitle = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: ${p => p.theme.ACCENT_COLOR};
  margin-bottom: 16px;
  
  @media (max-width: 480px) {
    font-size: 20px;
  }
`;

const FinalText = styled.div`
  font-size: 16px;
  color: ${p => p.theme.PRIMARY_TEXT_COLOR};
  line-height: 1.7;
  margin-bottom: 20px;
`;

const OutroMission3 = () => {
  const navigate = useNavigate();
  const { dataManager, userId, addMissionPoints } = useUserStats(); // ✅ Použiť addMissionPoints

  useEffect(() => {
    const completeMission = async () => {
      if (!userId) return;

      try {
        const progress = await dataManager.loadUserProgress(userId);
        
        // ✅ Pridaj 25 bodov za poslednú misiu
        const pointsAdded = await addMissionPoints('mission3');
        
        if (pointsAdded) {
          console.log('🎉 Mission 3 dokončená - VŠETKY MISIE DOKONČENÉ!');
        }
        
        // Označ misiu ako dokončenú
        progress.mission3_completed = true;
        progress.mission3_timestamp_end = new Date().toISOString();
        progress.all_missions_completed = true; // ✅ Všetky misie dokončené
        await dataManager.saveProgress(userId, progress);
        
      } catch (error) {
        console.error('❌ Chyba pri dokončovaní Mission 3:', error);
      }
    };

    completeMission();
  }, [dataManager, userId, addMissionPoints]);

  return (
    <Layout>
      <Container>
        <Title>🏆 Debriefing dokončený!</Title>
        
        <Text>
          Gratulujem! Úspešne ste dokončili poslednú misiu a stali ste sa majstrom detektívom!
        </Text>

        {/* ✅ Zobrazenie získaných bodov */}
        <SuccessBox>
          <PointsLabel>Získané body za misiu:</PointsLabel>
          <PointsEarned>+25</PointsEarned>
          <LevelUpText>⭐ Misia 3 dokončená!</LevelUpText>
        </SuccessBox>

        {/* ✅ ŠPECIÁLNY box pre finálnu misiu */}
        <FinalMissionBox>
          <FinalTitle>🎖️ Všetky misie dokončené!</FinalTitle>
          <FinalText>
            Dosiahli ste <strong>Level 5</strong> a získali <strong>100 bodov</strong> 
            za všetky misie! Ste teraz plnohodnotný člen detektívneho tímu!
          </FinalText>
          <LevelUpText>
            🌟 Gratulujeme k úspešnému dokončeniu celého programu!
          </LevelUpText>
        </FinalMissionBox>

        <Text>
          Ďakujeme za ukončenie Misie 3 a vašu účasť v celom programe.
        </Text>

        <StyledButton accent onClick={() => navigate('/mainmenu')}>
          🏠 Hlavné menu
        </StyledButton>
      </Container>
    </Layout>
  );
};

export default OutroMission3;
