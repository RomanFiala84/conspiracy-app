import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Layout from '../../styles/Layout';
import StyledButton from '../../styles/StyledButton';
import { useUserStats } from '../../contexts/UserStatsContext';
import * as XLSX from 'xlsx';

const Container = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled.h1`
  color: ${p => p.theme.PRIMARY_TEXT_COLOR};
  margin-bottom: 24px;
`;

const Section = styled.div`
  background: ${p => p.theme.CARD_BACKGROUND};
  border: 1px solid ${p => p.theme.BORDER_COLOR};
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
`;

const UserTable = styled.table`
  width: 100%;
  margin-top: 10px;
  border-collapse: collapse;
  font-size: 15px;
  background: #fff8;
`;

const Th = styled.th`
  padding: 6px 10px;
  background: #e6e7ee;
  color: #222;
  border: 1px solid #e5e5e5;
`;

const Td = styled.td`
  padding: 6px 10px;
  border: 1px solid #e5e5e5;
`;

const AdminPanel = () => {
  const navigate = useNavigate();
  const { dataManager, userId } = useUserStats();

  const [stats, setStats] = useState({
    total: 0, group0: 0, group1: 0, group2: 0,
    mission0Complete: 0, mission1Complete: 0, mission2Complete: 0, mission3Complete: 0
  });
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (!dataManager.isAdmin(userId)) {
      navigate('/');
      return;
    }
    (async () => {
      setLoading(true);
      await dataManager.fetchAllParticipantsData();
      const all = dataManager.getAllParticipantsData();
      const participants = Object.values(all);
      setAllUsers(participants);
      setStats({
        total: participants.length,
        group0: participants.filter(p => p.group_assignment === '0').length,
        group1: participants.filter(p => p.group_assignment === '1').length,
        group2: participants.filter(p => p.group_assignment === '2').length,
        mission0Complete: participants.filter(p => p.mission0_completed).length,
        mission1Complete: participants.filter(p => p.mission1_completed).length,
        mission2Complete: participants.filter(p => p.mission2_completed).length,
        mission3Complete: participants.filter(p => p.mission3_completed).length
      });
      setLoading(false);
    })();
  }, [userId, dataManager, navigate]);

  const handleExportExcel = async () => {
    setIsExporting(true);
    await dataManager.fetchAllParticipantsData();
    const allData = dataManager.getAllParticipantsData();
    const participants = Object.values(allData);
    if (participants.length === 0) {
      alert('Žiadne dáta na export');
      setIsExporting(false);
      return;
    }
    // Build rows as before
    const allComponentIds = new Set();
    const questionIdsByComponent = {};
    participants.forEach(p => {
      if (p.responses) {
        Object.entries(p.responses).forEach(([componentId, componentData]) => {
          allComponentIds.add(componentId);
          if (!questionIdsByComponent[componentId]) questionIdsByComponent[componentId] = new Set();
          if (componentData.answers) Object.keys(componentData.answers).forEach(qId => questionIdsByComponent[componentId].add(qId));
        });
      }
    });
    const rows = participants.map(p => {
      const row = {
        participant_code: p.participant_code || '',
        group_assignment: p.group_assignment || '',
        sharing_code: p.sharing_code || '',
        referral_code: p.referral_code || '',
        timestamp_start: p.timestamp_start || '',
        timestamp_last_update: p.timestamp_last_update || '',
        user_stats_points: p.user_stats_points || 0,
        user_stats_level: p.user_stats_level || 1,
        mission0_completed: p.mission0_completed || false,
        mission1_completed: p.mission1_completed || false,
        mission2_completed: p.mission2_completed || false,
        mission3_completed: p.mission3_completed || false,
        instruction_completed: p.instruction_completed || false,
        intro_completed: p.intro_completed || false
      };
      allComponentIds.forEach(componentId => {
        const componentData = p.responses?.[componentId];
        if (componentData) {
          const questionIds = questionIdsByComponent[componentId];
          questionIds.forEach(qId => { row[`${componentId}__${qId}`] = componentData.answers?.[qId] ?? ''; });
          if (componentData.metadata) {
            row[`${componentId}__started_at`] = componentData.metadata.started_at || '';
            row[`${componentId}__completed_at`] = componentData.metadata.completed_at || '';
            row[`${componentId}__time_spent_seconds`] = componentData.metadata.time_spent_seconds || '';
            row[`${componentId}__device`] = componentData.metadata.device || '';
          }
        } else {
          const questionIds = questionIdsByComponent[componentId];
          if (questionIds) questionIds.forEach(qId => { row[`${componentId}__${qId}`] = ''; });
        }
      });
      return row;
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    if (rows.length > 0) {
      const colWidths = [], headers = Object.keys(rows[0]);
      headers.forEach((header, i) => {
        const maxLen = Math.max(header.length, ...rows.map(row => String(row[header] || '').length));
        colWidths[i] = { wch: Math.min(maxLen + 2, 50) };
      });
      ws['!cols'] = colWidths;
    }
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'All Data');
    XLSX.writeFile(wb, `conspiracy_export_${new Date().toISOString().slice(0, 10)}.xlsx`);
    setIsExporting(false);
  };

  return (
    <Layout>
      <Container>
        <Title>Admin Panel</Title>

        <Section>
          <h2>📊 Štatistiky</h2>
          {loading ? "Načítam..." :
          <div>
            <div>Celkom účastníkov: <b>{stats.total}</b></div>
            <div>Skupina 0: {stats.group0} | Skupina 1: {stats.group1} | Skupina 2: {stats.group2}</div>
            <div>Misia 0: {stats.mission0Complete} | Misia 1: {stats.mission1Complete} | Misia 2: {stats.mission2Complete} | Misia 3: {stats.mission3Complete}</div>
          </div>}
        </Section>

        <Section>
          <h2>👥 Prehľad účastníkov</h2>
          {loading
            ? <div>Načítam údaje...</div>
            : <UserTable>
              <thead>
                <tr>
                  <Th>Kód</Th>
                  <Th>Skupina</Th>
                  <Th>Body</Th>
                  <Th>Misia0</Th>
                  <Th>Misia1</Th>
                  <Th>Misia2</Th>
                  <Th>Misia3</Th>
                  <Th>Registrovaný</Th>
                  <Th>Posledná aktivita</Th>
                </tr>
              </thead>
              <tbody>
                {allUsers.map(u => (
                  <tr key={u.participant_code}>
                    <Td>{u.participant_code}</Td>
                    <Td>{u.group_assignment}</Td>
                    <Td>{u.user_stats_points || 0}</Td>
                    <Td>{u.mission0_completed ? '✔' : '-'}</Td>
                    <Td>{u.mission1_completed ? '✔' : '-'}</Td>
                    <Td>{u.mission2_completed ? '✔' : '-'}</Td>
                    <Td>{u.mission3_completed ? '✔' : '-'}</Td>
                    <Td style={{ fontSize: 13 }}>{u.timestamp_start?.slice(0,10)}</Td>
                    <Td style={{ fontSize: 13 }}>{u.timestamp_last_update?.slice(0,16)?.replace('T', ' ')}</Td>
                  </tr>
                ))}
              </tbody>
            </UserTable>
          }
        </Section>

        <Section>
          <h2>💾 Export dát</h2>
          <StyledButton accent onClick={handleExportExcel} disabled={isExporting}>
            {isExporting ? '⏳ Exportujem...' : '📥 Export do Excelu'}
          </StyledButton>
        </Section>
      </Container>
    </Layout>
  );
};

export default AdminPanel;
