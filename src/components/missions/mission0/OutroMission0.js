// src/components/missions/mission0/OutroMission0.js
// ✅ S PRIHLÁSENÍM NA ĎALŠIU ČASŤ A NOTIFIKÁCIU

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Layout from '../../../styles/Layout';
import StyledButton from '../../../styles/StyledButton';
import DetectiveTipSmall from '../../shared/DetectiveTipSmall';
import { useUserStats } from '../../../contexts/UserStatsContext';
import { useContext } from 'react';
import { ThemeContext } from 'styled-components';
const Container = styled.div`
  padding: 24px 16px;
  max-width: 900px;
  margin: 0 auto;
  min-height: calc(100vh - 80px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  
  @media (max-width: 768px) {
    padding: 20px 12px;
  }
`;

const MissionCard = styled.div`
  background: linear-gradient(135deg, 
    ${p => p.theme.ACCENT_COLOR}45, 
    ${p => p.theme.ACCENT_COLOR_2}45
  );
  border: 2px solid ${p => p.theme.ACCENT_COLOR};
  border-radius: 16px;
  padding: 24px 40px;
  margin: 20px 0;
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  transition: all 0.3s ease;
  min-width: 280px;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(
      circle at top right,
      ${p => p.theme.ACCENT_COLOR}15 0%,
      transparent 70%
    );
    pointer-events: none;
  }
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 24px ${p => p.theme.ACCENT_COLOR}45;
    border-color: ${p => p.theme.ACCENT_COLOR_2};
  }
  
  @media (max-width: 480px) {
    padding: 20px 28px;
    min-width: auto;
    width: 100%;
  }
`;

const MissionLabel = styled.div`
  font-size: 25px;
  color: ${p => p.theme.PRIMARY_TEXT_COLOR};
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin-bottom: 8px;
  text-align: center;
  font-weight: 600;
  position: relative;
  z-index: 1;
  
  @media (max-width: 480px) {
    font-size: 25px;
  }
`;

const SuccessBox = styled.div`
  background: ${p => p.theme.CARD_BACKGROUND};
  border: 2px solid ${p => p.theme.ACCENT_COLOR};
  border-radius: 16px;
  padding: 32px;
  margin: 20px 0;
  max-width: 400px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px ${p => p.theme.ACCENT_COLOR}35;
  }
  
  @media (max-width: 480px) {
    padding: 24px;
    width: 100%;
  }
`;

const PointsEarned = styled.div`
  font-size: 50px;
  font-weight: 700;
  color: ${p => p.theme.ACCENT_COLOR};
  margin: 20px 0;
  animation: scaleIn 0.5s ease;
  text-align: center;
  
  @keyframes scaleIn {
    from {
      transform: scale(0);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }
  
  @media (max-width: 480px) {
    font-size: 50px;
  }
`;

const PointsLabel = styled.div`
  font-size: 15px;
  color: ${p => p.theme.PRIMARY_TEXT_COLOR};
  margin-bottom: 8px;
  text-align: center;
  font-weight: 600;
`;

const LevelUpText = styled.div`
  font-size: 15px;
  color: ${p => p.theme.PRIMARY_TEXT_COLOR};
  margin-top: 20px;
  font-weight: 600;
  padding-top: 16px;
  border-top: 2px solid ${p => p.theme.BORDER_COLOR};
  text-align: center;
`;

const InfoSection = styled.div`
  background: ${p => p.theme.CARD_BACKGROUND};
  border: 2px solid ${p => p.theme.BORDER_COLOR};
  border-radius: 12px;
  padding: 20px;
  margin: 16px 0;
  max-width: 700px;
  width: 100%;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${p => p.theme.ACCENT_COLOR}60;
  }
  
  @media (max-width: 480px) {
    padding: 16px;
  }
`;

