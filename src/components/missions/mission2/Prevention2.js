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

const ArticleContent = styled.div`
  line-height: 1.8;
  color: ${p => p.theme.PRIMARY_TEXT_COLOR};
  font-size: 15px;
  margin-bottom: 24px;
  
  h3 {
    margin-top: 24px;
    margin-bottom: 12px;
    color: ${p => p.theme.ACCENT_COLOR};
    font-size: 18px;
  }
  
  p {
    margin-bottom: 16px;
  }
  
  ul {
    margin: 16px 0;
    padding-left: 24px;
  }
  
  li {
    margin-bottom: 8px;
  }
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

const COMPONENT_ID = 'mission2_prevention';

const Prevention2 = () => {
  const navigate = useNavigate();
  const { dataManager, userId } = useUserStats();
  const responseManager = getResponseManager(dataManager);
  
  const [startTime] = useState(Date.now());
  const [timeSpent, setTimeSpent] = useState(0);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Tracking času stráveného na stránke
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [startTime]);

  // Tracking scrollovania (behavioral measure)
  useEffect(() => {
    const handleScroll = () => {
      const scrollPercentage = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      if (scrollPercentage > 80) {
        setHasScrolled(true);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-save času každých 5 sekúnd
  useEffect(() => {
    const autoSave = setInterval(async () => {
      const currentTime = Math.floor((Date.now() - startTime) / 1000);
      await responseManager.saveAnswer(
        userId,
        COMPONENT_ID,
        'time_spent_seconds',
        currentTime,
        { last_autosave: new Date().toISOString() }
      );
    }, 5000);
    
    return () => clearInterval(autoSave);
  }, [userId, responseManager, startTime]);

  // Guard: prevent access if mission2 locked (unless admin)
  useEffect(() => {
    (async () => {
      const prog = await dataManager.loadUserProgress(userId);
      if (!prog.mission2_unlocked && !dataManager.isAdmin(userId)) {
        return navigate('/mainmenu');
      }
    })();
  }, [dataManager, userId, navigate]);

  const handleContinue = async () => {
    setIsSubmitting(true);
    
    try {
      const finalTime = Math.floor((Date.now() - startTime) / 1000);
      
      // Ulož behavioral data
      await responseManager.saveMultipleAnswers(
        userId,
        COMPONENT_ID,
        {
          time_spent_seconds: finalTime,
          scrolled_to_bottom: hasScrolled,
          article_read: true
        },
        {
          started_at: new Date(startTime).toISOString(),
          completed_at: new Date().toISOString(),
          device: /Mobile|Android|iPhone/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
          screen_width: window.innerWidth,
          screen_height: window.innerHeight
        }
      );
      
      
      // Navigácia podľa skupiny
      const progress = await dataManager.loadUserProgress(userId);
      const group = progress.group_assignment;
      
      if (group === '1') {
        navigate('/mission2/intervention');
      } else {
        navigate('/mission2/postsa');
      }
      
    } catch (error) {
      console.error('Error saving prevention data:', error);
      alert('Chyba pri ukladaní. Skús to znova.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <Container>
        <Card>
          <Title>Prevencia proti dezinformáciám</Title>
          
          <TimeTracker>
            Čas strávený čítaním: {Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}
          </TimeTracker>
          
          <ArticleContent>
            <h3>Ako rozpoznať dezinformácie?</h3>
            <p>
              Dezinformácie sú falošné alebo zavádzajúce informácie, ktoré sú zámerne šírené 
              s cieľom ovplyvniť verejnú mienku alebo poškodiť určité osoby či inštitúcie.
            </p>
            
            <h3>Znaky dezinformácií:</h3>
            <ul>
              <li><strong>Senzačné titulky</strong> – Používajú emócie namiesto faktov</li>
              <li><strong>Nepodložené tvrdenia</strong> – Chybajú overiteľné zdroje</li>
              <li><strong>Manipulácia s obrázkami</strong> – Upravené alebo vystrihnuté fotky</li>
              <li><strong>Anonymné zdroje</strong> – "Experti tvrdia..." bez mien</li>
              <li><strong>Konšpiračné teórie</strong> – Vysvetľujú komplexné udalosti jednoduchými teóriami</li>
            </ul>
            
            <h3>Ako sa chrániť?</h3>
            <p>
              Vždy si overte informácie z niekoľkých nezávislých zdrojov. Skontrolujte, 
              či článok publikovalo dôveryhodné médium. Pozrite sa na dátum publikácie 
              a autora článku.
            </p>
            
            <p>
              Buďte ostražití pri zdieľaní obsahu na sociálnych sieťach. Pred zdieľaním 
              si overte, či je informácia pravdivá.
            </p>
            
            <h3>Užitočné nástroje:</h3>
            <ul>
              <li>Konšpirátori.sk – Fact-checking slovenských hoaxov</li>
              <li>Demagog.sk – Overovanie výrokov politikov</li>
              <li>Google Reverse Image Search – Overenie obrázkov</li>
            </ul>
          </ArticleContent>
          
          <ButtonContainer>
            <StyledButton 
              accent 
              onClick={handleContinue}
              disabled={isSubmitting || timeSpent < 15}
            >
              {timeSpent < 15 
                ? `Prečítaj článok (${15 - timeSpent}s)` 
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

export default Prevention2;