// src/components/main/MainMenu.js
// VERZIA s DetectiveTipLarge namiesto export tlačidla + GRADIENT ODRÁŽKY

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Layout from '../../styles/Layout';
import StyledButton from '../../styles/StyledButton';
import { useUserStats } from '../../contexts/UserStatsContext';
import DetectiveTipLarge from '../shared/DetectiveTipLarge';
import { useContext } from 'react';
import { ThemeContext } from 'styled-components';

// =====================
// STYLED COMPONENTS - OPTIMALIZOVANÁ VERZIA
// =====================
const GradientCircleList = styled.ul`
  list-style: none;
  padding-left: 20px;
  padding-right: 20px;
  margin: 0;
  text-align: left;
  > li {
    padding-left: 0;
    position: relative;
    margin-bottom: 10px;
    line-height: 1.6;
    color: ${props => props.theme.PRIMARY_TEXT_COLOR};
    
    &::before {
      content: '•';
      position: absolute;
      left: -15px;
      top: 0;
      color: ${props => props.theme.ACCENT_COLOR};
      line-height: 1.6;
      font-weight: bold;
    }
    
    strong {
      color: ${props => props.theme.PRIMARY_TEXT_COLOR};
      font-weight: 600;
    }
    
    a {
      color: ${props => props.theme.PRIMARY_TEXT_COLOR};
      text-decoration: none;
      
      &:hover {
        text-decoration: underline;
      }
    }
  }
`;

const NestedListItem = styled.div`
  padding-left: 40px;
  padding-right: 20px;
  color: ${props => props.theme.PRIMARY_TEXT_COLOR};
  position: relative;
  margin-bottom: 10px;
  line-height: 1.6;
  text-align: left;
  &::before {
    content: '→';
    position: absolute;
    left: 20px;
    top: 0;
    color: ${props => props.theme.ACCENT_COLOR};
    line-height: 1.6;
  }
  
  strong {
    color: ${props => props.theme.PRIMARY_TEXT_COLOR};
    font-weight: 600;
  }
  
  a {
    color: ${props => props.theme.PRIMARY_TEXT_COLOR};
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;


const Container = styled.div`
  padding: 16px;
  max-width: 800px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    padding: 12px;
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
  color: ${p => p.theme.ACCENT_COLOR};
  font-size: 25px;
  font-weight: 700;
  margin-bottom: 6px;
  
  @media (max-width: 768px) {
    font-size: 25px;
  }
  
  @media (max-width: 480px) {
    font-size: 25px;
  }
`;

const InstructionCard = styled.div`
    background: ${p => p.theme.CARD_BACKGROUND};
  border: 2px solid ${p => p.theme.BORDER_COLOR};
  border-radius: 12px;
  padding: 20px;
  margin: 16px 0;
  max-width: 800px;
  width: 100%;
  transition: all 0.2s ease;
  font-size: 15px;
  color: ${p => p.theme.ACCENT_COLOR};
  &:hover {
    border-color: ${p => p.theme.ACCENT_COLOR}60;
  }
  
  @media (max-width: 768px) {
    padding: 14px;
  }
`;

const SubNote = styled.div`
  background: ${p => p.theme.ACCENT_COLOR}45;
  border-radius: 6px;
  padding: 10px;
  margin-top: 6px;
  font-size: 15px;
  color: ${p => p.theme.PRIMARY_TEXT_COLOR};
  line-height: 1.4;
  
  &:hover {
    border-color: ${p => p.theme.ACCENT_COLOR}60;
  }
 
  @media (max-width: 480px) {
    font-size: 15px;
  }
`;

const InstructionsWrapper = styled.div`
  width: 100%;
  max-width: 800px;
  margin-bottom: 20px;
`;





const MissionsList = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 24px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const MissionCard = styled.div`
  background: ${p => p.theme.ACCENT_COLOR}45;
  border: 2px solid ${p => p.locked ? p.theme.BORDER_COLOR : p.theme.ACCENT_COLOR}60;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 12px;
  position: relative;
  cursor: ${p => p.locked ? 'not-allowed' : 'pointer'};
  opacity: ${p => p.locked ? 0.6 : 1};
  transition: all 0.2s ease;
  box-shadow: 0 2px 6px rgba(0,0,0,0.08);
  overflow: hidden;
  min-height: 180px;
  
  ${p => p.completed && `
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(
        135deg,
        ${p.theme.ACCENT_COLOR}08 0%,
        transparent 70%
      );
      pointer-events: none;
    }
  `}

  &:hover {
    transform: ${p => p.locked ? 'none' : 'translateY(-2px)'};
    border-color: ${p => p.locked ? p.theme.BORDER_COLOR : p.theme.ACCENT_COLOR};
    box-shadow: ${p => p.locked ? '0 2px 6px rgba(0,0,0,0.08)' : `0 4px 12px ${p.theme.ACCENT_COLOR}60`};
  }
  
  @media (max-width: 480px) {
    padding: 14px;
    min-height: 160px;
  }
`;

const MissionIcon = styled.div`
  width: 64px;
  height: 64px;
  min-width: 64px;
  background: linear-gradient(135deg, 
    ${p => p.theme.ACCENT_COLOR}, 
    ${p => p.theme.ACCENT_COLOR_2}
  );
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  box-shadow: 0 2px 8px ${p => p.theme.ACCENT_COLOR_2}45;
  
  @media (max-width: 480px) {
    width: 56px;
    height: 56px;
    min-width: 56px;
    font-size: 15px;
  }
