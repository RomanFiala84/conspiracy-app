// src/components/admin/AdminPanel.js

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate }      from 'react-router-dom';
import styled               from 'styled-components';
import Layout               from '../../styles/Layout';
import StyledButton         from '../../styles/StyledButton';
import { useUserStats }     from '../../contexts/UserStatsContext';
import * as XLSX            from 'xlsx';

// =====================
// STYLED COMPONENTS
// =====================

const Container = styled.div`
  padding: 16px;
  max-width: 1200px;
  margin: 0 auto;
  @media (max-width: 768px) { padding: 12px; }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
`;

const Title = styled.h1`
  color: ${p => p.theme.PRIMARY_TEXT_COLOR};
  font-size: 25px;
  margin: 0;
  font-weight: 700;
  @media (max-width: 768px) { font-size: 25px; }
`;

const RefreshButton = styled(StyledButton)`
  @media (max-width: 480px) { width: 100%; }
`;

const Section = styled.div`
  background: ${p => p.theme.CARD_BACKGROUND};
  border: 1px solid ${p => p.theme.BORDER_COLOR};
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  @media (max-width: 768px) { padding: 12px; margin-bottom: 12px; }
`;

const SectionTitle = styled.h2`
  color: ${p => p.theme.ACCENT_COLOR};
  margin: 0 0 12px 0;
  font-size: 15px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 12px;
  @media (max-width: 480px) {
    flex-direction: column;
    button { width: 100%; }
  }
`;

const InfoText = styled.p`
  color: ${p => p.theme.SECONDARY_TEXT_COLOR};
  margin: 0 0 12px 0;
  font-size: 15px;
  line-height: 1.5;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  gap: 8px;
  @media (max-width: 768px) { grid-template-columns: repeat(3, 1fr); }
  @media (max-width: 480px) { grid-template-columns: repeat(2, 1fr); }
`;

const StatCard = styled.div`
  background: ${p => p.theme.ACCENT_COLOR}11;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid ${p => p.theme.ACCENT_COLOR}45;
  text-align: center;
`;

const StatLabel = styled.div`
  color: ${p => p.theme.SECONDARY_TEXT_COLOR};
  font-size: 15px;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
`;

const StatValue = styled.div`
  color: ${p => p.theme.PRIMARY_TEXT_COLOR};
  font-size: 15px;
  font-weight: 700;
  @media (max-width: 768px) { font-size: 15px; }
`;

const TableWrapper = styled.div`
  overflow-x: auto;
  margin-top: 12px;
  border-radius: 6px;
  border: 1px solid ${p => p.theme.BORDER_COLOR};
  max-height: 500px;
  overflow-y: auto;
`;

const UserTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 15px;
  min-width: 1000px;
`;

const Th = styled.th`
  padding: 8px 6px;
  background: ${p => p.theme.ACCENT_COLOR};
  color: #FFFFFF;
  text-align: left;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 15px;
  letter-spacing: 0.3px;
  position: sticky;
  top: 0;
  z-index: 10;
  white-space: nowrap;
`;

const Td = styled.td`
  padding: 6px;
  border-bottom: 1px solid ${p => p.theme.BORDER_COLOR}45;
  color: ${p => p.theme.PRIMARY_TEXT_COLOR};
  background: ${p => p.blocked ? 'rgba(239, 68, 68, 0.08)' : 'transparent'};
  text-align: center;
  font-size: 15px;
  &:first-child {
    font-weight: 600;
    color: ${p => p.blocked ? '#ef4444' : p.theme.ACCENT_COLOR};
    text-align: left;
    font-size: 15px;
  }
`;

const BlockButton = styled(StyledButton)`
  font-size: 15px;
  padding: 3px 6px;
  min-width: 70px;
