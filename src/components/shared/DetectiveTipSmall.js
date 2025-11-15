// src/components/shared/DetectiveTipSmall.js
// Jednoduchá nápoveda bez floating button - môžeš zatvoriť ihneď



import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';



const TipContainer = styled.div`
  position: relative;
  background: ${p => p.theme.CARD_BACKGROUND};
  border: 2px solid ${p => p.theme.ACCENT_COLOR};
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  animation: ${p => p.$isClosing ? 'slideOut' : 'slideIn'} 0.3s ease;
  animation-fill-mode: forwards;
  
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes slideOut {
    from {
      opacity: 1;
      transform: translateY(0);
    }
    to {
      opacity: 0;
      transform: translateY(-10px);
    }
  }
  
  @media (max-width: 768px) {
    padding: 14px;
  }
  
  @media (max-width: 480px) {
    padding: 12px;
  }
`;



const TipHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;



const TipTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  color: ${p => p.theme.ACCENT_COLOR};
  font-size: 15px;
  
  @media (max-width: 480px) {
    font-size: 14px;
  }
`;



const TipIcon = styled.span`
  font-size: 20px;
  
  @media (max-width: 480px) {
    font-size: 18px;
  }
`;



const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: ${p => p.theme.SECONDARY_TEXT_COLOR};
  font-size: 20px;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${p => p.theme.BORDER_COLOR};
    color: ${p => p.theme.PRIMARY_TEXT_COLOR};
  }
  
  @media (max-width: 480px) {
    font-size: 18px;
    width: 20px;
    height: 20px;
  }
`;



const TipText = styled.div`
  color: ${p => p.theme.PRIMARY_TEXT_COLOR};
  font-size: 14px;
  line-height: 1.6;
  
  @media (max-width: 480px) {
    font-size: 13px;
    line-height: 1.5;
  }
  
  strong {
    color: ${p => p.theme.ACCENT_COLOR};
    font-weight: 600;
  }
  
  em {
    color: ${p => p.theme.ACCENT_COLOR_2};
    font-style: normal;
  }
  
  p {
    margin: 0 0 8px 0;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
`;



const DetectiveTipSmall = ({ 
  tip, 
  title = "💡 Tip",
  icon = "🕵️",
  autoOpen = true,
  autoOpenDelay = 0,
  autoClose = false,
  autoCloseDelay = 5000,
  onOpen,
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(autoOpen);
  const [isClosing, setIsClosing] = useState(false);



  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      setIsVisible(false);
      if (onClose) onClose();
    }, 300);
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



  if (!tip || !isVisible) return null;



  return (
    <TipContainer $isClosing={isClosing}>
      <TipHeader>
        <TipTitle>
          <TipIcon>{icon}</TipIcon>
          {title}
        </TipTitle>
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