`;

const MissionContent = styled.div`
  flex: 1;
  position: relative;
  z-index: 1;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const MissionNumber = styled.div`
  font-size: 15px;
  color: ${p => p.theme.PRIMARY_TEXT_COLOR};
  margin-bottom: 3px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const MissionTitle = styled.h3`
  font-size: 15px;
  color: ${p => p.theme.PRIMARY_TEXT_COLOR};
  margin-bottom: 4px;
  font-weight: 600;
  line-height: 1.3;
  
  @media (max-width: 480px) {
    font-size: 15px;
  }
`;

const MissionStatus = styled.div`
  font-size: 10px;
  color: ${p => p.completed ? p.theme.SUCCESS_COLOR : p.theme.ERROR_COLOR};
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
`;

const AdminButtons = styled.div`
  display: flex;
  gap: 6px;
  position: relative;
  z-index: 1;
  width: 100%;
  justify-content: center;
  margin-top: 8px;
`;

const AdminButton = styled.button`
  background: ${p => p.$unlock ? '#590000ff' : p.theme.ACCENT_COLOR};
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 600;
  
  &:hover:not(:disabled) {
    opacity: 0.85;
    transform: scale(1.05);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 24px;
  background: ${p => `${p.theme.ACCENT_COLOR}15`}; // ⬅️ Jemnejšie pozadie (15% miesto 45%)
  border: 2px solid ${p => p.theme.BORDER_COLOR};
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: all 0.2s ease;
  
  /* ✅ Hover efekt */
  &:hover {
    border-color: ${p => p.theme.ACCENT_COLOR};
    box-shadow: 0 4px 12px ${p => `${p.theme.ACCENT_COLOR}25`};
  }
  
  @media (max-width: 480px) {
    flex-direction: column;
    
    button {
      width: 100%;
    }
  }
`;

// ✅ INFO BUTTON - Zelená (SUCCESS)
const InfoButton = styled(StyledButton)`
  background: ${p => `${p.theme.SUCCESS_COLOR}15`}; // ⬅️ Jemné pozadie
  border: 2px solid ${p => p.theme.SUCCESS_COLOR};
  color: ${p => p.theme.SUCCESS_COLOR};
  font-weight: 600;
  
  &:hover {
    background: ${p => p.theme.SUCCESS_COLOR};
    color: ${p => p.theme.BACKGROUND_COLOR}; // ⬅️ Kontrast s pozadím
    transform: translateY(-2px);
    box-shadow: 0 4px 12px ${p => `${p.theme.SUCCESS_COLOR}40`};
  }
  
  &:active {
    transform: translateY(0);
  }
`;

// ✅ CONTEST BUTTON - Oranžová (WARNING)
const ContestButton = styled(StyledButton)`
  background: ${p => `${p.theme.WARNING_COLOR}15`}; // ⬅️ Jemné pozadie
  border: 2px solid ${p => p.theme.WARNING_COLOR};
  color: ${p => p.theme.WARNING_COLOR};
  font-weight: 600;
  
  &:hover {
    background: ${p => p.theme.WARNING_COLOR};
    color: ${p => p.theme.BACKGROUND_COLOR}; // ⬅️ Kontrast s pozadím
    transform: translateY(-2px);
    box-shadow: 0 4px 12px ${p => `${p.theme.WARNING_COLOR}40`};
  }
  
  &:active {
    transform: translateY(0);
  }
`;

// ✅ LOGOUT BUTTON - Červená (ERROR)
const LogoutButton = styled(StyledButton)`
  background: ${p => `${p.theme.ERROR_COLOR}15`}; // ⬅️ Jemné pozadie
  border: 2px solid ${p => p.theme.ERROR_COLOR};
  color: ${p => p.theme.ERROR_COLOR};
  font-weight: 600;
  
  &:hover {
    background: ${p => p.theme.ERROR_COLOR};
    color: #ffffff; // ⬅️ Biela pre červenú
    transform: translateY(-2px);
    box-shadow: 0 4px 12px ${p => `${p.theme.ERROR_COLOR}40`};
  }
  
  &:active {
    transform: translateY(0);
  }
`;


const SharingSection = styled.div`
  background:${p => p.theme.CARD_BACKGROUND};
  border: 2px solid ${p => p.theme.BORDER_COLOR};
  border-radius: 16px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 3px 10px rgba(0,0,0,0.1);
  margin-top: 16px;
  position: relative;
  overflow: hidden;
  &:hover {
    border-color: ${p => p.theme.ACCENT_COLOR}60;
  }
  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const SharingTitle = styled.h3`
  color: ${p => p.theme.ACCENT_COLOR};
  margin-bottom: 12px;
  font-size: 15px;
  font-weight: 700;
  position: relative;
  z-index: 1;
  
  &::before {
    content: '🎁';
    margin-right: 8px;
  }

  &::after {
    content: '🎁';
    margin-left: 8px;
  }
  
  @media (max-width: 480px) {
    font-size: 15px;
  }
`;

const SharingCodeDisplay = styled.div`
  background: ${p => p.theme.CARD_BACKGROUND};
  border: 2px dashed ${p => p.theme.ACCENT_COLOR};
  border-radius: 12px;
  padding: 16px;
  margin: 12px 0;
  position: relative;
  z-index: 1;
  transition: all 0.2s ease;
  
  &:hover {
    border-style: solid;
    box-shadow: 0 2px 8px ${p => p.theme.ACCENT_COLOR}45;
  }
`;

const SharingCodeLabel = styled.div`
  font-size: 15px;
  color: ${p => p.theme.ACCENT_COLOR};
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
`;

const SharingCode = styled.code`
  font-size: 25px;
  font-weight: bold;
  letter-spacing: 4px;
  color: ${p => p.theme.ACCENT_COLOR};
  font-family: 'Courier New', monospace;
  text-shadow: 0 2px 4px ${p => p.theme.SECONDARY_TEXT_COLOR}60;
  
  @media (max-width: 768px) {
    font-size: 25px;
    letter-spacing: 3px;
  }
  
  @media (max-width: 480px) {
    font-size: 25px;
    letter-spacing: 2px;
  }
`;

const LinkDisplay = styled.div`
  background: ${p => p.theme.INPUT_BACKGROUND};
  border: 2px solid ${p => p.theme.BORDER_COLOR};
  border-radius: 12px;
  padding: 12px;
  margin: 12px 0;
  word-break: break-all;
  text-align: center;
  position: relative;
  z-index: 1;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${p => p.theme.ACCENT_COLOR}60;
  }
`;

const LinkLabel = styled.div`
  font-size: 15px;
  color: ${p => p.theme.ACCENT_COLOR};
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
`;

const LinkText = styled.code`
  font-size: 15px;
  color: ${p => p.theme.SECONDARY_TEXT_COLOR};
  font-family: 'Courier New', monospace;
  line-height: 1.5;
  
  @media (max-width: 480px) {
    font-size: 15px;
  }
`;

const ShareButtonsGroup = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 10px;
  position: relative;
  z-index: 1;
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const SharingInfo = styled.p`
  color: ${p => p.theme.PRIMARY_TEXT_COLOR};
  font-size: 15px;
  margin: 12px 0;
  line-height: 1.5;
  position: relative;
  z-index: 1;
  
  strong {
    color: ${p => p.theme.PRIMARY_TEXT_COLOR};
    font-weight: 600;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  animation: fadeIn 0.2s ease;
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const ModalContent = styled.div`
  position: relative;
  background: ${p => p.theme.CARD_BACKGROUND};
  border: 2px solid ${p => p.theme.ACCENT_COLOR};
  border-radius: 16px;
  padding: 24px;
  max-width: 600px;
  width: 100%;
  color: ${p => p.theme.PRIMARY_TEXT_COLOR};
  box-shadow: 0 20px 60px rgba(0,0,0,0.5);
  max-height: 85vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease;
  
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  h3 {
    color: ${p => p.theme.ACCENT_COLOR};
    margin-bottom: 16px;
    font-size: 15px;
    text-align: center;
  }
  
  h4 {
    color: ${p => p.theme.ACCENT_COLOR};
    font-size: 15px;
    font-weight: 700;
    margin-top: 16px;
    margin-bottom: 8px;
    border-bottom: 2px solid ${p => p.theme.ACCENT_COLOR}45;
    padding-bottom: 4px;
  }
  
  p {
    line-height: 1.6;
    margin-bottom: 10px;
    font-size: 15px;
  }
  
  a {
    color: ${p => p.theme.ACCENT_COLOR};
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${p => p.theme.BORDER_COLOR}45;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${p => p.theme.ACCENT_COLOR};
    border-radius: 3px;
  }
  
  @media (max-width: 768px) {
    padding: 20px;
    max-height: 90vh;
    
    h3 {
      font-size: 15px;
    }
    
    h4 {
      font-size: 15px;
    }
    
    p {
      font-size: 15px;
    }
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  background: ${p => p.theme.BORDER_COLOR}45;
  border: none;
  color: ${p => p.theme.SECONDARY_TEXT_COLOR};
  font-size: 15px;
  cursor: pointer;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${p => p.theme.ACCENT_COLOR};
    color: #ffffff;
    transform: rotate(90deg);
  }
`;

const makeMissionList = (p) => [
  { id: 0, title: 'Predvýskum', route: '/mission0/intro', completed: !!p.mission0_completed, locked: !p.mission0_unlocked, icon: '/images/preresearch.png' },
  { id: 1, title: 'Úvodný dotazník', route: '/mission1/intro', completed: !!p.mission1_completed, locked: !p.mission1_unlocked, icon: '/images/quest.png' },
  { id: 2, title: 'Prvá časť hlavného výskumu', route: '/mission2/intro', completed: !!p.mission2_completed, locked: !p.mission2_unlocked, icon: '/images/research.png' },
  { id: 3, title: 'Druhá časť hlavného výskumu', route: '/mission3/intro', completed: !!p.mission3_completed, locked: !p.mission3_unlocked, icon: '/images/research.png' }
];

const MainMenu = () => {
  const navigate = useNavigate();
  const {dataManager, userId, logout } = useUserStats();
  const [missions, setMissions] = useState([]);
  const [modal, setModal] = useState({ open: false, type: '' });
  const [isUpdating, setIsUpdating] = useState(false);
  const [copySuccess, setCopySuccess] = useState('');
  const [userProgress, setUserProgress] = useState(null);
  const isAdmin = dataManager.isAdmin(userId);

  // ✅ NOVÉ - Kontrola auth pri načítaní stránky
  useEffect(() => {
    const checkAuth = () => {
      const storedCode = sessionStorage.getItem('participantCode');
      
      // ✅ ZMENA: Redirect len ak OBIDVE sú null
      if (!userId && !storedCode) {
        console.log('🚫 No authentication found, redirecting to instruction');
        navigate('/instruction', { replace: true });
        return false;
      }
      
      return true;
    };

    // ✅ ZMENA: Pridaj timeout pre stabilitu
    const timeoutId = setTimeout(() => {
      checkAuth();
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [userId, navigate]);

  useEffect(() => {
    if (!userId) {
      console.log('⚠️ No userId in MainMenu, checking sessionStorage...');
      const storedCode = sessionStorage.getItem('participantCode');
      
      if (!storedCode) {
        console.log('🚫 No stored code, redirecting to instruction');
        navigate('/instruction');
      }
      return;
    }

    const loadData = async () => {
      try {
        await dataManager.syncAllFromServer();
        const central = dataManager.getAllParticipantsData();
        const p = central[userId] || {};
        setMissions(makeMissionList(p));
        setUserProgress(p);
      } catch (error) {
        console.warn('Sync failed, using local data:', error);
        const central = dataManager.getAllParticipantsData();
        const p = central[userId] || {};
        setMissions(makeMissionList(p));
        setUserProgress(p);
      }
    };

    loadData();
    const interval = setInterval(loadData, 5000);

    const handleStorage = (e) => {
      if (e.key === dataManager.centralStorageKey) {
        loadData();
      }
      
      // ✅ NOVÉ - Sleduj zmeny participantCode
      if (e.key === 'participantCode' && !e.newValue) {
        console.log('🚪 participantCode removed, logging out');
        navigate('/instruction');
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorage);
    };
  }, [dataManager, userId, navigate]);

  const handleMissionClick = (m) => {
    if (!m.locked) navigate(m.route);
  };

  const generateReferralLink = () => {
    const baseUrl = window.location.origin;
    const referralCode = userProgress?.sharing_code;
    return `${baseUrl}/?ref=${referralCode}`;
  };

  const handleCopyCode = () => {
    if (userProgress?.sharing_code) {
      navigator.clipboard.writeText(userProgress.sharing_code);
      setCopySuccess('code');
      setTimeout(() => setCopySuccess(''), 2000);
    }
  };

  const handleCopyLink = () => {
    const link = generateReferralLink();
    navigator.clipboard.writeText(link);
    setCopySuccess('link');
    setTimeout(() => setCopySuccess(''), 2000);
  };

  const handleUnlock = async (id) => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    try {
      await dataManager.unlockMissionForAll(id);
      await dataManager.syncAllFromServer();
      const central = dataManager.getAllParticipantsData();
      const p = central[userId] || {};
      setMissions(makeMissionList(p));
      setUserProgress(p);
      alert(`✅ Misia ${id} bola odomknutá.`);
    } catch (error) {
      alert(`❌ Chyba: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLock = async (id) => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    try {
      await dataManager.lockMissionForAll(id);
      await dataManager.syncAllFromServer();
      const central = dataManager.getAllParticipantsData();
      const p = central[userId] || {};
      setMissions(makeMissionList(p));
      setUserProgress(p);
      alert(`✅ Misia ${id} bola zamknutá.`);
    } catch (error) {
      alert(`❌ Chyba: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const openModal = (type) => setModal({ open: true, type });
  const closeModal = () => setModal({ open: false, type: '' });
  
  // ✅ UPRAVENÉ - Potvrď logout a vyčisti všetko
  const handleLogout = () => {
    if (window.confirm('🚪 Naozaj sa chcete odhlásiť?')) {
      console.log('🚪 Logging out...');
      
      // Vyčisti sessionStorage
      sessionStorage.removeItem('participantCode');
      
      // Zavolaj logout z contextu
      logout();
      
      // Presmeruj
      navigate('/instruction', { replace: true });
    }
  };
 const theme = useContext(ThemeContext);
 const detectiveStory = `
   <p style="font-size: 15px; font-weight: bold; color: ${theme.PRIMARY_TEXT_COLOR}; margin-bottom: 12px;">
      <strong>Ktorou misiou mám začať?</strong>
    </p>
    
      <ul style="list-style: none; padding-left: 20px; padding-right: 20px; margin: 0;">
        <li style="font-size: 15px; font-weight: bold; padding-left: 0; position: relative; margin-bottom: 16px; line-height: 1.6; color: ${theme.PRIMARY_TEXT_COLOR};">
          <span style="position: absolute; left: -15px; top: 0; color: ${theme.ACCENT_COLOR}; font-weight: bold; font-size: 15px;">•</span>
          <strong>Ak sa účastníte predvýskumu začnite prosím Misiou 0.</strong>
          
          <div style="padding-left: 20px; margin-top: 8px;">
            <p style="font-size: 15px; font-weight: bold; color: ${theme.PRIMARY_TEXT_COLOR}; margin-bottom: 4px; line-height: 1.5; position: relative; padding-left: 15px;">
              <span style="position: absolute; left: 0; top: 0; color: ${theme.ACCENT_COLOR};">→</span>
              <strong>Po ukončení predvýskumu bude táto misia uzamknutá a účasť v nej už nebude možná.</strong>
            </p>
          </div>
        </li>
        
        <li style="font-size: 15px; font-weight: bold; padding-left: 0; position: relative; margin-bottom: 16px; line-height: 1.6; color: ${theme.PRIMARY_TEXT_COLOR};">
          <span style="position: absolute; left: -15px; top: 0; color: ${theme.ACCENT_COLOR}; font-weight: bold; font-size: 15px;">•</span>
          <strong>Ak sa účastníte prvej časti hlavného výskumu začnite prosím Misiou 1 a pokračujte Misiou 2.</strong>
          
          <div style="padding-left: 20px; margin-top: 8px;">
            <p style="font-size: 15px; font-weight: bold; color: ${theme.PRIMARY_TEXT_COLOR}; margin-bottom: 4px; line-height: 1.5; position: relative; padding-left: 15px;">
              <span style="position: absolute; left: 0; top: 0; color: ${theme.ACCENT_COLOR};">→</span>
              <strong>Po ukončení predvýskumu budú tieto misie neustále odomknuté.</strong>
            </p>
            <p style="font-size: 15px; font-weight: bold; color: ${theme.PRIMARY_TEXT_COLOR}; margin-bottom: 4px; line-height: 1.5; position: relative; padding-left: 15px;">
              <span style="position: absolute; left: 0; top: 0; color: ${theme.ACCENT_COLOR};">→</span>
              <strong>Pre spustenie týchto misií nie je potrebné mať absolvovanú Misiu 0.</strong>
            </p>
          </div>
        </li>
        
        <li style="font-size: 15px; font-weight: bold; padding-left: 0; position: relative; margin-bottom: 10px; line-height: 1.6; color: ${theme.PRIMARY_TEXT_COLOR};">
          <span style="position: absolute; left: -15px; top: 0; color: ${theme.ACCENT_COLOR}; font-weight: bold; font-size: 15px;">•</span>
          <strong>Ak sa účastníte druhej časti hlavného výskumu pokračujte prosím Misiou 3.</strong>
          
          <div style="padding-left: 20px; margin-top: 8px;">
            <p style="font-size: 15px; font-weight: bold; color: ${theme.PRIMARY_TEXT_COLOR}; margin-bottom: 4px; line-height: 1.5; position: relative; padding-left: 15px;">
              <span style="position: absolute; left: 0; top: 0; color: ${theme.ACCENT_COLOR};">→</span>
              <strong>Po ukončení prvej časti hlavného výskumu bude táto misia neustále odomknutá.</strong>
            </p>
            <p style="font-size: 15px; font-weight: bold; color: ${theme.PRIMARY_TEXT_COLOR}; margin-bottom: 4px; line-height: 1.5; position: relative; padding-left: 15px;">
              <span style="position: absolute; left: 0; top: 0; color: ${theme.ACCENT_COLOR};">→</span>
              <strong>Pred spustením Misie 3 si prosím skontrolujte v hlavnom menu, či máte dokončenú Misiu 1 a Misiu 2.</strong>
            </p>
          </div>
        </li>
      </ul>
    </div>
    
    <p style="font-size: 15px; font-weight:  bold; color: ${theme.PRIMARY_TEXT_COLOR}; margin-bottom: 12px; margin-top: 24px;">
      <strong>Čo nájdem v hlavnom menu?</strong>
    </p>
    
    <ul style="list-style: none; padding-left: 20px; padding-right: 20px; margin: 0;">
      <li style="font-size: 15px; font-weight: bold; padding-left: 0; position: relative; margin-bottom: 8px; line-height: 1.6; color: ${theme.PRIMARY_TEXT_COLOR};">
        <span style="position: absolute; left: -15px; top: 0; color: ${theme.ACCENT_COLOR}; font-weight: bold; font-size: 15px;">•</span>
        <strong>Bočný panel s aktuálnou detektívnou úrovňou a bodmi.</strong>
      </li>
      <li style="font-size: 15px; font-weight: bold; padding-left: 0; position: relative; margin-bottom: 8px; line-height: 1.6; color: ${theme.PRIMARY_TEXT_COLOR};">
        <span style="position: absolute; left: -15px; top: 0; color: ${theme.ACCENT_COLOR}; font-weight: bold; font-size: 15px;">•</span>
        <strong>Panel s aktuálnym progresom misií a celkový počet nazbieraných bodov.</strong>
      </li>
      <li style="font-size: 15px; font-weight: bold; padding-left: 0; position: relative; margin-bottom: 8px; line-height: 1.6; color: ${theme.PRIMARY_TEXT_COLOR};">
        <span style="position: absolute; left: -15px; top: 0; color: ${theme.ACCENT_COLOR}; font-weight: bold; font-size: 15px;">•</span>
        <strong>Zoznam všetkých misií.</strong>
      </li>
      <li style="font-size: 15px; font-weight: bold; padding-left: 0; position: relative; margin-bottom: 8px; line-height: 1.6; color: ${theme.PRIMARY_TEXT_COLOR};">
        <span style="position: absolute; left: -15px; top: 0; color: ${theme.ACCENT_COLOR}; font-weight: bold; font-size: 15px;">•</span>
        <strong>Odkaz na pomoc.</strong>
      </li>
      <li style="font-size: 15px; font-weight: bold; padding-left: 0; position: relative; margin-bottom: 8px; line-height: 1.6; color: ${theme.PRIMARY_TEXT_COLOR};">
        <span style="position: absolute; left: -15px; top: 0; color: ${theme.ACCENT_COLOR}; font-weight: bold; font-size: 15px;">•</span>
        <strong>Odkaz na pravidlá a podmienky súťaže.</strong>
      </li>
      <li style="font-size: 15px; font-weight: bold; padding-left: 0; position: relative; margin-bottom: 8px; line-height: 1.6; color: ${theme.PRIMARY_TEXT_COLOR};">
        <span style="position: absolute; left: -15px; top: 0; color: ${theme.ACCENT_COLOR}; font-weight: bold; font-size: 15px;">•</span>
        <strong>Možnosť odhlásenia z aplikácie.</strong>
      </li>
      <li style="font-size: 15px; font-weight: bold; padding-left: 0; position: relative; margin-bottom: 8px; line-height: 1.6; color: ${theme.PRIMARY_TEXT_COLOR};">
        <span style="position: absolute; left: -15px; top: 0; color: ${theme.ACCENT_COLOR}; font-weight: bold; font-size: 15px;">•</span>
        <strong>Váš osobný referral kód, ktorý môžete zdieľať s priateľmi.</strong>
      </li>
    </ul>
  `;


  // ✅ NOVÉ - Loading state
  if (!userId && !userProgress) {
    return (
      <Layout showLevelDisplay={false}  showAnimatedBackground={true}
  cubeCount={15}
  animationSpeed="normal"
  complexity="medium">
        <Container>
          <Header>
            <Title>Načítavam...</Title>
          </Header>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout  showAnimatedBackground={true}
  cubeCount={50}
  animationSpeed="normal"
  complexity="medium ">
      <Container>
        <Header>
          <Title>HLAVNÉ MENU</Title>
          <InstructionsWrapper>
            <InstructionCard>
              <h4 style={{ color: theme.ACCENT_COLOR }}><strong>Inštrukcie k postupu</strong></h4>
              
              {/* ✅ GRADIENT ODRÁŽKY */}
              <SubNote style={{ marginTop: '12px' }}>
                <strong>Ak sa účastníte predvýskumu - začnite prosím Misiou 0.<br/> </strong>
                Po ukončení predvýskumu bude táto misia uzamknutá a účasť v nej už nebude možná.
              </SubNote>
              
              <SubNote style={{ marginTop: '12px' }}>
                <strong>Ak sa účastníte prvej časti hlavného výskumu - začnite prosím Misiou 1 a pokračujte Misiou 2. </strong><br/>
                Po ukončení predvýskumu budú tieto misie neustále odomknuté.<br/>
                Pre spustenie týchto misií nie je potrebné mať absolvovanú Misiu 0.
              </SubNote>
              
              <SubNote style={{ marginTop: '12px' }}>
                <strong>Ak sa účastníte druhej časti hlavného výskumu - pokračujte prosím Misiou 3.</strong><br/>
                Po ukončení prvej časti hlavného výskumu bude táto misia neustále odomknutá.<br/>
                Pred spustením Misie 3 si prosím skontrolujte v hlavnom menu, či máte dokočenú Misiu 1 a Misiu 2.
              </SubNote>
            </InstructionCard>
          </InstructionsWrapper>
        </Header>

        <MissionsList>
          {missions.map(m => (
            <MissionCard
              key={m.id}
              locked={m.locked}
              completed={m.completed}
              onClick={() => handleMissionClick(m)}
            >
              <MissionIcon><MissionIcon>
                {m.icon.startsWith('/') || m.icon.startsWith('http') ? (
                   <img 
                      src={m.icon} 
                      alt={m.title}
                      style={{ 
                        width: '64px', 
                        height: '64px',
                        objectFit: 'contain'
                      }}
                    />
                ) : (
                  m.icon
                )}
              </MissionIcon>
              </MissionIcon>
              <MissionContent>
                <MissionNumber>Misia {m.id}</MissionNumber>
                <MissionTitle>{m.title}</MissionTitle>
                <MissionStatus completed={m.completed}>
                  {m.locked ? '🔒 Misia je uzamknutá' : m.completed ? '✅ Misia je dokončená' : '▶️ Spustiť misiu'}
                </MissionStatus>
              </MissionContent>
              {isAdmin && (
                <AdminButtons>
                  <AdminButton
                    $unlock
                    disabled={isUpdating}
                    onClick={e => {
                      e.stopPropagation();
                      handleUnlock(m.id);
                    }}
                  >
                    🔓 Odomknúť
                  </AdminButton>
                  <AdminButton
                    disabled={isUpdating}
                    onClick={e => {
                      e.stopPropagation();
                      handleLock(m.id);
                    }}
                  >
                    🔒 Zamknúť
                  </AdminButton>
                </AdminButtons>
              )}
            </MissionCard>
          ))}
        </MissionsList>

        <ButtonGroup>
          <InfoButton size="medium" onClick={() => openModal('help')}>
            ❓ Pomoc
          </InfoButton>
          
          <ContestButton size="medium" onClick={() => openModal('contest')}>
            🎁 Súťaž
          </ContestButton>
          
          {isAdmin && (
            <StyledButton variant="accent" size="medium" onClick={() => navigate('/admin')}>
              ⚙️ Admin panel
            </StyledButton>
          )}
          
          <LogoutButton size="medium" onClick={handleLogout}>
            🚪 Odhlásiť sa
          </LogoutButton>
        </ButtonGroup>

        <SharingSection>
          <SharingTitle><strong>Zdieľajte výskum a získajte body!</strong></SharingTitle>
          
          <SharingCodeDisplay>
            <SharingCodeLabel><strong>Váš refferal kód:</strong></SharingCodeLabel>
            <SharingCode>
              {userProgress?.sharing_code || '━━━━━━'}
            </SharingCode>
          </SharingCodeDisplay>
          
          <LinkDisplay>
            <LinkLabel>🔗 Link s automatickým zadaním kódu:</LinkLabel>
            <LinkText>{generateReferralLink()}</LinkText>
          </LinkDisplay>
          
          <ShareButtonsGroup>
            <StyledButton 
              variant="accent"
              onClick={handleCopyCode}
            >
              {copySuccess === 'code' ? '✅ Kód bol skopírovaný!' : '📋 Skopírovať iba kód'}
            </StyledButton>
            <StyledButton 
              variant="success"
              onClick={handleCopyLink}
            >
              {copySuccess === 'link' ? '✅ Link bol skopírovaný!' : '🔗 Skopírovať link s kódom'}
            </StyledButton>
          </ShareButtonsGroup>
          
          <SharingInfo>
            <strong>Zdieľajte kód alebo link s priateľmi!</strong><br/>
           <strong>Za každého nového respondenta získate</strong> <strong>+10 bodov</strong>
          </SharingInfo>
        
        </SharingSection>

        <DetectiveTipLarge
          tip={detectiveStory}
          detectiveName="Inšpektor Kritan"
          imageUrl="/images/detective.png"
          iconUrl="/images/detective-icon.png"
          buttonText="Rozumiem!"
          autoOpen={false}
          showBadge={true}
          position="right"
          style={{ textAlign: "left" }}
        />

        {modal.open && (
          <ModalOverlay onClick={closeModal}>
            <ModalContent onClick={e => e.stopPropagation()}>
              <CloseButton onClick={closeModal}>×</CloseButton>
              {modal.type === 'help' && (
                <>
                  <h3>Čo ak sa počas výskumu cítim znepokojený/á?</h3>
                  
                  {/* ✅ GRADIENT ODRÁŽKY */}
                  <GradientCircleList>
                    <li>Je úplne v poriadku mať z niektorých tém alebo tvrdení nepríjemný pocit - dotýkajú sa citlivých spoločenských tém.</li>
                    <li>Odporúčame o svojich pocitoch hovoriť s niekým, komu dôverujete (priateľ, rodina, odborník).</li>
                    <li>Ak máte pocit, že na vás podobné informácie dlhodobo pôsobia stresujúco alebo úzkostne, môže byť užitočné poradiť sa so psychológom alebo iným odborníkom.</li>
                  </GradientCircleList>
                  
                  <h4>Dostupné zdroje pomoci:</h4>
                  <GradientCircleList>
                    <li>Kontakt na výskumníka - <a href="mailto:roman.fiala@tvu.sk">roman.fiala@tvu.sk</a></li>
                    <li>IPčko - <a href="https://ipcko.sk" target="_blank" rel="noopener noreferrer">https://ipcko.sk</a></li>
                    <li>Linka dôvery - <a href="https://www.linkanezabudka.sk" target="_blank" rel="noopener noreferrer">https://www.linkanezabudka.sk</a></li>
                  </GradientCircleList>
                </>
              )}
              {modal.type === 'contest' && (
                <>
                  <h3>🎁 Pravidlá a podmienky súťaže:</h3>
                  
                  <h4>Organizátor súťaže:</h4>
                  <GradientCircleList>
                    <li>Organizátorom súťaže je hlavný zodpovedný riešiteľ výskumu - Roman Fiala.</li>
                  </GradientCircleList>

                  <h4>Účastníci súťaže:</h4>
                  <GradientCircleList>
                    <li>Súťaže sa môžu zúčastniť osoby, ktoré dovŕšili 18 rokov a vyjadrili informovaný súhlas s účasťou vo výskume.</li>
                  </GradientCircleList>

                  <h4>Podmienky zaradenia do žrebovania:</h4>
                  <GradientCircleList>
                    <li>Podmienky účasti uvedené v tejto časti sú zároveň podmienkami na získanie minimálneho počtu 50 bodov potrebných na zaradenie do žrebovania.</li>
                    <li>Účastník bude zaradený do žrebovania o ceny, ak:</li>
                  </GradientCircleList>
                  
                  <NestedListItem>
                    Absolvuje aspoň jednu z požadovaných častí výskumu: Predvýskum alebo prvú časť hlavného výskumu.
                  </NestedListItem>
                  <NestedListItem>
                    Pravdivo a úplne vyplní všetky povinné položky predvýskumu alebo prvej časti hlavného výskumu.
                  </NestedListItem>
                  <NestedListItem>
                    Poskytne kontaktný e-mail určený výhradne na účely súťaže, ktorý nie je spájaný s výskumnými dátami.
                  </NestedListItem>
                  
                  <GradientCircleList>
                    <li>Účasť v súťaži nie je podmienkou účasti vo výskume, respondent sa môže zúčastniť výskumu aj bez poskytnutia kontaktného e-mailu.</li>
                  </GradientCircleList>

                  <h4>Trvanie súťaže:</h4>
                  <GradientCircleList>
                    <li>Súťaž prebieha v období od spustenia predvýskumu do ukončenia hlavného výskumu - marec 2026.</li>
                    <li>Pozor - predvýskum bude dostupný iba do spustenia hlavného výskumu, to znamená že po jeho spustení predvýskum už nebude možné absolvovať.</li>
                    <li>Do žrebovania budú zaradení len účastníci, ktorí splnia podmienky účasti v tomto časovom intervale.</li>
                  </GradientCircleList>

                  <h4>Bodovanie účasti v súťaži:</h4>
                  <GradientCircleList>
                    <li>Každý získaný bod predstavuje jeden žreb v súťaži. Účastník s vyšším počtom bodov tak má vyššiu pravdepodobnosť výhry. Minimálnou podmienkou zaradenia do žrebovania je získanie minimálne 50 bodov.</li>
                    <li>Za absolvovanie predvýskumu získava účastník 50 bodov.</li>
                    <li>Za absolvovanie prvej časti hlavného výskumu získava účastník 50 bodov.</li>
                    <li>Za absolvovanie druhej časti hlavného výskumu (follow-up meranie) získava účastník 25 bodov.</li>
                    <li>Za odporúčanie ďalším účastníkom 10 bodov za nového účastníka, ktorý dokončí aspoň predvýskum alebo prvú časť výskumu.</li>
                  </GradientCircleList>
                  
                  <NestedListItem>
                    Každý účastník, ktorý absolvuje aspoň predvýskum alebo prvú časť hlavného výskumu, získa jedinečný referral kód.
                  </NestedListItem>
                  <NestedListItem>
                    Ak nový účastník pri vstupe do štúdie uvedie referral kód osoby, ktorá ho pozvala, a sám splní podmienky účasti, osoba, ktorá referral kód zdieľala, získa za každé takéto platné odporúčanie 10 bodov.
                  </NestedListItem>
                  <NestedListItem>
                    Za toho istého nového účastníka možno referral kód započítať len raz a len jednému odporúčateľovi.
                  </NestedListItem>
                  <NestedListItem>
                    Referral kód nemá vplyv na samotný priebeh výskumu, slúži iba na pridelenie bodov do súťaže.
                  </NestedListItem>

                  <h4>Výhry:</h4>
                  <GradientCircleList>
                    <li>Hlavnou cenou je darčekový poukaz v hodnote 50 € pre jedného výhercu, ktorý získa najviac zdieľaní - platných dokončení od nových respondentov prostredníctvom svojho referral kódu (zdieľacieho kódu) a splní podmienky účasti v súťaži.</li>
                    <li>Vedľajšími cenami sú darčekové poukazy, každý v hodnote 10 € pre troch výhercov, ktorí získajú minimálne 50 bodov do žrebovania a splnia podmienky účasti v súťaži.</li>
                    <li>Výhercovia si určia, v ktorom obchode si chcú uplatniť darčekový poukaz a na základe toho im bude poukaz poskytnutý.</li>
                    <li>Organizátor si vyhradzuje právo zmeniť typ ceny za inú v rovnakej alebo vyššej hodnote (napr. iný typ poukážky), ak pôvodnú cenu nebude možné zabezpečiť.</li>
                  </GradientCircleList>

                  <h4>Žrebovanie výhercov:</h4>
                  <GradientCircleList>
                    <li>Žrebovanie prebehne najneskôr do 10 dní po ukončení hlavného výskumu.</li>
                    <li>Žrebovanie bude realizované náhodným výberom z databázy e-mailových adries účastníkov, ktorí splnili podmienky účasti.</li>
                    <li>Žrebovanie vykoná organizátor za prítomnosti svedkov a bude zaznamenané na videozáznam s časovou stopou.</li>
                  </GradientCircleList>

                  <h4>Oznámenie a odovzdanie výhry:</h4>
                  <GradientCircleList>
                    <li>Výhercovia budú kontaktovaní e-mailom najneskôr do 5 dní od žrebovania.</li>
                    <li>Ak výherca do 10 pracovných dní od odoslania e-mailu nereaguje alebo odmietne výhru, cena môže byť pridelená náhradníkovi, ktorý bude vyžrebovaný rovnakým spôsobom.</li>
                    <li>Výhra bude odovzdaná elektronicky formou poukazu.</li>
                  </GradientCircleList>

                  <h4>Ochrana osobných údajov:</h4>
                  <GradientCircleList>
                    <li>Kontaktný e-mail nebude spájaný s odpoveďami v predvýskume ani v hlavnom výskume.</li>
                    <li>Údaje budú použité výhradne na účely kontaktovania výhercu a budú uchovávané len po dobu trvania súťaže a odovzdania výhry, následne budú bezpečne zlikvidované.</li>
                    <li>Spracovanie osobných údajov prebieha v súlade s GDPR a zákonom č. 18/2018 Z. z.</li>
                  </GradientCircleList>

                  <h4>Vylúčenie zo súťaže:</h4>
                  <GradientCircleList>
                    <li>Organizátor si vyhradzuje právo vylúčiť účastníka zo súťaže, ak:</li>
                  </GradientCircleList>
                  
                  <NestedListItem>
                    Porušil tieto pravidlá a podmienky súťaže.
                  </NestedListItem>
                  <NestedListItem>
                    Uviedol zjavne nepravdivé údaje alebo iným spôsobom zneužil mechanizmus súťaže (napr. viacnásobná registrácia s rôznymi e-mailmi).
                  </NestedListItem>

                  <h4>Zodpovednosť organizátora:</h4>
                  <GradientCircleList>
                    <li>Organizátor nezodpovedá za technické problémy (napr. výpadky internetu, poruchy zariadenia účastníka), ktoré znemožnia alebo skomplikujú účasť v súťaži alebo dokončenie výskumu.</li>
                  </GradientCircleList>
                </>
              )}
            </ModalContent>
          </ModalOverlay>
        )}
      </Container>
    </Layout>
  );
};

export default MainMenu;
