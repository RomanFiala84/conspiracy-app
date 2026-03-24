// src/components/missions/mission3/StroopTest2.js

import React, { useState, useCallback, useRef } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useUserStats } from '../../../contexts/UserStatsContext';
import DetectiveTipSmall from '../../shared/DetectiveTipSmall';
import PageTransition from '../../shared/PageTransition';

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, ${p => p.theme.ACCENT_COLOR}45, ${p => p.theme.ACCENT_COLOR_2}45);
  padding: 20px;
`;

const Wrapper = styled.div`
  background: ${p => p.theme.CARD_BACKGROUND};
  border: 2px solid ${p => p.theme.ACCENT_COLOR};
  border-radius: 16px;
  padding: 40px;
  max-width: 600px;
  width: 100%;
  box-shadow: 0 8px 32px rgba(0,0,0,0.2);
  @media (max-width: 768px) { padding: 30px 20px; }
  @media (max-width: 480px) { padding: 20px 16px; }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 40px;
  @media (max-width: 480px) { margin-bottom: 30px; }
`;

const Title = styled.h1`
  font-size: 15px;
  font-weight: 700;
  color: ${p => p.theme.ACCENT_COLOR};
  margin: 0 0 12px 0;
`;

const Subtitle = styled.p`
  font-size: 15px;
  color: ${p => p.theme.ACCENT_COLOR};
  margin: 0 0 8px 0;
  line-height: 1.6;
`;

const Instructions = styled.p`
  font-size: 15px;
  color: ${p => p.theme.SECONDARY_TEXT_COLOR};
  margin: 0;
`;

const ProgressContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 40px;
  @media (max-width: 480px) { margin-bottom: 30px; }
`;

const ProgressBar = styled.div`
  flex: 1;
  height: 8px;
  background: ${p => p.theme.BORDER_COLOR};
  border-radius: 4px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  width: ${p => (p.current / p.total) * 100}%;
  background: linear-gradient(to right, ${p => p.theme.ACCENT_COLOR}, ${p => p.theme.ACCENT_COLOR_2});
  transition: width 0.3s ease;
`;

const ProgressText = styled.span`
  font-size: 15px;
  font-weight: 600;
  color: ${p => p.theme.ACCENT_COLOR};
  min-width: 50px;
  text-align: right;
`;

const GameArea = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
  margin-bottom: 40px;
  @media (max-width: 480px) { gap: 24px; margin-bottom: 30px; }
`;

const Question = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: ${p => p.theme.SECONDARY_TEXT_COLOR};
  text-align: center;
`;

const SymbolRow = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  width: 100%;
  justify-items: center;
  @media (max-width: 480px) { gap: 10px; }
`;

const SymbolButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 110px;
  height: 110px;
  border: 4px solid ${p => p.isSelected
    ? p.isCorrect ? '#22c55e' : '#ef4444'
    : p.theme.BORDER_COLOR};
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0;
  background: ${p => p.theme.SECONDARY_BACKGROUND};
  font-size: 50px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  &:hover:not(:disabled) { transform: scale(1.08); box-shadow: 0 6px 16px rgba(0,0,0,0.3); }
  &:active:not(:disabled) { transform: scale(0.95); }
  &:disabled { cursor: not-allowed; }
  @media (max-width: 768px) { width: 90px; height: 90px; font-size: 40px; }
  @media (max-width: 480px) { width: 68px; height: 68px; font-size: 30px; border-width: 3px; }
`;

const CompletionMessage = styled.div`
  text-align: center;
  padding: 40px 20px;
  @media (max-width: 480px) { padding: 30px 16px; }
`;

const CompletionTitle = styled.h2`
  font-size: 25px;
  font-weight: 700;
  color: ${p => p.theme.ACCENT_COLOR};
  margin: 0 0 16px 0;
  @media (max-width: 480px) { font-size: 20px; }
`;

const CompletionText = styled.p`
  font-size: 15px;
  color: ${p => p.theme.SECONDARY_TEXT_COLOR};
  margin: 0 0 24px 0;
  line-height: 1.6;
`;

const ContinueButton = styled.button`
  padding: 12px 32px;
  font-size: 15px;
  font-weight: 600;
  background: linear-gradient(135deg, ${p => p.theme.ACCENT_COLOR}, ${p => p.theme.ACCENT_COLOR_2});
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover { transform: translateY(-2px); box-shadow: 0 4px 12px ${p => p.theme.ACCENT_COLOR}60; }
  &:active { transform: translateY(0); }
  @media (max-width: 480px) { padding: 10px 24px; }
`;

