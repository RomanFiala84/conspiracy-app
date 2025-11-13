// src/components/admin/AdminPanel.js

import React, { useState, useEffect, useCallback } from 'react';
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

const SectionTitle = styled.h2`
  color: ${p => p.theme.ACCENT_COLOR};
  margin-bottom: 16px;
  font-size: 18px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 16px;
`;

const InfoText = styled.p`
  color: ${p => p.theme.SECONDARY_TEXT_COLOR};
  margin-bottom: 12px;
  font-size: 14px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  margin-top: 16px;
`;

const StatCard = styled.div`
  background: ${p => p.theme.HOVER_OVERLAY};
  padding: 12px;
  border-radius: 4px;
`;

const StatLabel = styled.div`
  color: ${p => p.theme.SECONDARY_TEXT_COLOR};
  font-size: 12px;
  margin-bottom: 4px;
`;

const StatValue = styled.div`
  color: ${p => p.theme.PRIMARY_TEXT_COLOR};
  font-size: 20px;
  font-weight: 600;
`;

const AdminPanel = () => {
  const navigate = useNavigate();
  const { dataManager, userId } = useUserStats();

  const [stats, setStats] = useState({
    total: 0,
    group0: 0,
    group1: 0,
    group2: 0,
    mission0Complete: 0,
    mission1Complete: 0,
    mission2Complete: 0,
    mission3Complete: 0
  });

  const loadStats = useCallback(() => {
    const allData = dataManager.getAllParticipantsData();
    const participants = Object.values(allData);

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
  }, [dataManager]);

  useEffect(() => {
    if (!dataManager.isAdmin(userId)) {
      navigate('/');
      return;
    }
    loadStats();
  }, [userId, dataManager, navigate, loadStats]);

  const handleExportExcel = () => {
    const allData = dataManager.getAllParticipantsData();
    const participants = Object.values(allData);

    if (participants.length === 0) {
      alert('Žiadne dáta na export');
      return;
    }

    const allComponentIds = new Set();
    const questionIdsByComponent = {};

    participants.forEach(p => {
      if (p.responses) {
        Object.entries(p.responses).forEach(([componentId, componentData]) => {
          allComponentIds.add(componentId);
          if (!questionIdsByComponent[componentId]) {
            questionIdsByComponent[componentId] = new Set();
          }
          if (componentData.answers) {
            Object.keys(componentData.answers).forEach(qId => {
              questionIdsByComponent[componentId].add(qId);
            });
          }
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
          questionIds.forEach(qId => {
            const columnName = `${componentId}__${qId}`;
            row[columnName] = componentData.answers?.[qId] ?? '';
          });

          if (componentData.metadata) {
            row[`${componentId}__started_at`] = componentData.metadata.started_at || '';
            row[`${componentId}__completed_at`] = componentData.metadata.completed_at || '';
            row[`${componentId}__time_spent_seconds`] = componentData.metadata.time_spent_seconds || '';
            row[`${componentId}__device`] = componentData.metadata.device || '';
          }
        } else {
          const questionIds = questionIdsByComponent[componentId];
          if (questionIds) {
            questionIds.forEach(qId => {
              row[`${componentId}__${qId}`] = '';
            });
          }
        }
      });
      return row;
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    
    if (rows.length > 0) {
      const colWidths = [];
      const headers = Object.keys(rows[0]);
      headers.forEach((header, i) => {
        const maxLen = Math.max(
          header.length,
          ...rows.map(row => String(row[header] || '').length)
        );
        colWidths[i] = { wch: Math.min(maxLen + 2, 50) };
      });
      ws['!cols'] = colWidths;
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'All Data');
    const filename = `conspiracy_export_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, filename);
    alert(`Export úspešný! (${rows.length} účastníkov)`);
  };

  const handleUnlockMission = async (missionId) => {
    if (!window.confirm(`Odomknúť misiu ${missionId} pre všetkých?`)) return;
    try {
      await dataManager.unlockMissionForAll(missionId);
      alert(`Misia ${missionId} odomknutá!`);
      loadStats();
    } catch (error) {
      alert(`Chyba: ${error.message}`);
    }
  };

  const handleLockMission = async (missionId) => {
    if (!window.confirm(`Zamknúť misiu ${missionId} pre všetkých?`)) return;
    try {
      await dataManager.lockMissionForAll(missionId);
      alert(`Misia ${missionId} zamknutá!`);
      loadStats();
    } catch (error) {
      alert(`Chyba: ${error.message}`);
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('⚠️ VYMAZAŤ VŠETKÝCH ÚČASTNÍKOV? Táto akcia je nevratná!')) return;
    if (!window.confirm('Ste si istý? Všetky dáta budú natrvalo vymazané!')) return;

    try {
      const response = await fetch('/api/progress?code=all', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminCode: 'RF9846' })
      });

      if (response.ok) {
        dataManager.clearAllData();
        alert('✅ Všetky dáta vymazané!');
        loadStats();
      } else {
        alert('Chyba pri mazaní dát');
      }
    } catch (error) {
      alert(`Chyba: ${error.message}`);
    }
  };

  return (
    <Layout>
      <Container>
        <Title>Admin Panel</Title>

        {/* Štatistiky */}
        <Section>
          <SectionTitle>📊 Štatistiky</SectionTitle>
          <StatsGrid>
            <StatCard>
              <StatLabel>Celkom účastníkov</StatLabel>
              <StatValue>{stats.total}</StatValue>
            </StatCard>
            <StatCard>
              <StatLabel>Skupina 0 (Control)</StatLabel>
              <StatValue>{stats.group0}</StatValue>
            </StatCard>
            <StatCard>
              <StatLabel>Skupina 1 (Intervention)</StatLabel>
              <StatValue>{stats.group1}</StatValue>
            </StatCard>
            <StatCard>
              <StatLabel>Skupina 2 (Prevention)</StatLabel>
              <StatValue>{stats.group2}</StatValue>
            </StatCard>
            <StatCard>
              <StatLabel>Mission 0 Complete</StatLabel>
              <StatValue>{stats.mission0Complete}</StatValue>
            </StatCard>
            <StatCard>
              <StatLabel>Mission 1 Complete</StatLabel>
              <StatValue>{stats.mission1Complete}</StatValue>
            </StatCard>
            <StatCard>
              <StatLabel>Mission 2 Complete</StatLabel>
              <StatValue>{stats.mission2Complete}</StatValue>
            </StatCard>
            <StatCard>
              <StatLabel>Mission 3 Complete</StatLabel>
              <StatValue>{stats.mission3Complete}</StatValue>
            </StatCard>
          </StatsGrid>
        </Section>

        {/* Export */}
        <Section>
          <SectionTitle>💾 Export dát</SectionTitle>
          <InfoText>
            Export obsahuje všetky odpovede, metadata a progress informácie.
          </InfoText>
          <ButtonGroup>
            <StyledButton accent onClick={handleExportExcel}>
              📥 Export do Excel (.xlsx)
            </StyledButton>
          </ButtonGroup>
        </Section>

        {/* Misie */}
        <Section>
          <SectionTitle>🔓 Správa misií</SectionTitle>
          <InfoText>Odomknúť/zamknúť misie pre všetkých účastníkov.</InfoText>

          {[0, 1, 2, 3].map(missionId => (
            <ButtonGroup key={missionId}>
              <StyledButton onClick={() => handleUnlockMission(missionId)}>
                🔓 Odomknúť misiu {missionId}
              </StyledButton>
              <StyledButton onClick={() => handleLockMission(missionId)}>
                🔒 Zamknúť misiu {missionId}
              </StyledButton>
            </ButtonGroup>
          ))}
        </Section>

        {/* Danger Zone */}
        <Section>
          <SectionTitle style={{ color: '#d9534f' }}>⚠️ Danger Zone</SectionTitle>
          <InfoText>Tieto akcie sú nevratné!</InfoText>
          <ButtonGroup>
            <StyledButton 
              onClick={handleDeleteAll}
              style={{ background: '#d9534f' }}
            >
              🗑️ Vymazať všetkých účastníkov
            </StyledButton>
          </ButtonGroup>
        </Section>

        <ButtonGroup>
          <StyledButton onClick={() => navigate('/mainmenu')}>
            ← Späť na hlavné menu
          </StyledButton>
        </ButtonGroup>
      </Container>
    </Layout>
  );
};

export default AdminPanel;