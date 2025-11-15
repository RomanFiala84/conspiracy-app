// src/components/shared/DetectiveTip.js
// OPRAVENÁ VERZIA - Delay len pri prvom otvorení


import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled from 'styled-components';


const TipButton = styled.button`
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, 
    ${p => p.theme.ACCENT_COLOR}, 
    ${p => p.theme.ACCENT_COLOR_2}
  );
  border: 4px solid ${p => p.theme.CARD_BACKGROUND};
  box-shadow: 0 6px 20px rgba(0,0,0,0.4);
  cursor: pointer;
  z-index: 999;
  transition: all 0.3s ease;
  overflow: hidden;
  
  &:hover {
    transform: scale(1.1);
    box-shadow: 0 8px 24px rgba(0,0,0,0.5);
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  @media (max-width: 768px) {
    width: 60px;
    height: 60px;
    bottom: 15px;
    right: 15px;
  }
  
  @media (max-width: 480px) {
    width: 50px;
    height: 50px;
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
`;


const DetectiveIconFallback = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 35px;
  
  @media (max-width: 480px) {
    font-size: 28px;
  }
`;


const Badge = styled.div`
  position: absolute;
  top: -5px;
  right: -5px;
  width: 24px;
  height: 24px;
  background: #ff4444;
  border-radius: 50%;
  border: 2px solid ${p => p.theme.CARD_BACKGROUND};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  color: white;
  animation: pulse 2s infinite;
  
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }
  
  @media (max-width: 480px) {
    width: 20px;
    height: 20px;
    font-size: 10px;
  }
`;


const TipBubble = styled.div`
  position: fixed;
  bottom: 100px;
  right: 20px;
  max-width: 380px;
  background: ${p => p.theme.CARD_BACKGROUND};
  border: 3px solid ${p => p.theme.ACCENT_COLOR};
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  z-index: 998;
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
  
  &::after {
    content: '';
    position: absolute;
    bottom: -15px;
    right: 35px;
    width: 0;
    height: 0;
    border-left: 15px solid transparent;
    border-right: 15px solid transparent;
    border-top: 15px solid ${p => p.theme.ACCENT_COLOR};
  }
  
  @media (max-width: 768px) {
    max-width: 320px;
    right: 15px;
    bottom: 85px;
    padding: 16px;
  }
  
  @media (max-width: 480px) {
    max-width: calc(100vw - 30px);
    left: 15px;
    right: 15px;
    bottom: 75px;
    padding: 14px;
    
    &::after {
      right: 25px;
    }
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


const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: ${p => p.theme.SECONDARY_TEXT_COLOR};
  font-size: 24px;
  cursor: ${p => p.disabled ? 'not-allowed' : 'pointer'};
  padding: 0;
  line-height: 1;
  transition: color 0.2s ease;
  opacity: ${p => p.disabled ? 0.3 : 1};
  
  &:hover {
    color: ${p => p.disabled ? p.theme.SECONDARY_TEXT_COLOR : p.theme.PRIMARY_TEXT_COLOR};
  }
`;


const ProgressBar = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: ${p => p.theme.BORDER_COLOR};
  border-radius: 0 0 18px 18px;
  overflow: hidden;
`;


const ProgressFill = styled.div`
  height: 100%;
  background: ${p => p.theme.ACCENT_COLOR};
  animation: progress ${p => p.$duration}s linear;
  
  @keyframes progress {
    from { width: 100%; }
    to { width: 0%; }
  }
`;


const CountdownTimer = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  background: ${p => p.theme.ACCENT_COLOR}22;
  border: 1px solid ${p => p.theme.ACCENT_COLOR};
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 11px;
  font-weight: 600;
  color: ${p => p.theme.ACCENT_COLOR};
  display: flex;
  align-items: center;
  gap: 4px;
  
  @media (max-width: 480px) {
    font-size: 10px;
    padding: 3px 6px;
  }
`;


const DetectiveTip = ({ 
  tip, 
  detectiveName = "Detektív Conan", 
  autoOpen = false,
  autoOpenDelay = 500,
  autoClose = false,
  autoCloseDelay = 8000,
  showBadge = false,
  position = 'right',
  minReadTime = 10000,
  onOpen,
  onClose
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [canClose, setCanClose] = useState(false);
  const [countdown, setCountdown] = useState(minReadTime / 1000);
  
  // ✅ NOVÉ: Track či bol tip už otvorený
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


  // ✅ UPRAVENÉ: Countdown len ak je prvé otvorenie
  useEffect(() => {
    if (!isOpen) return;
    
    // ✅ Ak už bol otvorený, povoliť zatvoriť hneď
    if (hasBeenOpenedRef.current) {
      setCanClose(true);
      setCountdown(0);
      return;
    }
    
    // ✅ Prvé otvorenie - countdown
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
    console.warn('Detective image failed to load, using fallback');
    setImageError(true);
  };


  if (!tip) return null;


  const buttonStyle = position === 'left' ? { left: '20px', right: 'auto' } : {};
  const bubbleStyle = position === 'left' ? { left: '20px', right: 'auto' } : {};


  return (
    <>
      <TipButton 
        onClick={handleToggle} 
        title="Tip od detektíva"
        style={buttonStyle}
        aria-label="Otvoriť tip od detektíva"
      >
        {!imageError ? (
          <DetectiveIcon 
            src="/images/detective-icon.png" 
            alt=""
            onError={handleImageError}
          />
        ) : (
          <DetectiveIconFallback>🕵️</DetectiveIconFallback>
        )}
        {showBadge && !isOpen && <Badge>!</Badge>}
      </TipButton>
      
      {(isOpen || isClosing) && (
        <TipBubble style={bubbleStyle} $isClosing={isClosing}>
          {/* ✅ Countdown len ak nie je prvé otvorenie */}
          {!canClose && (
            <CountdownTimer>
              ⏱️ {countdown}s
            </CountdownTimer>
          )}
          
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
              disabled={!canClose}
              aria-label="Zavrieť tip"
              title={!canClose ? `Čakaj ešte ${countdown}s` : 'Zavrieť'}
            >
              ×
            </CloseButton>
          </TipHeader>
          <TipText dangerouslySetInnerHTML={{ __html: tip }} />
          
          {autoClose && canClose && (
            <ProgressBar>
              <ProgressFill $duration={autoCloseDelay / 1000} />
            </ProgressBar>
          )}
        </TipBubble>
      )}
    </>
  );
};


export default DetectiveTip;