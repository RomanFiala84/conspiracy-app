//HOTOVO
// ✅ OPRAVENÁ VERZIA - Obrázok detektíva na celú plochu bez okrajov

import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled from 'styled-components';

// =====================
// STYLED COMPONENTS - OPTIMALIZOVANÁ VERZIA
// =====================

const TipButton = styled.button`
  position: fixed;
  bottom: 16px;
  right: 16px;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, 
    ${p => p.theme.ACCENT_COLOR}, 
    ${p => p.theme.ACCENT_COLOR_2}
  );
  border: 3px solid ${p => p.theme.CARD_BACKGROUND};
  box-shadow: 0 4px 16px rgba(0,0,0,0.35);
  cursor: pointer;
  z-index: 999;
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  overflow: hidden;
  
  &:hover {
    transform: scale(1.15) rotate(5deg);
    box-shadow: 0 6px 20px rgba(0,0,0,0.45);
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  @media (max-width: 768px) {
    width: 64px;
    height: 64px;
    bottom: 12px;
    right: 12px;
  }
  
  @media (max-width: 480px) {
    width: 56px;
    height: 56px;
  }
`;

const DetectiveIcon = styled.img`
  width: 110%;
  height: 110%;
  object-fit: cover;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  transition: transform 0.3s ease;
  
  ${TipButton}:hover & {
    transform: translate(-50%, -50%) scale(1.1);
  }
`;

