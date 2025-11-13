// src/styles/Layout.js
// OPRAVENÁ VERZIA - LevelDisplay s podmienkou cez prop

import React from 'react';
import styled from 'styled-components';
import LevelDisplay from '../components/shared/LevelDisplay';

const LayoutContainer = styled.div`
  min-height: 100vh;
  background: ${p => p.theme.BACKGROUND_COLOR};
  padding: 20px;
  transition: background 240ms ease;
  
  @media (max-width: 768px) {
    padding: 15px;
  }
  
  @media (max-width: 480px) {
    padding: 10px;
  }
`;

const ContentWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  
  /* ✅ Padding iba ak sa zobrazuje LevelDisplay */
  padding-top: ${p => p.$showLevel ? '80px' : '0'};
  
  @media (max-width: 768px) {
    padding-top: ${p => p.$showLevel ? '70px' : '0'};
  }
  
  @media (max-width: 480px) {
    padding-top: ${p => p.$showLevel ? '60px' : '0'};
  }
`;

const Layout = ({ children, showLevelDisplay = true }) => {
  return (
    <LayoutContainer>
      {/* ✅ Zobrazí sa iba ak showLevelDisplay === true */}
      {showLevelDisplay && <LevelDisplay />}
      
      <ContentWrapper $showLevel={showLevelDisplay}>
        {children}
      </ContentWrapper>
    </LayoutContainer>
  );
};

export default Layout;
