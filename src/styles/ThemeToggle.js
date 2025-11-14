// src/styles/ThemeToggle.js
// VERZIA - Pravý dolný roh

import React from 'react';
import styled from 'styled-components';

const Toggle = styled.button`
  position: fixed;
  bottom: 20px; // ✅ Dolný roh
  right: 20px;  // ✅ Pravá strana
  z-index: 1100;
  padding: 10px 16px;
  border-radius: 12px;
  border: 2px solid ${props => props.theme.ACCENT_COLOR};
  background: ${props => props.theme.CARD_BACKGROUND};
  color: ${props => props.theme.PRIMARY_TEXT_COLOR};
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px ${props => props.theme.ACCENT_COLOR}66;
    border-color: ${props => props.theme.ACCENT_COLOR};
    background: ${props => props.theme.ACCENT_COLOR}22;
  }
  
  &:active {
    transform: translateY(0);
  }
  
  @media (max-width: 768px) {
    bottom: 15px;
    right: 15px;
    padding: 8px 12px;
    font-size: 14px;
  }
  
  @media (max-width: 480px) {
    bottom: 10px;
    right: 10px;
    padding: 8px 12px;
    font-size: 14px;
  }
`;

const Icon = styled.span`
  font-size: 20px;
  
  @media (max-width: 768px) {
    font-size: 18px;
  }
`;

const ThemeToggle = ({ themeName, onToggle }) => {
  return (
    <Toggle onClick={onToggle}>
      <Icon>{themeName === 'dark' ? '🌙' : '☀️'}</Icon>
      {themeName === 'dark' ? 'Dark' : 'Light'}
    </Toggle>
  );
};

export default ThemeToggle;
