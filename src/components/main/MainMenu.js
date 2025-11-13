// src/components/main/MainMenu.js
// UPRAVENÁ VERZIA - Misie pod sebou, sharing section na konci

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Layout from '../../styles/Layout';
import StyledButton from '../../styles/StyledButton';
import { useUserStats } from '../../contexts/UserStatsContext';

const Container = styled.div`
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    padding: 15px;
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
  color: ${p => p.theme.PRIMARY_TEXT_COLOR};
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 8px;
  
  @media (max-width: 768px) {
    font-size: 28px;
  }
  
  @media (max-width: 480px) {
    font-size: 24px;
  }
`;

const Subtitle = styled.p`
  color: ${p => p.theme.SECONDARY_TEXT_COLOR};
  font-size: 16px;
  margin-bottom: 20px;
  
  @media (max-width: 480px) {
    font-size: 14px;
  }
`;

const StatsCard = styled.div`
  background: ${p => p.theme.CARD_BACKGROUND};
  border: 2px solid ${p => p.theme.ACCENT_COLOR}44;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  justify-content: space-around;
  gap: 20px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  
  @media (max-width: 480px) {
    flex-direction: column;
    gap: 16px;
  }
`;

const StatItem = styled.div`
  text-align: center;
  flex: 1;
`;

const StatValue = styled.div`
  font-size: 32px;
  font-weight: 700;
  color: ${p => p.theme.ACCENT_COLOR};
  margin-bottom: 4px;
  
  @media (max-width: 768px) {
    font-size: 28px;
  }
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: ${p => p.theme.SECONDARY_TEXT_COLOR};
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
`;

const SectionTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: ${p => p.theme.PRIMARY_TEXT_COLOR};
  margin-bottom: 20px;
  text-align: center;
  
  @media (max-width: 480px) {
    font-size: 20px;
  }
`;

// ✅ NOVÉ - Misie pod sebou namiesto grid
const MissionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 40px;
`;

const MissionCard = styled.div`
  background: ${p => p.theme.CARD_BACKGROUND};
  border: 2px solid ${p => p.locked ? p.theme.BORDER_COLOR : p.theme.ACCENT_COLOR}44;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 20px;
  position: relative;
  cursor: ${p => p.locked ? 'not-allowed' : 'pointer'};
  opacity: ${p => p.locked ? 0.6 : 1};
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);

  &:hover {
    transform: ${p => p.locked ? 'none' : 'translateY(-2px)'};
    border-color: ${p => p.locked ? p.theme.BORDER_COLOR : p.theme.ACCENT_COLOR};
    box-shadow: ${p => p.locked ? '0 2px 8px rgba(0,0,0,0.1)' : `0 6px 16px ${p.theme.ACCENT_COLOR}33`};
  }
  
  @media (max-width: 480px) {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }
`;

const MissionIcon = styled.div`
  width: 60px;
  height: 60px;
  min-width: 60px;
  background: linear-gradient(135deg, 
    ${p => p.theme.ACCENT_COLOR}, 
    ${p => p.theme.ACCENT_COLOR_2}
  );
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  
  @media (max-width: 480px) {
    width: 50px;
    height: 50px;
    min-width: 50px;
    font-size: 28px;
  }
`;

const MissionContent = styled.div`
  flex: 1;
  
  @media (max-width: 480px) {
    text-align: center;
  }
`;

const MissionNumber = styled.div`
  font-size: 12px;
  color: ${p => p.theme.SECONDARY_TEXT_COLOR};
  margin-bottom: 4px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const MissionTitle = styled.h3`
  font-size: 18px;
  color: ${p => p.theme.PRIMARY_TEXT_COLOR};
  margin-bottom: 4px;
  font-weight: 600;
`;

const MissionStatus = styled.div`
  font-size: 13px;
  color: ${p => p.completed ? '#10b981' : p.theme.SECONDARY_TEXT_COLOR};
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const AdminButtons = styled.div`
  display: flex;
  gap: 8px;
  
  @media (max-width: 480px) {
    width: 100%;
    justify-content: center;
  }
`;

const AdminButton = styled.button`
  background: ${p => p.$unlock ? '#10b981' : p.theme.ACCENT_COLOR};
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 600;
  
  &:hover:not(:disabled) {
    opacity: 0.8;
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
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 40px;
  
  @media (max-width: 480px) {
    flex-direction: column;
    
    button {
      width: 100%;
    }
  }
`;