const InfoTitle = styled.h3`
  font-size: 15px;
  color: ${p => p.theme.ACCENT_COLOR};
  margin-bottom: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  
  @media (max-width: 480px) {
    font-size: 15px;
  }
`;

const InfoList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 20px 0;
  display: grid;
  gap: 8px;
`;

const InfoItem = styled.li`
  font-size: 15px;
  color: ${p => p.theme.PRIMARY_TEXT_COLOR};
  padding: 8px 12px 8px 32px;
  position: relative;
  line-height: 1.5;
  background: ${p => p.theme.ACCENT_COLOR}15;
  border-radius: 8px;
  transition: all 0.2s ease;
  
  &::before {
    content: '✓';
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: ${p => p.theme.ACCENT_COLOR};
    font-weight: bold;
    font-size: 15px;
  }
  
  &:hover {
    background: ${p => p.theme.ACCENT_COLOR}45;
    transform: translateX(4px);
  }
  
  @media (max-width: 480px) {
    font-size: 15px;
    padding: 7px 10px 7px 28px;
  }
`;

const ParticipationSection = styled.div`
  margin-top: 24px;
  padding-top: 20px;
  border-top: 2px solid ${p => p.theme.BORDER_COLOR};
`;

const SectionTitle = styled.h4`
  font-size: 15px;
  color: ${p => p.theme.ACCENT_COLOR};
  margin-bottom: 16px;
  font-weight: 600;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
  margin-bottom: 16px;
  padding: 12px;
  border-radius: 8px;
  background: ${p => p.checked ? `${p.theme.ACCENT_COLOR}15` : 'transparent'};
  transition: all 0.2s ease;
  
  &:hover {
    background: ${p => p.theme.ACCENT_COLOR}15;
  }
`;

const Checkbox = styled.input`
  width: 20px;
  height: 20px;
  min-width: 20px;
  cursor: pointer;
  accent-color: ${p => p.theme.ACCENT_COLOR};
  margin-top: 2px;
`;

const CheckboxText = styled.span`
  font-size: 15px;
  color: ${p => p.theme.PRIMARY_TEXT_COLOR};
  line-height: 1.5;
`;

const EmailInputContainer = styled.div`
  display: ${p => p.show ? 'block' : 'none'};
  margin-top: 16px;
  animation: ${p => p.show ? 'slideDown 0.3s ease' : 'none'};
  
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const EmailLabel = styled.label`
  display: block;
  font-size: 15px;
  color: ${p => p.theme.SECONDARY_TEXT_COLOR};
  margin-bottom: 8px;
  font-weight: 500;
`;

const EmailInput = styled.input`
  width: 100%;
  padding: 12px;
  border: 2px solid ${p => p.theme.BORDER_COLOR};
  border-radius: 8px;
  font-size: 15px;
  font-family: inherit;
  background: ${p => p.theme.INPUT_BACKGROUND || p.theme.CARD_BACKGROUND};
  color: ${p => p.theme.SECONDARY_TEXT_COLOR};
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${p => p.theme.ACCENT_COLOR};
    box-shadow: 0 0 0 3px ${p => p.theme.ACCENT_COLOR}45;
  }
  
  &::placeholder {
    color: ${p => p.theme.SECONDARY_TEXT_COLOR};
    opacity: 0.6;
  }
`;

const RadioGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 12px;
`;

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding: 10px;
  border-radius: 8px;
  background: ${p => p.checked ? `${p.theme.ACCENT_COLOR}15` : 'transparent'};
  transition: all 0.2s ease;
  
  &:hover {
    background: ${p => p.theme.ACCENT_COLOR}15;
  }
`;

const RadioButton = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: ${p => p.theme.ACCENT_COLOR};
`;

const RadioText = styled.span`
  font-size: 15px;
  color: ${p => p.theme.PRIMARY_TEXT_COLOR};
  line-height: 1.4;
