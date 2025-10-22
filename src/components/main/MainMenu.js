// src/components/main/MainMenu.js - KOMPLETNÁ OPRAVENÁ VERZIA

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Layout from '../../styles/Layout';
import { useUserStats } from '../../contexts/UserStatsContext';

const Container = styled.div`
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 30px;
`;

const Title = styled.h1`
  color: ${p => p.theme.PRIMARY_TEXT_COLOR};
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 8px;
`;

const Subtitle = styled.p`
  color: ${p => p.theme.SECONDARY_TEXT_COLOR};
  font-size: 14px;
`;

const StatsCard = styled.div`
  background: ${p => p.theme.CARD_BACKGROUND};
  border: 1px solid ${p => p.theme.BORDER_COLOR};
  border-radius: 8px;
  padding: 16px;
  display: flex;
  justify-content: space-around;
  margin-bottom: 30px;
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: ${p => p.theme.ACCENT_COLOR};
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: ${p => p.theme.SECONDARY_TEXT_COLOR};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const MissionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const MissionCard = styled.div`
  background: ${p => p.theme.CARD_BACKGROUND};
  border: 1px solid ${p => p.theme.BORDER_COLOR};
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  position: relative;
  cursor: ${p => p.locked ? 'not-allowed' : 'pointer'};
  opacity: ${p => p.locked ? 0.5 : 1};
  transition: all 0.2s ease;

  &:hover {
    transform: ${p => p.locked ? 'none' : 'translateY(-2px)'};
    border-color: ${p => p.locked ? p.theme.BORDER_COLOR : p.theme.ACCENT_COLOR};
  }
`;

const MissionNumber = styled.div`
  font-size: 12px;
  color: ${p => p.theme.SECONDARY_TEXT_COLOR};
  margin-bottom: 8px;
  font-weight: 600;
  text-transform: uppercase;
`;

const MissionTitle = styled.h3`
  font-size: 16px;
  color: ${p => p.theme.PRIMARY_TEXT_COLOR};
  margin-bottom: 12px;
`;

const MissionStatus = styled.div`
  font-size: 12px;
  color: ${p => p.completed ? p.theme.ACCENT_COLOR_3 : p.theme.SECONDARY_TEXT_COLOR};
  font-weight: 600;
  text-transform: uppercase;
`;

const AdminButtons = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 4px;
`;

const AdminButton = styled.button`
  background: ${p => p.unlock ? p.theme.ACCENT_COLOR_3 : p.theme.ACCENT_COLOR_2};
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 4px 6px;
  font-size: 10px;
  cursor: pointer;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 20px;
  flex-wrap: wrap;
`;

const IconButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${p => p.theme.CARD_BACKGROUND};
  color: ${p => p.theme.PRIMARY_TEXT_COLOR};
  border: 1px solid ${p => p.theme.BORDER_COLOR};
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${p => p.theme.HOVER_OVERLAY};
    transform: translateY(-1px);
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  position: relative;
  background: ${p => p.theme.CARD_BACKGROUND};
  border-radius: 8px;
  padding: 24px;
  max-width: 400px;
  width: 100%;
  color: ${p => p.theme.PRIMARY_TEXT_COLOR};
`;

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: transparent;
  border: none;
  color: ${p => p.theme.SECONDARY_TEXT_COLOR};
  font-size: 18px;
  cursor: pointer;
`;

const makeMissionList = (p) => [
  { id: 0, title: 'Misia 0', route: '/mission0/intro', completed: !!p.mission0_completed, locked: !p.mission0_unlocked },
  { id: 1, title: 'Misia 1', route: '/mission1/intro', completed: !!p.mission1_completed, locked: !p.mission1_unlocked },
  { id: 2, title: 'Misia 2', route: '/mission2/intro', completed: !!p.mission2_completed, locked: !p.mission2_unlocked },
  { id: 3, title: 'Misia 3', route: '/mission3/intro', completed: !!p.mission3_completed, locked: !p.mission3_unlocked }
];

