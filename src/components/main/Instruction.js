// src/components/main/Instruction.js
// FINÁLNA VERZIA - Automatické načítanie referral kódu z URL + blokovanie

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Layout from '../../styles/Layout';
import StyledButton from '../../styles/StyledButton';
import { useUserStats } from '../../contexts/UserStatsContext';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  min-height: 100vh;
  
  @media (max-width: 768px) {
    padding: 30px 15px;
  }
`;

const Title = styled.h1`
  font-size: 36px;
  text-align: center;
  margin-bottom: 16px;
  background: linear-gradient(
    135deg,
    ${props => props.theme.ACCENT_COLOR},
    ${props => props.theme.ACCENT_COLOR_2}
  );
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 700;
  
  @media (max-width: 768px) {
    font-size: 28px;
  }
  
  @media (max-width: 480px) {
    font-size: 24px;
  }
`;

const Subtitle = styled.p`
  font-size: 18px;
  line-height: 1.6;
  max-width: 700px;
  margin-bottom: 32px;
  color: ${props => props.theme.SECONDARY_TEXT_COLOR};
  text-align: center;
  
  @media (max-width: 768px) {
    font-size: 16px;
    margin-bottom: 24px;
  }
`;

const FormCard = styled.div`
  background: ${p => p.theme.CARD_BACKGROUND};
  border: 2px solid ${p => p.$hasError ? '#ef4444' : p.theme.BORDER_COLOR};
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 20px;
  width: 100%;
  max-width: 600px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${p => p.$hasError ? '#ef4444' : p.theme.ACCENT_COLOR}66;
  }
  
  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: ${p => p.$disabled ? 'not-allowed' : 'pointer'};
  
  label {
    cursor: ${p => p.$disabled ? 'not-allowed' : 'pointer'};
    color: ${p => p.$disabled ? p.theme.SECONDARY_TEXT_COLOR : p.theme.PRIMARY_TEXT_COLOR};
    text-decoration: ${p => p.$disabled ? 'line-through' : 'none'};
    opacity: ${p => p.$disabled ? 0.6 : 1};
    user-select: none;
    font-size: 15px;
  }
`;

const Checkbox = styled.input`
  width: 20px;
  height: 20px;
  cursor: ${p => p.disabled ? 'not-allowed' : 'pointer'};
  accent-color: ${p => p.theme.ACCENT_COLOR};
`;

const InputLabel = styled.label`
  display: block;
  font-weight: 600;
  margin-bottom: 10px;
  color: ${props => props.theme.PRIMARY_TEXT_COLOR};
  font-size: 15px;
`;

const Input = styled.input`
  width: 100%;
  padding: 14px 16px;
  border: 2px solid ${props => props.$hasError ? '#ef4444' : props.theme.BORDER_COLOR};
  border-radius: 10px;
  font-size: 16px;
  background: ${props => props.theme.INPUT_BACKGROUND};
  color: ${props => props.theme.PRIMARY_TEXT_COLOR};
  font-family: inherit;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-weight: 600;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${props => props.$hasError ? '#ef4444' : props.theme.ACCENT_COLOR};
    box-shadow: 0 0 0 3px ${props => props.$hasError ? '#ef444422' : `${props.theme.ACCENT_COLOR}22`};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: ${props => props.theme.BORDER_COLOR};
  }
  
  &::placeholder {
    text-transform: none;
    letter-spacing: normal;
    font-weight: normal;
    opacity: 0.5;
  }
`;

const ErrorText = styled.div`
  color: #ef4444;
  font-size: 13px;
  margin-top: 8px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  
  &::before {
    content: '⚠️';
  }
`;

const Note = styled.div`
  font-size: 12px;
  color: ${p => p.theme.SECONDARY_TEXT_COLOR};
  margin-top: 8px;
  line-height: 1.5;
`;

const InfoBox = styled.div`
  background: ${p => p.$hasError ? '#ef444411' : `${p.theme.ACCENT_COLOR}11`};
  border-left: 4px solid ${p => p.$hasError ? '#ef4444' : p.theme.ACCENT_COLOR};
  padding: 20px;
  margin-bottom: 24px;
  max-width: 600px;
  width: 100%;
  border-radius: 12px;
  
  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const InfoTitle = styled.div`
  color: ${p => p.theme.PRIMARY_TEXT_COLOR};
  font-weight: 700;
  margin-bottom: 12px;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const InfoText = styled.div`
  color: ${p => p.theme.SECONDARY_TEXT_COLOR};
  font-size: 14px;
  line-height: 1.8;
  
  strong {
    color: ${p => p.theme.PRIMARY_TEXT_COLOR};
    font-weight: 600;
  }