const DetectiveIconFallback = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  
  @media (max-width: 768px) {
    font-size: 30px;
  }
  
  @media (max-width: 480px) {
    font-size: 30px;
  }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
  animation: ${p => p.$isClosing ? 'fadeOut' : 'fadeIn'} 0.3s ease;
  animation-fill-mode: forwards;
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }
`;

const ModalContainer = styled.div`
  background: ${p => p.theme.CARD_BACKGROUND};
  border: 2px solid ${p => p.theme.ACCENT_COLOR};
  border-radius: 16px;
  max-width: 850px;
  width: 100%;
  height: 580px;           // ✅ FIXNÁ výška modalu
  max-height: 90vh;        // ✅ Limit pre malé obrazovky
  overflow: hidden;
  display: flex;
  flex-direction: row;
  box-shadow: 0 16px 48px rgba(0,0,0,0.5);
  position: relative;
  animation: ${p => p.$isClosing ? 'slideOut' : 'slideIn'} 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  animation-fill-mode: forwards;
  
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: scale(0.85) translateY(20px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }
  
  @keyframes slideOut {
    from {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
    to {
      opacity: 0;
      transform: scale(0.85) translateY(20px);
    }
  }
  
  @media (max-width: 768px) {
    max-width: 90%;
    height: auto;          // ✅ Mobile - automatická výška
    min-height: 400px;     // ✅ Minimálna výška
    flex-direction: column;
    border-radius: 12px;
  }
  
  @media (max-width: 480px) {
    max-width: 95%;
    min-height: 360px;
  }
`;

const DetectiveImageContainer = styled.div`
  position: relative;
  width: 40%;
  height: 100%;            // ✅ 100% výšky modalu (580px)
  background: linear-gradient(135deg, 
    ${p => p.theme.ACCENT_COLOR}30, 
    ${p => p.theme.ACCENT_COLOR_2}30
  );
  overflow: hidden;
  order: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  
  @media (max-width: 768px) {
    width: 100%;
    height: 250px;         // ✅ Fixná výška pre mobile
    order: 1;
  }
  
  @media (max-width: 480px) {
    height: 200px;
  }
`;

const DetectiveImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;       // ✅ Vyplní celú plochu
  object-position: center top;  // ✅ Zamerá na tvár (hore)
  position: relative;
  z-index: 2;
@media (max-width: 768px) {
    object-position: center 30%; // ✅ Tablet - o trošku nižšie
  }
  
  @media (max-width: 480px) {
    object-position: center 35%; // ✅ Mobile - zamerá sa na tvár + okuliare
  }
`;

const ContentContainer = styled.div`
  width: 60%;
  height: 100%;            // ✅ 100% výšky modalu (580px)
  padding: 24px;
  padding-bottom: 28px;
  overflow-y: auto;        // ✅ Scroll pri dlhom texte
  display: flex;
  flex-direction: column;
  order: 1;
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 5px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${p => p.theme.BORDER_COLOR}33;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${p => p.theme.ACCENT_COLOR};
    border-radius: 3px;
  }
  
  @media (max-width: 768px) {
    width: 100%;
    height: auto;          // ✅ Mobile - automatická výška
    padding: 20px;
    padding-bottom: 24px;
    order: 2;
  }
  
  @media (max-width: 480px) {
    padding: 16px;
    padding-bottom: 20px;
  }
`;

const DetectiveImageFallback = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 100px;
  position: relative;
  z-index: 2;
  
  @media (max-width: 768px) {
    font-size: 80px;
  }
  
  @media (max-width: 480px) {
    font-size: 60px;
  }
`;


const CountdownBadge = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  background: ${p => p.theme.ACCENT_COLOR};
  color: white;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 10px;
  font-weight: 700;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 5px;
  box-shadow: 0 3px 10px rgba(0,0,0,0.25);
  backdrop-filter: blur(4px);
  
  @media (max-width: 480px) {
    font-size: 10px;
    padding: 5px 10px;
    top: 10px;
    right: 10px;
  }
`;


const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid ${p => p.theme.BORDER_COLOR};
`;

const DetectiveName = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: ${p => p.theme.ACCENT_COLOR};
  display: flex;
  align-items: center;
  gap: 8px;

  
  @media (max-width: 480px) {
    font-size: 10px;
    
  }
`;

// src/components/shared/DetectiveTipLarge.js
// ✅ OPRAVA - ContentContainer s lepším paddingom a spacing


const TipText = styled.div`
  color: ${p => p.theme.PRIMARY_TEXT_COLOR};
  font-size: 15px;
  line-height: 1.7;
  margin-bottom: 20px; // ✅ ZVÄČŠI z 16px na 20px
  flex: 1;
  overflow-y: auto; // ✅ PRIDAJ - Scroll len pre text ak je dlhý
  text-align: justify; 
  @media (max-width: 480px) {
    font-size: 15px;
    line-height: 1.6;
    margin-bottom: 15px;
  }
  
  strong {
    color: ${p => p.theme.PRIMARY_TEXT_COLOR};
    font-weight: 600;
  }
  
  em {
    color: ${p => p.theme.PRIMARY_TEXT_COLOR};
    font-style: italic;
  }
  
  p {
    margin-bottom: 10px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  ul {
    margin: 8px 0;
    padding-left: 20px;
    
    li {
      margin-bottom: 5px;
    }
  }
`;

const ActionButton = styled.button`
  width: 100%;
  padding: 12px 20px;
  background: ${p => p.disabled 
    ? p.theme.BORDER_COLOR 
    : `linear-gradient(135deg, ${p.theme.ACCENT_COLOR}, ${p.theme.ACCENT_COLOR_2})`
  };
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: ${p => p.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  box-shadow: 0 3px 10px rgba(0,0,0,0.2);
  opacity: ${p => p.disabled ? 0.6 : 1};
  position: relative;
  overflow: hidden;
  flex-shrink: 0; // ✅ PRIDAJ - Button sa nesmie zmenšiť
  margin-top: auto; // ✅ PRIDAJ - Tlačí sa na spodok
  
  /* Shine effect */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.3),
      transparent
    );
    transition: left 0.5s ease;
  }
  
  &:hover {
    transform: ${p => p.disabled ? 'none' : 'translateY(-2px)'};
    box-shadow: ${p => p.disabled ? '0 3px 10px rgba(0,0,0,0.2)' : '0 5px 15px rgba(0,0,0,0.3)'};
    
    &::before {
      left: ${p => p.disabled ? '-100%' : '100%'};
    }
  }
  
  &:active {
    transform: ${p => p.disabled ? 'none' : 'translateY(0)'};
  }
  
  @media (max-width: 480px) {
    padding: 10px 16px;
    font-size: 15px;
  }
`;


// =====================
// COMPONENT
// =====================

const DetectiveTipLarge = ({
  tip,
  detectiveName = "Inšpektor Kritan",
  imageUrl = "/images/detective.png",
  iconUrl = "/images/detective-icon.png",
  buttonText = "Rozumiem!",
  autoOpen = false,
  autoOpenDelay = 500,
  autoClose = false,
  autoCloseDelay = 8000,
  position = 'right',
  minReadTime = 5000,
  onOpen,
  onClose
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [iconError, setIconError] = useState(false);
  const [canClose, setCanClose] = useState(false);
  const [countdown, setCountdown] = useState(minReadTime / 1000);
  
  const hasBeenOpenedRef = useRef(false);

  const handleClose = useCallback(() => {
    if (!canClose) return;
    
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      setIsOpen(false);
      if (onClose) onClose();
    }, 400);
  }, [canClose, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    
    if (hasBeenOpenedRef.current) {
      setCanClose(true);
      setCountdown(0);
      return;
    }
    
    hasBeenOpenedRef.current = true;
    setCanClose(false);
    setCountdown(minReadTime / 1000);
    
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          setCanClose(true);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isOpen, minReadTime]);

  useEffect(() => {
    if (autoOpen) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        if (onOpen) onOpen();
      }, autoOpenDelay);
      return () => clearTimeout(timer);
    }
  }, [autoOpen, autoOpenDelay, onOpen]);

  useEffect(() => {
    if (isOpen && autoClose && canClose) {
      const timer = setTimeout(() => {
        handleClose();
      }, autoCloseDelay);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, autoCloseDelay, canClose, handleClose]);

  const handleToggle = useCallback(() => {
    if (isOpen) {
      handleClose();
    } else {
      setIsOpen(true);
      if (onOpen) onOpen();
    }
  }, [isOpen, handleClose, onOpen]);

  const handleImageError = () => {
    setImageError(true);
  };

  const handleIconError = () => {
    setIconError(true);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && canClose) {
      handleClose();
    }
  };

  if (!tip) return null;

  const buttonStyle = position === 'left' ? { left: '16px', right: 'auto' } : {};

  return (
    <>
      <TipButton 
        onClick={handleToggle} 
        title="Tip od Inšpektora Kritana"
        style={buttonStyle}
        aria-label="Otvoriť tip od Inšpektora Kritana"
      >
        {!iconError ? (
          <DetectiveIcon 
            src={iconUrl}
            alt=""
            onError={handleIconError}
          />
        ) : (
          <DetectiveIconFallback>🕵️</DetectiveIconFallback>
        )}
      </TipButton>
      
      {(isOpen || isClosing) && (
        <Overlay $isClosing={isClosing} onClick={handleOverlayClick}>
          <ModalContainer $isClosing={isClosing}>
            {!canClose && (
              <CountdownBadge>
                ⏱️ {countdown}s
              </CountdownBadge>
            )}
            
            <ContentContainer>
              <Header>
                <DetectiveName>{detectiveName}</DetectiveName>
              </Header>
              
              <TipText dangerouslySetInnerHTML={{ __html: tip }} />
              
              <ActionButton 
                onClick={handleClose}
                disabled={!canClose}
                title={!canClose ? `Zostávajúci čas: ${countdown}s` : buttonText}
              >
                {!canClose ? `Prečítajte si prosím informácie. ${countdown}s...` : buttonText}
              </ActionButton>
            </ContentContainer>
            
            <DetectiveImageContainer>
              {!imageError ? (
                <DetectiveImage 
                  src={imageUrl}
                  alt={detectiveName}
                  onError={handleImageError}
                />
              ) : (
                <DetectiveImageFallback>🕵️</DetectiveImageFallback>
              )}
            </DetectiveImageContainer>
          </ModalContainer>
        </Overlay>
      )}
    </>
  );
};

export default DetectiveTipLarge;
