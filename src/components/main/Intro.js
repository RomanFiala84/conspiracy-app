// src/components/main/Intro.js
// OPTIMALIZOVANÁ VERZIA - Kompaktnejší dizajn + vizuálne vylepšenia

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Layout from '../../styles/Layout';
import StyledButton from '../../styles/StyledButton';
import { useUserStats } from '../../contexts/UserStatsContext';
import DetectiveTipLarge from '../shared/DetectiveTipLarge';
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

const Header = styled.div`
  text-align: center;
  margin-bottom: 24px;
  
  @media (max-width: 768px) {
    margin-bottom: 20px;
  }
`;

const Title = styled.h1`
  font-size: 25px;
  margin-bottom: 8px;
  background: linear-gradient(
    135deg,
    ${props => props.theme.ACCENT_COLOR},
    ${props => props.theme.ACCENT_COLOR_2}
  );
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-align: center;
  font-weight: 700;
  
  @media (max-width: 768px) {
    font-size: 25px;
  }
  
  @media (max-width: 480px) {
    font-size: 25px;
  }
`;

const Subtitle = styled.h2`
  font-size: 20px;
  margin-bottom: 4px;
  color: ${props => props.theme.ACCENT_COLOR};
  text-align: center;
  font-weight: 600;
  text-align: left;
  @media (max-width: 480px) {
    font-size: 20px;
  }
`;

const Text = styled.p`
  font-size: 15px;
  line-height: 1.6;
  margin-bottom: 20px;
  color: ${props => props.theme.PRIMARY_TEXT_COLOR};
  text-align: center;
  max-width: 700px;
  text-align: center;
  strong {
    color: ${props => props.theme.PRIMARY_TEXT_COLOR};
    font-weight: 600;
  }
  
  @media (max-width: 480px) {
    font-size: 15px;
    line-height: 1.5;
    margin-bottom: 16px;
  }
`;

const GroupCard = styled.div`
  background: linear-gradient(135deg, 
    ${p => p.theme.ACCENT_COLOR}22, 
    ${p => p.theme.ACCENT_COLOR_2}22
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
  
  /* Decentný gradient overlay */
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

const GroupLabel = styled.div`
  font-size: 20px;
  color: ${p => p.theme.PRIMARY_TEXT_COLOR};
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin-bottom: 8px;
  text-align: center;
  font-weight: 600;
  position: relative;
  z-index: 1;
  
  @media (max-width: 480px) {
    font-size: 20px;
  }
