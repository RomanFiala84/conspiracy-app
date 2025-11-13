// src/components/main/Intro.js
// FINÁLNA VERZIA - Optimalizovaný dizajn + veľký detective tip

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Layout from '../../styles/Layout';
import StyledButton from '../../styles/StyledButton';
import { useUserStats } from '../../contexts/UserStatsContext';
import DetectiveTipLarge from '../shared/DetectiveTipLarge';

const Container = styled.div`
  padding: 40px 20px;
  max-width: 900px;
  margin: 0 auto;
  min-height: calc(100vh - 80px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  
  @media (max-width: 768px) {
    padding: 30px 15px;
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 40px;
  
  @media (max-width: 768px) {
    margin-bottom: 30px;
  }
`;

const Title = styled.h1`
  font-size: 40px;
  margin-bottom: 16px;
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
    font-size: 32px;
  }
  
  @media (max-width: 480px) {
    font-size: 28px;
  }
`;

const Subtitle = styled.h2`
  font-size: 22px;
  margin-bottom: 8px;
  color: ${props => props.theme.PRIMARY_TEXT_COLOR};
  text-align: center;
  font-weight: 600;
  
  @media (max-width: 480px) {
    font-size: 20px;
  }
`;

const Text = styled.p`
  font-size: 18px;
  line-height: 1.8;
  margin-bottom: 32px;
  color: ${props => props.theme.SECONDARY_TEXT_COLOR};
  text-align: center;
  max-width: 700px;
  
  strong {
    color: ${props => props.theme.ACCENT_COLOR};
    font-weight: 600;
  }
  
  @media (max-width: 480px) {
    font-size: 16px;
    line-height: 1.6;
    margin-bottom: 24px;
  }
`;

const GroupCard = styled.div`
  background: linear-gradient(135deg, 
    ${p => p.theme.ACCENT_COLOR}22, 
    ${p => p.theme.ACCENT_COLOR_2}22
  );
  border: 3px solid ${p => p.theme.ACCENT_COLOR};
  border-radius: 16px;
  padding: 32px 48px;
  margin: 32px 0;
  box-shadow: 0 8px 24px rgba(0,0,0,0.2);
  transition: all 0.3s ease;
  min-width: 300px;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px ${p => p.theme.ACCENT_COLOR}33;
  }
  
  @media (max-width: 480px) {
    padding: 24px 32px;
    min-width: auto;
    width: 100%;
  }
`;

const GroupLabel = styled.div`
  font-size: 14px;
  color: ${p => p.theme.SECONDARY_TEXT_COLOR};
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 12px;
  text-align: center;
  font-weight: 600;
`;

const GroupValue = styled.div`
  font-size: 48px;
  font-weight: 700;
  color: ${p => p.theme.ACCENT_COLOR};
  text-align: center;
  font-family: 'Courier New', monospace;
  letter-spacing: 2px;
  
  @media (max-width: 480px) {
    font-size: 36px;
  }
`;

const InfoSection = styled.div`
  background: ${p => p.theme.CARD_BACKGROUND};
  border: 2px solid ${p => p.theme.BORDER_COLOR};
  border-radius: 12px;
  padding: 24px;
  margin: 24px 0;
  max-width: 700px;
  width: 100%;
  
  @media (max-width: 480px) {
    padding: 20px;
  }
`;