// ── Helpers ───────────────────────────────────────────────────────────────────

const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// ── Symboly ───────────────────────────────────────────────────────────────────

const SYMBOLS = {
  BRAIN:     { emoji: '🧠', label: 'Mozog'   },
  BULB:      { emoji: '💡', label: 'Nápad'   },
  SCIENTIST: { emoji: '🔬', label: 'Veda'    },
  ALIEN: {
    emojis: ['🔮','🧿','🌀','🍕','🎱','🪬','☠️','👹',
             '🛸','🧨','💀','🕷️','🎭','👻','🎂','👑',
             '🧙','🃏','🎪','🌽'],
    label: 'Votrelec'
  }
};

const TEMATIC_KEYS = ['BRAIN', 'BULB', 'SCIENTIST'];
const TOTAL_TRIALS = 40;

const generateTrials = () => {
  const trials = [];
  const alienEmojis = [...SYMBOLS.ALIEN.emojis];

  for (let i = 0; i < TOTAL_TRIALS; i++) {
    const alienEmoji = alienEmojis[Math.floor(Math.random() * alienEmojis.length)];
    const tematicEmojis = shuffleArray(TEMATIC_KEYS).map(k => ({
      key: k,
      emoji: SYMBOLS[k].emoji
    }));
    const alienIndex = Math.floor(Math.random() * 4);
    const options = [...tematicEmojis];
    options.splice(alienIndex, 0, { key: 'ALIEN', emoji: alienEmoji });

    trials.push({
      id: i,
      options,
      correctAnswer: alienIndex,
      response: null,
      isCorrect: null,
      timestamp: null
    });
  }

  return shuffleArray(trials);
};

// ── Komponenta ────────────────────────────────────────────────────────────────