`;

const GroupValue = styled.div`
  font-size: 42px;
  font-weight: 700;
  color: ${p => p.theme.ACCENT_COLOR};
  text-align: center;
  font-family: 'Courier New', monospace;
  letter-spacing: 2px;
  text-shadow: 0 2px 8px ${p => p.theme.ACCENT_COLOR}45;
  position: relative;
  z-index: 1;
  
  @media (max-width: 480px) {
    font-size: 20px;
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
  text-align: left;
  &:hover {
    border-color: ${p => p.theme.ACCENT_COLOR}60;
  }
  
  @media (max-width: 480px) {
    padding: 16px;
  }
`;



const InfoTitle = styled.h3`
  font-size: 16px;
  color: ${p => p.theme.ACCENT_COLOR};
  margin-bottom: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &::before {
    content: '';
    font-size: 18px;
  }
  
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
  text-align: left;
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

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 40px;
  height: 40px;
  border: 3px solid ${p => p.theme.BORDER_COLOR};
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 20px 0;
`;

const LoadingText = styled.div`
  font-size: 15px;
  color: ${p => p.theme.PRIMARY_TEXT_COLOR};
  font-weight: 500;
`;


const Intro = () => {
  const navigate = useNavigate();
  const { dataManager } = useUserStats();
  const [groupCode, setGroupCode] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showTip, setShowTip] = useState(false);

  // ✅ OPRAVENÉ - použije sessionStorage namiesto userId state
  useEffect(() => {
    const loadGroup = async () => {
      // ✅ Načítaj participantCode priamo zo sessionStorage
      const participantCode = sessionStorage.getItem('participantCode');
      
      if (!participantCode) {
        console.warn('⚠️ No participantCode in Intro, redirecting to instruction...');
        navigate('/instruction');
        return;
      }
      
      try {
        console.log(`📊 Loading group assignment for: ${participantCode}`);
        const prog = await dataManager.loadUserProgress(participantCode);
        
        // ✅ Skupina sa zachová - NIKDY sa nezmení po prvom nastavení
        setGroupCode(prog.group_assignment || '0');
        
        setTimeout(() => {
          setShowTip(true);
        }, 300);
      } catch (error) {
        console.error('❌ Error loading user progress:', error);
        setGroupCode('0');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadGroup();
  }, [dataManager, navigate]); // ✅ Odstránené userId dependency

  const handleContinue = () => {
    navigate('/mainmenu');
  };

  const getGroupDescription = (code) => {
    switch(code) {
      case '0':
        return 'Columbo';
      case '1':
        return 'Poirot';
      case '2':
        return 'Holmes';
      default:
        return 'Oddelenie';
    }
  };
  const theme = useContext(ThemeContext);
  return (
    <Layout showLevelDisplay={false} showAnimatedBackground={true}
  cubeCount={50}
  animationSpeed="normal"
  complexity="medium">
      <Container>
        <Header>
          <Title><strong>Aplikácia CP-PASS</strong></Title>
          <Subtitle><strong>Vitajte v detektívnej akadémii!</strong></Subtitle>
        </Header>
        
        {isLoading ? (
          <GroupCard>
            <GroupLabel><strong>Priraďujem vás do oddelenia</strong></GroupLabel>
            <LoadingContainer>
              <LoadingSpinner />
              <LoadingText>Načítavam...</LoadingText>
            </LoadingContainer>
          </GroupCard>
        ) : (
          <>
            <GroupCard>
              <GroupLabel><strong>Vaše detektívne oddelenie:</strong></GroupLabel>
              <GroupValue>{getGroupDescription(groupCode)}</GroupValue>
            </GroupCard>

            <Text>
              <strong>Výborne! Boli ste priradení do oddelenia </strong> <strong>{getGroupDescription(groupCode)}</strong>.<br/>
              <strong>Ste pripravení začať svoju cestu detektíva/ky? Pozrime sa, čo vás čaká v tejto aplikácii.</strong>
            </Text>

            <InfoSection>
              <InfoTitle><strong>Čo vás čaká?</strong></InfoTitle>
              <InfoList>
                <InfoItem><strong>4 zaujímavé detektívne misie</strong></InfoItem>
                <InfoItem><strong>Zbieranie bodov a levelovanie</strong></InfoItem>
                <InfoItem><strong>Možnosť vyhrať ceny v súťaži</strong></InfoItem>
              </InfoList>
            </InfoSection>

            <ButtonContainer>
              <StyledButton 
                variant="accent"
                size="large"
                onClick={handleContinue}
              >
                Rozumiem, poďme na to!
              </StyledButton>
            </ButtonContainer>
          </>
        )}
        
        {showTip && !isLoading && (
          <DetectiveTipLarge
            detectiveName="Inšpektor Kritan"
            imageUrl="/images/detective.png"
            iconUrl="/images/detective-icon.png"
            style={{ textAlign: "justify" }}
            tip={`
              <p style="font-size: 15px; font-weight: bold; color: ${theme.PRIMARY_TEXT_COLOR}; margin-bottom: 12px;">
                <strong>Ahoj, milý/á respondent/ka!</strong>
              </p>
              
              <p style="font-size: 15px; font-weight: bold; margin-bottom: 10px; line-height: 1.6; color: ${theme.PRIMARY_TEXT_COLOR};">
                <strong>Volám sa Inšpektor Kritan a budem vašim sprievodcom počas celého výskumu.</strong>
              </p>
              
              <p style="font-size: 15px; font-weight: bold;margin-bottom: 10px; line-height: 1.6; color: ${theme.PRIMARY_TEXT_COLOR};">
                <strong>Ak budete potrebovať pomoc, môžete sa kedykoľvek obrátiť na mňa.</strong>
                <strong>Nájdete ma vždy v pravom dolnom rohu obrazovky.</strong>
              </p>
              
              
                <p style="font-size: 15px; font-weight: bold;margin-bottom: 8px; color: ${theme.PRIMARY_TEXT_COLOR};">
                  <strong>Počas tohto výskumu:</strong>
                </p>
                <ul style="list-style: none; padding-left: 20px; padding-right: 20px; margin: 0;">
                  <li style="font-size: 15px; padding-left: 0; position: relative; margin-bottom: 10px; line-height: 1.6; color: ${theme.PRIMARY_TEXT_COLOR};">
                    <span style="position: absolute; left: -15px; top: 0; color: ${theme.ACCENT_COLOR}; font-weight: bold; font-size: 15px;">•</span>
                    <strong>Budete zastávať rolu detektíva/ky.</strong>
                  </li>
                  <li style="font-size: 15px; padding-left: 0; position: relative; margin-bottom: 10px; line-height: 1.6; color: ${theme.PRIMARY_TEXT_COLOR};">
                    <span style="position: absolute; left: -15px; top: 0; color: ${theme.ACCENT_COLOR}; font-weight: bold; font-size: 15px;">•</span>
                    <strong>Získate detektívne body a levely.</strong>
                  </li>
                  <li style="font-size: 15px; padding-left: 0; position: relative; margin-bottom: 10px; line-height: 1.6; color: ${theme.PRIMARY_TEXT_COLOR};">
                    <span style="position: absolute; left: -15px; top: 0; color: ${theme.ACCENT_COLOR}; font-weight: bold; font-size: 15px;">•</span>
                    <strong>Môžete súťažiť o ceny.</strong>
                  </li>
                </ul>
              </div>
              
              <p style="font-size: 15px; font-weight: bold;margin-top: 16px; color: ${theme.ACCENT_COLOR}; line-height: 1.6;">
                <strong>Ak ste pripravený, poďme sa spolu pozrieť do ktorého oddelenia ste boli priradený!</strong> 
              </p>
            `}

            buttonText="Rozumiem, poďme na to!"
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

export default Intro;
