// src/App.js

import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { AnimatePresence } from 'framer-motion';
import { Analytics } from '@vercel/analytics/react';
import { lightTheme, darkTheme } from './styles/theme';
import ScrollToTop from './styles/ScrollToTop';
import { GlobalStyles } from './styles/GlobalStyles';
import ThemeToggle from './styles/ThemeToggle';
import { UserStatsProvider } from './contexts/UserStatsContext';
import PageTransition from './components/shared/PageTransition';

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENTS
// ═══════════════════════════════════════════════════════════
import Instruction from './components/main/Instruction';
import Intro from './components/main/Intro';
import MainMenu from './components/main/MainMenu';

// ═══════════════════════════════════════════════════════════
// ADMIN COMPONENTS
// ═══════════════════════════════════════════════════════════
import AdminPanel from './components/admin/AdminPanel';

// ═══════════════════════════════════════════════════════════
// MISSION 0
// ═══════════════════════════════════════════════════════════
import IntroMission0 from './components/missions/mission0/IntroMission0';
import Questionnaire0 from './components/missions/mission0/Questionnaire0';
import OutroMission0 from './components/missions/mission0/OutroMission0';

// ═══════════════════════════════════════════════════════════
// MISSION 1 — súbory: IntroMission1, Questionnaire1, OutroMission1
// ═══════════════════════════════════════════════════════════
import IntroMission1 from './components/missions/mission1/IntroMission1';
import Questionnaire1 from './components/missions/mission1/Questionnaire1';
import OutroMission1 from './components/missions/mission1/OutroMission1';

// ═══════════════════════════════════════════════════════════
// MISSION 2 — súbory: IntroMission2, Questionnaire2Ajs,
//   PostsA1, StroopTest1, Intervention1A, Intervention1B,
//   PostsB1, Questionnaire2B, OutroMission2
//
// FLOW:
//   Kontrolná (0):        QuestA → PostsA → Stroop → PostsB → QuestB
//   Bez dôvery (1):       QuestA → PostsA → InterventionA → PostsB → QuestB
//   S budovaním dôvery (2): QuestA → PostsA → InterventionB → PostsB → QuestB
// ═══════════════════════════════════════════════════════════
import IntroMission2 from './components/missions/mission2/IntroMission2';
import Questionnaire2A from './components/missions/mission2/Questionnaire2A';
import StroopTest1 from './components/missions/mission2/StroopTest1';
import Intervention1A from './components/missions/mission2/Intervention1A';
import Intervention1B from './components/missions/mission2/Intervention1B';
import Questionnaire2B from './components/missions/mission2/Questionnaire2B';
import OutroMission2 from './components/missions/mission2/OutroMission2';

// ═══════════════════════════════════════════════════════════
// MISSION 3 — súbory: IntroMission3, Questionnaire3Ajs,
//   PostsA2, StroopTest2, Intervention2A, Intervention2B,
//   PostsB2, Questionnaire3B, OutroMission3
//
// FLOW:
//   Kontrolná (0):        QuestA → PostsA → Stroop → PostsB → QuestB
//   Bez dôvery (1):       QuestA → PostsA → InterventionA → PostsB → QuestB
//   S budovaním dôvery (2): QuestA → PostsA → InterventionB → PostsB → QuestB
// ═══════════════════════════════════════════════════════════
import IntroMission3 from './components/missions/mission3/IntroMission3';
import Questionnaire3A from './components/missions/mission3/Questionnaire3A';
import StroopTest2 from './components/missions/mission3/StroopTest2';
import Intervention2A from './components/missions/mission3/Intervention2A';
import Intervention2B from './components/missions/mission3/Intervention2B';
import Questionnaire3B from './components/missions/mission3/Questionnaire3B';
import OutroMission3 from './components/missions/mission3/OutroMission3';