`;

const ExampleCode = styled.code`
  background: ${p => p.theme.INPUT_BACKGROUND};
  padding: 4px 10px;
  border-radius: 6px;
  font-family: 'Courier New', monospace;
  color: ${p => p.theme.ACCENT_COLOR};
  font-weight: 700;
  font-size: 15px;
  letter-spacing: 1px;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 32px;
  
  @media (max-width: 480px) {
    flex-direction: column;
    width: 100%;
    max-width: 600px;
  }
`;

const BlockedWarning = styled.div`
  background: linear-gradient(135deg, #ef4444, #dc2626);
  border: 2px solid #b91c1c;
  border-radius: 16px;
  padding: 32px;
  margin: 24px 0;
  max-width: 600px;
  width: 100%;
  box-shadow: 0 8px 24px rgba(239, 68, 68, 0.3);
  text-align: center;
  animation: shake 0.5s ease-in-out;
  scroll-margin-top: 20px;
  
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-10px); }
    75% { transform: translateX(10px); }
  }
  
  @media (max-width: 768px) {
    padding: 24px;
  }
`;

const BlockedIcon = styled.div`
  font-size: 64px;
  margin-bottom: 16px;
  animation: pulse 2s ease-in-out infinite;
  
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }
`;

const BlockedTitle = styled.h2`
  color: #ffffff;
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 12px;
  
  @media (max-width: 768px) {
    font-size: 20px;
  }
`;

const BlockedMessage = styled.p`
  color: #fecaca;
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 8px;
  
  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const ContactInfo = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 16px;
  margin-top: 20px;
  color: #fef2f2;
  font-size: 14px;
  
  strong {
    color: #ffffff;
  }
`;

const ClearCodeButton = styled(StyledButton)`
  margin-top: 16px;
  background: rgba(255, 255, 255, 0.2);
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

// ✅ NOVÝ - Highlight pre automaticky vyplnený kód
const ReferralNotice = styled.div`
  background: ${p => `${p.theme.ACCENT_COLOR}22`};
  border: 2px solid ${p => p.theme.ACCENT_COLOR};
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
  max-width: 600px;
  width: 100%;
  text-align: center;
  animation: slideIn 0.5s ease-out;
  
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const ReferralNoticeText = styled.div`
  color: ${p => p.theme.PRIMARY_TEXT_COLOR};
  font-size: 14px;
  margin-bottom: 8px;
  
  strong {
    color: ${p => p.theme.ACCENT_COLOR};
    font-weight: 700;
    font-size: 18px;
    letter-spacing: 2px;
  }