`;

const MissionToggleButton = styled.button`
  background: ${p =>
    p.completed ? '#10b98122' :
    p.unlocked  ? '#fbbf2422' :
    'transparent'
  };
  border: 1px solid ${p =>
    p.completed ? '#10b981' :
    p.unlocked  ? '#fbbf24' :
    p.theme.BORDER_COLOR
  };
  border-radius: 3px;
  padding: 2px 6px;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.15s ease;
  min-width: 28px;
  &:hover:not(:disabled) {
    background: ${p =>
      p.completed ? '#10b98133' :
      p.unlocked  ? '#fbbf2433' :
      p.theme.ACCENT_COLOR + '45'
    };
    transform: scale(1.08);
  }
  &:active  { transform: scale(0.95); }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
`;

const MissionRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  background: ${p => p.theme.INPUT_BACKGROUND}33;
  border-radius: 6px;
  margin-bottom: 8px;
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 6px;
  }
`;

const MissionLabel = styled.div`
  font-weight: 600;
  color: ${p => p.theme.PRIMARY_TEXT_COLOR};
  font-size: 15px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const MissionButtons = styled.div`
  display: flex;
  gap: 6px;
  @media (max-width: 768px) {
    width: 100%;
    button { flex: 1; }
  }
`;

const DangerSection = styled(Section)`
  border-color: #ef444466;
  background: ${p => p.theme.CARD_BACKGROUND};
`;

const DeleteRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  background: #ef44440a;
  border-radius: 6px;
  margin-bottom: 8px;
  border: 1px solid #ef444422;
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 6px;
  }
`;

const DeleteLabel = styled.div`
  font-weight: 600;
  color: #ef4444;
  font-size: 15px;
  display: flex;
  align-items: center;
  gap: 6px;
  span {
    font-size: 15px;
    color: ${p => p.theme.SECONDARY_TEXT_COLOR};
    font-weight: normal;
  }
`;

const LoadingOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(3px);
`;

const LoadingSpinner = styled.div`
  text-align: center;
  color: white;
  font-size: 15px;
  &::before {
    content: '⏳';
    display: block;
    font-size: 40px;
    margin-bottom: 12px;
    animation: spin 2s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
`;

const Divider = styled.hr`
  margin: 16px 0;
  border: none;
  border-top: 1px solid ${p => p.theme.BORDER_COLOR}44;
`;

// =====================
// ADMIN PANEL KOMPONENT
// =====================

const AdminPanel = () => {
  const navigate = useNavigate();
  const { dataManager, userId } = useUserStats();

  const [stats, setStats] = useState({
    total: 0, blocked: 0,
    group0: 0, group1: 0, group2: 0,
    versionA: 0, versionB: 0,
    mission0Complete: 0, mission1Complete: 0,
    mission2Complete: 0, mission3Complete: 0,
  });

  const [allUsers,    setAllUsers]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const loadStats = useCallback(async () => {
    setLoading(true);
    await dataManager.fetchAllParticipantsData();
    const participants = Object.values(dataManager.getAllParticipantsData());
    setAllUsers(participants);
    setStats({
      total:            participants.length,
      blocked:          participants.filter(p => p.blocked).length,
      group0:           participants.filter(p => p.group_assignment === '0').length,
      group1:           participants.filter(p => p.group_assignment === '1').length,
      group2:           participants.filter(p => p.group_assignment === '2').length,
      versionA:         participants.filter(p => p.question_version === 'A').length,
      versionB:         participants.filter(p => p.question_version === 'B').length,
      mission0Complete: participants.filter(p => p.mission0_completed).length,
      mission1Complete: participants.filter(p => p.mission1_completed).length,
      mission2Complete: participants.filter(p => p.mission2_completed).length,
      mission3Complete: participants.filter(p => p.mission3_completed).length,
    });
    setLoading(false);
  }, [dataManager]);

  useEffect(() => {
    if (!userId || !dataManager.isAdmin(userId)) {
      navigate('/instruction');
      return;
    }
    loadStats();
  }, [userId, dataManager, navigate, loadStats]);

  const handleToggleMissionForUser = async (participantCode, missionId, currentUnlockedState) => {
    const action = currentUnlockedState ? 'Zamknúť' : 'Odomknúť';
    const emoji  = currentUnlockedState ? '🔒' : '🔓';
    if (!window.confirm(`${emoji} ${action} Misiu ${missionId} pre ${participantCode}?`)) return;
    try {
      setLoading(true);
      if (currentUnlockedState) {
        await dataManager.lockMissionForUser(participantCode, missionId);
      } else {
        await dataManager.unlockMissionForUser(participantCode, missionId);
      }
      alert(`✅ Misia ${missionId} ${action === 'odomknúť' ? 'odomknutá' : 'zamknutá'} pre ${participantCode}!`);
      await loadStats();
    } catch (error) {
      alert(`❌ Chyba: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBlock = async (participantCode, currentBlockedState) => {
    const action = currentBlockedState ? 'odblokovať' : 'blokovať';
    if (!window.confirm(`${action} ${participantCode}?`)) return;
    try {
      await dataManager.setBlockedState(participantCode, !currentBlockedState);
      alert(`✅ ${currentBlockedState ? 'Odblokovaný' : 'Blokovaný'}!`);
      await loadStats();
    } catch (error) {
      alert(`❌ ${error.message}`);
    }
  };

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      await dataManager.fetchAllParticipantsData();
      const participants = Object.values(dataManager.getAllParticipantsData());
      if (participants.length === 0) { alert('Žiadne dáta'); return; }

      const allComponentIds        = new Set();
      const questionIdsByComponent = {};
      participants.forEach(p => {
        if (p.responses) {
          Object.entries(p.responses).forEach(([componentId, componentData]) => {
            allComponentIds.add(componentId);
            if (!questionIdsByComponent[componentId]) questionIdsByComponent[componentId] = new Set();
            if (componentData.answers) {
              Object.keys(componentData.answers).forEach(qId => questionIdsByComponent[componentId].add(qId));
            }
          });
        }
      });

      const rows = participants.map(p => {
        const missionPoints = p.user_stats_mission_points || 0;
        const bonusPoints   = (p.referrals_count || 0) * 10;
        const row = {
          'Kód účastníka':            p.participant_code || '',
          'Blokovaný':                p.blocked ? 'ÁNO' : 'NIE',
          'Blokovaný dňa':            p.blocked_at ? new Date(p.blocked_at).toLocaleString('sk-SK') : '',
          'Skupina':                  p.group_assignment || '',
          'Verzia otázok':            p.question_version || '',
          'Sharing kód':              p.sharing_code || '',
          'Použitý referral kód':     p.used_referral_code || '',
          'Odporučil ho':             p.referred_by || '',
          'Počet odporučení':         p.referrals_count || 0,
          'Odporučení používatelia':  (p.referred_users || []).join(', '),
          'Registrovaný':             p.timestamp_start ? new Date(p.timestamp_start).toLocaleString('sk-SK') : '',
          'Posledná aktualizácia':    p.timestamp_last_update ? new Date(p.timestamp_last_update).toLocaleString('sk-SK') : '',
          'Body za misie':            missionPoints,
          'Bonusové body':            bonusPoints,
          'Celkové body':             missionPoints + bonusPoints,
          'Level':                    p.user_stats_level || 1,
          'Inštrukcie dokončené':     p.instruction_completed ? 'ÁNO' : 'NIE',
          'Intro dokončené':          p.intro_completed ? 'ÁNO' : 'NIE',
          'Návštevy hlavného menu':   p.mainmenu_visits || 0,
          'Misia 0 - Odomknutá':      p.mission0_unlocked ? 'ÁNO' : 'NIE',
          'Misia 0 - Dokončená':      p.mission0_completed ? 'ÁNO' : 'NIE',
          'Misia 1 - Odomknutá':      p.mission1_unlocked ? 'ÁNO' : 'NIE',
          'Misia 1 - Dokončená':      p.mission1_completed ? 'ÁNO' : 'NIE',
          'Misia 2 - Odomknutá':      p.mission2_unlocked ? 'ÁNO' : 'NIE',
          'Misia 2 - Dokončená':      p.mission2_completed ? 'ÁNO' : 'NIE',
          'Misia 3 - Odomknutá':      p.mission3_unlocked ? 'ÁNO' : 'NIE',
          'Misia 3 - Dokončená':      p.mission3_completed ? 'ÁNO' : 'NIE',
          'Všetky misie dokončené':   p.all_missions_completed ? 'ÁNO' : 'NIE',

                    // === SÚŤAŽ ===
          'Informed consent':                p.informedconsentgiven ? 'ÁNO' : 'NIE',
          'Súhlas so súťažou':               p.competitionconsentgiven ? 'ÁNO' : 'NIE',
          'Súťažný email':                   p.competitionemail || '',
          'Súťažný email pridaný dňa':       p.competitionemailaddedat ? new Date(p.competitionemailaddedat).toLocaleString('sk-SK') : '',

          // === OUTRO MISSION 0 — účasť na hlavnom výskume ===
          'Chce participovať (hlavný)':      p.wantstoparticipatemainstudy ? 'ÁNO' : 'NIE',
          'Participácia M0 odpoveď dňa':     p.participationresponsetimestamp ? new Date(p.participationresponsetimestamp).toLocaleString('sk-SK') : '',
          'Chce notifikáciu (M0)':           p.wantsnotification ? 'ÁNO' : 'NIE',
          'Notifikačný email (M0)':          p.notificationemail || '',
          'Email option (M0)':               p.notificationemailoption || '',

          // === OUTRO MISSION 2 — účasť na misii 3 ===
          'Chce participovať (M3)':          p.wantstoparticipatemission3 ? 'ÁNO' : 'NIE',
          'Participácia M3 odpoveď dňa':     p.participationmission3responsetimestamp ? new Date(p.participationmission3responsetimestamp).toLocaleString('sk-SK') : '',
          'Chce notifikáciu (M3)':           p.wantsnotificationmission3 ? 'ÁNO' : 'NIE',
          'Notifikačný email (M3)':          p.notificationmission3email || '',
          'Email option (M3)':               p.notificationmission3emailoption || '',

        };

        allComponentIds.forEach(componentId => {
          const componentData = p.responses?.[componentId];
          if (componentData) {
            questionIdsByComponent[componentId].forEach(qId => {
              const answer = componentData.answers?.[qId];
              row[`[${componentId}] ${qId}`] = Array.isArray(answer)
                ? answer.join('; ')
                : typeof answer === 'object' && answer !== null
                  ? JSON.stringify(answer)
                  : answer ?? '';
            });
            if (componentData.metadata) {
              row[`[${componentId}] Začiatok`]     = componentData.metadata.started_at   ? new Date(componentData.metadata.started_at).toLocaleString('sk-SK')   : '';
              row[`[${componentId}] Koniec`]        = componentData.metadata.completed_at ? new Date(componentData.metadata.completed_at).toLocaleString('sk-SK') : '';
              row[`[${componentId}] Čas (sekundy)`] = componentData.metadata.time_spent_seconds || '';
              row[`[${componentId}] Zariadenie`]    = componentData.metadata.device || '';
            }
          }
        });
        return row;
      });

      const ws = XLSX.utils.json_to_sheet(rows);
      if (rows.length > 0) {
        ws['!cols'] = Object.keys(rows[0]).map(h => ({ wch: Math.min(Math.max(h.length, ...rows.map(r => String(r[h] || '').length)) + 2, 50) }));
      }
      ws['!freeze'] = { xSplit: 1, ySplit: 1 };

      const summaryData = [
        ['=== ŠTATISTIKA ==='], [''],
        ['Štatistika',    'Hodnota'],
        ['Účastníci',     participants.length],
        ['Blokovaní',     participants.filter(p => p.blocked).length],
        ['Aktívni',       participants.filter(p => !p.blocked).length], [''],
        ['Skupina 0',     participants.filter(p => p.group_assignment === '0').length],
        ['Skupina 1',     participants.filter(p => p.group_assignment === '1').length],
        ['Skupina 2',     participants.filter(p => p.group_assignment === '2').length], [''],
        ['Verzia A',      participants.filter(p => p.question_version === 'A').length],
        ['Verzia B',      participants.filter(p => p.question_version === 'B').length], [''],
        ['M0 dokončená',  participants.filter(p => p.mission0_completed).length],
        ['M1 dokončená',  participants.filter(p => p.mission1_completed).length],
        ['M2 dokončená',  participants.filter(p => p.mission2_completed).length],
        ['M3 dokončená',  participants.filter(p => p.mission3_completed).length],
        ['Všetky misie',  participants.filter(p => p.all_missions_completed).length],
      ];

      const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
      wsSummary['!cols'] = [{ wch: 20 }, { wch: 12 }];

      const wb  = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws,        'Účastníci');
      XLSX.utils.book_append_sheet(wb, wsSummary, 'Súhrn');

      const now      = new Date();
      const filename = `export_${now.toISOString().slice(0, 10)}_${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}.xlsx`;
      XLSX.writeFile(wb, filename);
      alert(`✅ Export OK!\n\n📊 ${rows.length} účastníkov\n📝 ${allComponentIds.size} komponentov`);

    } catch (error) {
      alert(`❌ ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleUnlockMission = async (missionId) => {
    if (!window.confirm(`Odomknúť M${missionId} pre všetkých?`)) return;
    try {
      await dataManager.unlockMissionForAll(missionId);
      alert(`✅ M${missionId} odomknutá!`);
      await loadStats();
    } catch (error) { alert(`❌ ${error.message}`); }
  };

  const handleLockMission = async (missionId) => {
    if (!window.confirm(`Zamknúť M${missionId} pre všetkých?`)) return;
    try {
      await dataManager.lockMissionForAll(missionId);
      alert(`✅ M${missionId} zamknutá!`);
      await loadStats();
    } catch (error) { alert(`❌ ${error.message}`); }
  };

  const handleDeleteProgress = async () => {
    if (!window.confirm('⚠️ VYMAZAŤ PROGRESS DB?')) return;
    if (!window.confirm('Naozaj? Nevratné!')) return;
    try {
      const res = await fetch('/api/progress?code=all', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminCode: process.env.REACT_APP_ADMIN_CODE })
      });
      if (res.ok) { dataManager.clearAllData(); alert('✅ Vymazané!'); await loadStats(); }
      else { const e = await res.json(); alert(`❌ ${e.error || res.statusText}`); }
    } catch (error) { alert(`❌ ${error.message}`); }
  };

  const handleDeleteResponses = async () => {
    if (!window.confirm('⚠️ VYMAZAŤ RESPONSES DB?')) return;
    if (!window.confirm('Naozaj? Nevratné!')) return;
    try {
      const res = await fetch('/api/responses', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminCode: process.env.REACT_APP_ADMIN_CODE })
      });
      if (res.ok) { alert('✅ Vymazané!'); }
      else { const e = await res.json(); alert(`❌ ${e.error || res.statusText}`); }
    } catch (error) { alert(`❌ ${error.message}`); }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('⚠️ VYMAZAŤ VŠETKY DB?')) return;
    if (!window.confirm('ABSOLÚTNE istý? NEVRATNÉ!')) return;
    if (!window.confirm('POSLEDNÉ VAROVANIE!')) return;
    setLoading(true);
    try {
      await fetch('/api/progress?code=all', {
        method: 'DELETE', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminCode: process.env.REACT_APP_ADMIN_CODE })

      });
      await fetch('/api/responses', {
        method: 'DELETE', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminCode: process.env.REACT_APP_ADMIN_CODE })
      });
      dataManager.clearAllData();
      alert('✅ Všetko vymazané!');
      await loadStats();
    } catch (error) { alert(`❌ ${error.message}`); }
    finally { setLoading(false); }
  };

  if (loading && allUsers.length === 0) {
    return (
      <Layout showLevelDisplay={false}>
        <LoadingOverlay><LoadingSpinner>Načítavam...</LoadingSpinner></LoadingOverlay>
      </Layout>
    );
  }

  return (
    <Layout showLevelDisplay={false}>
      <Container>

        <Header>
          <Title>⚙️ Admin Panel</Title>
          <RefreshButton variant="accent" size="small" onClick={loadStats}>
            🔄 Obnoviť
          </RefreshButton>
        </Header>

        {/* STATS */}
        <Section>
          <SectionTitle>📊 Štatistiky</SectionTitle>
          <StatsGrid>
            <StatCard><StatLabel>Celkom</StatLabel><StatValue>{stats.total}</StatValue></StatCard>
            <StatCard><StatLabel>Blokovaní</StatLabel><StatValue style={{ color: '#ef4444' }}>{stats.blocked}</StatValue></StatCard>
            <StatCard><StatLabel>Sk 0</StatLabel><StatValue>{stats.group0}</StatValue></StatCard>
            <StatCard><StatLabel>Sk 1</StatLabel><StatValue>{stats.group1}</StatValue></StatCard>
            <StatCard><StatLabel>Sk 2</StatLabel><StatValue>{stats.group2}</StatValue></StatCard>
            <StatCard><StatLabel>Ver A</StatLabel><StatValue>{stats.versionA}</StatValue></StatCard>
            <StatCard><StatLabel>Ver B</StatLabel><StatValue>{stats.versionB}</StatValue></StatCard>
            <StatCard><StatLabel>M0</StatLabel><StatValue>{stats.mission0Complete}</StatValue></StatCard>
            <StatCard><StatLabel>M1</StatLabel><StatValue>{stats.mission1Complete}</StatValue></StatCard>
            <StatCard><StatLabel>M2</StatLabel><StatValue>{stats.mission2Complete}</StatValue></StatCard>
            <StatCard><StatLabel>M3</StatLabel><StatValue>{stats.mission3Complete}</StatValue></StatCard>
          </StatsGrid>
        </Section>

        {/* EXPORT */}
        <Section>
          <SectionTitle>💾 Export</SectionTitle>
          <InfoText>Export všetkých dát</InfoText>
          <StyledButton
            variant="success"
            fullWidth
            loading={isExporting}
            onClick={handleExportExcel}
          >
            {isExporting ? 'Exportujem...' : '📥 Export Excel'}
          </StyledButton>
        </Section>

        {/* MISSIONS */}
        <Section>
          <SectionTitle>Kontrola misií (globálne)</SectionTitle>
          <InfoText>Odomknúť alebo zamknúť pre všetkých.</InfoText>
          {[0, 1, 2, 3].map(missionId => (
            <MissionRow key={missionId}>
              <MissionLabel>M{missionId}</MissionLabel>
              <MissionButtons>
                <StyledButton variant="success" size="small" onClick={() => handleUnlockMission(missionId)}>🔓</StyledButton>
                <StyledButton variant="outline"  size="small" onClick={() => handleLockMission(missionId)}>🔒</StyledButton>
              </MissionButtons>
            </MissionRow>
          ))}
        </Section>

        {/* USER TABLE */}
        <Section>
          <SectionTitle>👥 Účastníci ({allUsers.length})</SectionTitle>
          <InfoText>Klikni 🔒 alebo 🔓 pre individuálnu správu misií. Dokončená misia = ✅.</InfoText>
          {allUsers.length === 0 ? (
            <InfoText>Žiadni účastníci.</InfoText>
          ) : (
            <TableWrapper>
              <UserTable>
                <thead>
                  <tr>
                    <Th>IDK</Th><Th>STAV</Th><Th>SKUPINA</Th><Th>VERZIA</Th><Th>BODY</Th><Th>BONUSOVE BODY</Th><Th>CELKOM BODOV</Th><Th>ZDIELANI</Th>
                    <Th>M0🔓</Th><Th>M0✅</Th><Th>M1🔓</Th><Th>M1✅</Th>
                    <Th>M2🔓</Th><Th>M2✅</Th><Th>M3🔓</Th><Th>M3✅</Th>
                    <Th>REGISTRACIA</Th><Th>AKCIA</Th>
                  </tr>
                </thead>
                <tbody>
                  {allUsers.map(u => {
                    const missionPoints = u.user_stats_mission_points || 0;
                    const bonusPoints   = (u.referrals_count || 0) * 10;
                    const isBlocked     = u.blocked || false;
                    return (
                      <tr key={u.participant_code}>
                        <Td blocked={isBlocked}>{u.participant_code}</Td>
                        <Td blocked={isBlocked}>{isBlocked ? '🚫' : '✅'}</Td>
                        <Td blocked={isBlocked}>{u.group_assignment}</Td>
                        <Td blocked={isBlocked}>{u.question_version || '—'}</Td>
                        <Td blocked={isBlocked}>{missionPoints}</Td>
                        <Td blocked={isBlocked}>{bonusPoints}</Td>
                        <Td blocked={isBlocked}><strong>{missionPoints + bonusPoints}</strong></Td>
                        <Td blocked={isBlocked}>{u.referrals_count || 0}</Td>

                        {[0, 1, 2, 3].map(missionId => (
                          <React.Fragment key={missionId}>
                            <Td blocked={isBlocked}>
                              <MissionToggleButton
                                unlocked={u[`mission${missionId}_unlocked`]}
                                completed={false}
                                onClick={() => handleToggleMissionForUser(u.participant_code, missionId, u[`mission${missionId}_unlocked`])}
                                disabled={isBlocked}
                                title={u[`mission${missionId}_unlocked`] ? `Zamknúť M${missionId}` : `Odomknúť M${missionId}`}
                              >
                                {u[`mission${missionId}_unlocked`] ? '🔓' : '🔒'}
                              </MissionToggleButton>
                            </Td>
                            <Td blocked={isBlocked}>
                              <span
                                style={{ fontSize: '16px', display: 'inline-block', opacity: u[`mission${missionId}_completed`] ? 1 : 0.3 }}
                                title={u[`mission${missionId}_completed`] ? `M${missionId} dokončená` : `M${missionId} nedokončená`}
                              >
                                {u[`mission${missionId}_completed`] ? '✅' : '⬜'}
                              </span>
                            </Td>
                          </React.Fragment>
                        ))}

                        <Td blocked={isBlocked}>{u.timestamp_start?.slice(0, 10)}</Td>
                        <Td blocked={isBlocked}>
                          <BlockButton
                            variant={isBlocked ? 'outline' : 'danger'}
                            size="small"
                            onClick={() => handleToggleBlock(u.participant_code, isBlocked)}
                          >
                            {isBlocked ? '✅' : '🚫'}
                          </BlockButton>
                        </Td>
                      </tr>
                    );
                  })}
                </tbody>
              </UserTable>
            </TableWrapper>
          )}
        </Section>

        {/* DANGER ZONE */}
        <DangerSection>
          <SectionTitle style={{ color: '#ef4444' }}>⚠️ Nebezpečná zóna</SectionTitle>
          <InfoText><strong>NEVRATNÉ AKCIE!!!</strong></InfoText>

          <DeleteRow>
            <DeleteLabel>Databáza respondentov <span>(users, progress)</span></DeleteLabel>
            <StyledButton variant="danger" size="small" onClick={handleDeleteProgress}>🗑️</StyledButton>
          </DeleteRow>

          <DeleteRow>
            <DeleteLabel>Databáza odpovedí <span>(answers)</span></DeleteLabel>
            <StyledButton variant="danger" size="small" onClick={handleDeleteResponses}>🗑️</StyledButton>
          </DeleteRow>

          <Divider />

          <DeleteRow style={{ borderColor: '#ef4444', borderWidth: '2px' }}>
            <DeleteLabel style={{ fontSize: '15px' }}>💥 VŠETKO <span>(Progress + Responses)</span></DeleteLabel>
            <StyledButton variant="danger" onClick={handleDeleteAll}>🔥 Vymazať všetko</StyledButton>
          </DeleteRow>
        </DangerSection>

        <ButtonGroup>
          <StyledButton variant="ghost" size="small" onClick={() => navigate('/mainmenu')}>
            ← Menu
          </StyledButton>
        </ButtonGroup>

      </Container>
    </Layout>
  );
};

export default AdminPanel;
