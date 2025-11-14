// src/styles/Layout.js
// FINÁLNA VERZIA - Správny padding pre horizontálny fixed LevelDisplay

import React from 'react';
import styled from 'styled-components';
import LevelDisplay from '../components/shared/LevelDisplay';

const LayoutContainer = styled.div`
  min-height: 100vh;
  background: ${p => p.theme.BACKGROUND_COLOR};
  transition: background 240ms ease;
`;

const ContentWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  padding: 20px;
  
  /* ✅ OPRAVENÉ - Väčší padding-top pre fixed LevelDisplay */
  padding-top: ${p => p.$showLevel ? '140px' : '20px'};
  
  @media (max-width: 1024px) {
    padding-top: ${p => p.$showLevel ? '130px' : '20px'};
  }
  
  @media (max-width: 768px) {
    padding: 15px;
    /* Wrapped layout na tablete - potrebuje viac miesta */
    padding-top: ${p => p.$showLevel ? '180px' : '15px'};
  }
  
  @media (max-width: 480px) {
    padding: 10px;
    /* Stacked layout na mobile - potrebuje ešte viac miesta */
    padding-top: ${p => p.$showLevel ? '280px' : '10px'};
  }
`;

const Layout = ({ children, showLevelDisplay = true }) => {
  return (
    <LayoutContainer>
      {showLevelDisplay && <LevelDisplay />}
      
      <ContentWrapper $showLevel={showLevelDisplay}>
        {children}
      </ContentWrapper>
    </LayoutContainer>
  );
};

export default Layout;
