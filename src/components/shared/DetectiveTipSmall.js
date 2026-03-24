// ✅ VERZIA BEZ MOŽNOSTI ZATVORENIA
// Avatar bez okrajov, bez badge, BEZ close button
// ✅ + SectionAudioPlayer podpora

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import SectionAudioPlayer from './SectionAudioPlayer';

// =====================
// STYLED COMPONENTS - OPTIMALIZOVANÁ VERZIA
// =====================

const TipContainer = styled.div`
  position: relative;
  background: ${p => p.theme.CARD_BACKGROUND};
  border: 2px solid ${p => p.theme.ACCENT_COLOR};
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 6px 20px rgba(0,0,0,0.4);
  animation: slideIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(
      circle at top left,
      ${p => p.theme.ACCENT_COLOR}15 0%,
      transparent 60%
    );
    pointer-events: none;
  }
  
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(20px) scale(0.9);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
  
  @media (max-width: 768px) {
    padding: 14px;
    margin-bottom: 14px;
  }
  
  @media (max-width: 480px) {
    padding: 12px;
    margin-bottom: 12px;
  }
`;

const TipHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 2px solid ${p => p.theme.BORDER_COLOR};
  position: relative;
  z-index: 1;
`;

const DetectiveAvatar = styled.img`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid ${p => p.theme.ACCENT_COLOR};
  box-shadow: 0 2px 6px ${p => p.theme.ACCENT_COLOR}45;
  transition: transform 0.3s ease;
  flex-shrink: 0;
  
  &:hover {
    transform: scale(1.1) rotate(5deg);
  }
  
  @media (max-width: 480px) {
    width: 32px;
    height: 32px;
  }
`;

const DetectiveAvatarFallback = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${p => p.theme.ACCENT_COLOR};
  border: 2px solid ${p => p.theme.ACCENT_COLOR};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  box-shadow: 0 2px 6px ${p => p.theme.ACCENT_COLOR}33;
  flex-shrink: 0;
  
  @media (max-width: 480px) {
    width: 32px;
    height: 32px;
    font-size: 15px;
  }
`;

const DetectiveName = styled.div`
  font-weight: 700;
  color: ${p => p.theme.ACCENT_COLOR};
  font-size: 15px;
  flex: 1;
  
  @media (max-width: 480px) {
    font-size: 15px;
  }
`;

const TipText = styled.div`
  color: ${p => p.theme.PRIMARY_TEXT_COLOR};
  font-size: 15px;
  line-height: 1.6;
  position: relative;
  z-index: 1;
  text-align: justify; 
  @media (max-width: 480px) {
    font-size: 15px;
    line-height: 1.5;
  }
  
  p {
    margin-bottom: 8px;
    &:last-child { margin-bottom: 0; }
  }
  
  ul {
    margin: 6px 0;
    padding-left: 20px;
    li {
      margin-bottom: 6px;
      &:last-child { margin-bottom: 0; }
    }
  }
  
  strong {
    color: ${p => p.theme.PRIMARY_TEXT_COLOR};
    font-weight: 600;
  }
  
  em {
    color: ${p => p.theme.PRIMARY_TEXT_COLOR};
    font-style: normal;
    font-weight: 500;
  }
  
  code {
    background: ${p => p.theme.ACCENT_COLOR}15;
    border: 1px solid ${p => p.theme.ACCENT_COLOR}45;
    border-radius: 4px;
    padding: 2px 6px;
    font-family: 'Courier New', monospace;
    font-size: 1rem;
  }
`;

// ✅ Oddeľovač medzi textom a playerom
const AudioDivider = styled.div`
  height: 1px;
  background: ${p => p.theme.BORDER_COLOR};
  margin: 12px 0 8px 0;
  position: relative;
  z-index: 1;
`;

// =====================
// KOMPONENT
// =====================

const DetectiveTipSmall = ({ 
  tip, 
  detectiveName = "Inšpektor Kritan",
  autoOpen = true,
  autoOpenDelay = 0,
  onOpen,
  // ✅ NOVÉ — audio props
  audioSrc,
  audioId,
  played,
  onPlayed,
}) => {
  const [isVisible, setIsVisible] = useState(autoOpen);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (autoOpen && autoOpenDelay > 0) {
      const timer = setTimeout(() => {
        setIsVisible(true);
        if (onOpen) onOpen();
      }, autoOpenDelay);
      return () => clearTimeout(timer);
    }
  }, [autoOpen, autoOpenDelay, onOpen]);

  const handleImageError = () => {
    console.warn('Detective image failed to load, using fallback');
    setImageError(true);
  };

  if (!tip || !isVisible) return null;

  const hasAudio = audioSrc && audioId;

  return (
    <TipContainer>
      <TipHeader>
        {!imageError ? (
          <DetectiveAvatar 
            src="/images/detective-icon.png" 
            alt=""
            onError={handleImageError}
          />
        ) : (
          <DetectiveAvatarFallback>🔍</DetectiveAvatarFallback>
        )}
        <DetectiveName>{detectiveName}</DetectiveName>
      </TipHeader>

      <TipText dangerouslySetInnerHTML={{ __html: tip }} />

      {/* ✅ Audio player — zobrazí sa len ak sú poskytnuté audio props */}
      {hasAudio && (
        <>
          <AudioDivider />
          <SectionAudioPlayer
            src={audioSrc}
            audioId={audioId}
            label="Prehrať"
            played={!!played}
            onPlayed={onPlayed}
          />
        </>
      )}
    </TipContainer>
  );
};

export default DetectiveTipSmall;
