// src/components/missions/mission1/Intervention1.js
// UPRAVENÁ VERZIA s ResponseManager a time tracking

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Layout from '../../../styles/Layout';
import StyledButton from '../../../styles/StyledButton';
import { useUserStats } from '../../../contexts/UserStatsContext';
import { getResponseManager } from '../../../utils/ResponseManager';

const Container = styled.div`
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
`;

const Card = styled.div`
  background: ${p => p.theme.CARD_BACKGROUND};
  border: 1px solid ${p => p.theme.BORDER_COLOR};
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 20px;
`;

const Title = styled.h2`
  color: ${p => p.theme.PRIMARY_TEXT_COLOR};
  text-align: center;
  margin-bottom: 24px;
  font-size: 20px;
  font-weight: 600;
`;

const InterventionContent = styled.div`
  line-height: 1.8;
  color: ${p => p.theme.PRIMARY_TEXT_COLOR};
  font-size: 15px;
  margin-bottom: 24px;
`;

const ExampleBox = styled.div`
  background: ${p => p.theme.HOVER_OVERLAY};
  border-left: 4px solid ${p => p.theme.ACCENT_COLOR};
  padding: 16px;
  margin: 16px 0;
  border-radius: 4px;
`;

const TimeTracker = styled.div`
  text-align: center;
  font-size: 12px;
  color: ${p => p.theme.SECONDARY_TEXT_COLOR};
  margin-bottom: 16px;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 24px;
`;

const COMPONENT_ID = 'mission1_intervention';

const Intervention1 = () => {
  const navigate = useNavigate();
  const { dataManager, userId } = useUserStats();
  const responseManager = getResponseManager(dataManager);
  
  const [startTime] = useState(Date.now());
  const [timeSpent, setTimeSpent] = useState(0);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  // Guard: prevent access if mission1 locked (unless admin)
  useEffect(() => {
    (async () => {
      const prog = await dataManager.loadUserProgress(userId);
      if (!prog.mission1_unlocked && !dataManager.isAdmin(userId)) {
        return navigate('/mainmenu');
      }
    })();
  }, [dataManager, userId, navigate]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPercentage = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      if (scrollPercentage > 80) setHasScrolled(true);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const autoSave = setInterval(async () => {
      const currentTime = Math.floor((Date.now() - startTime) / 1000);
      await responseManager.saveAnswer(userId, COMPONENT_ID, 'time_spent_seconds', currentTime, { last_autosave: new Date().toISOString() });
    }, 5000);
    return () => clearInterval(autoSave);
  }, [userId, responseManager, startTime]);

  const handleContinue = async () => {
    setIsSubmitting(true);
    
    try {
      const finalTime = Math.floor((Date.now() - startTime) / 1000);
      
      await responseManager.saveMultipleAnswers(
        userId,
        COMPONENT_ID,
        {
          time_spent_seconds: finalTime,
          scrolled_to_bottom: hasScrolled,
          intervention_read: true,
          intervention_type: 'debunking'
        },
        {
          started_at: new Date(startTime).toISOString(),
          completed_at: new Date().toISOString(),
          device: /Mobile|Android|iPhone/i.test(navigator.userAgent) ? 'mobile' : 'desktop'
        }
      );
      

      navigate('/mission1/postsb');
      
    } catch (error) {
      console.error('Error saving intervention data:', error);
      alert('Chyba pri ukladaní. Skús to znova.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <Container>
        <Card>
          <Title>Intervencia: Debunking dezinformácií</Title>
          
          <TimeTracker>
            Čas strávený: {Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}
          </TimeTracker>
          
          <InterventionContent>
            <h3>Čo je debunking?</h3>
            <p>
              Debunking je proces vyvracovania falošných informácií pomocou faktov a dôkazov.
              Je to účinná metóda boja proti dezinformáciám.
            </p>
            
            <ExampleBox>
              <strong>Príklad debunkingu:</strong>
              <p style={{ marginTop: 8 }}>
                <strong>Mýtus:</strong> "Vakcíny obsahujú čipy na sledovanie."
              </p>
              <p>
                <strong>Fakt:</strong> Vakcíny obsahujú biologické látky (antigény, adjuvansy) 
                a nemôžu obsahovať elektronické čipy. Čip by bol viditeľný voľným okom 
                a vyžadoval by by zdroj energie.
              </p>
            </ExampleBox>
            
            <h3>Kľúčové princípy debunkingu:</h3>
            <ul>
              <li><strong>Začni faktom</strong> – Nie negáciou mýtu</li>
              <li><strong>Vysvetli prečo</strong> – Logika za pravdou</li>
              <li><strong>Použi dôkazy</strong> – Overiteľné zdroje</li>
              <li><strong>Buď jednoduchý</strong> – Komplikované vysvetlenia nefungujú</li>
            </ul>
            
            <h3>Praktické tipy:</h3>
            <p>
              Pri stretnutí s dezinformáciou sa najprv opýtaj: "Odkiaľ táto informácia pochádza?" 
              a "Kto z toho profituje?"
            </p>
            
            <p>
              Nezabúdaj, že cieľom nie je presvedčiť každého, ale poskytnúť alternatívny 
              pohľad založený na faktoch.
            </p>
          </InterventionContent>
          
          <ButtonContainer>
            <StyledButton 
              accent 
              onClick={handleContinue}
              disabled={isSubmitting || timeSpent < 20}
            >
              {timeSpent < 20 
                ? `Prečítaj článok (${20 - timeSpent}s)` 
                : isSubmitting 
                  ? 'Ukladám...' 
                  : 'Pokračovať'}
            </StyledButton>
          </ButtonContainer>
        </Card>
      </Container>
    </Layout>
  );
};

export default Intervention1;