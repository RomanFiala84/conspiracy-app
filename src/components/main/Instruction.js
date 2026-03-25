// HOTOVO
// ✅ FINÁLNA VERZIA - s lokálnymi zoznamami a správnym zarovnaním

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Layout from '../../styles/Layout';
import StyledButton from '../../styles/StyledButton';
import { useUserStats } from '../../contexts/UserStatsContext';

// =====================
// LOKÁLNE STYLED COMPONENTS PRE ZOZNAMY
// =====================

const LocalList = styled.ul`
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

const LocalNestedItem = styled.div`
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


// =====================
// OSTATNÉ STYLED COMPONENTS
// =====================

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  min-height: 100vh;
  
  @media (max-width: 768px) {
    padding: 20px 12px;
  }
`;

// =====================
// ÚVODNÉ OKNO - PRIDAJ PO EXISTUJÚCICH STYLED COMPONENTS
// =====================

const WelcomeCard = styled.div`
  background: ${p => `${p.theme.ACCENT_COLOR}25`};
  border: 2px solid ${p => p.theme.ACCENT_COLOR}60;
  border-radius: 12px;
  padding: 24px; /* ✅ Väčší padding pre úvodné okno */
  margin-bottom: 20px; /* ✅ Väčší spacing */
  width: 100%;
  max-width: 800px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: all 0.2s ease;
  text-align: center;
  
  &:hover {
    border-color: ${p => p.theme.ACCENT_COLOR};
    box-shadow: 0 4px 16px ${p => `${p.theme.ACCENT_COLOR}45`}; /* ✅ Svetelný efekt */
  }
  
  @media (max-width: 768px) {
    padding: 20px;
    margin-bottom: 16px;
  }
`;

const WelcomeTitle = styled.h2`
  font-size: 25px;
  margin-bottom: 20px;
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
    font-size: 25px;
  }
`;

const WelcomeSubtitle = styled.p`
  font-size: 15px;
  line-height: 1.6;
  color: ${props => props.theme.PRIMARY_TEXT_COLOR};
  margin-bottom: 16px;
  font-weight: 600;
  text-align: center;
  @media (max-width: 768px) {
    font-size: 15px;
  }
`;

const WelcomeInstructions = styled.div`
  text-align: center;
  font-size: 15px;
  line-height: 1.6;
  color: ${props => props.theme.PRIMARY_TEXT_COLOR};
  margin-top: 16px;
  padding-top: 16px;
  
  p {
    margin-bottom: 12px;
    
    &:last-child {
      margin-bottom: 0; /* ✅ Posledný odstavec bez marginu */
    }
    
    strong {
      color: ${props => props.theme.PRIMARY_TEXT_COLOR};
      font-weight: 600;
    }
  }
`;


const InstructionsSection = styled.div`
  width: 100%;
  max-width: 800px;
  margin-bottom: 20px;
`;


const AccordionItem = styled.div`
  margin-bottom: 8px;
  border: 1px solid ${props => props.theme.BORDER_COLOR};
  border-radius: 10px;
  overflow: hidden;
  background: ${props => props.theme.CARD_BACKGROUND};
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${props => props.theme.ACCENT_COLOR}60;
  }
`;

const AccordionHeader = styled.button`
  width: 100%;
  padding: 12px 16px;
  background: ${props => props.$isOpen ? props.theme.CARD_BACKGROUND : 'transparent'};
  border: none;
  text-align: left;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 15px;
  font-weight: 600;
  color: ${props => props.$isOpen ? props.theme.ACCENT_COLOR : props.theme.ACCENT_COLOR};
  transition: all 0.2s ease;
  font-family: inherit;
  
  &:hover {
    color: ${props => props.theme.ACCENT_COLOR};
  }
  
  @media (max-width: 768px) {
    font-size: 15px;
    padding: 12px 14px;
  }
`;

// ✅ OPTIMALIZOVANÉ ACCORDION KOMPONENTY

const AccordionContent = styled.div`
  max-height: ${props => props.$isOpen ? '3000px' : '0'};
  overflow: hidden;
  transition: max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1);
`;

const AccordionInner = styled.div`
  padding: 16px; /* ✅ FIXNÝ padding, BEZ animácie */
  color: ${props => props.theme.PRIMARY_TEXT_COLOR};
  line-height: 1.6;
  font-size: 15px;
  opacity: ${props => props.$isOpen ? '1' : '0'};
  transition: opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1) 0.08s;
  /* ✅ ODSTRÁNENÉ: padding-top a padding-bottom animácie */
  
  h3 {
    color: ${props => props.theme.PRIMARY_TEXT_COLOR};
    margin: 12px 0 6px 0;
    font-size: 15px;
    font-weight: 600;
  }
  
  p {
    margin-bottom: 10px;
  }
  
  strong {
    color: ${props => props.theme.PRIMARY_TEXT_COLOR};
    font-weight: 600;
  }
  
  a {
    color: ${props => props.theme.ACCENT_COLOR};
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
  
  @media (max-width: 768px) {
    font-size: 15px;
    
    h3 {
      font-size: 15px;
    }
  }
`;

const AccordionIcon = styled.span`
  transform: ${props => props.$isOpen ? 'rotate(180deg)' : 'rotate(0)'};
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 15px;
  color: ${props => props.theme.ACCENT_COLOR};
`;

const ContestItem = styled.div`
  margin-bottom: 8px;
  border: 1px solid ${props => props.theme.BORDER_COLOR};
  border-radius: 10px;
  overflow: hidden;
  background: ${props => props.theme.CARD_BACKGROUND};
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${props => props.theme.ACCENT_COLOR}60;
  }
`;

const ContestHeader = styled.button`
  width: 100%;
  padding: 12px 16px;
  background: ${props => props.$isOpen ? props.theme.CARD_BACKGROUND : 'transparent'};
  border: none;
  text-align: left;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 15px;
  font-weight: 600;
  color: ${props => props.$isOpen ? props.theme.ACCENT_COLOR : props.theme.ACCENT_COLOR};
  transition: all 0.2s ease;
  font-family: inherit;
  
  &:hover {
    color: ${props => props.theme.ACCENT_COLOR};
  }
  
  @media (max-width: 768px) {
    font-size: 15px;
    padding: 12px 14px;
  }
`;

// ✅ OPTIMALIZOVANÉ ACCORDION KOMPONENTY

const ContestContent = styled.div`
  max-height: ${props => props.$isOpen ? '3000px' : '0'};
  overflow: hidden;
  transition: max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1);
