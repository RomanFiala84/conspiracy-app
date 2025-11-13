// src/components/missions/mission1/Questionnaire1B.js
// KOMPLETNÁ UPRAVENÁ VERZIA s ResponseManager a time tracking

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Layout from '../../../styles/Layout';
import StyledButton from '../../../styles/StyledButton';
import { useUserStats } from '../../../contexts/UserStatsContext';
import { getResponseManager } from '../../../utils/ResponseManager';

const Container = styled.div`
  padding: 20px;
  max-width: 600px;
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

const QuestionCard = styled.div`
  background: ${p => p.theme.CARD_BACKGROUND};
  border: 1px solid ${p => p.theme.BORDER_COLOR};
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
`;

const Question = styled.p`
  margin-bottom: 12px;
  color: ${p => p.theme.PRIMARY_TEXT_COLOR};
  font-size: 14px;
  font-weight: 500;
`;

const ScaleContainer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
`;

const RadioLabel = styled.label`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  border: 1px solid ${p => p.theme.BORDER_COLOR};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${p => p.checked ? p.theme.ACCENT_COLOR : 'transparent'};
  color: ${p => p.checked ? '#FFFFFF' : p.theme.PRIMARY_TEXT_COLOR};
  font-size: 14px;
  font-weight: 600;
  
  &:hover {
    background: ${p => p.checked ? p.theme.ACCENT_COLOR : p.theme.HOVER_OVERLAY};
  }
  
  input {
    display: none;
  }
`;

const ScaleLabels = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 12px;
  color: ${p => p.theme.SECONDARY_TEXT_COLOR};
`;

const ErrorText = styled.div`
  color: ${p => p.theme.ACCENT_COLOR_2};
  margin-bottom: 16px;
  text-align: center;
  font-size: 14px;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 24px;
`;

const ProgressIndicator = styled.div`
  text-align: center;
  font-size: 12px;
  color: ${p => p.theme.SECONDARY_TEXT_COLOR};
  margin-top: 16px;
`;

// Definícia otázok post-test
const QUESTIONS = [
  {
    id: 'q1_posttrust_media',
    text: 'Po absolvovaní misie dôverujem médiám viac.',
    scale: [1, 2, 3, 4, 5]
  },
  {
    id: 'q2_postskeptical',
    text: 'Som viac skeptický voči neovereným informáciám.',
    scale: [1, 2, 3, 4, 5]
  },
  {
    id: 'q3_postverify',
    text: 'Overujem si fakty pred zdieľaním častejšie.',
    scale: [1, 2, 3, 4, 5]
  }
];

const COMPONENT_ID = 'mission3_questionnaire3b';

const Questionnaire3B = () => {
  const navigate = useNavigate();
  const { dataManager, userId } = useUserStats();
  const responseManager = getResponseManager(dataManager);
  
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState('');
  const [startTime] = useState(Date.now());
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadSaved = async () => {
      if (!userId) return;
      const progress = await dataManager.loadUserProgress(userId);
      if (!progress.mission3_unlocked && !dataManager.isAdmin(userId)) {
        return navigate('/mainmenu');
      }
      const saved = await responseManager.loadResponses(userId, COMPONENT_ID);
      if (saved.answers && Object.keys(saved.answers).length > 0) {
        setAnswers(saved.answers);
      }
    };
    loadSaved();
  }, [userId, responseManager, dataManager, navigate]);

  const handleChange = async (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    setError('');
    await responseManager.saveAnswer(userId, COMPONENT_ID, questionId, value);
  };

  const isComplete = () => QUESTIONS.every(q => answers[q.id] !== undefined && answers[q.id] !== null);

  const handleContinue = async () => {
    if (!isComplete()) {
      setError('Prosím označte odpoveď na všetky výroky.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      
      await responseManager.saveMultipleAnswers(
        userId,
        COMPONENT_ID,
        answers,
        {
          time_spent_seconds: timeSpent,
          device: /Mobile|Android|iPhone/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
          completed_at: new Date().toISOString()
        }
      );
      

  // Mark mission 3 completed
  const progress = await dataManager.loadUserProgress(userId);
  progress.mission3_completed = true;
  await dataManager.saveProgress(userId, progress);

  navigate('/mission3/outro');
      
    } catch (error) {
      console.error('Error submitting questionnaire:', error);
      setError('Chyba pri ukladaní odpovedí. Skús to znova.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <Container>
        <Card>
          <Title>Dotazník 3B – Miera dôvery (po misii)</Title>
          
          {QUESTIONS.map((question) => (
            <QuestionCard key={question.id}>
              <Question>{question.text}</Question>
              <ScaleContainer>
                {question.scale.map(v => (
                  <RadioLabel key={v} checked={answers[question.id] === v}>
                    <input
                      type="radio"
                      name={question.id}
                      checked={answers[question.id] === v}
                      onChange={() => handleChange(question.id, v)}
                    />
                    {v}
                  </RadioLabel>
                ))}
              </ScaleContainer>
              <ScaleLabels>
                <span>Nesúhlasím</span>
                <span>Súhlasím</span>
              </ScaleLabels>
            </QuestionCard>
          ))}
          
          {error && <ErrorText>{error}</ErrorText>}
          
          <ButtonContainer>
            <StyledButton 
              accent 
              onClick={handleContinue}
              disabled={!isComplete() || isSubmitting}
            >
              {isSubmitting ? 'Ukladám...' : 'Dokončiť misiu'}
            </StyledButton>
          </ButtonContainer>
          
          <ProgressIndicator>
            Vyplnené: {Object.keys(answers).length} / {QUESTIONS.length}
          </ProgressIndicator>
        </Card>
      </Container>
    </Layout>
  );
};

export default Questionnaire3B;