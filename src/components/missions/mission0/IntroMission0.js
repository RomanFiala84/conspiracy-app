// src/components/mission0/intro/IntroMission0.js
// ✅ OPTIMALIZOVANÁ VERZIA - Štýl z hlavného Intro

import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { ThemeContext } from 'styled-components';
import Layout from '../../../styles/Layout';
import StyledButton from '../../../styles/StyledButton';
import { useUserStats } from '../../../contexts/UserStatsContext';
import DetectiveTipLarge from '../../shared/DetectiveTipLarge';

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
  margin: 0;
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
    background: ${p => p.theme.ACCENT_COLOR}15;
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

const IntroMission0 = () => {
  const navigate = useNavigate();
  const { dataManager} = useUserStats();
  const [showTip, setShowTip] = useState(false);
  const theme = useContext(ThemeContext);

  useEffect(() => {
    const recordStart = async () => {
      const participantCode = sessionStorage.getItem('participantCode');
      if (!participantCode) {
        console.warn('⚠️ No participantCode, redirecting...');
        navigate('/instruction');
        return;
      }

      try {
        const prog = await dataManager.loadUserProgress(participantCode);
        if (!prog) {
          console.error(`❌ Failed to load progress for ${participantCode}`);
          return;
        }

        const timestampKey = 'mission0_timestamp_start';
        if (!prog[timestampKey]) {
          prog[timestampKey] = new Date().toISOString();
          await dataManager.saveProgress(participantCode, prog);
        }

        // Zobraz tip po načítaní
        setTimeout(() => {
          setShowTip(true);
        }, 300);
      } catch (error) {
        console.error('❌ Error recording mission start:', error);
      }
    };

    recordStart();
  }, [dataManager, navigate]);

  const handleContinue = () => navigate('/mission0/questionnaire');

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
          <MissionLabel><strong>Misia 0: Predvýskum</strong></MissionLabel>
        </MissionCard>

        <InfoSection>
          <InfoTitle><strong>Čo vás čaká v tejto misii?</strong></InfoTitle>
          <InfoList>
            <InfoItem><strong>Dotazník (5-10 minút) - séria otázok a tvrdení</strong></InfoItem>
            <InfoItem><strong>Získate 50 detektívnych bodov</strong></InfoItem>
          </InfoList>
        </InfoSection>

        <ButtonContainer>
          <StyledButton 
            variant="accent"
            size="large"
            onClick={handleContinue}
          >
            Začať misiu!
          </StyledButton>
        </ButtonContainer>

        {showTip && (
          <DetectiveTipLarge
            detectiveName="Inšpektor Kritan"
            imageUrl="/images/detective.png"
            iconUrl="/images/detective-icon.png"
            style={{ textAlign: "left" }}
            tip={`
              <p style="font-size: 15px; font-weight: bold; margin-bottom: 10px; line-height: 1.6; color: ${theme.PRIMARY_TEXT_COLOR};">
                <strong>Ďakujeme, že ste sa rozhodli zúčastniť v predvýskume!</strong>
              </p>
              
              <p style="font-size: 15px; font-weight: bold; margin-bottom: 10px; line-height: 1.6; color: ${theme.PRIMARY_TEXT_COLOR};">
                <strong>Čo je cieľom predvýskumu?</strong>
              </p>
              <ul style="list-style: none; padding-left: 20px; padding-right: 20px; margin: 0;">
                <li style="font-size: 15px; padding-left: 0; position: relative; margin-bottom: 10px; line-height: 1.6; color: ${theme.PRIMARY_TEXT_COLOR};">
                  <span style="position: absolute; left: -15px; top: 0; color: ${theme.ACCENT_COLOR}; font-weight: bold; font-size: 15px;">•</span>
                  <strong>Predtým ako spustíme hlavný výskum, potrebujeme overiť, že všetky otázky a tvrdenia v dotazníku sú zrozumiteľné a jednoznačné.</strong>
                </li>
              </ul>


              <p style="font-size: 15px; font-weight: bold; margin-bottom: 10px; line-height: 1.6; color: ${theme.PRIMARY_TEXT_COLOR};">
                <strong>Aká je vaša úloha?</strong>
              </p>
              <ul style="list-style: none; padding-left: 20px; padding-right: 20px; margin: 0;">
                <li style="font-size: 15px; padding-left: 0; position: relative; margin-bottom: 10px; line-height: 1.6; color: ${theme.PRIMARY_TEXT_COLOR};">
                  <span style="position: absolute; left: -15px; top: 0; color: ${theme.ACCENT_COLOR}; font-weight: bold; font-size: 15px;">•</span>
                  <strong>Pozorne si prečítajte každú otázku a tvrdenie, odpovedajte prosím úprimne.</strong>
                </li>
                <li style="font-size: 15px; padding-left: 0; position: relative; margin-bottom: 10px; line-height: 1.6; color: ${theme.PRIMARY_TEXT_COLOR};">
                  <span style="position: absolute; left: -15px; top: 0; color: ${theme.ACCENT_COLOR}; font-weight: bold; font-size: 15px;">•</span>
                  <strong>Veľmi dlho nad otázkami a tvrdeniami nepremýšľajte. Pri jednotlivých položkách nie sú správne alebo nesprávne odpovede.</strong>
                </li>
                <li style="font-size: 15px; padding-left: 0; position: relative; margin-bottom: 10px; line-height: 1.6; color: ${theme.PRIMARY_TEXT_COLOR};">
                  <span style="position: absolute; left: -15px; top: 0; color: ${theme.ACCENT_COLOR}; font-weight: bold; font-size: 15px;">•</span>
                  <strong>Po každom bloku otázok vás požiadame o spätnú väzbu.</strong>
                </li>
                <li style="font-size: 15px; padding-left: 0; position: relative; margin-bottom: 10px; line-height: 1.6; color: ${theme.PRIMARY_TEXT_COLOR};">
                  <span style="position: absolute; left: -15px; top: 0; color: ${theme.ACCENT_COLOR}; font-weight: bold; font-size: 15px;">•</span>
                  <strong>Budeme sa pýtať napríklad na zrozumiteľnosť, jednoznačnosť a významovú zhodu otázok a tvrdení.</strong>
                </li>
                <li style="font-size: 15px; padding-left: 0; position: relative; margin-bottom: 10px; line-height: 1.6; color: ${theme.PRIMARY_TEXT_COLOR};">
                  <span style="position: absolute; left: -15px; top: 0; color: ${theme.ACCENT_COLOR}; font-weight: bold; font-size: 15px;">•</span>
                  <strong>Taktiež budeme zisťovať, či dokážete vybranou hodnotiacou stupnicou vyjadriť svoj skutočný postoj.</strong>
                </li>
              </ul>

              <p style="font-size: 15px; font-weight: bold; margin-top: 16px; color: ${theme.ACCENT_COLOR}; line-height: 1.6;">
                <strong>Ste pripravený?</strong>
              </p>
            `}
            buttonText="Poďme na to!"
            autoOpen={true}
            autoOpenDelay={800}
            autoClose={false}
            showBadge={true}
          />
        )}
      </Container>
    </Layout>
  );
};

export default IntroMission0;