`;

const ContestInner = styled.div`
  padding: 16px; /* ✅ FIXNÝ padding, BEZ animácie */
  color: ${props => props.theme.PRIMARY_TEXT_COLOR};
  line-height: 1.6;
  font-size: 10px;
  opacity: ${props => props.$isOpen ? '1' : '0'};
  transition: opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1) 0.08s;
  text-align: left;
  /* ✅ ODSTRÁNENÉ: padding-top a padding-bottom animácie */
  
  h3 {
    color: ${props => props.theme.ACCENT_COLOR};
    margin: 12px 0 6px 0;
    font-size: 15px;
    font-weight: 600;
  }
  
  h4 {
    color: ${props => props.theme.ACCENT_COLOR};
    margin: 12px 0 6px 0;
    font-size: 15px;
    font-weight: 600;
  }
  
  p {
    margin-bottom: 10px;
  }
  
  strong {
    color: ${props => props.theme.ACCENT_COLOR};
    font-weight: 600;
  }
  
  a {
    color: ${props => props.theme.ACCENT_COLOR};
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
  
  @media (max-width: 768px) {
    font-size: 10px;
    
    h3 {
      font-size: 15px;
    }
    
    h4 {
      font-size: 15px;
    }
  }
`;

const ContestIcon = styled.span`
  transform: ${props => props.$isOpen ? 'rotate(180deg)' : 'rotate(0)'};
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 15px;
  color: ${props => props.theme.ACCENT_COLOR};
`;

const FormCard = styled.div`
  background: ${p => p.theme.CARD_BACKGROUND};
  border: 2px solid ${p => p.$hasError ? '#ff0000' : p.theme.BORDER_COLOR};
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  width: 100%;
  max-width: 800px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: all 0.2s ease;
  scroll-margin-top: 20px;
  
  &:hover {
    border-color: ${p => p.$hasError ? '#ff0000' : p.theme.ACCENT_COLOR}60;
  }
  
  @media (max-width: 768px) {
    padding: 14px;
  }
`;

const ConsentText = styled.div`
  font-size: 10px;
  color: ${p => p.theme.PRIMARY_TEXT_COLOR};
  line-height: 1.5;
  margin-top: 12px;
  text-align: left;
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  cursor: ${p => p.$disabled ? 'not-allowed' : 'pointer'};
  
  label {
    cursor: ${p => p.$disabled ? 'not-allowed' : 'pointer'};
    color: ${p => p.$disabled ? p.theme.ACCENT_COLOR : p.theme.ACCENT_COLOR};
    text-decoration: ${p => p.$disabled ? 'line-through' : 'none'};
    opacity: ${p => p.$disabled ? 0.6 : 1};
    user-select: none;
    font-size: 15px;
    line-height: 1.4;
  }
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  margin-top: 2px;
  flex-shrink: 0;
  cursor: ${p => p.disabled ? 'not-allowed' : 'pointer'};
  accent-color: ${p => p.theme.ACCENT_COLOR};
`;

const InputLabel = styled.label`
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  color: ${props => props.theme.SECONDARY_TEXT_COLOR};
  font-size: 15px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 14px;
  border: 2px solid ${props => props.$hasError ? '#ff0000' : props.theme.BORDER_COLOR};
  border-radius: 8px;
  font-size: 15px;
  background: ${props => props.theme.INPUT_BACKGROUND};
  color: ${props => props.theme.PRIMARY_TEXT_COLOR};
  font-family: inherit;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-weight: 600;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${props => props.$hasError ? '#ff0000' : props.theme.ACCENT_COLOR};
    box-shadow: 0 0 0 3px ${props => props.$hasError ? '#ff000022' : `${props.theme.ACCENT_COLOR}45`};
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
  color: #ff0000;
  font-size: 15px;
  margin-top: 6px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  
  &::before {
    content: '⚠️';
  }
`;

const Note = styled.div`
  font-size: 10px;
  color: ${p => p.theme.PRIMARY_TEXT_COLOR};
  margin-top: 6px;
  line-height: 1.4;
`;

const InfoBox = styled.div`
  background: ${p => p.theme.CARD_BACKGROUND};
  border: 2px solid ${p => p.$hasError ? '#ff0000' : p.theme.BORDER_COLOR};
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  width: 100%;
  max-width: 800px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: all 0.2s ease;
  scroll-margin-top: 20px;
  
  &:hover {
    border-color: ${p => p.$hasError ? '#ff0000' : p.theme.ACCENT_COLOR}60;
  }
  
  @media (max-width: 768px) {
    padding: 14px;
  }
`;

const InfoTitle = styled.div`
  color: ${p => p.theme.ACCENT_COLOR};
  font-weight: 700;
  margin-bottom: 8px;
  font-size: 15px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const InfoText = styled.div`
  color: ${p => p.theme.PRIMARY_TEXT_COLOR};
  font-size: 15px;
  line-height: 1.6;
  strong {
    color: ${p => p.theme.PRIMARY_TEXT_COLOR};
    font-weight: 600;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 20px;
  width: 100%;
  max-width: 800px;
  
  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

const BlockedWarning = styled.div`
  background: linear-gradient(135deg, #ff0000, #dc2626);
  border: 2px solid #b91c1c;
  border-radius: 16px;
  padding: 32px;
  margin: 24px 0;
  max-width: 800px;
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
  font-size: 60px;
  margin-bottom: 16px;
  animation: pulse 2s ease-in-out infinite;
  
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }
`;

const BlockedTitle = styled.h2`
  color: #ffffff;
  font-size: 25px;
  font-weight: 700;
  margin-bottom: 12px;
  
  @media (max-width: 768px) {
    font-size: 20px;
  }
`;

const BlockedMessage = styled.p`
  color: #ffffff;
  font-size: 15px;
  line-height: 1.6;
  margin-bottom: 8px;
  
  @media (max-width: 768px) {
    font-size: 15px;
  }
`;

const ContactInfo = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 16px;
  margin-top: 20px;
  color: #ffffff;
  font-size: 15px;
  
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

const ReferralNotice = styled.div`
  background: ${p => `${p.theme.ACCENT_COLOR}45`};
  border: 2px solid ${p => p.theme.ACCENT_COLOR};
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 12px;
  max-width: 800px;
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
  font-size: 15px;
  margin-bottom: 6px;
  
  strong {
    color: ${p => p.theme.ACCENT_COLOR};
    font-weight: 700;
    font-size: 15px;
    letter-spacing: 2px;
  }
`;

const CompetitionSection = styled(FormCard)`
  background: ${p => p.theme.CARD_BACKGROUND};
  border: 2px solid ${p => p.$hasError ? '#ff0000' : p.theme.BORDER_COLOR};
`;

const CompetitionTitle = styled.h3`
  color: ${p => p.theme.ACCENT_COLOR};
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 8px;
`;

const CompetitionText = styled.p`
  color: ${p => p.theme.PRIMARY_TEXT_COLOR};
  font-size: 15px;
  line-height: 1.5;
  margin-bottom: 12px;
`;

const EmailInput = styled(Input)`
  text-transform: none;
  letter-spacing: normal;
`;

const RulesSection = styled.div`
  width: 100%;
  max-width: 800px;
  margin-bottom: 12px;
`;

const RulesAccordion = styled(ContestItem)`
  border-color: ${p => p.theme.BORDER_COLOR}60;
  
  &:hover {
    border-color: ${p => p.theme.ACCENT_COLOR};
  }
`;

// =====================
// MAIN COMPONENT
// =====================

export default function Instruction() {
  const navigate = useNavigate();
  const { login, dataManager } = useUserStats();

  const [participantCode, setParticipantCode] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [hasReferral, setHasReferral] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);
  const [competitionConsent, setCompetitionConsent] = useState(false);
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [referralAlreadyUsed, setReferralAlreadyUsed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCheckingCode, setIsCheckingCode] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [referralFromUrl, setReferralFromUrl] = useState(false);
  const [openSections, setOpenSections] = useState({});
  
  const consentRef = useRef(null);
  const participantCodeRef = useRef(null);
  const emailRef = useRef(null);
  const competitionConsentRef = useRef(null);
  const referralRef = useRef(null);
  const blockedWarningRef = useRef(null);


  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    
    if (refCode && refCode.length === 6) {
      console.log(`🔗 URL obsahuje referral code: ${refCode}`);
      
      const upperRef = refCode.toUpperCase();
      sessionStorage.setItem('referralCode', upperRef);
      
      setReferralCode(upperRef);
      setHasReferral(true);
      setReferralFromUrl(true);
      
      console.log(`✅ Referral kód automaticky vyplnený: ${upperRef}`);
      
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, []);

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const validateEmail = (email) => {
    if (!email) return true;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

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

  const checkReferralStatus = async (userCode) => {
    if (!userCode || userCode.length !== 6) return false;
    
    try {
      setIsCheckingCode(true);
      
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
    let firstErrorRef = null;
    
    if (isBlocked) {
      e.blocked = 'Váš účet bol zablokovaný administrátorom.';
      firstErrorRef = blockedWarningRef;
      return e;
    }
    
    if (!consentGiven) {
      e.consent = 'Ak sa chcete zapojiť do výskumu je potrebné poskytnúť informovaný súhlas s podmienkami výskumu.';
      if (!firstErrorRef) firstErrorRef = consentRef;
    }
    
    const codeValidation = validateParticipantCode(participantCode);
    if (!codeValidation.valid) {
      e.participant = 'Zadali ste neplatný formát identifikačného kódu respondenta. Zadajte prosím identifikačný kód respondenta podľa inštrukcií.';
      if (!firstErrorRef) firstErrorRef = participantCodeRef;
    }
    
    if (email && !validateEmail(email)) {
      e.email = 'Prosím zadajte e-mailovú adresu v správnom formáte.';
      if (!firstErrorRef) firstErrorRef = emailRef;
    }
    
    if (email && validateEmail(email)) {
      try {
        const exists = await dataManager.checkEmailExists(email);
        if (exists) {
          e.email = 'Táto e-mailová adresa už bola zaregistrovaná v súťaži.';
          if (!firstErrorRef) firstErrorRef = emailRef;
        }
      } catch (error) {
        console.error('❌ Error checking email:', error);
        e.email = 'Nepodarilo sa overiť e-mailovú adresu. Skúste to znova prosím.';
        if (!firstErrorRef) firstErrorRef = emailRef;
      }
    }

    if (email && !competitionConsent) {
      e.competitionConsent = 'Ak sa chcete zapojiť do súťaže je potrebné poskytnúť informovaný súhlas s pravidlami a podmienkami súťaže.';
      if (!firstErrorRef) firstErrorRef = competitionConsentRef;
    }
    
    if (hasReferral) {
      if (referralAlreadyUsed) {
        e.referral = 'Už ste použili referral kód. Viacnásobné použitie referral kódu nie je povolené.';
        if (!firstErrorRef) firstErrorRef = referralRef;
      } else if (!referralCode || !/^[A-Z0-9]{6}$/.test(referralCode.trim())) {
        e.referral = 'Referral kód musí mať presne 6 znakov.';
        if (!firstErrorRef) firstErrorRef = referralRef;
      } else {
        try {
          const valid = await dataManager.validateReferralCode(referralCode.trim().toUpperCase());
          if (!valid) {
            e.referral = 'Tento referral kód neexistuje.';
            if (!firstErrorRef) firstErrorRef = referralRef;
          } else {
            const userSharingCode = await dataManager.getUserSharingCode(participantCode.toUpperCase());
            if (userSharingCode && userSharingCode === referralCode.trim().toUpperCase()) {
              e.referral = 'Nemôžete použiť svoj vlastný referral kód.';
              if (!firstErrorRef) firstErrorRef = referralRef;
            }
          }
        } catch (error) {
          console.error('❌ Error validating referral:', error);
          e.referral = 'Nepodarilo sa overiť referral kód. Skúste to znova prosím.';
          if (!firstErrorRef) firstErrorRef = referralRef;
        }
      }
    }
    
    if (firstErrorRef && Object.keys(e).length > 0) {
      setTimeout(() => {
        firstErrorRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }, 100);
    }
    
    return e;
  };

  const isProcessingRef = useRef(false); // ✅ PRIDANÉ

  const handleStart = async () => {
    // ✅ ZMENA 1: OKAMŽITÁ OCHRANA - useRef kontrola NA ZAČIATKU (pred sessionStorage check)
    if (isProcessingRef.current) {
      console.log('⏭️ Already processing (ref check), ignoring click');
      return;
    }
    
    isProcessingRef.current = true; // ✅ Okamžite nastav
    setIsProcessing(true);
    setIsLoading(true);
    
    try {
      // ✅ ZMENA 2: VALIDÁCIA NA ZAČIATKU (pred akýmikoľvek kontrolami)
      const e = await validate();
      setErrors(e);
      
      if (Object.keys(e).length > 0) {
        console.log('❌ Validation failed:', e);
        return;
      }

      const codeValidation = validateParticipantCode(participantCode);
      const upperCode = participantCode.toUpperCase();
      
      // ✅ ZMENA 3: KONTROLA BLOKOVANIA (pred uložením do sessionStorage)
      try {
        const userData = await dataManager.loadUserProgress(upperCode, true);
        
        if (userData?.blocked) {
          console.log(`❌ Účet ${upperCode} je blokovaný`);
          setIsBlocked(true);
          setParticipantCode(upperCode);
          setErrors({ blocked: 'Tento účet bol zablokovaný administrátorom.' });
          setTimeout(() => {
            blockedWarningRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 100);
          return;
        }
      } catch (error) {
        console.error('❌ Error checking blocked status:', error);
      }
      
      // ✅ ZMENA 4: ULOŽIŤ sessionStorage PRED login() (ako v starej verzii)
      sessionStorage.setItem('participantCode', upperCode);
      console.log(`💾 SessionStorage nastavené: ${upperCode}`);
      
      // ✅ ZMENA 5: Ulož informovaný súhlas
      try {
        const userData = await dataManager.loadUserProgress(upperCode);
        
        userData.informed_consent_given = consentGiven;
        userData.informed_consent_timestamp = new Date().toISOString();
        
        if (email && competitionConsent) {
          userData.competition_consent_given = true;
          userData.competition_consent_timestamp = new Date().toISOString();
        }
        
        await dataManager.saveProgress(upperCode, userData);
        console.log(`✅ Súhlasy uložené pre ${upperCode}`);
        
      } catch (error) {
        console.error('❌ Error saving consents:', error);
      }

      // ✅ Ulož email pre súťaž
      if (email && validateEmail(email) && competitionConsent) {
        try {
          await dataManager.saveCompetitionEmail(upperCode, email);
          console.log(`✅ Email pre súťaž uložený: ${email}`);
        } catch (error) {
          console.error('❌ Email save error:', error);
        }
      }
      
      // ✅ Spracuj referral kód
      if (hasReferral && !referralAlreadyUsed && referralCode.trim()) {
        try {
          await dataManager.processReferral(upperCode, referralCode.trim().toUpperCase());
          console.log(`✅ Referral kód spracovaný: ${referralCode}`);
        } catch (error) {
          console.error('❌ Referral processing error:', error);
          setErrors({ referral: 'Chyba pri spracovaní referral kódu. Zadajte kód znova prosím.' });
          return;
        }
      }
      
      // ✅ ZMENA 6: PRIHLÁSENIE (ako v starej verzii)
      console.log(`🔐 Prihlasovanie používateľa: ${upperCode}`);
      const loginResult = await login(upperCode);
      
      if (!loginResult.success) {
        if (loginResult.blocked) {
          console.log(`❌ Účet ${upperCode} je blokovaný`);
          setIsBlocked(true);
          setParticipantCode(upperCode);
          setErrors({ blocked: 'Tento účet bol zablokovaný administrátorom.' });
          setTimeout(() => {
            blockedWarningRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 100);
        } else {
          console.log('❌ Login failed:', loginResult.message);
          setErrors({ general: loginResult.message || 'Chyba pri prihlásení.' });
        }
        return;
      }
      
      // ✅ ZMENA 7: NAVIGÁCIA (ako v starej verzii - až PO úspešnom login)
      await new Promise(resolve => setTimeout(resolve, 150));

      console.log(`✅ Prihlásenie úspešné - presmerovanie (${codeValidation.type})`);

      if (codeValidation.type === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/intro', { replace: true });
      }
      
    } catch (error) {
      console.error('❌ Unexpected error in handleStart:', error);
      setErrors({ general: 'Neočakávaná chyba. Skúste to znova prosím.' });
    } finally {
      // ✅ ZMENA 8: VŽDY resetuj TRI flagy (state + ref)
      setIsLoading(false);
      setIsProcessing(false);
      isProcessingRef.current = false;
      console.log('🔄 Processing flags reset');
    }
  };

  const handleClearCode = () => {
    setParticipantCode('');
    setIsBlocked(false);
    setReferralAlreadyUsed(false);
    setErrors({});
    setConsentGiven(false);
    setCompetitionConsent(false);
    setHasReferral(false);
    setReferralCode('');
    setReferralFromUrl(false);
    setEmail('');
    sessionStorage.removeItem('participantCode');
    console.log('🧹 Formulár vyčistený');
  };




  const instructionsSections = [
    {
      id: 'podmienky',
      title: 'Aké sú podmienky účasti vo výskume?',
      content: (
      <LocalList>
        <li>Účasť je určená len pre dospelé osoby (18 a viac rokov), ktoré sú schopné samostatne posúdiť informácie o výskume a rozhodnúť sa o svojej účasti.</li>
        <li>Pre účasť je ďalej potrebné, aby respondent/ka pochádzal/a zo Slovenska, prípadne mal/a trvalý/dlhodobý pobyt na území Slovenskej republiky.</li>
        <li>Pozorne si prečítajte každú otázku a tvrdenie, odpovedajte prosím úprimne. Veľmi dlho nad otázkami a tvrdeniami nepremýšľajte. Pri jednotlivých položkách nie sú správne alebo nesprávne odpovede.</li>
        <li>V prípade porušenia podmienok výskumu, môžete byť z výskumu a súťaže o ceny vylúčený, následkom čoho bude zablokovanie vášho prístupu do aplikácie.</li>
      </LocalList>
      )
    },
    {
      id: 'ciel',
      title: 'Čo je cieľom predvýskumu a hlavného výskumu?',
      content: (
      <>
        <LocalList>
          <li>Predvýskum:</li>
        </LocalList>
        <LocalNestedItem>
          Predtým ako spustíme hlavný výskum, potrebujeme overiť, že všetky otázky a tvrdenia v dotazníku sú zrozumiteľné a jednoznačné.
        </LocalNestedItem>
        
        <LocalList>
          <li>Hlavný výskum:</li>
        </LocalList>
        <LocalNestedItem>
          Cieľom nášho hlavného výskumu je lepšie porozumieť tomu, ako ľudia na Slovensku vnímajú inštitúcie Európskej únie, ako im dôverujú a aké faktory s tým súvisia. V našom výskume sme sa preto zameriavame na to ako informácie o fungovaní EÚ a jej prínosoch môžu pôsobiť na presvedčenia a mieru dôvery v inštitúcie EÚ.
        </LocalNestedItem>
      </>
      )
    },
    {
      id: 'priebehPred',
      title: 'Ako bude prebiehať predvýskum?',
      content: (
      <>
        <LocalList>
          <li>V predvýskume prejdete sériou otázok a tvrdení - Misia 0 (5-10 minút).</li>
          <li>Pri hodnotení neexistujú správne ani nesprávne odpovede a po každom bloku otázok vás požiadame o spätnú väzbu.</li>
          <li>Budeme sa pýtať napríklad na:</li>
        </LocalList>
        
        <LocalNestedItem>
          Zrozumiteľnosť: Bola otázka alebo tvrdenie významovo jasná? Rozumeli ste všetkým použitým slovám?
        </LocalNestedItem>
        <LocalNestedItem>
          Jednoznačnosť: Mohli by ste si otázku vyložiť viacerými spôsobmi?
        </LocalNestedItem>
        <LocalNestedItem>
          Významová zhoda: Pri niektorých položkách vám ukážeme dva rôzne spôsoby formulácie toho istého tvrdenia. Budeme sa pýtať, či podľa vás znamenajú to isté, alebo sa v niečom líšia.
        </LocalNestedItem>
        <LocalNestedItem>
          Hodnotiaca stupnica: Bola stupnica odpovedí zrozumiteľná a mali ste pocit, že dokážete vyjadriť svoj skutočný postoj?
        </LocalNestedItem>
      </>
      )
    },
    {
      id: 'priebehHlavny',
      title: 'Ako bude prebiehať hlavný výskum?',
      content: (
      <>
        <LocalList>
          <li>Výskum prebieha online formou interaktívnej aplikácie.</li>
          <li>Pozostáva z troch fáz:</li>
        </LocalList>
        
        <LocalNestedItem>
          Misia 1 (5-10 minút) - Úvodný dotazník.
        </LocalNestedItem>
        <LocalNestedItem>
          Misia 2 (10-15 minút) - Prebehne bezprostredne po dokončení úvodného dotazníka.
        </LocalNestedItem>
        <LocalNestedItem>
          Misia 3 (10-15 minút) - Prebehne po piatich dňoch od dokončenia Misie 1.
        </LocalNestedItem>
      
      </>
      )
    },
    {
      id: 'spracovanie',
      title: 'Ako budú spracované výsledky a chránené vaše údaje?',
      content: (
      <LocalList>
        <li>Odpovede, ktoré nám poskytnete vyplnením dotazníka, budú použité výhradne na výskumné účely.</li>
        <li>Výsledky budú spracované a zverejňované len v anonymizovanej, súhrnnej forme, takže z nich nebude možné spätne identifikovať konkrétnu osobu.</li>
        <li>V dotazníku neuvádzate žiadne osobné identifikačné údaje ani IP adresu a namiesto mena si vytvoríte jedinečný kód.</li>
        <li>Všetky údaje sú anonymné, dôverné a uložené v zabezpečenej databáze, ku ktorej má prístup len výskumný tím.</li>
        <li>Ak poskytnete e-mailovú adresu kvôli zapojeniu sa do súťaže alebo do ďalšej časti výskumu, bude použitá výhradne na tieto účely a po ukončení súťaže a výskumu bude bezprostredne vymazaná.</li>
      </LocalList>
      )
    },
    {
      id: 'odstupenie',
      title: 'Môžem odstúpiť?',
      content: (
      <LocalList>
        <li>Áno. Účasť je dobrovoľná a môžete kedykoľvek odstúpiť bez udania dôvodu.</li>
        <li>Môžete tiež požiadať o vymazanie údajov, ktoré budú odstránené najneskôr do 7 dní po ukončení výskumu.</li>
      </LocalList>
      )
    },
    {
      id: 'rizika',
      title: 'Aké sú riziká účasti vo výskume?',
      content: (
      <LocalList>
        <li>Účasť nepredstavuje žiadne závažné riziká.</li>
        <li>Niektoré tvrdenia sa dotýkajú citlivých spoločenských tém, čo môže vyvolať mierne emocionálne napätie.</li>
        <li>Ak pocítite akúkoľvek nepohodu, môžete účasť kedykoľvek ukončiť, prípadne využiť niektorý z kontaktov pre pomoc uvedených nižšie.</li>
      </LocalList>
      )
    },
    {
      id: 'podpora',
      title: 'Čo ak sa budem počas výskumu cítiť znepokojený/á',
      content: (
      <>
        <LocalList>
          <li>Je úplne v poriadku mať z niektorých tém alebo tvrdení nepríjemný pocit - dotýkajú sa citlivých spoločenských tém.</li>
        </LocalList>
        
        <LocalNestedItem>
          Odporúčame o svojich pocitoch hovoriť s niekým, komu dôverujete (priateľ, rodina, odborník).
        </LocalNestedItem>
        <LocalNestedItem>
          Ak máte pocit, že na vás podobné informácie dlhodobo pôsobia stresujúco alebo úzkostne, môže byť užitočné poradiť sa so psychológom alebo iným odborníkom.
        </LocalNestedItem>

        <LocalList>
          <li>Dostupné zdroje pomoci:</li>
        </LocalList>
        
        <LocalNestedItem>
          Kontakt na výskumníka - <a href="mailto:roman.fiala@tvu.sk">roman.fiala@tvu.sk</a>
        </LocalNestedItem>
        <LocalNestedItem>
          IPčko - <a href="https://ipcko.sk" target="_blank" rel="noopener noreferrer">https://ipcko.sk</a>
        </LocalNestedItem>
        <LocalNestedItem>
          Linka dôvery - <a href="https://www.linkanezabudka.sk" target="_blank" rel="noopener noreferrer">https://www.linkanezabudka.sk</a>
        </LocalNestedItem>
      </>
      )
    },
    {
      id: 'sutaz',
      title: 'Súťaž',
      content: (
      <LocalList>
        <li>Súťaž bude vyhodnotená na základe stanovených pravidiel do 10 dní od ukončenia hlavného výskumu.</li>
        <li>Podrobné informácie o bodovaní, cenách a podmienkach účasti nájdete nižšie v sekcii Pravidlá a podmienky súťaže.</li>
      </LocalList>
      )
    },
    {
      id: 'kontakt',
      title: 'Kontakt',
      content: (
      <LocalList>
        <li>V prípade, že máte otázky k samotnému výskumu, môžete nás kontaktovať na uvedenej e-mailovej adrese - radi vám poskytneme doplňujúce informácie.</li>
        <li>Výskumník:<br/>
        Roman Fiala<br/>
        Psychológia, 3. roč. Bc.<br/>
        Katedra psychológie, Filozofická fakulta, Trnavská univerzita v Trnave<br/>
        Email: <a href="mailto:roman.fiala@tvu.sk">roman.fiala@tvu.sk</a></li>
      </LocalList>
      )
    }
  ];

  return (
    <Layout showLevelDisplay={false} showAnimatedBackground={true}
  cubeCount={50}
  animationSpeed="normal"
  complexity="medium">
      <Container>
        <WelcomeCard>
          <WelcomeTitle><strong>Vitajte v aplikácií CP-PASS</strong></WelcomeTitle>
          
          <WelcomeSubtitle>
            <strong>Milá respondentka, milý respondent, ďakujeme vám za váš čas a ochotu zúčastniť sa v našom výskume.</strong>
          </WelcomeSubtitle>
          
          <WelcomeInstructions>
            <p><strong>Prečítajte si prosím pozorne podmienky a inštrukcie k výskumu.</strong></p>
            <p><strong>Následne pokračujte prihlásením sa do výskumnej aplikácie.</strong></p>
          </WelcomeInstructions>
        </WelcomeCard>

        <InstructionsSection>
          
          {instructionsSections.map(section => (
            <AccordionItem key={section.id}>
              <AccordionHeader 
                onClick={() => toggleSection(section.id)}
                $isOpen={openSections[section.id]}
              >
                {section.title}
                <AccordionIcon $isOpen={openSections[section.id]}>▼</AccordionIcon>
              </AccordionHeader>
              <AccordionContent $isOpen={openSections[section.id]}>
                <AccordionInner $isOpen={openSections[section.id]}>
                  {section.content}
                </AccordionInner>
              </AccordionContent>
            </AccordionItem>
          ))}
        </InstructionsSection>

        {referralFromUrl && referralCode && (
          <ReferralNotice>
            <ReferralNoticeText>
              Referral kód bol automaticky vyplnený: <strong>{referralCode}</strong>
            </ReferralNoticeText>
            <ReferralNoticeText style={{ marginTop: '8px', fontSize: '15px' }}>
              Váš priateľ/ka dostane +10 bodov za odporúčanie!
            </ReferralNoticeText>
          </ReferralNotice>
        )}

        {isBlocked && (
          <BlockedWarning ref={blockedWarningRef}>
            <BlockedIcon>🚫</BlockedIcon>
            <BlockedTitle>Váš prístup do aplikácie bol zamietnutý.</BlockedTitle>
            <BlockedMessage>
              Váš účet <strong style={{ textTransform: 'uppercase' }}>{participantCode}</strong>  bol zablokovaný administrátorom.
            </BlockedMessage>
            <BlockedMessage>
              <strong>Nemôžete sa prihlásiť do aplikácie výskumu, kým vám administrátor váš účet neodblokuje.</strong>
            </BlockedMessage>
            <ContactInfo>
              <strong>V prípade ak sa chcete dozvedieť z akého dôvodu bol váš účet zablokovaný alebo pokračovať vo výskume, kontaktujte prosím administrátora.</strong><br/>
              <strong>Email: roman.fiala@tvu.sk</strong>
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

        <FormCard ref={consentRef} $hasError={!!errors.consent}>
          <div>
            <CheckboxContainer 
              $disabled={isBlocked}
              onClick={() => !isBlocked && setConsentGiven(!consentGiven)}>
              <Checkbox
                type="checkbox"
                checked={consentGiven}
                disabled={isBlocked}
                onChange={(e) => setConsentGiven(e.target.checked)}
              />
              <label><strong>SÚHLASÍM SO SPRACOVANÍM ÚDAJOV A PARTICIPÁCIOU VO VÝSKUME</strong></label>
            </CheckboxContainer>
            
            <ConsentText>
              <LocalList>
                <li><strong>Prehlasujem, že:</strong></li>
              </LocalList>
              
              <LocalNestedItem>
               Bol(a) som informovaný(á) o účele, priebehu a podmienkach výskumu prostredníctvom informačného listu.
              </LocalNestedItem>
              <LocalNestedItem>
                Rozumiem, že v prípade porušenia podmienok výskumu, môžem byť z výskumu a súťaže o ceny vylúčený, následkom čoho bude zablokovanie môjho prístupu do aplikácie.
              </LocalNestedItem>
              <LocalNestedItem>
                Mám vedomosť o svojich právach a povinnostiach počas výskumu.
              </LocalNestedItem>
              <LocalNestedItem>
                Rozumiem, že moja účasť je dobrovoľná a môžem kedykoľvek odstúpiť bez penalizácie.
              </LocalNestedItem>
              <LocalNestedItem>
                Rozumiem, že moje osobné údaje budú spracované v súlade s GDPR a zákonom č. 18/2018 Z. z..
              </LocalNestedItem>
              <LocalNestedItem>
                Súhlasím s anonymizáciou a publikáciou mojich údajov v súhrnnej forme.
              </LocalNestedItem>
              <LocalNestedItem>
                Uvedomujem si a súhlasím so všetkým uvedeným vyššie.
              </LocalNestedItem>
            </ConsentText>
          </div>
          {errors.consent && <ErrorText>{errors.consent}</ErrorText>}
        </FormCard>

        <InfoBox>
          <InfoTitle>Inštrukcie pre prihlásenie</InfoTitle>
          <InfoText>
            <LocalList>
              <li>Do výskumu sa ako respondenti budete prihlasovať pomocou identifikačného kódu respondenta (IKR).</li> 
              <li>Kód sa skladá zo štyroch znakov a dvojčíslia, ktoré budú pri vašom zadávaní zapísané automaticky veľkým písmom.</li> 
              <li>Tento kód slúži na to aby bola zachovaná vaša anonymita a aby ste si kód pri ďalšom prihlásení nemuseli pamätať.</li> 
              <li><strong>Prosím zadajte kód podľa následujúcich inštrukcií:</strong></li>
            </LocalList>
            
            <LocalNestedItem>
              <strong>Pre 1. znak: Zadajte prvé písmeno vášho mena.</strong>
            </LocalNestedItem>
            <LocalNestedItem>
              <strong>Pre 2. znak: Zadajte posledné písmeno vášho mena.</strong>
            </LocalNestedItem>
            <LocalNestedItem>
              <strong>Pre 3. znak: Zadajte druhé písmeno vášho priezviska.</strong>
            </LocalNestedItem>
            <LocalNestedItem>
              <strong>Pre 4. znak: Zadajte tretie písmeno vášho priezviska.</strong>
            </LocalNestedItem>
            <LocalNestedItem>
              <strong>Pre dvojčíslie: Zadajte číselne váš mesiac narodenia vo formáte MM (napr. pre január zadajte 01).</strong>
            </LocalNestedItem>
            <LocalNestedItem>
              Príklad: Jožko Mrkvička narodený v novembri = JORK11.
            </LocalNestedItem>
            
            <LocalList>
              <li><strong>V prípade ak ste sa do výskumu ešte neprihlásili a IKR už existuje, zadajte prosím:</strong></li>
            </LocalList>
            
            <LocalNestedItem>
              <strong>Namiesto 1. znaku: Zadajte 1. písmeno okresu v ktorom žijete.</strong>
            </LocalNestedItem>
            
            <LocalNestedItem>
              Príklad: Jožko Mrkvička narodený v novembri z okresu Trenčín = TORK11.
            </LocalNestedItem>
          </InfoText>
        </InfoBox>

        <FormCard ref={participantCodeRef} $hasError={!!errors.participant || !!errors.blocked}>
          <InputLabel htmlFor="participant-code"><strong>Zadajte váš identifikačný kód respondenta pre prihlásenie:</strong></InputLabel>
          <Input
            id="participant-code"
            type="text"
            placeholder="Napr. ABCD01"
            value={participantCode}
            onChange={(e) => setParticipantCode(e.target.value)}
            onBlur={(e) => checkReferralStatus(e.target.value)}
            disabled={isBlocked}
            maxLength={6}
            $hasError={!!errors.participant || !!errors.blocked}
            autoComplete="off"
          />
          {errors.participant && <ErrorText>{errors.participant}</ErrorText>}
          {errors.blocked && <ErrorText>{errors.blocked}</ErrorText>}
          <Note>Prosím zadajte kód podľa inštrukcií.</Note>
        </FormCard>

        <CompetitionSection ref={emailRef}>
          <CompetitionTitle>Zapojte sa do súťaže o ceny</CompetitionTitle>
          <CompetitionText>
            <LocalList>
              <li><strong>Pre zapojenie do súťaže je potrebné zadať e-mailovú adresu a absolovať predvýskum alebo prvú časť hlavného výskumu.</strong></li>
              <li><strong>Súťaž funguje na základe bodovacieho systému:</strong></li>
            </LocalList>
            
            <LocalNestedItem>
              Za absolvovanie predvýskumu získava účastník 50 bodov.
            </LocalNestedItem>
            <LocalNestedItem>
              Za absolvovanie prvej časti hlavného výskumu získava účastník 50 bodov.
            </LocalNestedItem>
            <LocalNestedItem>
              Za absolvovanie druhej časti hlavného výskumu (follow up meranie) získava účastník 25 bodov.
            </LocalNestedItem>
            <LocalNestedItem>
              Za odporúčanie ďalším účastníkom získava účastník 10 bodov za každého nového účastníka, ktorý dokončí aspoň predvýskum alebo prvú časť výskumu.
            </LocalNestedItem>
            
            <LocalList>
              <li><strong>Hlavnou cenou je darčekový poukaz v hodnote 50 € pre jedného výhercu, ktorý získa najviac zdieľaní - platných dokončení od nových respondentov prostredníctvom svojho referral kódu (zdieľacieho kódu) a splní podmienky účasti v súťaži.</strong></li>
              <li><strong>Vedľajšími cenami sú darčekové poukazy, každý v hodnote 10 € pre troch výhercov, ktorí získajú minimálne 50 bodov do žrebovania a splnia podmienky účasti v súťaži.</strong></li>
              <li><strong>Výhercovia si určia, v ktorom obchode si chcú uplatniť darčekový poukaz a na základe toho im bude poukaz poskytnutý.</strong></li>
              <li><strong>Organizátor si vyhradzuje právo zmeniť typ ceny za inú v rovnakej alebo vyššej hodnote (napr. iný typ poukážky), ak pôvodnú cenu nebude možné zabezpečiť.</strong></li>
              <li><strong>Viac informácií o súťaži nájdete v sekcii Pravidlá a podmienky súťaže.</strong></li>
            </LocalList>
          </CompetitionText>
          
          <InputLabel htmlFor="email"><strong>Zadajte prosím e-mailovú adresu pre zapojenie do súťaže (nepovinné):</strong></InputLabel>
          <EmailInput
            id="email"
            type="email"
            placeholder="vas.email@priklad.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isBlocked}
            $hasError={!!errors.email}
            autoComplete="email"
          />
          {errors.email && <ErrorText>{errors.email}</ErrorText>}
          <Note>
            <LocalList>
              <li>Kontaktný e-mail nebude spájaný s odpoveďami v predvýskume ani v hlavnom výskume.</li>
              <li>E-mailová adresa bude použitá výhradne na účely kontaktovania výhercov a budú uchovávané len po dobu trvania súťaže a odovzdania výhry, následne budú bezpečne zlikvidované.</li>
            </LocalList>
          </Note>
        </CompetitionSection>

        {email && (
          <FormCard ref={competitionConsentRef} $hasError={!!errors.competitionConsent}>
            <div>
              <CheckboxContainer 
                $disabled={isBlocked}
                onClick={() => !isBlocked && setCompetitionConsent(!competitionConsent)}>
                <Checkbox
                  type="checkbox"
                  checked={competitionConsent}
                  disabled={isBlocked}
                  onChange={(e) => setCompetitionConsent(e.target.checked)}
                />
                <label>
                  <strong>SÚHLASÍM SO SPRACOVANÍM OSOBNÝCH ÚDAJOV A PARTICIPÁCIOU V SÚŤAŽI</strong>
                </label>
              </CheckboxContainer>
              
              <ConsentText>
                <LocalList>
                  <li><strong>Prehlasujem, že:</strong></li>
                </LocalList>
                
                <LocalNestedItem>
                  Súhlasím s účasťou v súťaži a potvrdzujem, že som si Pravidlá a podmienky súťaže prečítal/a, porozumel/a im a súhlasím s nimi.
                </LocalNestedItem>
                <LocalNestedItem>
                  Rozumiem, že v prípade porušenia podmienok súťaže, môžem byť zo súťaže o ceny vylúčený.
                </LocalNestedItem>
                <LocalNestedItem>
                  Mám vedomosť o svojich právach a povinnostiach počas súťaže.
                </LocalNestedItem>
                <LocalNestedItem>
                  Rozumiem, že moja účasť je dobrovoľná a môžem kedykoľvek odstúpiť bez penalizácie.
                </LocalNestedItem>
                <LocalNestedItem>
                  Rozumiem, že moje osobné údaje budú spracované v súlade s GDPR a zákonom č. 18/2018 Z. z..
                </LocalNestedItem>
                <LocalNestedItem>
                  Uvedomujem si a súhlasím so všetkým uvedeným vyššie.
                </LocalNestedItem>
              </ConsentText>
            </div>
            {errors.competitionConsent && <ErrorText>{errors.competitionConsent}</ErrorText>}
          </FormCard>
        )}

        {!referralAlreadyUsed && (
          <FormCard ref={referralRef} $hasError={!!errors.referral}>
            <CheckboxContainer
              $disabled={isBlocked}
              onClick={() => !isBlocked && setHasReferral(!hasReferral)}
            >
              <Checkbox
                type="checkbox"
                checked={hasReferral}
                disabled={isBlocked}
                onChange={(e) => setHasReferral(e.target.checked)}
              />
              <label><strong>Mám referral kód</strong></label>
            </CheckboxContainer>

            {hasReferral && (
              <>
                <InputLabel htmlFor="referral-code" style={{ marginTop: '16px' }}>
                  <strong>Zadajte referral kód: </strong>{referralFromUrl && '(automaticky vyplnený)'}
                </InputLabel>
                <Input
                  id="referral-code"
                  type="text"
                  placeholder="Zadajte 6-znakový kód"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  disabled={isBlocked || referralFromUrl}
                  maxLength={6}
                  $hasError={!!errors.referral}
                  autoComplete="off"
                />
                {errors.referral && <ErrorText>{errors.referral}</ErrorText>}
                <Note>
                  {referralFromUrl 
                    ? 'Kód bol vyplnený automaticky z odkazu.' 
                    : 'Zadajte 6-znakový kód ktorý vám bol poskytnutý respondentom od ktorého ste prišli do nášho výskumu.'}
                </Note>
              </>
            )}
          </FormCard>
        )}

        <RulesSection>
          <RulesAccordion>
            <ContestHeader 
              onClick={() => toggleSection('rules')}
              $isOpen={openSections['rules']}
            >
              <strong>Pravidlá a podmienky súťaže</strong>
              <ContestIcon $isOpen={openSections['rules']}>▼</ContestIcon>
            </ContestHeader>
            <ContestContent $isOpen={openSections['rules']}>
              <ContestInner $isOpen={openSections['rules']}>

                <h4>Organizátor súťaže:</h4>
                <LocalList>
                  <li>Organizátorom súťaže je hlavný zodpovedný riešiteľ výskumu - Roman Fiala.</li>
                </LocalList>

                <h4>Účastníci súťaže:</h4>
                <LocalList>
                  <li>Súťaže sa môžu zúčastniť osoby, ktoré dovŕšili 18 rokov a vyjadrili informovaný súhlas s účasťou vo výskume.</li>
                </LocalList>

                <h4>Podmienky zaradenia do žrebovania:</h4>
                <LocalList>
                  <li>Podmienky účasti uvedené v tejto časti sú zároveň podmienkami na získanie minimálneho počtu 50 bodov potrebných na zaradenie do žrebovania.</li>
                  <li>Účastník bude zaradený do žrebovania o ceny, ak:</li>
                </LocalList>
                
                <LocalNestedItem>
                  Absolvuje aspoň jednu z požadovaných častí výskumu: Predvýskum alebo prvú časť hlavného výskumu.
                </LocalNestedItem>
                <LocalNestedItem>
                  Pravdivo a úplne vyplní všetky povinné položky predvýskumu alebo prvej časti hlavného výskumu.
                </LocalNestedItem>
                <LocalNestedItem>
                  Poskytne kontaktný e-mail určený výhradne na účely súťaže, ktorý nie je spájaný s výskumnými dátami.
                </LocalNestedItem>
                
                <LocalList>
                  <li>Účasť v súťaži nie je podmienkou účasti vo výskume, respondent sa môže zúčastniť výskumu aj bez poskytnutia kontaktného e-mailu.</li>
                </LocalList>

                <h4>Trvanie súťaže:</h4>
                <LocalList>
                  <li>Súťaž prebieha v období od spustenia predvýskumu do ukončenia hlavného výskumu - marec/apríl 2026.</li>
                  <li>Pozor - predvýskum bude dostupný iba do spustenia hlavného výskumu, to znamená že po jeho spustení predvýskum už nebude možné absolvovať.</li>
                  <li>Do žrebovania budú zaradení len účastníci, ktorí splnia podmienky účasti v tomto časovom intervale.</li>
                </LocalList>

                <h4>Bodovanie účasti v súťaži:</h4>
                <LocalList>
                  <li>Každý získaný bod predstavuje jeden žreb v súťaži. Účastník s vyšším počtom bodov tak má vyššiu pravdepodobnosť výhry. Minimálnou podmienkou zaradenia do žrebovania je získanie minimálne 50 bodov.</li>
                  <li>Za absolvovanie predvýskumu získava účastník 50 bodov.</li>
                  <li>Za absolvovanie prvej časti hlavného výskumu získava účastník 50 bodov.</li>
                  <li>Za absolvovanie druhej časti hlavného výskumu (follow-up meranie) získava účastník 25 bodov.</li>
                  <li>Za odporúčanie ďalším účastníkom získava účastník 10 bodov za každého nového účastníka, ktorý dokončí aspoň predvýskum alebo prvú časť výskumu.</li>
                </LocalList>
                
                <LocalNestedItem>
                  Každý účastník, ktorý absolvuje aspoň predvýskum alebo prvú časť hlavného výskumu, získa jedinečný referral kód.
                </LocalNestedItem>
                <LocalNestedItem>
                  Ak nový účastník pri vstupe do štúdie uvedie referral kód osoby, ktorá ho pozvala, a sám splní podmienky účasti, osoba, ktorá referral kód zdieľala, získa za každé takéto platné odporúčanie 10 bodov.
                </LocalNestedItem>
                <LocalNestedItem>
                  Za toho istého nového účastníka možno referral kód započítať len raz a len jednému odporúčateľovi.
                </LocalNestedItem>
                <LocalNestedItem>
                  Referral kód nemá vplyv na samotný priebeh výskumu, slúži iba na pridelenie bodov do súťaže.
                </LocalNestedItem>

                <h4>Výhry:</h4>
                <LocalList>
                  <li>Hlavnou cenou je darčekový poukaz v hodnote 50 € pre jedného výhercu, ktorý získa najviac zdieľaní - platných dokončení od nových respondentov prostredníctvom svojho referral kódu (zdieľacieho kódu) a splní podmienky účasti v súťaži.</li>
                  <li>Vedľajšími cenami sú darčekové poukazy, každý v hodnote 10 € pre troch výhercov, ktorí získajú minimálne 50 bodov do žrebovania a splnia podmienky účasti v súťaži.</li>
                  <li>Výhercovia si určia, v ktorom obchode si chcú uplatniť darčekový poukaz a na základe toho im bude poukaz poskytnutý.</li>
                  <li>Organizátor si vyhradzuje právo zmeniť typ ceny za inú v rovnakej alebo vyššej hodnote (napr. iný typ poukážky), ak pôvodnú cenu nebude možné zabezpečiť.</li>
                </LocalList>

                <h4>Žrebovanie výhercov:</h4>
                <LocalList>
                  <li>Žrebovanie prebehne najneskôr do 10 dní po ukončení hlavného výskumu.</li>
                  <li>Žrebovanie bude realizované náhodným výberom z databázy e-mailových adries účastníkov, ktorí splnili podmienky účasti.</li>
                  <li>Žrebovanie vykoná organizátor za prítomnosti svedkov a bude zaznamenané na videozáznam s časovou stopou.</li>
                </LocalList>

                <h4>Oznámenie a odovzdanie výhry:</h4>
                <LocalList>
                  <li>Výhercovia budú kontaktovaní e-mailom najneskôr do 5 dní od žrebovania.</li>
                  <li>Ak výherca do 10 pracovných dní od odoslania e-mailu nereaguje alebo odmietne výhru, cena môže byť pridelená náhradníkovi, ktorý bude vyžrebovaný rovnakým spôsobom.</li>
                  <li>Výhra bude odovzdaná elektronicky formou poukazu.</li>
                </LocalList>

                <h4>Ochrana osobných údajov:</h4>
                <LocalList>
                  <li>Kontaktný e-mail nebude spájaný s odpoveďami v predvýskume ani v hlavnom výskume.</li>
                  <li>Údaje budú použité výhradne na účely kontaktovania výhercu a budú uchovávané len po dobu trvania súťaže a odovzdania výhry, následne budú bezpečne zlikvidované.</li>
                  <li>Spracovanie osobných údajov prebieha v súlade s GDPR a zákonom č. 18/2018 Z. z.</li>
                </LocalList>

                <h4>Vylúčenie zo súťaže:</h4>
                <LocalList>
                  <li>Organizátor si vyhradzuje právo vylúčiť účastníka zo súťaže, ak:</li>
                </LocalList>
                
                <LocalNestedItem>
                  Porušil tieto pravidlá a podmienky súťaže.
                </LocalNestedItem>
                <LocalNestedItem>
                  Uviedol zjavne nepravdivé údaje alebo iným spôsobom zneužil mechanizmus súťaže (napr. viacnásobná registrácia s rôznymi e-mailmi).
                </LocalNestedItem>

                <h4>Zodpovednosť organizátora:</h4>
                <LocalList>
                  <li>Organizátor nezodpovedá za technické problémy (napr. výpadky internetu, poruchy zariadenia účastníka), ktoré znemožnia alebo skomplikujú účasť v súťaži alebo dokončenie výskumu.</li>
                </LocalList>
              </ContestInner>
            </ContestContent>
          </RulesAccordion>
        </RulesSection>

        <ButtonContainer>
          <StyledButton
            onMouseDown={(e) => {
              e.preventDefault(); // ✅ Zabráni onBlur eventu
              handleStart();
            }}
            disabled={isLoading || isBlocked || isCheckingCode || isProcessing} // ✅ PRIDAJ isProcessing
          >
            {isLoading ? 'Načítavam...' : isCheckingCode ? 'Kontrolujem kód...' : 'Prihlásiť sa do aplikácie výskumu →'}
          </StyledButton>

        </ButtonContainer>
      </Container>
    </Layout>
  );
}