// ✅ Sharing section presunutá na koniec
const SharingSection = styled.div`
  background: linear-gradient(135deg, 
    ${p => p.theme.ACCENT_COLOR}22, 
    ${p => p.theme.ACCENT_COLOR_2}22
  );
  border: 2px solid ${p => p.theme.ACCENT_COLOR};
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  margin-top: 20px;
  
  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const SharingTitle = styled.h3`
  color: ${p => p.theme.PRIMARY_TEXT_COLOR};
  margin-bottom: 16px;
  font-size: 20px;
  font-weight: 700;
  
  @media (max-width: 480px) {
    font-size: 18px;
  }
`;

const SharingCodeDisplay = styled.div`
  background: ${p => p.theme.CARD_BACKGROUND};
  border: 2px dashed ${p => p.theme.ACCENT_COLOR};
  border-radius: 12px;
  padding: 20px;
  margin: 16px 0;
`;

const SharingCodeLabel = styled.div`
  font-size: 14px;
  color: ${p => p.theme.SECONDARY_TEXT_COLOR};
  margin-bottom: 12px;
`;

const SharingCode = styled.code`
  font-size: 36px;
  font-weight: bold;
  letter-spacing: 6px;
  color: ${p => p.theme.ACCENT_COLOR};
  font-family: 'Courier New', monospace;
  
  @media (max-width: 768px) {
    font-size: 32px;
    letter-spacing: 4px;
  }
  
  @media (max-width: 480px) {
    font-size: 28px;
    letter-spacing: 3px;
  }
`;

const SharingInfo = styled.p`
  color: ${p => p.theme.SECONDARY_TEXT_COLOR};
  font-size: 14px;
  margin: 16px 0;
  line-height: 1.6;
  
  strong {
    color: ${p => p.theme.ACCENT_COLOR};
    font-weight: 600;
  }
`;

const ReferralStats = styled.div`
  display: flex;
  justify-content: center;
  gap: 32px;
  margin-top: 20px;
  
  @media (max-width: 480px) {
    gap: 20px;
  }
`;

const ReferralStat = styled.div`
  text-align: center;
`;

const ReferralStatValue = styled.div`
  font-size: 28px;
  font-weight: bold;
  color: ${p => p.theme.ACCENT_COLOR};
  
  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

const ReferralStatLabel = styled.div`
  font-size: 11px;
  color: ${p => p.theme.SECONDARY_TEXT_COLOR};
  margin-top: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
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
`;

const ModalContent = styled.div`
  position: relative;
  background: ${p => p.theme.CARD_BACKGROUND};
  border: 2px solid ${p => p.theme.ACCENT_COLOR};
  border-radius: 16px;
  padding: 32px;
  max-width: 500px;
  width: 100%;
  color: ${p => p.theme.PRIMARY_TEXT_COLOR};
  box-shadow: 0 20px 60px rgba(0,0,0,0.5);
  
  h3 {
    color: ${p => p.theme.ACCENT_COLOR};
    margin-bottom: 16px;
    font-size: 24px;
  }
  
  p {
    line-height: 1.6;
    margin-bottom: 12px;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: transparent;
  border: none;
  color: ${p => p.theme.SECONDARY_TEXT_COLOR};
  font-size: 24px;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${p => p.theme.BORDER_COLOR};
    color: ${p => p.theme.PRIMARY_TEXT_COLOR};
    transform: rotate(90deg);
  }
`;

const makeMissionList = (p) => [
  { id: 0, title: 'Špeciálny agent', route: '/mission0/intro', completed: !!p.mission0_completed, locked: !p.mission0_unlocked, icon: '🎯' },
  { id: 1, title: 'Misia 1', route: '/mission1/intro', completed: !!p.mission1_completed, locked: !p.mission1_unlocked, icon: '🔍' },
  { id: 2, title: 'Misia 2', route: '/mission2/intro', completed: !!p.mission2_completed, locked: !p.mission2_unlocked, icon: '🕵️' },
  { id: 3, title: 'Misia 3', route: '/mission3/intro', completed: !!p.mission3_completed, locked: !p.mission3_unlocked, icon: '🎭' }
];

