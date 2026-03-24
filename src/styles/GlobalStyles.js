//HOTOVO
// OPTIMALIZOVANÉ - Lepšie transitions, accessibility, responzivita

import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    height: 100%;
    scroll-behavior: smooth; // ✅ NOVÉ - Plynulý scroll
  }

  body {
    height: 100%;
    font-family: 'Avenir Next', 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif;
    background-color: ${props => props.theme.BACKGROUND_COLOR};
    color: ${props => props.theme.PRIMARY_TEXT_COLOR};
    min-height: 100vh;
    transition: background-color 0.3s ease, color 0.3s ease; // ✅ ZRÝCHLENÉ
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    font-size: 15px; // ✅ ZMENENÉ z 14px na 16px (lepšia čitateľnosť)
    line-height: 1.6; // ✅ ZMENENÉ z 1.5 na 1.6
    overflow-x: hidden; // ✅ NOVÉ - Zabráň horizontálnemu scrollu
    
    @media (max-width: 768px) {
      font-size: 15px;
    }
    
    @media (max-width: 480px) {
      font-size: 15px;
    }
  }

  #root {
    height: 100%;
    min-height: 100vh; // ✅ PRIDANÉ
  }

  // ✅ NOVÉ - Lepší výber textu
  ::selection {
    background: ${props => props.theme.ACCENT_COLOR}44;
    color: ${props => props.theme.PRIMARY_TEXT_COLOR};
  }

  ::-moz-selection {
    background: ${props => props.theme.ACCENT_COLOR}44;
    color: ${props => props.theme.PRIMARY_TEXT_COLOR};
  }

  // ✅ NOVÉ - Scrollbar styling
  ::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }

  ::-webkit-scrollbar-track {
    background: ${props => props.theme.BACKGROUND_COLOR};
  }

  ::-webkit-scrollbar-thumb {
    background: ${props => props.theme.ACCENT_COLOR}66;
    border-radius: 6px;
    
    &:hover {
      background: ${props => props.theme.ACCENT_COLOR}99;
    }
  }

  // Links
  a {
    color: ${props => props.theme.ACCENT_COLOR};
    text-decoration: none;
    transition: color 0.2s ease, opacity 0.2s ease; // ✅ PRIDANÉ
    
    &:hover {
      text-decoration: underline;
      opacity: 0.85; // ✅ PRIDANÉ
    }
    
    &:focus-visible {
      outline: 2px solid ${props => props.theme.ACCENT_COLOR};
      outline-offset: 2px;
      border-radius: 2px;
    }
  }

  // Inputs & Textareas
  input, textarea, select {
    background: ${props => props.theme.INPUT_BACKGROUND};
    color: ${props => props.theme.PRIMARY_TEXT_COLOR};
    border: 2px solid ${props => props.theme.BORDER_COLOR}; // ✅ ZMENENÉ z 1px na 2px
    transition: all 0.2s ease; // ✅ ZMENENÉ
    font-family: inherit;
    font-size: 15px;
    border-radius: 8px;
    padding: 12px 14px; // ✅ ZMENENÉ z 10px 12px
    width: 100%; // ✅ PRIDANÉ
    
    &:hover {
      border-color: ${props => props.theme.ACCENT_COLOR}66; // ✅ PRIDANÉ
    }
    
    &:focus {
      outline: none;
      border-color: ${props => props.theme.ACCENT_COLOR};
      box-shadow: 0 0 0 3px ${props => props.theme.ACCENT_COLOR}22; // ✅ PRIDANÉ
    }
    
    &::placeholder {
      color: ${props => props.theme.SECONDARY_TEXT_COLOR};
      opacity: 0.6;
    }
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      background: ${props => props.theme.BORDER_COLOR};
    }
  }

  // Textarea specific
  textarea {
    resize: vertical;
    min-height: 100px;
  }

  // Buttons
  button {
    cursor: pointer;
    font-family: inherit;
    background: ${props => props.theme.BUTTON_COLOR};
    color: #FFFFFF;
    border: none;
    transition: all 0.2s ease; // ✅ ZMENENÉ
    border-radius: 8px;
    font-weight: 600;
    font-size: 15px;
    padding: 12px 20px; // ✅ ZMENENÉ z 8px 16px
    
    &:hover:not(:disabled) {
      opacity: 0.85;
      transform: translateY(-1px); // ✅ PRIDANÉ
      box-shadow: 0 4px 12px ${props => props.theme.ACCENT_COLOR}33; // ✅ PRIDANÉ
    }
    
    &:active:not(:disabled) {
      transform: translateY(0); // ✅ ZMENENÉ
    }
    
    &:focus-visible {
      outline: 2px solid ${props => props.theme.ACCENT_COLOR};
      outline-offset: 2px;
    }
    
    &:disabled {
      opacity: 0.4; // ✅ ZMENENÉ z 0.3
      cursor: not-allowed;
      transform: none;
    }
  }

  // ✅ NOVÉ - Headings
  h1, h2, h3, h4, h5, h6 {
    line-height: 1.3;
    font-weight: 700;
    color: ${props => props.theme.PRIMARY_TEXT_COLOR};
    margin-bottom: 0.5em;
  }

  h1 {
    font-size: 2rem;
    
    @media (max-width: 768px) {
      font-size: 1.75rem;
    }
    
    @media (max-width: 480px) {
      font-size: 1.5rem;
    }
  }

  h2 {
    font-size: 1.5rem;
    
    @media (max-width: 768px) {
      font-size: 1.375rem;
    }
    
    @media (max-width: 480px) {
      font-size: 1.25rem;
    }
  }

  h3 {
    font-size: 1.25rem;
    
    @media (max-width: 480px) {
      font-size: 1.125rem;
    }
  }

  // ✅ NOVÉ - Paragraphs
  p {
    margin-bottom: 1em;
    line-height: 1.7;
  }

  // ✅ NOVÉ - Lists
  ul, ol {
    padding-left: 1.5em;
    margin-bottom: 1em;
  }

  li {
    margin-bottom: 0.5em;
  }

  // ✅ NOVÉ - Images
  img {
    max-width: 100%;
    height: auto;
    display: block;
  }

  // ✅ NOVÉ - Code blocks
  code {
    background: ${props => props.theme.INPUT_BACKGROUND};
    color: ${props => props.theme.ACCENT_COLOR};
    padding: 2px 6px;
    border-radius: 4px;
    font-family: 'Monaco', 'Courier New', monospace;
    font-size: 0.9em;
  }

  // ✅ NOVÉ - Pre blocks
  pre {
    background: ${props => props.theme.INPUT_BACKGROUND};
    color: ${props => props.theme.PRIMARY_TEXT_COLOR};
    padding: 16px;
    border-radius: 8px;
    overflow-x: auto;
    margin-bottom: 1em;
    
    code {
      background: none;
      padding: 0;
    }
  }

  // ✅ NOVÉ - Horizontal rules
  hr {
    border: none;
    border-top: 2px solid ${props => props.theme.BORDER_COLOR};
    margin: 2em 0;
  }

  // ✅ NOVÉ - Focus visible pre accessibility
  :focus-visible {
    outline: 2px solid ${props => props.theme.ACCENT_COLOR};
    outline-offset: 2px;
  }

  // ✅ NOVÉ - Redukcia animácií pre používateľov s preferenciou
  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
`;
