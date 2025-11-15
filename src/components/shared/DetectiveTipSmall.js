// src/components/shared/DetectiveTipSmall.js
// Inline nápoveda - vizuálne rovnaká ako DetectiveTip bubble


import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';


const TipContainer = styled.div`
  position: relative;
  background: ${p => p.theme.CARD_BACKGROUND};
  border: 3px solid ${p => p.theme.ACCENT_COLOR};
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  animation: ${p => p.$isClosing ? 'slideOut' : 'slideIn'} 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  animation-fill-mode: forwards;
  
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(30px) scale(0.8);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
  
  @keyframes slideOut {
    from {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
    to {
      opacity: 0;
      transform: translateY(30px) scale(0.8);
    }
  }
  
  @media (max-width: 768px) {
    padding: 16px;
  }
  
  @media (max-width: 480px) {
    padding: 14px;
  }
`;


const TipHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
  padding-bottom: 12px;
  border-bottom: 2px solid ${p => p.theme.BORDER_COLOR};
`;


const DetectiveAvatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid ${p => p.theme.ACCENT_COLOR};
  
  @media (max-width: 480px) {
    width: 35px;
    height: 35px;
  }
`;


const DetectiveAvatarFallback = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${p => p.theme.ACCENT_COLOR};
  border: 2px solid ${p => p.theme.ACCENT_COLOR};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  
  @media (max-width: 480px) {
    width: 35px;
    height: 35px;
    font-size: 18px;
  }
`;


const DetectiveName = styled.div`
  font-weight: 700;
  color: ${p => p.theme.ACCENT_COLOR};
  font-size: 16px;
  flex: 1;
  
  @media (max-width: 480px) {
    font-size: 14px;
  }
`;


const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: ${p => p.theme.SECONDARY_TEXT_COLOR};
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  transition: color 0.2s ease;
  
  &:hover {
    color: ${p => p.theme.PRIMARY_TEXT_COLOR};
  }
`;


const TipText = styled.div`
  color: ${p => p.theme.PRIMARY_TEXT_COLOR};
  font-size: 15px;
  line-height: 1.7;
  
  @media (max-width: 480px) {
    font-size: 14px;
    line-height: 1.6;
  }
  
  strong {
    color: ${p => p.theme.ACCENT_COLOR};
    font-weight: 600;
  }
  
  em {
    color: ${p => p.theme.ACCENT_COLOR_2};
    font-style: normal;
  }
`;


const DetectiveTipSmall = ({ 
  tip, 
  detectiveName = "Detektív Conan",
  autoOpen = true,
  autoOpenDelay = 0,
  autoClose = false,
  autoCloseDelay = 5000,
  onOpen,
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(autoOpen);
  const [isClosing, setIsClosing] = useState(false);
  const [imageError, setImageError] = useState(false);


  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      setIsVisible(false);
      if (onClose) onClose();
    }, 400);
  }, [onClose]);


  useEffect(() => {
    if (autoOpen && autoOpenDelay > 0) {
      const timer = setTimeout(() => {
        setIsVisible(true);
        if (onOpen) onOpen();
      }, autoOpenDelay);

      return () => clearTimeout(timer);
    }
  }, [autoOpen, autoOpenDelay, onOpen]);


  useEffect(() => {
    if (isVisible && autoClose) {
      const timer = setTimeout(() => {
        handleClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [isVisible, autoClose, autoCloseDelay, handleClose]);


  const handleImageError = () => {
    console.warn('Detective image failed to load, using fallback');
    setImageError(true);
  };


  if (!tip || !isVisible) return null;


  return (
    <TipContainer $isClosing={isClosing}>
      <TipHeader>
        {!imageError ? (
          <DetectiveAvatar 
            src="/images/detective-icon.png" 
            alt=""
            onError={handleImageError}
          />
        ) : (
          <DetectiveAvatarFallback>🕵️</DetectiveAvatarFallback>
        )}
        <DetectiveName>{detectiveName}</DetectiveName>
        <CloseButton 
          onClick={handleClose}
          aria-label="Zavrieť tip"
        >
          ×
        </CloseButton>
      </TipHeader>
      <TipText dangerouslySetInnerHTML={{ __html: tip }} />
    </TipContainer>
  );
};


export default DetectiveTipSmall;