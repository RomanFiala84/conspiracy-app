// src/components/admin/AdminPanel.js
// FINÁLNA VERZIA - S template generation na fixné rozmery (1200×2000)

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Layout from '../../styles/Layout';
import StyledButton from '../../styles/StyledButton';
import { useUserStats } from '../../contexts/UserStatsContext';
import * as XLSX from 'xlsx';
import { generateAndUploadComponentTemplate } from '../../utils/trackingHelpers';

// Styled components (všetky zostávajú rovnaké)
const Container = styled.div`
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    padding: 15px;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  flex-wrap: wrap;
  gap: 16px;
`;

const Title = styled.h1`
  color: ${p => p.theme.PRIMARY_TEXT_COLOR};
  font-size: 32px;
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

const RefreshButton = styled(StyledButton)`
  @media (max-width: 480px) {
    width: 100%;
  }
`;

const GridLayout = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Section = styled.div`
  background: ${p => p.theme.CARD_BACKGROUND};
  border: 2px solid ${p => p.theme.BORDER_COLOR};
  border-radius: 12px;
  padding: 24px;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${p => p.theme.ACCENT_COLOR}44;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
  
  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const SectionTitle = styled.h2`
  color: ${p => p.theme.ACCENT_COLOR};
  margin-bottom: 20px;
  font-size: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  
  @media (max-width: 768px) {
    font-size: 18px;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 16px;
  
  @media (max-width: 480px) {
    flex-direction: column;
    
    button {
      width: 100%;
    }
  }
`;

const InfoText = styled.p`
  color: ${p => p.theme.SECONDARY_TEXT_COLOR};
  margin-bottom: 16px;
  font-size: 14px;
  line-height: 1.6;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  background: linear-gradient(135deg, 
    ${p => p.theme.ACCENT_COLOR}22, 
    ${p => p.theme.ACCENT_COLOR_2}22
  );
  padding: 16px;
  border-radius: 8px;
  border: 1px solid ${p => p.theme.ACCENT_COLOR}44;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px ${p => p.theme.ACCENT_COLOR}33;
  }
`;

const StatLabel = styled.div`
  color: ${p => p.theme.SECONDARY_TEXT_COLOR};
  font-size: 12px;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const StatValue = styled.div`
  color: ${p => p.theme.ACCENT_COLOR};
  font-size: 28px;
  font-weight: 700;
  
  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

const TableWrapper = styled.div`
  overflow-x: auto;
  margin-top: 16px;
  border-radius: 8px;
  border: 1px solid ${p => p.theme.BORDER_COLOR};
`;

const UserTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  min-width: 1000px;
`;

const Th = styled.th`
  padding: 12px 8px;
  background: ${p => p.theme.ACCENT_COLOR};
  color: #FFFFFF;
  text-align: left;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 11px;
  letter-spacing: 0.5px;
  position: sticky;
  top: 0;
  z-index: 10;
`;

const Td = styled.td`
  padding: 10px 8px;
  border-bottom: 1px solid ${p => p.theme.BORDER_COLOR};
  color: ${p => p.theme.PRIMARY_TEXT_COLOR};
  background: ${p => p.blocked ? 'rgba(239, 68, 68, 0.1)' : 'transparent'};
  
  &:first-child {
    font-weight: 600;
    color: ${p => p.blocked ? '#ef4444' : p.theme.ACCENT_COLOR};
  }
`;

const BlockButton = styled(StyledButton)`
  font-size: 11px;
  padding: 4px 8px;
  min-width: 80px;
`;

const MissionRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: ${p => p.theme.INPUT_BACKGROUND}44;
  border-radius: 8px;
  margin-bottom: 12px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
`;

const MissionLabel = styled.div`
  font-weight: 600;
  color: ${p => p.theme.PRIMARY_TEXT_COLOR};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const MissionButtons = styled.div`
  display: flex;
  gap: 8px;
  
  @media (max-width: 768px) {
    width: 100%;
    
    button {
      flex: 1;
    }
  }
`;

const DangerSection = styled(Section)`
  border-color: ${p => p.theme.ERROR_COLOR || '#ef4444'};
  background: ${p => `${p.theme.ERROR_COLOR || '#ef4444'}11`};
`;

const DeleteRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: ${p => p.theme.INPUT_BACKGROUND}44;
  border-radius: 8px;
  margin-bottom: 12px;
  border: 1px solid #ef444433;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
`;

const DeleteLabel = styled.div`
  font-weight: 600;
  color: #ef4444;
  display: flex;
  align-items: center;
  gap: 8px;
  
  span {
    font-size: 12px;
    color: ${p => p.theme.SECONDARY_TEXT_COLOR};
    font-weight: normal;
  }
`;