`;

export default function Instruction() {
  const navigate = useNavigate();
  const { login, dataManager } = useUserStats();

  const [participantCode, setParticipantCode] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [hasReferral, setHasReferral] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);
  const [errors, setErrors] = useState({});
  const [referralAlreadyUsed, setReferralAlreadyUsed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingCode, setIsCheckingCode] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [referralFromUrl, setReferralFromUrl] = useState(false);
  
  const blockedWarningRef = useRef(null);

  // ✅ NOVÝ useEffect - Načítanie referral kódu z URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    
    if (refCode && refCode.length === 6) {
      console.log(`🔗 URL obsahuje referral code: ${refCode}`);
      
      const upperRef = refCode.toUpperCase();
      
      // Ulož do sessionStorage
      sessionStorage.setItem('referralCode', upperRef);
      
      // ✅ Automaticky vyplň referral pole
      setReferralCode(upperRef);
      setHasReferral(true);
      setReferralFromUrl(true);
      
      console.log(`✅ Referral kód automaticky vyplnený: ${upperRef}`);
      
      // ✅ Vymaž ref parameter z URL (bez reload)
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, []);

  const validateParticipantCode = (code) => {
    const upperCode = code.toUpperCase().trim();
    
    if (upperCode === 'RF9846') {
      return { valid: true, type: 'admin' };
    }
    
    const testPattern = /^TEST([0-5][0-9]|60)$/;
    if (testPattern.test(upperCode)) {
      return { valid: true, type: 'test' };
    }
    
    const participantPattern = /^[A-Z]{4}(0[1-9]|1[0-2])$/;
    if (participantPattern.test(upperCode)) {
      return { valid: true, type: 'participant' };
    }
    
    return { valid: false, type: null };
  };

  // ✅ OPRAVENÉ - Force fetch zo servera
  const checkReferralStatus = async (userCode) => {
    if (!userCode || userCode.length !== 6) return false;
    
    try {
      setIsCheckingCode(true);
      
      // ✅ Force refresh zo servera (preskočí cache)
      const userData = await dataManager.loadUserProgress(userCode, true);
      
      if (userData?.blocked) {
        console.log(`🚫 Používateľ ${userCode} je blokovaný`);
        setIsBlocked(true);
        
        setTimeout(() => {
          blockedWarningRef.current?.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }, 100);
        
        return true;
      } else {
        setIsBlocked(false);
      }
      
      if (userData?.used_referral_code) {
        console.log(`⚠️ Používateľ ${userCode} už použil referral kód`);
        setReferralAlreadyUsed(true);
        setHasReferral(false);
        return true;
      }
      
      setReferralAlreadyUsed(false);
      return false;
    } catch (error) {
      console.warn('Could not check referral status:', error);
      return false;
    } finally {
      setIsCheckingCode(false);
    }
  };

  const validate = async () => {
    const e = {};
    
    if (isBlocked) {
      e.blocked = 'Tento účet bol zablokovaný administrátorom.';
      return e;
    }
    
    if (!consentGiven) {
      e.consent = 'Musíte súhlasiť s účasťou.';
    }
    
    const codeValidation = validateParticipantCode(participantCode);
    if (!codeValidation.valid) {
      e.participant = 'Neplatný formát kódu. Použite formát ABCDMM, TEST01-TEST60, alebo RF9846';
    }
    
    if (hasReferral) {
      if (referralAlreadyUsed) {
        e.referral = 'Už ste použili referral kód. Nemôžete ho zadať znova.';
      } else if (!referralCode || !/^[A-Z0-9]{6}$/.test(referralCode.trim())) {
        e.referral = 'Referral kód musí mať presne 6 znakov.';
      } else {
        const valid = await dataManager.validateReferralCode(referralCode.trim().toUpperCase());
        if (!valid) {
          e.referral = 'Tento referral kód neexistuje v systéme.';
        } else {
          const userSharingCode = await dataManager.getUserSharingCode(participantCode.toUpperCase());
          if (userSharingCode && userSharingCode === referralCode.trim().toUpperCase()) {
            e.referral = 'Nemôžete použiť svoj vlastný zdieľací kód!';
          }
        }
      }
    }
    
    return e;
  };

  const handleStart = async () => {
    setIsLoading(true);
    const e = await validate();
    setErrors(e);
    
    if (Object.keys(e).length) {
      setIsLoading(false);
      return;
    }

    const codeValidation = validateParticipantCode(participantCode);
    const upperCode = participantCode.toUpperCase();
    
    sessionStorage.setItem('participantCode', upperCode);
    
    if (hasReferral && !referralAlreadyUsed && referralCode.trim()) {
      try {
        await dataManager.processReferral(upperCode, referralCode.trim().toUpperCase());
      } catch (error) {
        console.error('Referral processing error:', error);
        setErrors({ referral: 'Chyba pri spracovaní referral kódu. Skúste znova.' });
        setIsLoading(false);
        return;
      }
    }
    
    await login(upperCode);
    setIsLoading(false);
    
    if (codeValidation.type === 'admin') {
      navigate('/admin');
    } else {
      navigate('/intro');
    }
  };

  const handleClearCode = () => {
    setParticipantCode('');
    setIsBlocked(false);
    setReferralAlreadyUsed(false);
    setErrors({});
    setConsentGiven(false);
    setHasReferral(false);
    setReferralCode('');
    setReferralFromUrl(false);
  };

  return (
    <Layout showLevelDisplay={false}>
      <Container>
        <Title>🔑 Conspiracy Pass</Title>
        <Subtitle>
          Zadajte svoj kód účastníka a prípadne referral kód od priateľa
        </Subtitle>

        {/* ✅ NOVÉ - Indikátor automaticky vyplneného kódu */}
        {referralFromUrl && referralCode && (
          <ReferralNotice>
            <ReferralNoticeText>
              🎁 Referral kód automaticky vyplnený: <strong>{referralCode}</strong>
            </ReferralNoticeText>
            <ReferralNoticeText style={{ marginTop: '8px', fontSize: '13px' }}>
              Váš priateľ dostane +10 bodov za odporúčanie!
            </ReferralNoticeText>
          </ReferralNotice>
        )}

        {isBlocked && (
          <BlockedWarning ref={blockedWarningRef}>
            <BlockedIcon>🚫</BlockedIcon>
            <BlockedTitle>Prístup zamietnutý</BlockedTitle>
            <BlockedMessage>
              Účet <strong>{participantCode}</strong> bol zablokovaný administrátorom.
            </BlockedMessage>
            <BlockedMessage>
              Nemôžete sa prihlásiť do aplikácie, kým vám administrátor účet neodblokuje.
            </BlockedMessage>
            <ContactInfo>
              <strong>Máte otázky?</strong><br/>
              Kontaktujte administrátora na <strong>support@example.com</strong>
            </ContactInfo>
            
            <ClearCodeButton
              variant="ghost"
              size="small"
              onClick={handleClearCode}
            >
              ↻ Použiť iný účet
            </ClearCodeButton>
          </BlockedWarning>
        )}

        <InfoBox>
          <InfoTitle>ℹ️ Formát prihlasovacieho kódu</InfoTitle>
          <InfoText>
            Váš kód sa skladá z:<br/>
            • <strong>1. písmeno</strong> mena<br/>
            • <strong>3. písmeno</strong> mena<br/>
            • <strong>2. písmeno</strong> priezviska<br/>
            • <strong>4. písmeno</strong> priezviska<br/>
            • <strong>Mesiac narodenia</strong> (2 číslice: 01-12)<br/>
            <br/>
            <strong>Príklad:</strong> Pre <strong>Roman Milanko</strong> narodený v <strong>novembri</strong>:<br/>
            → <ExampleCode>RMIL11</ExampleCode>
            <br/><br/>
            <strong>Testovacie účty:</strong> TEST01-TEST60 • <strong>Admin:</strong> RF9846
          </InfoText>
        </InfoBox>

        <FormCard $hasError={!!errors.consent}>
          <CheckboxContainer>
            <Checkbox
              type="checkbox"
              checked={consentGiven}
              onChange={e => {
                setConsentGiven(e.target.checked);
                setErrors(prev => ({ ...prev, consent: null }));
              }}
              disabled={isBlocked}
            />
            <label>Súhlasím s účasťou v prieskume</label>
          </CheckboxContainer>
          {errors.consent && <ErrorText>{errors.consent}</ErrorText>}
        </FormCard>

        <FormCard $hasError={!!errors.participant}>
          <InputLabel htmlFor="participantCode">Kód účastníka *</InputLabel>
          <Input
            id="participantCode"
            type="text"
            value={participantCode}
            onChange={async (e) => {
              const newCode = e.target.value.toUpperCase();
              setParticipantCode(newCode);
              setErrors(prev => ({ ...prev, participant: null, referral: null }));
              
              if (newCode.length === 6) {
                await checkReferralStatus(newCode);
              } else {
                setReferralAlreadyUsed(false);
                setIsBlocked(false);
              }
            }}
            placeholder="napr. RMIL11"
            $hasError={!!errors.participant}
            maxLength={6}
            disabled={isLoading}
          />
          {errors.participant && <ErrorText>{errors.participant}</ErrorText>}
          {isCheckingCode && <Note>🔄 Kontrolujem používateľa...</Note>}
          {!isCheckingCode && !isBlocked && <Note>Zadajte kód podľa inštrukcií vyššie</Note>}
          {isBlocked && <Note style={{color: '#ef4444'}}>⚠️ Tento účet je zablokovaný. Môžete zadať iný kód.</Note>}
        </FormCard>

        <CheckboxContainer $disabled={referralAlreadyUsed || isLoading || isBlocked}>
          <Checkbox
            type="checkbox"
            checked={hasReferral}
            onChange={e => {
              if (!referralAlreadyUsed && !isBlocked) {
                setHasReferral(e.target.checked);
                setErrors(prev => ({ ...prev, referral: null }));
              }
            }}
            disabled={referralAlreadyUsed || isLoading || isBlocked}
          />
          <label>
            Mám referral kód od priateľa
          </label>
        </CheckboxContainer>

        {referralAlreadyUsed && (
          <InfoBox $hasError>
            <InfoTitle>⚠️ Referral kód už bol použitý</InfoTitle>
            <InfoText>
              Už ste zadali referral kód pri predošlom prihlásení. 
              Každý používateľ môže použiť referral kód <strong>iba raz</strong>.
            </InfoText>
          </InfoBox>
        )}

        {hasReferral && !referralAlreadyUsed && !isBlocked && (
          <FormCard $hasError={!!errors.referral}>
            <InputLabel htmlFor="referralCode">
              Referral kód {referralFromUrl && '🔗 (automaticky vyplnený z linku)'}
            </InputLabel>
            <Input
              id="referralCode"
              type="text"
              value={referralCode}
              onChange={e => {
                setReferralCode(e.target.value.toUpperCase());
                setErrors(prev => ({ ...prev, referral: null }));
                setReferralFromUrl(false); // Reset pri manuálnej zmene
              }}
              placeholder="napr. ABC123"
              $hasError={!!errors.referral}
              maxLength={6}
              disabled={isLoading}
            />
            {errors.referral && <ErrorText>{errors.referral}</ErrorText>}
            <Note>🎁 Váš priateľ dostane +10 bodov za odporúčanie!</Note>
          </FormCard>
        )}

        <ButtonContainer>
          <StyledButton 
            variant="accent"
            size="large"
            fullWidth
            loading={isLoading}
            disabled={isLoading || isCheckingCode || isBlocked}
            onClick={handleStart}
          >
            → Prihlásiť sa
          </StyledButton>
        </ButtonContainer>
      </Container>
    </Layout>
  );
}
