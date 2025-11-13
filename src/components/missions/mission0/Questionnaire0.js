// src/components/missions/mission0/Questionnaire0.js
// OPRAVENÁ VERZIA s ResponseManager

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Layout from '../../../styles/Layout';
import StyledButton from '../../../styles/StyledButton';
import { useUserStats } from '../../../contexts/UserStatsContext';
import { getResponseManager } from '../../../utils/ResponseManager';

const Container = styled.div`
  padding: 20px;
  max-width: 700px;
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
  margin-bottom: 20px;
`;

const Question = styled.p`
  margin-bottom: 10px;
  color: ${p => p.theme.PRIMARY_TEXT_COLOR};
  font-size: 14px;
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid ${p => p.theme.BORDER_COLOR};
  border-radius: 4px;
  font-size: 14px;
  background: ${p => p.theme.CARD_BACKGROUND};
  color: ${p => p.theme.PRIMARY_TEXT_COLOR};
  
  &:focus {
    outline: none;
    border-color: ${p => p.theme.ACCENT_COLOR};
  }
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

// Definícia otázok
const QUESTIONS = [
  { id: 'vek', text: 'Vek:', type: 'number' },
  { id: 'povolanie', text: 'Povolanie:', type: 'text' },
  { id: 'vzdelanie', text: 'Najvyššie dosiahnuté vzdelanie:', type: 'text' },
  { id: 'zaujem_konspiracie', text: 'Máte záujem o konšpiračné teórie?', type: 'text' }
];

const COMPONENT_ID = 'mission0_questionnaire';

export default function Questionnaire0() {
  const navigate = useNavigate();
  const { dataManager, userId, addPoints } = useUserStats();
  const responseManager = getResponseManager(dataManager);
  
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState('');
  const [startTime] = useState(Date.now());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Načítaj uložené odpovede
  useEffect(() => {
    const loadSaved = async () => {
      if (!userId) return;
      const saved = await responseManager.loadResponses(userId, COMPONENT_ID);
      if (saved.answers && Object.keys(saved.answers).length > 0) {
        setAnswers(saved.answers);
      }
    };
    loadSaved();
  }, [userId, responseManager]);

  // Handler pre zmenu odpovede s auto-save
  const handleChange = async (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
    setError('');
    // Auto-save do DB
    await responseManager.saveAnswer(
      userId,
      COMPONENT_ID,
      questionId,
      value
    );
  };

  // Validácia - všetky otázky vyplnené?
  const isComplete = () => {
    return QUESTIONS.every(q => {
      const answer = answers[q.id];
      return answer !== undefined && answer !== null && answer !== '';
    });
  };

  // Submit
  const handleNext = async () => {
    if (!isComplete()) {
      setError('Prosím odpovedzte na všetky otázky.');
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
      await addPoints(10, 'questionnaire0');
      // Označ misiu 0 ako dokončenú
      const progress = await dataManager.loadUserProgress(userId);
      progress.mission0_completed = true;
      await dataManager.saveProgress(userId, progress);
      navigate('/mission0/outro');
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
          <Title>Dotazník 0 – Demografia</Title>
          {QUESTIONS.map((question) => (
            <QuestionCard key={question.id}>
              <Question>{question.text}</Question>
              <Input
                type={question.type}
                value={answers[question.id] || ''}
                onChange={(e) => handleChange(question.id, e.target.value)}
                placeholder={`Napíšte vašu odpoveď...`}
              />
            </QuestionCard>
          ))}
          {error && <ErrorText>{error}</ErrorText>}
          <ButtonContainer>
            <StyledButton 
              accent 
              onClick={handleNext}
              disabled={!isComplete() || isSubmitting}
            >
              {isSubmitting ? 'Ukladám...' : 'Pokračovať'}
            </StyledButton>
          </ButtonContainer>
          <ProgressIndicator>
            Vyplnené: {Object.keys(answers).filter(k => answers[k] && answers[k] !== '').length} / {QUESTIONS.length}
          </ProgressIndicator>
        </Card>
      </Container>
    </Layout>
  );
}