const InfoTitle = styled.h3`
  font-size: 18px;
  color: ${p => p.theme.ACCENT_COLOR};
  margin-bottom: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const InfoList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const InfoItem = styled.li`
  font-size: 15px;
  color: ${p => p.theme.SECONDARY_TEXT_COLOR};
  margin-bottom: 10px;
  padding-left: 24px;
  position: relative;
  line-height: 1.6;
  
  &::before {
    content: '✓';
    position: absolute;
    left: 0;
    color: ${p => p.theme.ACCENT_COLOR};
    font-weight: bold;
  }
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 32px;
  
  @media (max-width: 480px) {
    flex-direction: column;
    width: 100%;
    max-width: 400px;
  }
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 48px;
  height: 48px;
  border: 4px solid ${p => p.theme.BORDER_COLOR};
  border-radius: 50%;
  border-top-color: ${p => p.theme.ACCENT_COLOR};
  animation: spin 0.8s linear infinite;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const Intro = () => {
  const navigate = useNavigate();
  const { dataManager, userId } = useUserStats();
  const [groupCode, setGroupCode] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showTip, setShowTip] = useState(false);

  useEffect(() => {
    const loadGroup = async () => {
      if (userId) {
        try {
          const prog = await dataManager.loadUserProgress(userId);
          setGroupCode(prog.group_assignment || '0');
          
          // ✅ Počkaj kým sa načítajú dáta pred zobrazením tipu
          setTimeout(() => {
            setShowTip(true);
          }, 300);
        } catch (error) {
          console.error('Error loading user progress:', error);
          setGroupCode('0');
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    loadGroup();
  }, [userId, dataManager]);

  const handleContinue = () => {
    navigate('/mainmenu');
  };

  const getGroupDescription = (code) => {
    switch(code) {
      case '0':
        return 'Kontrolná skupina';
      case '1':
        return 'Intervenčná skupina';
      case '2':
        return 'Preventívna skupina';
      default:
        return 'Výskumná skupina';
    }
  };

  return (
    <Layout showLevelDisplay={false}>
      <Container>
        <Header>
          <Title>🔍 Conspiracy Pass</Title>
          <Subtitle>Vitajte v detektívnej akadémii!</Subtitle>
        </Header>
        
        {isLoading ? (
          <GroupCard>
            <GroupLabel>Načítavam priradenie...</GroupLabel>
            <GroupValue style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
              <LoadingSpinner />
            </GroupValue>
          </GroupCard>
        ) : (
          <>
            <GroupCard>
              <GroupLabel>{getGroupDescription(groupCode)}</GroupLabel>
              <GroupValue>Skupina {groupCode}</GroupValue>
            </GroupCard>

            <Text>
              Ste pripravení vydať sa na dobrodružstvo plné <strong>tajomstiev</strong> a <strong>odhaľovania pravdy</strong>? 
              Vaše detektívne schopnosti budú testované v rôznych misiách.
            </Text>

            <InfoSection>
              <InfoTitle>🎯 Čo vás čaká</InfoTitle>
              <InfoList>
                <InfoItem>4 zaujímavé detektívne misie</InfoItem>
                <InfoItem>Tréning kritického myslenia</InfoItem>
                <InfoItem>Odhaľovanie dezinformácií a konšpirácií</InfoItem>
                <InfoItem>Zbieranie bodov a levelovanie</InfoItem>
                <InfoItem>Možnosť získať ceny v súťaži</InfoItem>
              </InfoList>
            </InfoSection>

            <ButtonContainer>
              <StyledButton 
                variant="accent"
                size="large"
                onClick={handleContinue}
              >
                🚀 Začať výcvik
              </StyledButton>
            </ButtonContainer>
          </>
        )}

        {/* ✅ Detective Tip - zobrazí sa len po načítaní dát */}
        {showTip && !isLoading && (
          <DetectiveTipLarge
            detectiveName="Detektív Conan"
            imageUrl="/images/detective.png"
            iconUrl="/images/detective-icon.png"
            tip={`
              <p>Vitajte, <strong>mladý detektíve</strong>!</p>
              <p>Ja som detektív Conan a budem vašim sprievodcom na ceste odhaľovania pravdy a boja proti dezinformáciám.</p>
              <p>Spoločne s mojím verným nemeckým ovčiakom preskúmame záhadné prípady a naučíme sa rozpoznávať <strong>manipuláciu a konšpiračné teórie</strong>.</p>
              <p><em>Pripravte sa na detektívne dobrodružstvo! 🕵️‍♂️</em></p>
            `}
            buttonText="🎯 Rozumiem, poďme na to!"
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