const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
`;

const LoadingSpinner = styled.div`
  text-align: center;
  color: white;
  font-size: 18px;
  
  &::before {
    content: '⏳';
    display: block;
    font-size: 48px;
    margin-bottom: 16px;
    animation: spin 2s linear infinite;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const TrackingSection = styled(Section)`
  background: linear-gradient(135deg, 
    ${p => p.theme.ACCENT_COLOR}11, 
    ${p => p.theme.ACCENT_COLOR_2}11
  );
  border-color: ${p => p.theme.ACCENT_COLOR}44;
`;

const TrackingGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin-top: 16px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const TrackingCard = styled.div`
  background: ${p => p.theme.CARD_BACKGROUND};
  border: 1px solid ${p => p.theme.BORDER_COLOR};
  border-radius: 8px;
  padding: 16px;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    border-color: ${p => p.theme.ACCENT_COLOR};
  }
`;

const TrackingTitle = styled.div`
  font-weight: 600;
  color: ${p => p.theme.PRIMARY_TEXT_COLOR};
  margin-bottom: 8px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const TrackingMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 12px;
  font-size: 12px;
  color: ${p => p.theme.SECONDARY_TEXT_COLOR};
`;

const TrackingBadge = styled.span`
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  background: ${p => {
    if (p.type === 'post') return p.theme.ACCENT_COLOR + '22';
    if (p.type === 'intervention') return '#00C85322';
    if (p.type === 'prevention') return '#FF980022';
    return '#99999922';
  }};
  color: ${p => {
    if (p.type === 'post') return p.theme.ACCENT_COLOR;
    if (p.type === 'intervention') return '#00C853';
    if (p.type === 'prevention') return '#FF9800';
    return '#999999';
  }};
`;

const ProgressText = styled.div`
  color: ${p => p.theme.PRIMARY_TEXT_COLOR};
  font-size: 14px;
  margin-top: 12px;
  padding: 12px;
  background: ${p => p.theme.ACCENT_COLOR}11;
  border-radius: 6px;
  font-weight: 500;
`;

// ADMIN PANEL KOMPONENT
const AdminPanel = () => {
  const navigate = useNavigate();
  const { dataManager, userId } = useUserStats();

  const [stats, setStats] = useState({
    total: 0,
    blocked: 0,
    group0: 0,
    group1: 0,
    group2: 0,
    mission0Complete: 0,
    mission1Complete: 0,
    mission2Complete: 0,
    mission3Complete: 0
  });

  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [trackingComponents, setTrackingComponents] = useState([]);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [generatingTemplates, setGeneratingTemplates] = useState(false);
  const [templateProgress, setTemplateProgress] = useState('');

  const loadStats = useCallback(async () => {
    setLoading(true);
    await dataManager.fetchAllParticipantsData();
    const all = dataManager.getAllParticipantsData();
    const participants = Object.values(all);
    
    setAllUsers(participants);
    setStats({
      total: participants.length,
      blocked: participants.filter(p => p.blocked).length,
      group0: participants.filter(p => p.group_assignment === '0').length,
      group1: participants.filter(p => p.group_assignment === '1').length,
      group2: participants.filter(p => p.group_assignment === '2').length,
      mission0Complete: participants.filter(p => p.mission0_completed).length,
      mission1Complete: participants.filter(p => p.mission1_completed).length,
      mission2Complete: participants.filter(p => p.mission2_completed).length,
      mission3Complete: participants.filter(p => p.mission3_completed).length
    });
    setLoading(false);
  }, [dataManager]);

  const loadTrackingComponents = useCallback(async () => {
    setTrackingLoading(true);
    try {
      const response = await fetch('/api/admin-tracking-components');
      const data = await response.json();

      if (data.success) {
        setTrackingComponents(data.components || []);
      } else {
        console.error('Failed to load tracking components:', data.message);
      }
    } catch (error) {
      console.error('Error loading tracking components:', error);
    } finally {
      setTrackingLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!dataManager.isAdmin(userId)) {
      navigate('/');
      return;
    }
    loadStats();
    loadTrackingComponents();
  }, [userId, dataManager, navigate, loadStats, loadTrackingComponents]);

  const handleOpenTracking = () => {
    navigate('/admin/tracking');
  };

  const formatTime = (ms) => {
    if (!ms) return '0s';
    return `${(ms / 1000).toFixed(1)}s`;
  };

    // ✅ FINÁLNA OPRAVENÁ VERZIA - Bez confirm dialógov, plne automatizovaná
  const handleGenerateTemplates = async () => {
    const confirmed = window.confirm(
      '📸 Vygenerovať component template screenshots?\n\n' +
      'Proces bude plne automatizovaný:\n' +
      '- Všetky templates budú mať šírku 1200px a dynamickú výšku\n' +
      '- Okná sa otvoria a zatvoria automaticky\n' +
      '- Počas procesu NEMANIPULUJTE s oknom\n\n' +
      'Komponenty na vygenerovanie:\n' +
      '• PostsA1, PostsB1 (Mission 1)\n' +
      '• PostsA2, PostsB2 (Mission 2)\n' +
      '• PostsA3, PostsB3 (Mission 3)\n\n' +
      'Pokračovať?'
    );

    if (!confirmed) return;

    setGeneratingTemplates(true);
    setTemplateProgress('Pripravujem generovanie templates...');

    // Definícia komponentov
    const components = [
      { id: 'postsA1_mission1', type: 'post', name: 'PostsA1', path: '/mission1/postsa' },
      { id: 'postsB1_mission1', type: 'post', name: 'PostsB1', path: '/mission1/postsb' },
      { id: 'postsA2_mission2', type: 'post', name: 'PostsA2', path: '/mission2/postsa' },
      { id: 'postsB2_mission2', type: 'post', name: 'PostsB2', path: '/mission2/postsb' },
      { id: 'postsA3_mission3', type: 'post', name: 'PostsA3', path: '/mission3/postsa' },
      { id: 'postsB3_mission3', type: 'post', name: 'PostsB3', path: '/mission3/postsb' },
    ];

    let successCount = 0;
    let failCount = 0;
    const results = [];

    try {
      for (let i = 0; i < components.length; i++) {
        const comp = components[i];
        setTemplateProgress(`📸 Spracúvam ${i + 1}/${components.length}: ${comp.name}...`);

        try {
          // ✅ Otvor popup okno (väčšie)
          const fullPath = `${window.location.origin}${comp.path}`;
          const newWindow = window.open(
            fullPath, 
            '_blank', 
            'width=1250,height=2500,scrollbars=yes,resizable=yes'
          );

          if (!newWindow) {
            throw new Error('Popup bolo zablokované! Povoľte popupy pre túto stránku.');
          }

          // ✅ Počkaj 10 sekúnd na úplné načítanie (dlhšie pre React komponenty)
          console.log(`⏳ Čakám 10s na načítanie ${comp.name}...`);
          await new Promise(resolve => setTimeout(resolve, 10000));

          // ✅ Scroll check (bez chýb)
          try {
            if (newWindow.document && newWindow.document.body) {
              const bodyHeight = newWindow.document.body.scrollHeight;
              console.log(`📏 Body height: ${bodyHeight}px`);
              
              if (bodyHeight > 0) {
                // Scroll nadol
                console.log('⬇️ Scrolling down...');
                newWindow.scrollTo(0, bodyHeight);
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                // Scroll späť na vrch
                console.log('⬆️ Scrolling back to top...');
                newWindow.scrollTo(0, 0);
                await new Promise(resolve => setTimeout(resolve, 1000));
              }
            }
          } catch (scrollError) {
            console.warn('⚠️ Scroll check failed:', scrollError);
          }

          // ✅ ŽIADNY window.confirm() - priamo urob screenshot
          console.log(`📸 Robím screenshot ${comp.name}...`);

          // Nájdi container v child okne
          const container = newWindow.document.querySelector('[class*="Container"]') || newWindow.document.body;
          
          if (!container) {
            throw new Error('Container element not found in popup');
          }

          console.log('📏 Container dimensions:', {
            scrollWidth: container.scrollWidth,
            scrollHeight: container.scrollHeight
          });

          // ✅ Použi helper funkciu
          const templateUrl = await generateAndUploadComponentTemplate(
            container,
            comp.id,
            comp.type
          );

          if (!templateUrl) {
            throw new Error('Failed to upload template');
          }

          console.log(`✅ Template uploaded for ${comp.name}:`, templateUrl);

          results.push({ 
            component: comp.name, 
            status: 'success', 
            url: templateUrl,
            dimensions: `${container.scrollWidth}×${container.scrollHeight}`
          });
          successCount++;

          // Zatvor okno
          newWindow.close();

          // Krátka pauza medzi komponentami
          await new Promise(resolve => setTimeout(resolve, 1500));

        } catch (error) {
          console.error(`❌ Failed to generate template for ${comp.name}:`, error);
          results.push({ component: comp.name, status: 'failed', error: error.message });
          failCount++;
        }
      }

      // Finálny report
      let reportMessage = `📸 Generovanie templates dokončené!\n\n`;
      reportMessage += `✅ Úspešné: ${successCount}\n`;
      reportMessage += `❌ Neúspešné: ${failCount}\n\n`;
      reportMessage += `Všetky templates majú šírku 1200px a dynamickú výšku\n\n`;
      reportMessage += `Detaily:\n`;
      
      results.forEach(r => {
        if (r.status === 'success') {
          reportMessage += `✅ ${r.component}: ${r.dimensions}\n`;
        } else {
          reportMessage += `❌ ${r.component}: ${r.error}\n`;
        }
      });

      alert(reportMessage);

      // Refresh tracking components
      await loadTrackingComponents();

    } catch (error) {
      console.error('❌ Template generation error:', error);
      alert(`❌ Chyba: ${error.message}`);
    } finally {
      setGeneratingTemplates(false);
      setTemplateProgress('');
    }
  };



  const handleToggleBlock = async (participantCode, currentBlockedState) => {
    const action = currentBlockedState ? 'odblokovať' : 'blokovať';
    if (!window.confirm(`Naozaj chcete ${action} používateľa ${participantCode}?`)) return;

    try {
      await dataManager.setBlockedState(participantCode, !currentBlockedState);
      alert(`✅ Používateľ ${currentBlockedState ? 'odblokovaný' : 'blokovaný'}!`);
      await loadStats();
    } catch (error) {
      alert(`❌ Chyba: ${error.message}`);
    }
  };

  const handleExportExcel = async () => {
    setIsExporting(true);
    
    try {
      await dataManager.fetchAllParticipantsData();
      const allData = dataManager.getAllParticipantsData();
      const participants = Object.values(allData);

      if (participants.length === 0) {
        alert('Žiadne dáta na export');
        setIsExporting(false);
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
        const missionPoints = p.user_stats_mission_points || 0;
        const bonusPoints = (p.referrals_count || 0) * 10;
        const totalPoints = missionPoints + bonusPoints;
        
        const row = {
          'Kód účastníka': p.participant_code || '',
          'Blokovaný': p.blocked ? 'ÁNO' : 'NIE',
          'Blokovaný dňa': p.blocked_at ? new Date(p.blocked_at).toLocaleString('sk-SK') : '',
          'Skupina': p.group_assignment || '',
          'Sharing kód': p.sharing_code || '',
          'Použitý referral kód': p.used_referral_code || '',
          'Odporučil ho': p.referred_by || '',
          'Počet odporučení': p.referrals_count || 0,
          'Odporučení používatelia': (p.referred_users || []).join(', '),
          'Registrovaný': p.timestamp_start ? new Date(p.timestamp_start).toLocaleString('sk-SK') : '',
          'Posledná aktualizácia': p.timestamp_last_update ? new Date(p.timestamp_last_update).toLocaleString('sk-SK') : '',
          'Body za misie': missionPoints,
          'Bonusové body': bonusPoints,
          'Celkové body': totalPoints,
          'Level': p.user_stats_level || 1,
          'Inštrukcie dokončené': p.instruction_completed ? 'ÁNO' : 'NIE',
          'Intro dokončené': p.intro_completed ? 'ÁNO' : 'NIE',
          'Návštevy hlavného menu': p.mainmenu_visits || 0,
          'Misia 0 - Odomknutá': p.mission0_unlocked ? 'ÁNO' : 'NIE',
          'Misia 0 - Dokončená': p.mission0_completed ? 'ÁNO' : 'NIE',
          'Misia 1 - Odomknutá': p.mission1_unlocked ? 'ÁNO' : 'NIE',
          'Misia 1 - Dokončená': p.mission1_completed ? 'ÁNO' : 'NIE',
          'Misia 2 - Odomknutá': p.mission2_unlocked ? 'ÁNO' : 'NIE',
          'Misia 2 - Dokončená': p.mission2_completed ? 'ÁNO' : 'NIE',
          'Misia 3 - Odomknutá': p.mission3_unlocked ? 'ÁNO' : 'NIE',
          'Misia 3 - Dokončená': p.mission3_completed ? 'ÁNO' : 'NIE',
          'Všetky misie dokončené': p.all_missions_completed ? 'ÁNO' : 'NIE',
        };

        allComponentIds.forEach(componentId => {
          const componentData = p.responses?.[componentId];
          if (componentData) {
            const questionIds = questionIdsByComponent[componentId];
            questionIds.forEach(qId => {
              const columnName = `[${componentId}] ${qId}`;
              const answer = componentData.answers?.[qId];
              
              if (Array.isArray(answer)) {
                row[columnName] = answer.join('; ');
              } else if (typeof answer === 'object' && answer !== null) {
                row[columnName] = JSON.stringify(answer);
              } else {
                row[columnName] = answer ?? '';
              }
            });

            if (componentData.metadata) {
              row[`[${componentId}] Začiatok`] = componentData.metadata.started_at 
                ? new Date(componentData.metadata.started_at).toLocaleString('sk-SK') 
                : '';
              row[`[${componentId}] Koniec`] = componentData.metadata.completed_at 
                ? new Date(componentData.metadata.completed_at).toLocaleString('sk-SK') 
                : '';
              row[`[${componentId}] Čas (sekundy)`] = componentData.metadata.time_spent_seconds || '';
              row[`[${componentId}] Zariadenie`] = componentData.metadata.device || '';
            }
          }
        });
        return row;
      });

      const ws = XLSX.utils.json_to_sheet(rows);
      
      if (rows.length > 0) {
        const headers = Object.keys(rows[0]);
        const colWidths = headers.map(header => {
          const maxLen = Math.max(
            header.length,
            ...rows.map(row => String(row[header] || '').length)
          );
          return { wch: Math.min(maxLen + 2, 50) };
        });
        ws['!cols'] = colWidths;
      }
      ws['!freeze'] = { xSplit: 1, ySplit: 1 };

      const summaryData = [
        ['=== CELKOVÁ ŠTATISTIKA ==='],
        [''],
        ['Štatistika', 'Hodnota'],
        ['Celkový počet účastníkov', participants.length],
        ['Blokovaní', participants.filter(p => p.blocked).length],
        ['Aktívni', participants.filter(p => !p.blocked).length],
        [''],
        ['Skupina 0', participants.filter(p => p.group_assignment === '0').length],
        ['Skupina 1', participants.filter(p => p.group_assignment === '1').length],
        ['Skupina 2', participants.filter(p => p.group_assignment === '2').length],
        [''],
        ['Misia 0 dokončená', participants.filter(p => p.mission0_completed).length],
        ['Misia 1 dokončená', participants.filter(p => p.mission1_completed).length],
        ['Misia 2 dokončená', participants.filter(p => p.mission2_completed).length],
        ['Misia 3 dokončená', participants.filter(p => p.mission3_completed).length],
        ['Všetky misie dokončené', participants.filter(p => p.all_missions_completed).length],
        [''],
        ['Celkové body (misie)', participants.reduce((sum, p) => sum + (p.user_stats_mission_points || 0), 0)],
        ['Celkové bonusové body', participants.reduce((sum, p) => sum + ((p.referrals_count || 0) * 10), 0)],
        ['Priemerné body na používateľa', Math.round(participants.reduce((sum, p) => {
          const mp = p.user_stats_mission_points || 0;
          const bp = (p.referrals_count || 0) * 10;
          return sum + mp + bp;
        }, 0) / participants.length)],
        [''],
        [''],
        ['=== ZOZNAM VŠETKÝCH POUŽÍVATEĽOV ==='],
        [''],
        ['Kód účastníka', 'Skupina', 'Celkové body', 'Status', 'Všetky misie', 'Registrovaný'],
      ];

      participants.forEach(p => {
        const missionPoints = p.user_stats_mission_points || 0;
        const bonusPoints = (p.referrals_count || 0) * 10;
        const totalPoints = missionPoints + bonusPoints;
        
        summaryData.push([
          p.participant_code,
          p.group_assignment,
          totalPoints,
          p.blocked ? 'BLOKOVANÝ' : 'Aktívny',
          p.all_missions_completed ? 'ÁNO' : 'NIE',
          p.timestamp_start ? new Date(p.timestamp_start).toLocaleDateString('sk-SK') : ''
        ]);
      });
      
      const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
      wsSummary['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Účastníci');
      XLSX.utils.book_append_sheet(wb, wsSummary, 'Súhrn');
      
      const now = new Date();
      const filename = `conspiracy_export_${now.toISOString().slice(0, 10)}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}.xlsx`;
      XLSX.writeFile(wb, filename);
      
      alert(`✅ Export úspešný!\n\n📊 ${rows.length} účastníkov\n📝 ${allComponentIds.size} komponentov\n📄 2 sheety (Účastníci + Súhrn)`);
      
    } catch (error) {
      console.error('❌ Chyba pri exporte:', error);
      alert(`Chyba pri exporte: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleUnlockMission = async (missionId) => {
    if (!window.confirm(`Odomknúť misiu ${missionId} pre všetkých?`)) return;
    try {
      await dataManager.unlockMissionForAll(missionId);
      alert(`✅ Misia ${missionId} odomknutá!`);
      await loadStats();
    } catch (error) {
      alert(`❌ Chyba: ${error.message}`);
    }
  };

  const handleLockMission = async (missionId) => {
    if (!window.confirm(`Zamknúť misiu ${missionId} pre všetkých?`)) return;
    try {
      await dataManager.lockMissionForAll(missionId);
      alert(`✅ Misia ${missionId} zamknutá!`);
      await loadStats();
    } catch (error) {
      alert(`❌ Chyba: ${error.message}`);
    }
  };

  const handleDeleteProgress = async () => {
    if (!window.confirm('⚠️ VYMAZAŤ PROGRESS DB (všetci používatelia)?\n\nTáto akcia je nevratná!')) return;
    if (!window.confirm('Ste si istý? Všetky progress dáta budú natrvalo vymazané!')) return;

    try {
      const response = await fetch('/api/progress?code=all', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminCode: 'RF9846' })
      });

      if (response.ok) {
        dataManager.clearAllData();
        alert('✅ Progress DB vymazaná!');
        await loadStats();
      } else {
        const errorData = await response.json();
        alert(`❌ Chyba: ${errorData.error || response.statusText}`);
      }
    } catch (error) {
      alert(`❌ Chyba: ${error.message}`);
    }
  };

  const handleDeleteResponses = async () => {
    if (!window.confirm('⚠️ VYMAZAŤ RESPONSES DB (všetky odpovede)?\n\nTáto akcia je nevratná!')) return;
    if (!window.confirm('Ste si istý? Všetky response dáta budú natrvalo vymazané!')) return;

    try {
      const response = await fetch('/api/responses', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminCode: 'RF9846', deleteAll: true })
      });

      if (response.ok) {
        alert('✅ Responses DB vymazaná!');
      } else {
        const errorData = await response.json();
        alert(`❌ Chyba: ${errorData.error || response.statusText}`);
      }
    } catch (error) {
      alert(`❌ Chyba: ${error.message}`);
    }
  };

  const handleDeleteTracking = async () => {
    if (!window.confirm('⚠️ VYMAZAŤ TRACKING DB (všetky tracking dáta)?\n\nTáto akcia je nevratná!')) return;
    if (!window.confirm('Ste si istý? Všetky tracking dáta budú natrvalo vymazané!')) return;

    try {
      const response = await fetch('/api/delete-all-tracking', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminCode: 'RF9846' })
      });

      if (response.ok) {
        alert('✅ Tracking DB vymazaná!');
        await loadTrackingComponents();
      } else {
        const errorData = await response.json();
        alert(`❌ Chyba: ${errorData.error || response.statusText}`);
      }
    } catch (error) {
      alert(`❌ Chyba: ${error.message}`);
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('⚠️ VYMAZAŤ VŠETKY DATABÁZY?\n\n- Progress DB\n- Responses DB\n- Tracking DB\n\nTáto akcia je NEVRATNÁ!')) return;
    if (!window.confirm('Ste si ABSOLÚTNE istý? Všetky dáta vo VŠETKÝCH databázach budú natrvalo vymazané!')) return;
    if (!window.confirm('POSLEDNÉ VAROVANIE! Táto akcia je nevratná. Pokračovať?')) return;

    setLoading(true);
    
    try {
      await fetch('/api/progress?code=all', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminCode: 'RF9846' })
      });

      await fetch('/api/responses', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminCode: 'RF9846', deleteAll: true })
      });

      await fetch('/api/delete-all-tracking', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminCode: 'RF9846' })
      });

      dataManager.clearAllData();
      alert('✅ Všetky databázy vymazané!\n\n- Progress DB\n- Responses DB\n- Tracking DB');
      await loadStats();
      await loadTrackingComponents();
    } catch (error) {
      alert(`❌ Chyba: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading && allUsers.length === 0) {
    return (
      <Layout showLevelDisplay={false}>
        <LoadingOverlay>
          <LoadingSpinner>
            Načítavam admin panel...
          </LoadingSpinner>
        </LoadingOverlay>
      </Layout>
    );
  }

  return (
    <Layout showLevelDisplay={false}>
      <Container>
        {generatingTemplates && (
          <LoadingOverlay>
            <LoadingSpinner>
              {templateProgress}
            </LoadingSpinner>
          </LoadingOverlay>
        )}

        <Header>
          <Title>⚙️ Admin Panel</Title>
          <RefreshButton variant="accent" size="small" onClick={loadStats}>
            🔄 Obnoviť dáta
          </RefreshButton>
        </Header>

        <Section>
          <SectionTitle>📊 Prehľad štatistík</SectionTitle>
          <StatsGrid>
            <StatCard>
              <StatLabel>Celkom účastníkov</StatLabel>
              <StatValue>{stats.total}</StatValue>
            </StatCard>
            <StatCard style={{ borderColor: '#ef4444' }}>
              <StatLabel>Blokovaní</StatLabel>
              <StatValue style={{ color: '#ef4444' }}>{stats.blocked}</StatValue>
            </StatCard>
            <StatCard>
              <StatLabel>Skupina 0</StatLabel>
              <StatValue>{stats.group0}</StatValue>
            </StatCard>
            <StatCard>
              <StatLabel>Skupina 1</StatLabel>
              <StatValue>{stats.group1}</StatValue>
            </StatCard>
            <StatCard>
              <StatLabel>Skupina 2</StatLabel>
              <StatValue>{stats.group2}</StatValue>
            </StatCard>
            <StatCard>
              <StatLabel>Misia 0</StatLabel>
              <StatValue>{stats.mission0Complete}</StatValue>
            </StatCard>
            <StatCard>
              <StatLabel>Misia 1</StatLabel>
              <StatValue>{stats.mission1Complete}</StatValue>
            </StatCard>
            <StatCard>
              <StatLabel>Misia 2</StatLabel>
              <StatValue>{stats.mission2Complete}</StatValue>
            </StatCard>
            <StatCard>
              <StatLabel>Misia 3</StatLabel>
              <StatValue>{stats.mission3Complete}</StatValue>
            </StatCard>
          </StatsGrid>
        </Section>

        <TrackingSection>
          <SectionTitle>🔥 Tracking Heatmaps</SectionTitle>
          <InfoText>
            Zobrazenie agregovaných heatmap pohybov myši od všetkých používateľov pre jednotlivé komponenty.
            Všetky templates sú štandardizované na 1200×2000px.
          </InfoText>
          
          {/* ✅ TLAČIDLO - Generate Templates */}
          <ButtonGroup>
            <StyledButton
              variant="accent"
              onClick={handleGenerateTemplates}
              disabled={generatingTemplates}
            >
              📸 Generate Component Templates (1200×2000px)
            </StyledButton>
            <StyledButton
              variant="outline"
              onClick={handleOpenTracking}
            >
              🔍 View All Heatmaps
            </StyledButton>
          </ButtonGroup>

          {generatingTemplates && (
            <ProgressText>{templateProgress}</ProgressText>
          )}
          
          {trackingLoading ? (
            <InfoText>Načítavam tracking komponenty...</InfoText>
          ) : trackingComponents.length === 0 ? (
            <InfoText>
              Žiadne tracking dáta zatiaľ nie sú dostupné. Tracking dáta sa zbierajú automaticky, keď používatelia prejdú cez tracked komponenty.
            </InfoText>
          ) : (
            <TrackingGrid>
              {trackingComponents.slice(0, 6).map((component, index) => (
                <TrackingCard key={index}>
                  <TrackingTitle>
                    <TrackingBadge type={component.contentType}>
                      {component.contentType}
                    </TrackingBadge>
                    {component.contentId}
                  </TrackingTitle>
                  <TrackingMeta>
                    <div>👥 {component.usersCount} users</div>
                    <div>📍 {component.totalPoints?.toLocaleString()} points</div>
                    <div>⏱️ {formatTime(component.avgHoverTime)} avg</div>
                    <div>📊 {component.recordsCount} records</div>
                  </TrackingMeta>
                  <StyledButton
                    variant="outline"
                    size="small"
                    fullWidth
                    onClick={handleOpenTracking}
                  >
                    🔍 View Heatmap
                  </StyledButton>
                </TrackingCard>
              ))}
            </TrackingGrid>
          )}
        </TrackingSection>

        <GridLayout>
          <Section>
            <SectionTitle>💾 Export dát</SectionTitle>
            <InfoText>
              Export obsahuje 2 sheety: detailné dáta všetkých účastníkov a súhrn so štatistikami + zoznamom ID používateľov.
            </InfoText>
            <StyledButton 
              variant="success"
              fullWidth
              loading={isExporting}
              onClick={handleExportExcel}
            >
              {isExporting ? 'Exportujem...' : '📥 Export do Excel'}
            </StyledButton>
          </Section>

          <Section>
            <SectionTitle>🔓 Správa misií</SectionTitle>
            <InfoText>Odomknúť/zamknúť misie pre všetkých.</InfoText>
            {[0, 1, 2, 3].map(missionId => (
              <MissionRow key={missionId}>
                <MissionLabel>🎯 Misia {missionId}</MissionLabel>
                <MissionButtons>
                  <StyledButton 
                    variant="success"
                    size="small"
                    onClick={() => handleUnlockMission(missionId)}
                  >
                    🔓 Odomknúť
                  </StyledButton>
                  <StyledButton 
                    variant="outline"
                    size="small"
                    onClick={() => handleLockMission(missionId)}
                  >
                    🔒 Zamknúť
                  </StyledButton>
                </MissionButtons>
              </MissionRow>
            ))}
          </Section>
        </GridLayout>

        <Section>
          <SectionTitle>👥 Zoznam účastníkov ({allUsers.length})</SectionTitle>
          {allUsers.length === 0 ? (
            <InfoText>Žiadni účastníci v databáze.</InfoText>
          ) : (
            <TableWrapper>
              <UserTable>
                <thead>
                  <tr>
                    <Th>Kód</Th>
                    <Th>Status</Th>
                    <Th>Skupina</Th>
                    <Th>Misie</Th>
                    <Th>Bonus</Th>
                    <Th>Spolu</Th>
                    <Th>Refs</Th>
                    <Th>M0</Th>
                    <Th>M1</Th>
                    <Th>M2</Th>
                    <Th>M3</Th>
                    <Th>Registrovaný</Th>
                    <Th>Akcia</Th>
                  </tr>
                </thead>
                <tbody>
                  {allUsers.map(u => {
                    const missionPoints = u.user_stats_mission_points || 0;
                    const bonusPoints = (u.referrals_count || 0) * 10;
                    const totalPoints = missionPoints + bonusPoints;
                    const isBlocked = u.blocked || false;
                    
                    return (
                      <tr key={u.participant_code}>
                        <Td blocked={isBlocked}>{u.participant_code}</Td>
                        <Td blocked={isBlocked}>{isBlocked ? '🚫' : '✅'}</Td>
                        <Td blocked={isBlocked}>{u.group_assignment}</Td>
                        <Td blocked={isBlocked}>{missionPoints}</Td>
                        <Td blocked={isBlocked}>{bonusPoints}</Td>
                        <Td blocked={isBlocked}><strong>{totalPoints}</strong></Td>
                        <Td blocked={isBlocked}>{u.referrals_count || 0}</Td>
                        <Td blocked={isBlocked}>{u.mission0_completed ? '✔' : '–'}</Td>
                        <Td blocked={isBlocked}>{u.mission1_completed ? '✔' : '–'}</Td>
                        <Td blocked={isBlocked}>{u.mission2_completed ? '✔' : '–'}</Td>
                        <Td blocked={isBlocked}>{u.mission3_completed ? '✔' : '–'}</Td>
                        <Td blocked={isBlocked}>{u.timestamp_start?.slice(0, 10)}</Td>
                        <Td blocked={isBlocked}>
                          <BlockButton
                            variant={isBlocked ? "outline" : "danger"}
                            size="small"
                            onClick={() => handleToggleBlock(u.participant_code, isBlocked)}
                          >
                            {isBlocked ? '✅ Odblokovať' : '🚫 Blokovať'}
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

        <DangerSection>
          <SectionTitle style={{ color: '#ef4444' }}>⚠️ Danger Zone - Mazanie databáz</SectionTitle>
          <InfoText>
            Tieto akcie sú <strong>NEVRATNÉ</strong> a vymažú dáta z jednotlivých databáz alebo zo všetkých naraz!
          </InfoText>
          
          <DeleteRow>
            <DeleteLabel>
              🗂️ Progress DB <span>(používatelia, progress, blokovanie)</span>
            </DeleteLabel>
            <StyledButton 
              variant="danger"
              size="small"
              onClick={handleDeleteProgress}
            >
              🗑️ Vymazať Progress
            </StyledButton>
          </DeleteRow>
          
          <DeleteRow>
            <DeleteLabel>
              📝 Responses DB <span>(odpovede na otázky)</span>
            </DeleteLabel>
            <StyledButton 
              variant="danger"
              size="small"
              onClick={handleDeleteResponses}
            >
              🗑️ Vymazať Responses
            </StyledButton>
          </DeleteRow>
          
          <DeleteRow>
            <DeleteLabel>
              🖱️ Tracking DB <span>(mouse tracking, heatmapy)</span>
            </DeleteLabel>
            <StyledButton 
              variant="danger"
              size="small"
              onClick={handleDeleteTracking}
            >
              🗑️ Vymazať Tracking
            </StyledButton>
          </DeleteRow>
          
          <hr style={{ margin: '24px 0', border: 'none', borderTop: '2px solid #ef444444' }} />
          
          <DeleteRow style={{ borderColor: '#ef4444', borderWidth: '2px' }}>
            <DeleteLabel style={{ fontSize: '18px' }}>
              💥 VYMAZAŤ VŠETKO <span>(všetky 3 databázy)</span>
            </DeleteLabel>
            <StyledButton 
              variant="danger"
              onClick={handleDeleteAll}
            >
              🔥 Vymazať VŠETKY databázy
            </StyledButton>
          </DeleteRow>
        </DangerSection>

        <ButtonGroup>
          <StyledButton variant="ghost" onClick={() => navigate('/mainmenu')}>
            ← Späť na hlavné menu
          </StyledButton>
        </ButtonGroup>
      </Container>
    </Layout>
  );
};

export default AdminPanel;
