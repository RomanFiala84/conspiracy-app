import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Layout from '../../styles/Layout';
import { useUserStats } from '../../contexts/UserStatsContext';

const Container = styled.div`
  padding: 20px;
  max-width: 1200px;
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

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  background: ${p => p.theme.CARD_BACKGROUND};
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Th = styled.th`
  border: 1px solid ${p => p.theme.BORDER_COLOR};
  padding: 12px 8px;
  background: ${p => p.theme.ACCENT_COLOR};
  color: #fff;
  font-weight: 600;
  text-align: center;
  font-size: 14px;
`;

const Td = styled.td`
  border: 1px solid ${p => p.theme.BORDER_COLOR};
  padding: 8px;
  text-align: center;
  color: ${p => p.theme.PRIMARY_TEXT_COLOR};
  font-size: 13px;
`;

const StatusBadge = styled.span`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  background: ${p => p.active ? p.theme.ACCENT_COLOR_3 : p.theme.ACCENT_COLOR_2};
  color: #fff;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 20px;
`;

const Button = styled.button`
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

const StatsCard = styled.div`
  background: ${p => p.theme.CARD_BACKGROUND};
  border: 1px solid ${p => p.theme.BORDER_COLOR};
  border-radius: 8px;
  padding: 16px;
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
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

export default function AdminPanel() {
  const navigate = useNavigate();
  const { dataManager, userId } = useUserStats();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (!dataManager.isAdmin(userId)) {
      navigate('/mainmenu');
      return;
    }

    const loadUsers = () => {
      const all = dataManager.getAllParticipantsData();
      const userList = Object.values(all).map(user => ({
        ...user,
        isActive: user.instruction_completed && user.timestamp_last_update,
        lastActivity: user.timestamp_last_update ? new Date(user.timestamp_last_update).toLocaleDateString('sk-SK') : '—'
      }));
      setUsers(userList);
    };

    loadUsers();
    const interval = setInterval(loadUsers, 30000);
    return () => clearInterval(interval);
  }, [dataManager, userId, navigate]);

  useEffect(() => {
    const load = () => {
      const all = dataManager.getAllParticipantsData();
      const userList = Object.values(all).map(user => ({
        ...user,
        isActive: user.instruction_completed && user.timestamp_last_update,
        lastActivity: user.timestamp_last_update ? new Date(user.timestamp_last_update).toLocaleDateString('sk-SK') : '—'
      }));
      setUsers(userList);
    };
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [dataManager]);

  const handleExport = () => {
    dataManager.exportAllParticipantsCSV();
  };

  const handleClearAllData = async () => {
    if (!window.confirm('⚠️ Naozaj chceš nenávratne vymazať všetky dáta zo systému aj zo servera?')) return;

    try {
      localStorage.clear();
      sessionStorage.clear();

      await fetch('/api/progress?code=all', { method: 'DELETE' }).catch(() => {});

      alert('✅ Všetky dáta boli úspešne vymazané.');
      setUsers([]);
    } catch (err) {
      console.error('❌ Chyba pri mazaní dát:', err);
      alert('❌ Chyba pri mazaní dát.');
    }
  };

  const activeUsers = users.filter(u => u.isActive).length;
  const totalUsers = users.length;
  const completedMissions = users.reduce((acc, u) => {
    return acc + [u.mission0_completed, u.mission1_completed, u.mission2_completed, u.mission3_completed].filter(Boolean).length;
  }, 0);

  return (
    <Layout>
      <Container>
        <Header>
          <Title>⚙️ Admin Panel</Title>
          <Subtitle>Správa používateľov a misií</Subtitle>

          <StatsCard>
            <StatItem>
              <StatValue>{totalUsers}</StatValue>
              <StatLabel>Celkom používateľov</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>{activeUsers}</StatValue>
              <StatLabel>Aktívni používatelia</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>{completedMissions}</StatValue>
              <StatLabel>Dokončené misie</StatLabel>
            </StatItem>
          </StatsCard>
        </Header>

        <ButtonGroup>
          <Button onClick={handleExport}>📤 Exportovať všetky dáta</Button>
          <Button onClick={handleClearAllData}>🗑️ Vymazať všetky dáta</Button>
          <Button onClick={() => navigate('/mainmenu')}>🏠 Späť na menu</Button>
        </ButtonGroup>

        <Table>
          <thead>
            <tr>
              <Th>Kód účastníka</Th>
              <Th>Sharing kód</Th>
              <Th>Referral kód</Th>
              <Th>Skupina</Th>
              <Th>Referrals</Th>
              <Th>Status</Th>
              <Th>Posledná aktivita</Th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <Td colSpan="7">Žiadni registrovaní používatelia</Td>
              </tr>
            ) : (
              users.map(user => (
                <tr key={user.participant_code}>
                  <Td><strong>{user.participant_code}</strong></Td>
                  <Td>{user.sharing_code}</Td>
                  <Td>{user.referral_code || '—'}</Td>
                  <Td>Skupina {user.group_assignment}</Td>
                  <Td>{user.referrals_count || 0}</Td>
                  <Td>
                    <StatusBadge active={user.isActive}>
                      {user.isActive ? 'Aktívny' : 'Neaktívny'}
                    </StatusBadge>
                  </Td>
                  <Td>{user.lastActivity}</Td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Container>
    </Layout>
  );
}