const MainMenu = () => {
  const navigate = useNavigate();
  const { userStats, dataManager, userId, logout } = useUserStats();
  const [missions, setMissions] = useState([]);
  const [modal, setModal] = useState({ open: false, type: '' });
  const [isUpdating, setIsUpdating] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [userProgress, setUserProgress] = useState(null);
  const isAdmin = dataManager.isAdmin(userId);

  useEffect(() => {
    if (!userId) {
      navigate('/instruction');
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

  const handleExport = () => {
    try {
      dataManager.exportAllParticipantsCSV();
    } catch (error) {
      console.error('Export error:', error);
      alert('❌ Chyba pri exportovaní dáta.');
    }
  };

  const handleCopyCode = () => {
    if (userProgress?.sharing_code) {
      navigator.clipboard.writeText(userProgress.sharing_code);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
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
      alert(`✅ Misia ${id} bola odomknutá`);
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
      alert(`✅ Misia ${id} bola zamknutá`);
    } catch (error) {
      alert(`❌ Chyba: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const openModal = (type) => setModal({ open: true, type });
  const closeModal = () => setModal({ open: false, type: '' });
  const handleLogout = () => {
    logout();
    navigate('/instruction');
  };

  return (
    <Layout>
      <Container>
        <Header>
          <Title>🕵️ Conspiracy Pass</Title>
          <Subtitle>Staňte sa detektívom a odhaľte pravdu</Subtitle>
          <StatsCard>
            <StatItem>
              <StatValue>{userStats.totalPoints || 0}</StatValue>
              <StatLabel>Celkové body</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>{missions.filter(m => m.completed).length}/4</StatValue>
              <StatLabel>Dokončené misie</StatLabel>
            </StatItem>
          </StatsCard>
        </Header>

        {/* ✅ Misie pod sebou */}
        <SectionTitle>📋 Misie</SectionTitle>
        <MissionsList>
          {missions.map(m => (
            <MissionCard
              key={m.id}
              locked={m.locked}
              completed={m.completed}
              onClick={() => handleMissionClick(m)}
            >
              <MissionIcon>{m.icon}</MissionIcon>
              <MissionContent>
                <MissionNumber>Misia {m.id}</MissionNumber>
                <MissionTitle>{m.title}</MissionTitle>
                <MissionStatus completed={m.completed}>
                  {m.locked ? '🔒 Uzamknuté' : m.completed ? '✅ Dokončené' : '▶️ Začať'}
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

        {/* Navigation Buttons */}
        <ButtonGroup>
          <StyledButton variant="ghost" size="small" onClick={() => openModal('help')}>
            ❓ Pomoc
          </StyledButton>
          <StyledButton variant="ghost" size="small" onClick={() => openModal('contest')}>
            🎁 Súťaž
          </StyledButton>
          {isAdmin && (
            <>
              <StyledButton variant="outline" size="small" onClick={handleExport}>
                📤 Export
              </StyledButton>
              <StyledButton variant="accent" size="small" onClick={() => navigate('/admin')}>
                ⚙️ Admin
              </StyledButton>
            </>
          )}
          <StyledButton variant="danger" size="small" onClick={handleLogout}>
            🔒 Odhlásiť
          </StyledButton>
        </ButtonGroup>

        {/* ✅ Sharing Section na konci */}
        <SharingSection>
          <SharingTitle>🎁 Zdieľajte a získajte body!</SharingTitle>
          
          <SharingCodeDisplay>
            <SharingCodeLabel>Váš zdieľací kód:</SharingCodeLabel>
            <SharingCode>
              {userProgress?.sharing_code || '━━━━━━'}
            </SharingCode>
          </SharingCodeDisplay>
          
          <StyledButton 
            variant="accent"
            onClick={handleCopyCode}
            style={{ marginBottom: '12px' }}
          >
            {copySuccess ? '✅ Skopírované!' : '📋 Kopírovať kód'}
          </StyledButton>
          
          <SharingInfo>
            Zdieľajte tento kód s priateľmi!<br/>
            Za každého nového používateľa získate <strong>+10 bodov</strong> 🎉
          </SharingInfo>
          
          {userProgress?.referrals_count > 0 && (
            <ReferralStats>
              <ReferralStat>
                <ReferralStatValue>{userProgress.referrals_count}</ReferralStatValue>
                <ReferralStatLabel>Odporúčaní</ReferralStatLabel>
              </ReferralStat>
              <ReferralStat>
                <ReferralStatValue>+{userProgress.referrals_count * 10}</ReferralStatValue>
                <ReferralStatLabel>Bonus bodov</ReferralStatLabel>
              </ReferralStat>
            </ReferralStats>
          )}
        </SharingSection>

        {/* Modal */}
        {modal.open && (
          <ModalOverlay onClick={closeModal}>
            <ModalContent onClick={e => e.stopPropagation()}>
              <CloseButton onClick={closeModal}>×</CloseButton>
              {modal.type === 'help' && (
                <>
                  <h3>❓ Pomoc</h3>
                  <p>Kontakt: support@example.com</p>
                  <p>V prípade problémov nás neváhajte kontaktovať.</p>
                </>
              )}
              {modal.type === 'contest' && (
                <>
                  <h3>🎁 Súťaž o ceny</h3>
                  <p><strong>1. miesto:</strong> iPad</p>
                  <p><strong>2. miesto:</strong> Bezdrôtové slúchadlá</p>
                  <p><strong>3. miesto:</strong> Poukážka 50€</p>
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