const MainMenu = () => {
  const navigate = useNavigate();
  // OPRAVA #1: Správne destructuring z useUserStats
  const { userStats, dataManager, userId, logout } = useUserStats();
  const [missions, setMissions] = useState([]);
  const [modal, setModal] = useState({ open: false, type: '' });
  const isAdmin = dataManager.isAdmin(userId);

  // OPRAVA #2: Jeden unified useEffect pre polling
  useEffect(() => {
    if (!userId) return;

    const handleStorage = (e) => {
      if (e.key === dataManager.centralStorageKey) {
        const central = dataManager.getAllParticipantsData();
        const p = central[userId] || {};
        setMissions(makeMissionList(p));
      }
    };

    const load = async () => {
      try {
        // Synchronizuj všetky dáta zo servera
        await dataManager.syncAllFromServer();
        const central = dataManager.getAllParticipantsData();
        const p = central[userId] || {};
        setMissions(makeMissionList(p));
      } catch (error) {
        console.warn('Sync failed, using local data:', error);
        const central = dataManager.getAllParticipantsData();
        const p = central[userId] || {};
        setMissions(makeMissionList(p));
      }
    };

    // Počiatočné načítanie
    load();

    // OPRAVA: Jeden interval namiesto dvoch - 5000ms namiesto 2000ms
    const interval = setInterval(load, 5000);
    window.addEventListener('storage', handleStorage);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorage);
    };
  }, [dataManager, userId]);

  // Redirectovanie ak nie je user
  useEffect(() => {
    if (!userId) {
      navigate('/instruction');
    }
  }, [userId, navigate]);

  // Inicializácia pri prvom načítaní
  useEffect(() => {
    if (userId) {
      const loadInitial = async () => {
        try {
          const p = await dataManager.loadUserProgress(userId);
          setMissions(makeMissionList(p));
        } catch (error) {
          console.warn('Failed to load initial data:', error);
          const central = dataManager.getAllParticipantsData();
          const p = central[userId] || {};
          setMissions(makeMissionList(p));
        }
      };
      loadInitial();
    }
  }, [dataManager, userId]);

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

  const handleUnlock = async (id) => {
    try {
      await dataManager.unlockMissionForAll(id);
      const central = dataManager.getAllParticipantsData();
      const p = central[userId] || {};
      setMissions(makeMissionList(p));
    } catch (error) {
      console.error('Unlock error:', error);
    }
  };

  const handleLock = async (id) => {
    try {
      await dataManager.lockMissionForAll(id);
      const central = dataManager.getAllParticipantsData();
      const p = central[userId] || {};
      setMissions(makeMissionList(p));
    } catch (error) {
      console.error('Lock error:', error);
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
          <Title>Conspiracy Pass</Title>
          <Subtitle>Staňte sa detektívom a odhaľte pravdu</Subtitle>
          <StatsCard>
            <StatItem>
              {/* OPRAVA #3: Použitie userStats.points namiesto totalPoints */}
              <StatValue>{userStats.points}</StatValue>
              <StatLabel>Body</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>{missions.filter(m => m.completed).length}/4</StatValue>
              <StatLabel>Dokončené</StatLabel>
            </StatItem>
          </StatsCard>
        </Header>

        <MissionsGrid>
          {missions.map(m => (
            <MissionCard
              key={m.id}
              locked={m.locked}
              completed={m.completed}
              onClick={() => handleMissionClick(m)}
            >
              {isAdmin && (
                <AdminButtons>
                  <AdminButton
                    unlock
                    onClick={e => {
                      e.stopPropagation();
                      handleUnlock(m.id);
                    }}
                  >
                    🔓
                  </AdminButton>
                  <AdminButton
                    onClick={e => {
                      e.stopPropagation();
                      handleLock(m.id);
                    }}
                  >
                    🔒
                  </AdminButton>
                </AdminButtons>
              )}
              <MissionNumber>Misia {m.id}</MissionNumber>
              <MissionTitle>{m.title}</MissionTitle>
              <MissionStatus completed={m.completed}>
                {m.locked ? '🔒 Uzamknuté' : m.completed ? '✓ Dokončené' : '→ Začať'}
              </MissionStatus>
            </MissionCard>
          ))}
        </MissionsGrid>

        <ButtonGroup>
          <IconButton onClick={() => openModal('help')}>❓ Pomoc</IconButton>
          <IconButton onClick={() => openModal('contest')}>🎁 Súťaž o ceny</IconButton>
          {isAdmin && <IconButton onClick={handleExport}>📤 Exportovať dáta</IconButton>}
          {isAdmin && <IconButton onClick={() => navigate('/admin')}>⚙️ Admin</IconButton>}
          <IconButton onClick={handleLogout}>🔒 Odhlásiť sa</IconButton>
        </ButtonGroup>

        {modal.open && (
          <ModalOverlay onClick={closeModal}>
            <ModalContent onClick={e => e.stopPropagation()}>
              <CloseButton onClick={closeModal}>×</CloseButton>
              {modal.type === 'help' && (
                <>
                  <h3>Pomoc</h3>
                  <p>Kontakt: support@example.com</p>
                </>
              )}
              {modal.type === 'contest' && (
                <>
                  <h3>Súťaž o ceny</h3>
                  <p>1.p.: iPad; 2.p.: slúchadlá; 3.p.: poukážka 50€</p>
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