`;

const SaveMessage = styled.div`
  margin-top: 12px;
  padding: 10px 14px;
  background: ${p => p.success ? `${p.theme.ACCENT_COLOR}15` : '#ff000015'};
  border: 1px solid ${p => p.success ? `${p.theme.ACCENT_COLOR}33` : '#ff000033'};
  border-radius: 8px;
  font-size: 15px;
  color: ${p => p.success ? p.theme.ACCENT_COLOR : '#ff0000'};
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  animation: fadeIn 0.3s ease;
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  &::before {
    content: '${p => p.success ? '✓' : '⚠️'}';
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
  
  @media (max-width: 480px) {
    flex-direction: column;
    width: 100%;
    max-width: 400px;
  }
`;

const OutroMission0 = () => {
  const navigate = useNavigate();
  const { addMissionPoints, refreshUserStats, dataManager, userId } = useUserStats();
  const [isProcessing, setIsProcessing] = useState(false);
  
  // ✅ Participation state
  const [wantsParticipate, setWantsParticipate] = useState(false);
  
  // ✅ Notification state
  const [wantsNotification, setWantsNotification] = useState(false);
  const [emailOption, setEmailOption] = useState('contest'); // 'contest' alebo 'new'
  const [newEmail, setNewEmail] = useState('');
  const [saveMessage, setSaveMessage] = useState(null);
  const [existingEmail, setExistingEmail] = useState('');
  const theme = useContext(ThemeContext);
  // ✅ Načítaj existujúci email zo súťaže
  useEffect(() => {
    const loadExistingEmail = async () => {
      if (!userId) return;
      
      try {
        const progress = await dataManager.loadUserProgress(userId);
        if (progress?.contest_email) {
          setExistingEmail(progress.contest_email);
          setEmailOption('contest'); // ✅ Nastav contest ako default
        } else {
          setExistingEmail('');
          setEmailOption('new'); // ✅ Automaticky prepni na 'new' ak nie je contest email
        }
      } catch (error) {
        console.error('Error loading existing email:', error);
      }
    };
    
    loadExistingEmail();
  }, [userId, dataManager]);

  // ✅ Uloženie všetkých preferencií
  const savePreferences = async () => {
    if (!userId) return false;
    
    try {
      const progress = await dataManager.loadUserProgress(userId);
      
      // ✅ Uloženie účasti na ďalšej časti
      progress.wants_to_participate_main_study = wantsParticipate;
      progress.participation_response_timestamp = new Date().toISOString();
      
      // ✅ Uloženie notifikačných preferencií
      if (wantsNotification) {
        const finalEmail = emailOption === 'new' ? newEmail : existingEmail;
        
        progress.wants_notification = true;
        progress.notification_email_option = emailOption;
        progress.notification_email = finalEmail;
        progress.notification_timestamp = new Date().toISOString();
      } else {
        progress.wants_notification = false;
      }
      
      await dataManager.saveProgress(userId, progress);
      
      setSaveMessage({ success: true, text: 'Nastavenia uložené!' });
      
      setTimeout(() => {
        setSaveMessage(null);
      }, 3000);
      
      return true;
    } catch (error) {
      console.error('Error saving preferences:', error);
      setSaveMessage({ success: false, text: 'Chyba pri ukladaní!' });
      return false;
    }
  };

  const handleContinue = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      // ✅ Validácia emailu
      if (wantsNotification) {
        // ✅ Ak vybral contest email, ale neexistuje
        if (emailOption === 'contest' && !existingEmail) {
          setSaveMessage({ 
            success: false, 
            text: 'Pre súťaž ste nezadali email! Prosím zvoľte možnosť "Inú e-mailovú adresu".' 
          });
          setIsProcessing(false);
          return;
        }
        
        // ✅ Ak vybral nový email, ale nezadal ho
        if (emailOption === 'new' && !newEmail) {
          setSaveMessage({ success: false, text: 'Prosím zadajte e-mailovú adresu.' });
          setIsProcessing(false);
          return;
        }
        
        // ✅ Validácia formátu nového emailu
        if (emailOption === 'new' && !newEmail.includes('@')) {
          setSaveMessage({ success: false, text: 'Neplatný formát e-mailovej adresy.' });
          setIsProcessing(false);
          return;
        }
      }
      
      // ✅ Ulož všetky preferencie
      const saved = await savePreferences();
      if (!saved) {
        setIsProcessing(false);
        return;
      }
      
      console.log('🎯 Completing mission0...');
      
      // ✅ Pridaj body za misiu
      const success = await addMissionPoints('mission0');
      
      if (success) {
        console.log('✅ Mission0 points added successfully');
        
        // ✅ Refresh stats po pridaní bodov
        await refreshUserStats();
        
        // ✅ Navigate po krátkej pauze
        setTimeout(() => {
          navigate('/mainmenu');
        }, 500);
      } else {
        console.warn('⚠️ Mission0 already completed or error');
        navigate('/mainmenu');
      }
    } catch (error) {
      console.error('❌ Error completing mission0:', error);
      navigate('/mainmenu');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Layout 
      showLevelDisplay={true} 
      showAnimatedBackground={true}
      cubeCount={50}
      animationSpeed="normal"
      complexity="medium"
    >
      <Container>
        <MissionCard>
          <MissionLabel><strong>Gratulujeme!</strong></MissionLabel>
        </MissionCard>

        <SuccessBox>
          <PointsLabel><strong>ZÍSKALI STE:</strong></PointsLabel>
          <PointsEarned>+50 🌟</PointsEarned>
          <LevelUpText><strong>BODOV</strong></LevelUpText>
        </SuccessBox>

        <InfoSection>
          <InfoTitle><strong>Čo ste dosiahli?</strong></InfoTitle>
          <InfoList>
            <InfoItem><strong>Úspešne ste dokončili predvýskum</strong></InfoItem>
            <InfoItem><strong>Získali ste 50 bodov potrebných pre zapojenie sa do súťaže</strong></InfoItem>
            <InfoItem><strong>Pomohli ste nám zlepšiť hlavný výskum</strong></InfoItem>
          </InfoList>

          <DetectiveTipSmall
            style={{ textAlign: "justify" }}
            tip={`
            <p style="font-size: 15px; font-weight: bold; margin-bottom: 10px; line-height: 1.6; color: ${theme.PRIMARY_TEXT_COLOR};">
                <strong>Výborne! Úspešne ste dokončili predvýskum. Vaše odpovede a spätná väzba nám pomôžu vylepšiť hlavný výskum.</strong>
            <p style="font-size: 15px; font-weight: bold; margin-bottom: 10px; line-height: 1.6; color: ${theme.PRIMARY_TEXT_COLOR};">
                <strong>V blízkej dobe bude odomknutý hlavný výskum. Ak máte záujem, môžete sa zúčastniť.</strong>
            <p style="font-size: 15px; font-weight: bold; margin-bottom: 10px; line-height: 1.6; color: ${theme.PRIMARY_TEXT_COLOR};">
                <strong>Ak sa rozhodnete zúčastniť, nižšie môžete potvrdiť účasť a zvoliť si, či chcete byť jednorázovo upozornený/á e-mailom.</strong>
            <p style="font-size: 15px; font-weight: bold; margin-bottom: 10px; line-height: 1.6; color: ${theme.PRIMARY_TEXT_COLOR};">
                <strong>Ešte raz ďakujeme za účasť v predvýskume, dúfame že sa vám predvýskum páčil a snáď sa v blízkej dobe vidíme znova.</strong>
            `}
              detectiveName="Inšpektor Kritan"
            autoOpen={true}
          />

          {/* ✅ ÚČASŤ NA ĎALŠEJ ČASTI */}
          <ParticipationSection>
            <SectionTitle><strong>Hlavný výskum</strong></SectionTitle>
            
            <CheckboxLabel checked={wantsParticipate}>
              <Checkbox
                type="checkbox"
                checked={wantsParticipate}
                onChange={(e) => setWantsParticipate(e.target.checked)}
              />
              <CheckboxText>
                <strong>Chcem sa zúčastniť ďalšej časti výskumu (hlavný výskum).</strong>
              </CheckboxText>
            </CheckboxLabel>

            {/* ✅ NOTIFIKÁCIA - len ak chce účasť */}
            {wantsParticipate && (
              <EmailInputContainer show={wantsParticipate}>
                <CheckboxLabel checked={wantsNotification}>
                  <Checkbox
                    type="checkbox"
                    checked={wantsNotification}
                    onChange={(e) => setWantsNotification(e.target.checked)}
                  />
                  <CheckboxText>
                    <strong>Chcem byť upozornený/á e-mailom, keď bude hlavný výskum odomknutý.</strong>
                  </CheckboxText>
                </CheckboxLabel>

                {wantsNotification && (
                  <div>
                    <EmailLabel><strong>Na ktorú e-mailovú adresu chcete aby vám prišlo upozornenie?</strong></EmailLabel>
                    
                    <RadioGroup>
                      {/* ✅ VŽDY zobraz túto možnosť */}
                      <RadioLabel checked={emailOption === 'contest'}>
                        <RadioButton
                          type="radio"
                          name="emailOption"
                          value="contest"
                          checked={emailOption === 'contest'}
                          onChange={() => setEmailOption('contest')}
                          disabled={!existingEmail} // ✅ Disable ak nie je email
                        />
                        <RadioText style={{ 
                          color: !existingEmail ? '#ff0000' : 'inherit',
                          opacity: !existingEmail ? 0.7 : 1 
                        }}>
                          {existingEmail ? (
                            <>
                              <strong>E-mailovú adresu zadanú pre zapojenie sa do súťaže: </strong>
                              <span style={{ color: theme.ACCENT_COLOR }}>{existingEmail}</span>
                            </>
                          ) : (
                            <>
                              <strong>E-mailovú adresu zadanú pre zapojenie sa do súťaže:</strong>
                              <br />
                              <span style={{ 
                                fontSize: '15px', 
                                fontStyle: 'bold',
                                color: '#ff0000'
                              }}>
                                <strong>Pre účasť v súťaži ste nezadali žiadny email.</strong>
                              </span>
                            </>
                          )}
                        </RadioText>
                      </RadioLabel>
                      
                      <RadioLabel checked={emailOption === 'new'}>
                        <RadioButton
                          type="radio"
                          name="emailOption"
                          value="new"
                          checked={emailOption === 'new'}
                          onChange={() => setEmailOption('new')}
                        />
                        <RadioText>
                          <strong>Inú e-mailovú adresu:</strong>
                        </RadioText>
                      </RadioLabel>
                    </RadioGroup>

                    {emailOption === 'new' && (
                      <div style={{ marginTop: '12px' }}>
                        <EmailLabel><strong>Zadajte e-mailovú adresu na ktorú vám pošleme upozornenie:</strong></EmailLabel>
                        <EmailInput
                          type="email"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          placeholder="vas.email@priklad.sk"
                        />
                      </div>
                    )}
                  </div>
                )}
              </EmailInputContainer>
            )}

            {saveMessage && (
              <SaveMessage success={saveMessage.success}>
                {saveMessage.text}
              </SaveMessage>
            )}
          </ParticipationSection>
        </InfoSection>

        <ButtonContainer>
          <StyledButton 
            variant="accent"
            size="large"
            onClick={handleContinue}
            disabled={isProcessing}
          >
            {isProcessing ? 'Ukladám...' : 'Pokračovať do hlavného menu'}
          </StyledButton>
        </ButtonContainer>
      </Container>
    </Layout>
  );
};

export default OutroMission0;
