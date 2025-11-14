// src/components/shared/DetectiveTipLarge.js
// OPRAVENÁ VERZIA - Bez prebliknutia pri zatváraní


import React, { useState, useEffect, useCallback } from 'react';
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


const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  
  /* ✅ OPRAVA: animation-fill-mode: forwards */
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
  border: 3px solid ${p => p.theme.ACCENT_COLOR};
  border-radius: 20px;
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: row;
  box-shadow: 0 20px 60px rgba(0,0,0,0.5);
  
  /* ✅ OPRAVA: animation-fill-mode: forwards */
  animation: ${p => p.$isClosing ? 'slideOut' : 'slideIn'} 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  animation-fill-mode: forwards;
  
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: scale(0.8) translateY(30px);
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
      transform: scale(0.8) translateY(30px);
    }
  }
  
  @media (max-width: 768px) {
    max-width: 90%;
    flex-direction: column;
  }
  
  @media (max-width: 480px) {
    max-width: 95%;
    border-radius: 16px;
  }
`;


const ContentContainer = styled.div`
  width: 50%;
  padding: 30px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  order: 1;
  
  @media (max-width: 768px) {
    width: 100%;
    padding: 24px;
    order: 2;
  }
  
  @media (max-width: 480px) {
    padding: 20px;
  }
`;


const DetectiveImageContainer = styled.div`
  position: relative;
  width: 50%;
  min-height: 500px;
  background: linear-gradient(135deg, 
    ${p => p.theme.ACCENT_COLOR}33, 
    ${p => p.theme.ACCENT_COLOR_2}33
  );
  overflow: hidden;
  order: 2;
  
  @media (max-width: 768px) {
    width: 100%;
    min-height: 250px;
    order: 1;
  }
  
  @media (max-width: 480px) {
    min-height: 200px;
  }
`;


const DetectiveImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
`;


const DetectiveImageFallback = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 120px;
  
  @media (max-width: 480px) {
    font-size: 80px;
  }
`;


const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid ${p => p.theme.BORDER_COLOR};
`;


const DetectiveName = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: ${p => p.theme.ACCENT_COLOR};
  
  @media (max-width: 480px) {
    font-size: 20px;
  }
`;


const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: ${p => p.theme.SECONDARY_TEXT_COLOR};
  font-size: 28px;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${p => p.theme.BORDER_COLOR};
    color: ${p => p.theme.PRIMARY_TEXT_COLOR};
    transform: rotate(90deg);
  }
`;


const TipText = styled.div`
  color: ${p => p.theme.PRIMARY_TEXT_COLOR};
  font-size: 16px;
  line-height: 1.8;
  margin-bottom: 20px;
  flex: 1;
  
  @media (max-width: 480px) {
    font-size: 15px;
    line-height: 1.6;
  }
  
  strong {
    color: ${p => p.theme.ACCENT_COLOR};
    font-weight: 600;
  }
  
  em {
    color: ${p => p.theme.ACCENT_COLOR_2};
    font-style: italic;
  }
  
  p {
    margin-bottom: 12px;
  }
`;


const ActionButton = styled.button`
  width: 100%;
  padding: 14px 24px;
  background: linear-gradient(135deg, 
    ${p => p.theme.ACCENT_COLOR}, 
    ${p => p.theme.ACCENT_COLOR_2}
  );
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0,0,0,0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
`;


const DetectiveTipLarge = ({
  tip,
  detectiveName = "Detektív Conan",
  imageUrl = "/images/detective.png",
  iconUrl = "/images/detective-icon.png",
  buttonText = "Rozumiem!",
  autoOpen = false,
  autoOpenDelay = 500,
  autoClose = false,
  autoCloseDelay = 8000,
  showBadge = false,
  position = 'right',
  onOpen,
  onClose
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [iconError, setIconError] = useState(false);


  const handleClose = useCallback(() => {
    setIsClosing(true);
    // ✅ OPRAVA: Unmount až po dokončení animácie (400ms)
    setTimeout(() => {
      setIsClosing(false);
      setIsOpen(false);
      if (onClose) onClose();
    }, 400);
  }, [onClose]);


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
    if (isOpen && autoClose) {
      const timer = setTimeout(() => {
        handleClose();
      }, autoCloseDelay);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, autoCloseDelay, handleClose]);


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
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };


  if (!tip) return null;


  const buttonStyle = position === 'left' ? { left: '20px', right: 'auto' } : {};


  return (
    <>
      <TipButton 
        onClick={handleToggle} 
        title="Tip od detektíva"
        style={buttonStyle}
        aria-label="Otvoriť tip od detektíva"
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
        {showBadge && !isOpen && <Badge>!</Badge>}
      </TipButton>
      
      {(isOpen || isClosing) && (
        <Overlay $isClosing={isClosing} onClick={handleOverlayClick}>
          <ModalContainer $isClosing={isClosing}>
            <ContentContainer>
              <Header>
                <DetectiveName>{detectiveName}</DetectiveName>
                <CloseButton onClick={handleClose} aria-label="Zavrieť">
                  ×
                </CloseButton>
              </Header>
              
              <TipText dangerouslySetInnerHTML={{ __html: tip }} />
              
              <ActionButton onClick={handleClose}>
                {buttonText}
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