class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '20px',
          textAlign: 'center',
          background: '#0a0a0a',
          color: '#ffffff'
        }}>
          <h1 style={{ fontSize: '48px', marginBottom: '16px' }}>🚨</h1>
          <h2 style={{ marginBottom: '16px' }}>Niečo sa pokazilo</h2>
          <p style={{ marginBottom: '24px', color: '#b8b8b8' }}>
            Obnovte stránku alebo kontaktujte podporu
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: '#9d4edd',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            🔄 Obnoviť stránku
          </button>
          {process.env.NODE_ENV === 'development' && (
            <pre style={{
              marginTop: '24px',
              padding: '16px',
              background: '#1a1a1a',
              borderRadius: '8px',
              fontSize: '12px',
              textAlign: 'left',
              maxWidth: '600px',
              overflow: 'auto'
            }}>
              {this.state.error?.toString()}
            </pre>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}


function AppContent() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>

        {/* MAIN FLOW */}
        <Route path="/" element={<PageTransition><Instruction /></PageTransition>} />
        <Route path="/instruction" element={<PageTransition><Instruction /></PageTransition>} />
        <Route path="/intro" element={<PageTransition><Intro /></PageTransition>} />
        <Route path="/mainmenu" element={<PageTransition><MainMenu /></PageTransition>} />

        {/* ADMIN */}
        <Route path="/admin" element={<PageTransition><AdminPanel /></PageTransition>} />

        {/* MISSION 0 */}
        <Route path="/mission0/intro" element={<PageTransition><IntroMission0 /></PageTransition>} />
        <Route path="/mission0/questionnaire" element={<PageTransition><Questionnaire0 /></PageTransition>} />
        <Route path="/mission0/outro" element={<PageTransition><OutroMission0 /></PageTransition>} />

        {/* MISSION 1 */}
        <Route path="/mission1/intro" element={<PageTransition><IntroMission1 /></PageTransition>} />
        <Route path="/mission1/questionnaire" element={<PageTransition><Questionnaire1 /></PageTransition>} />
        <Route path="/mission1/outro" element={<PageTransition><OutroMission1 /></PageTransition>} />

        {/* ═══════════════════════════════════════════════════════════
            MISSION 2
            Kontrolná (0):        QuestA → PostsA → Stroop → PostsB → QuestB
            Bez dôvery (1):       QuestA → PostsA → InterventionA → PostsB → QuestB
            S budovaním dôvery (2): QuestA → PostsA → InterventionB → PostsB → QuestB
            ═══════════════════════════════════════════════════════════ */}
        <Route path="/mission2/intro" element={<PageTransition><IntroMission2 /></PageTransition>} />
        <Route path="/mission2/questionnaire2a" element={<PageTransition><Questionnaire2A /></PageTransition>} />
        <Route path="/mission2/stroop-test" element={<PageTransition><StroopTest1 /></PageTransition>} />
        <Route path="/mission2/intervention-a" element={<PageTransition><Intervention1A /></PageTransition>} />
        <Route path="/mission2/intervention-b" element={<PageTransition><Intervention1B /></PageTransition>} />
        <Route path="/mission2/questionnaire2b" element={<PageTransition><Questionnaire2B /></PageTransition>} />
        <Route path="/mission2/outro" element={<PageTransition><OutroMission2 /></PageTransition>} />

        {/* ═══════════════════════════════════════════════════════════
            MISSION 3
            Kontrolná (0):        QuestA → PostsA → Stroop → PostsB → QuestB
            Bez dôvery (1):       QuestA → PostsA → InterventionA → PostsB → QuestB
            S budovaním dôvery (2): QuestA → PostsA → InterventionB → PostsB → QuestB
            ═══════════════════════════════════════════════════════════ */}
        <Route path="/mission3/intro" element={<PageTransition><IntroMission3 /></PageTransition>} />
        <Route path="/mission3/questionnaire3a" element={<PageTransition><Questionnaire3A /></PageTransition>} />
        <Route path="/mission3/stroop-test" element={<PageTransition><StroopTest2 /></PageTransition>} />
        <Route path="/mission3/intervention-a" element={<PageTransition><Intervention2A /></PageTransition>} />
        <Route path="/mission3/intervention-b" element={<PageTransition><Intervention2B /></PageTransition>} />
        <Route path="/mission3/questionnaire3b" element={<PageTransition><Questionnaire3B /></PageTransition>} />
        <Route path="/mission3/outro" element={<PageTransition><OutroMission3 /></PageTransition>} />

        {/* 404 */}
        <Route path="*" element={
          <PageTransition>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '100vh',
              padding: '20px',
              textAlign: 'center'
            }}>
              <h1 style={{ fontSize: '72px', marginBottom: '16px' }}>404</h1>
              <p style={{ marginBottom: '24px' }}>Stránka nebola nájdená</p>
              <button
                onClick={() => window.location.href = '/'}
                style={{
                  background: '#9d4edd',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  fontSize: '16px',
                  cursor: 'pointer'
                }}
              >
                ← Späť na hlavnú stránku
              </button>
            </div>
          </PageTransition>
        } />
      </Routes>
    </AnimatePresence>
  );
}


function App() {
  const [themeName, setThemeName] = React.useState(() => {
    try {
      return localStorage.getItem('app_theme') || 'dark';
    } catch (e) {
      console.warn('Could not access localStorage:', e);
      return 'dark';
    }
  });

  const theme = themeName === 'light' ? lightTheme : darkTheme;

  const toggleTheme = () => {
    const next = themeName === 'dark' ? 'light' : 'dark';
    setThemeName(next);
    try {
      localStorage.setItem('app_theme', next);
    } catch (e) {
      console.warn('Could not save theme:', e);
    }
  };

  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <UserStatsProvider>
          <BrowserRouter>
            <GlobalStyles />
            <ScrollToTop />
            <div style={{
              position: 'fixed',
              top: '16px',
              right: '16px',
              zIndex: 999
            }}>
              <ThemeToggle themeName={themeName} onToggle={toggleTheme} />
            </div>
            <AppContent />
            <Analytics />
          </BrowserRouter>
        </UserStatsProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
