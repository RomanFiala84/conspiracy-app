// src/components/missions/mission3/OutroMission3.js
// OPRAVENÁ VERZIA - Finálna misia so špeciálnym celebration efektom

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

// ✅ Špeciálny box pre finálnu misiu
const FinalMissionBox = styled.div`
  background: linear-gradient(135deg, 
    ${p => p.theme.ACCENT_COLOR}22, 
    ${p => p.theme.ACCENT_COLOR_2}22
  );
  border: 3px solid ${p => p.theme.ACCENT_COLOR};
  border-radius: 20px;
  padding: 40px;
  margin: 40px auto;
  max-width: 500px;
  box-shadow: 0 12px 32px rgba(0,0,0,0.3);
  animation: fadeInUp 0.8s ease;
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @media (max-width: 480px) {
    padding: 28px;
  }
`;

const FinalTitle = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: ${p => p.theme.ACCENT_COLOR};
  margin-bottom: 20px;
  animation: pulse 2s ease-in-out infinite;
  
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
  
  @media (max-width: 480px) {
    font-size: 22px;
  }
`;

const FinalText = styled.div`
  font-size: 16px;
  color: ${p => p.theme.PRIMARY_TEXT_COLOR};
  line-height: 1.8;
  margin-bottom: 24px;
  
  strong {
    color: ${p => p.theme.ACCENT_COLOR};
    font-weight: 700;
  }
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

const OutroMission3 = () => {
  const navigate = useNavigate();
  const { addMissionPoints, refreshUserStats, dataManager, userId } = useUserStats();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleContinue = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      console.log('🎯 Completing mission3 (FINAL MISSION)...');
      
      // ✅ Pridaj body za finálnu misiu
      const success = await addMissionPoints('mission3');
      
      if (success) {
        console.log('✅ Mission3 points added successfully');
        
        // ✅ Označ všetky misie ako dokončené
        const progress = await dataManager.loadUserProgress(userId);
        progress.all_missions_completed = true;
        await dataManager.saveProgress(userId, progress);
        
        // ✅ Refresh stats po pridaní bodov
        await refreshUserStats();
        
        // ✅ Navigate po krátkej pauze
        setTimeout(() => {
          navigate('/mainmenu');
        }, 500);
      } else {
        console.warn('⚠️ Mission3 already completed or error');
        navigate('/mainmenu');
      }
    } catch (error) {
      console.error('❌ Error completing mission3:', error);
      navigate('/mainmenu');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Layout>
      <Container>
        <Title>🏆 Finálna misia dokončená!</Title>
        
        <Text>
          Neuveriteľné! Úspešne ste dokončili všetky detektívne misie a stali ste sa majstrom v odhaľovaní dezinformácií!
        </Text>

        <SuccessBox>
          <PointsLabel>Získané body za misiu:</PointsLabel>
          <PointsEarned>+25 🎭</PointsEarned>
          <LevelUpText>🎯 Misia 3 dokončená!</LevelUpText>
        </SuccessBox>

        {/* ✅ Špeciálny celebration box */}
        <FinalMissionBox>
          <FinalTitle>🎖️ Všetky misie dokončené!</FinalTitle>
          <FinalText>
            Dosiahli ste <strong>Level 5</strong> a získali ste celkovo <strong>100 bodov</strong> 
            za všetky misie! 🌟
          </FinalText>
          <FinalText>
            Ste teraz <strong>Expert Detektív</strong> v odhaľovaní konšpiračných teórií 
            a dezinformácií. Vaše schopnosti kritického myslenia dosiahli majstrovskú úroveň!
          </FinalText>
          <LevelUpText>
            🏅 Gratulujeme k úspešnému dokončeniu celého programu! 🏅
          </LevelUpText>
        </FinalMissionBox>

        <Text>
          Ďakujeme za vašu účasť! Získané znalosti vám pomôžu v reálnom živote rozpoznávať 
          a kriticky hodnotiť informácie, s ktorými sa stretnete.
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

export default OutroMission3;
