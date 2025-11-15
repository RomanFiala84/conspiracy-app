// src/components/missions/mission1/Questionnaire1A.js
// UPRAVENÁ VERZIA s ResponseManager, time tracking a DetectiveTipSmall


import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Layout from '../../../styles/Layout';
import StyledButton from '../../../styles/StyledButton';
import DetectiveTipSmall from '../../shared/DetectiveTipSmall';
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


// Definícia otázok - ľahko sa pridávajú/odoberajú
const QUESTIONS = [
  {
    id: 'q1_trust_media',
    text: 'Dôverujem médiám, ktoré pravidelne používam.',
    scale: [1, 2, 3, 4, 5]
  },
  {
    id: 'q2_skeptical',
    text: 'Som skeptický voči neovereným informáciám.',
    scale: [1, 2, 3, 4, 5]
  },
  {
    id: 'q3_verify_facts',
    text: 'Overujem si fakty pred zdieľaním.',
    scale: [1, 2, 3, 4, 5]
  }
];


const COMPONENT_ID = 'mission1_questionnaire1a';


const Questionnaire1A = () => {
  const navigate = useNavigate();
  const { dataManager, userId } = useUserStats();
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
    return QUESTIONS.every(q => answers[q.id] !== undefined && answers[q.id] !== null);
  };


  // Submit
  const handleContinue = async () => {
    if (!isComplete()) {
      setError('Prosím označte odpoveď na všetky výroky.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Vypočítaj čas strávený
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      
      // Ulož všetky odpovede s metadata
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
      
      // Navigácia podľa skupiny
      const progress = await dataManager.loadUserProgress(userId);
      const group = progress.group_assignment;
      
      if (group === '2') {
        navigate('/mission1/prevention');
      } else {
        navigate('/mission1/postsa');
      }
      
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
          <Title>Dotazník 1A – Miera dôvery</Title>
          
          {/* ✅ NOVÉ: Detective Tip */}
          <DetectiveTipSmall
            title="💡 Tip"
            icon="🕵️"
            tip="<strong>Označte</strong> číslo na škále pre každý výrok podľa toho, do akej miery s ním <strong>súhlasíte</strong> alebo <strong>nesúhlasíte</strong>."
          />
          
          {QUESTIONS.map((question, i) => (
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
              {isSubmitting ? 'Ukladám...' : 'Pokračovať'}
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


export default Questionnaire1A;