const StroopTest2 = () => {
  const navigate = useNavigate();
  const { dataManager, userId } = useUserStats();
  const [showDetectiveTip, setShowDetectiveTip] = useState(true);
  const testStartTime = useRef(null);

  const [completedTrials, setCompletedTrials] = useState(() => generateTrials());
  const [currentTrialIndex, setCurrentTrialIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);

  const currentTrial = completedTrials[currentTrialIndex];

  // ── Tip texty ─────────────────────────────────────────────────────────────

  const detectiveTipStart = `
    <ul style="text-align: left; padding-left: 8px; list-style: none;">
      <li><strong>Aká je vaša úloha?</strong></li>
      <li>👁️ Uvidíte <strong>4 symboly</strong>.</li>
      <li>🎯 Tri symboly patria do rovnakej skupiny, ale jeden je <strong>votrelec</strong>.</li>
      <li>🔍 Kliknite na symbol, ktorý <strong>nepatrí</strong> medzi ostatné.</li>
      <li>✅ Odpovedajte pokojne, ak sa pomýlite, vôbec to nevadí.</li>
    </ul>
  `;

  const detectiveTipEnd = `
    <p><strong>Výborne!</strong> Šifru prípadu: Falošná stopa ste úspešne zvládli!</p>
    <p>Vaša schopnosť rozoznať <strong>pravé symboly od votrelcov</strong> bola kľúčová pre tento prípad.</p>
    <p><strong>Teraz môžete pokračovať do ďalšej fázy misie!</strong></p>
  `;

  // ── Uloženie výsledkov ────────────────────────────────────────────────────

  const saveResults = useCallback(async (finalTrials) => {
    const totalTimeMs = testStartTime.current ? Date.now() - testStartTime.current : null;
    const correctCount = finalTrials.filter(t => t.isCorrect).length;

    const results = {
      mission: 3,
      testType: 'oddball_symbol',
      totalTrials: TOTAL_TRIALS,
      correctAnswers: correctCount,
      accuracy: (correctCount / TOTAL_TRIALS) * 100,
      totalTimeMs,
      trials: finalTrials,
      completedAt: new Date().toISOString()
    };

    try {
      const participantCode = userId || sessionStorage.getItem('participantCode');
      const progress = await dataManager.loadUserProgress(participantCode);
      await dataManager.saveProgress(participantCode, {
        ...progress,
        stroop_test_mission3_results: results,
        stroop_test_mission3_completed: true
      });
      console.log('✅ Oddball Symbol M3 results saved');
    } catch (error) {
      console.error('❌ Error saving results:', error);
    }
  }, [userId, dataManager]);

  // ── Handler ───────────────────────────────────────────────────────────────

  const handleAnswer = useCallback((clickedIndex) => {
    if (selectedIndex !== null) return;
    if (!testStartTime.current) testStartTime.current = Date.now();

    const isCorrect = clickedIndex === currentTrial.correctAnswer;
    const updated = [...completedTrials];
    updated[currentTrialIndex] = {
      ...currentTrial,
      response: clickedIndex,
      isCorrect,
      timestamp: new Date().toISOString()
    };
    setCompletedTrials(updated);
    setSelectedIndex(clickedIndex);

    if (currentTrialIndex < TOTAL_TRIALS - 1) {
      setTimeout(() => {
        setCurrentTrialIndex(prev => prev + 1);
        setSelectedIndex(null);
      }, 600);
    } else {
      setIsCompleted(true);
      saveResults(updated);
    }
  }, [currentTrial, currentTrialIndex, completedTrials, selectedIndex, saveResults]);

  const handleContinue = () => navigate('/mission3/questionnaire3b');

  // ── Completion ────────────────────────────────────────────────────────────

  if (isCompleted) {
    return (
      <PageTransition>
        <Container>
          <Wrapper>
            {showDetectiveTip && (
                          <DetectiveTipSmall
                            tip={detectiveTipEnd}
                            detectiveName="Inšpektor Kritan"
                            imageUrl="/images/detective-icon.png"
                            buttonText="Rozumiem!"
                            minReadTime={5000}
                            showBadge={false}
                            onClose={() => setShowDetectiveTip(false)}
                            style={{ textAlign: "justify" }}
                          />
                        )}
            <CompletionMessage>
              <CompletionTitle><strong>Šifra vylúštená!</strong></CompletionTitle>
              <CompletionText><strong>Výborná práca, detektív/ka!</strong></CompletionText>
              <CompletionText><strong>Pokračujme v misii ďalej.</strong></CompletionText>
              <ContinueButton onClick={handleContinue}>
                Pokračovať →
              </ContinueButton>
            </CompletionMessage>

          </Wrapper>
        </Container>
      </PageTransition>
    );
  }

  // ── Hlavná hra ────────────────────────────────────────────────────────────

  return (
    <PageTransition>
      <Container>
        <Wrapper>

          {/* DetectiveTipSmall NAD úlohou */}
          {showDetectiveTip && (
            <DetectiveTipSmall
              tip={detectiveTipStart}
              detectiveName="Inšpektor Kritan"
              imageUrl="/images/detective-icon.png"
              buttonText="Rozumiem!"
              autoOpen={true}
              autoOpenDelay={300}
              minReadTime={10000}
              showBadge={true}
              onClose={() => setShowDetectiveTip(false)}
              style={{ textAlign: "justify" }}
            />
          )}

          <Header>
            <Title><strong>Detektívna úloha</strong></Title>
            <Subtitle><strong>Prípad: Falošná stopa</strong></Subtitle>
            <Instructions><strong>Nájdite symbol, ktorý nepatrí medzi ostatné!</strong></Instructions>
            <Instructions><strong>Téma príbuzných symbolov je: VEDA.</strong></Instructions>
          </Header>

          <GameArea>
            <Question>Ktorý symbol je votrelec?</Question>
            {currentTrial && (
              <SymbolRow>
                {currentTrial.options.map((opt, idx) => (
                  <SymbolButton
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    isSelected={selectedIndex === idx}
                    isCorrect={idx === currentTrial.correctAnswer}
                    disabled={selectedIndex !== null}
                  >
                    {opt.emoji}
                  </SymbolButton>
                ))}
              </SymbolRow>
            )}
          </GameArea>
           <ProgressContainer>
            <ProgressBar>
              <ProgressFill current={currentTrialIndex + 1} total={TOTAL_TRIALS} />
            </ProgressBar>
            <ProgressText>{currentTrialIndex + 1}/{TOTAL_TRIALS}</ProgressText>
          </ProgressContainer>
        </Wrapper>
      </Container>
    </PageTransition>
  );
};

export default StroopTest2;
