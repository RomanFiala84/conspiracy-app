// src/components/missions/mission2/Questionnaire2b.js
// ČASŤ 1/3: IMPORTS + STYLED COMPONENTS

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Layout from '../../../styles/Layout';
import StyledButton from '../../../styles/StyledButton';
import DetectiveTipSmall from '../../shared/DetectiveTipSmall';
import { useUserStats } from '../../../contexts/UserStatsContext';
import { getResponseManager } from '../../../utils/ResponseManager';
import ReactMarkdown from 'react-markdown';

// ==========================================
// STYLED COMPONENTS - LAYOUT
// ==========================================

const MobileWrapper = styled.div`
  @media (max-width: 768px) {
    * {
      font-size: 12px !important;
      line-height: 1.5 !important;
    }
    
    input[type="radio"],
    input[type="checkbox"] {
      width: 12px !important;
      height: 12px !important;
    }
    
    button {
      font-size: 12px !important;
    }
  }
`;

const Container = styled.div`
  padding: 20px;
  max-width: 1000px;  /* ✅ ZVÄČŠENÉ z 800px */
  margin: 0 auto;
  
  @media (max-width: 768px) {
    max-width: 100%;
    padding: 12px;  /* ✅ ZMENŠENÉ z 16px pre viac priestoru */
  }
`;

// ==========================================
// HELPER - Markdown rendering BEZ knižnice
// ==========================================

const parseMarkdown = (text) => {
  if (!text) return text;
  
  // Náhrada **text** za <strong>
  let parsed = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Náhrada \n za <br>
  parsed = parsed.replace(/\\n/g, '<br />');
  
  return parsed;
};


const Card = styled.div`
  background: ${p => p.theme.CARD_BACKGROUND};
  border: 1px solid ${p => p.theme.BORDER_COLOR};
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    padding: 16px;  /* ✅ ZMENŠENÉ z 24px */
    border-radius: 6px;
  }
`;


const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background: ${p => p.theme.BORDER_COLOR};
  border-radius: 3px;
  margin-bottom: 20px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: ${p => p.theme.ACCENT_COLOR};
  transition: width 0.3s ease;
  width: ${p => p.progress}%;
`;

const ProgressText = styled.div`
  text-align: center;
  font-size: 15px;
  color: ${p => p.theme.ACCENT_COLOR};
  margin-bottom: 12px;
  font-weight: 600;
`;

const QuestionCard = styled.div`
  background: ${p => p.theme.CARD_BACKGROUND};
  border: 1px solid ${p => 
    p.hasError ? '#ff0000' : 
    p.isActive ? '#FF9800' :
    p.theme.BORDER_COLOR
  };
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  scroll-margin-top: 20px;
  transition: all 0.2s ease;

  ${p => p.hasError && `
    box-shadow: 0 0 0 3px rgba(255, 0, 0, 0.1);
  `}

  ${p => p.isActive && !p.hasError && `
    box-shadow: 0 0 0 3px rgba(255, 152, 0, 0.15);
  `}
  
  @media (max-width: 768px) {
    padding: 12px;
    margin-bottom: 12px;
  }
`;



const Question = styled.p`
  margin-bottom: 12px;
  color: ${p => p.theme.PRIMARY_TEXT_COLOR};
  font-size: 15px;
  font-weight: 500;
  line-height: 1.5;
  text-align: left;
  /* ✅ PRIDANÉ: Markdown styling */
  p {
    margin: 0;
    display: inline;
  }
  
  strong {
    font-weight: 700;
    color: ${p => p.theme.ACCENT_COLOR};
  }
  
  br {
    display: block;
    content: "";
    margin: 8px 0;
  }
`;


const QuestionError = styled.div`
  color:${p => p.theme.ERROR_COLOR}; ;
  font-size: 15px;
  margin-top: 8px;
  font-weight: 500;
`;

// ==========================================
// STYLED COMPONENTS - ACCORDION LIKERT
// ==========================================

const AccordionQuestionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const AccordionQuestionItem = styled.div`
  background: ${p => p.theme.SURFACE_COLOR};
  border: 2px solid ${p => 
    p.hasError ? p.theme.ERROR_COLOR : 
    p.isCompleted ? p.theme.SUCCESS_COLOR : 
    p.isActive ? p.theme.WARNING_COLOR : 
    p.theme.BORDER_COLOR
  };
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: ${p => 
    p.hasError ? '0 2px 8px rgba(244, 67, 54, 0.15)' :
    p.isActive ? '0 4px 12px rgba(0, 0, 0, 0.1)' : 
    '0 2px 4px rgba(0, 0, 0, 0.05)'
  };
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    border-color: ${p => p.hasError ? p.theme.ERROR_COLOR : p.theme.ACCENT_COLOR};
  }
`;

const AccordionQuestionText = styled.span`
  color: ${p => p.hasError ? p.theme.ERROR_COLOR : p.theme.PRIMARY_TEXT_COLOR};
  font-size: 15px;
  line-height: 1.5;
  font-weight: ${p => p.hasError ? '600' : '500'};
  
  /* ✅ PRIDANÉ: Markdown styling */
  p {
    margin: 0;
    display: inline;
  }
  
  strong {
    font-weight: 700;
    color: ${p => p.theme.ACCENT_COLOR};
  }
  
  br {
    display: block;
    content: "";
    margin: 8px 0;
  }
`;


const AccordionQuestionHeader = styled.div`
  padding: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: background 0.2s ease;
  
  &:hover {
    background: ${p => p.theme.HOVER_OVERLAY};
  }
  
  @media (max-width: 768px) {
    padding: 12px;  /* ✅ PRIDANÉ */
  }
`;


const AccordionQuestionTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
`;

const AccordionQuestionNumber = styled.span`
  font-weight: 700;
  color: ${p => p.theme.ACCENT_COLOR};
  font-size: 15px;
  min-width: 30px;
`;

const AccordionQuestionStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  color: ${p => p.theme.PRIMARY_TEXT_COLOR};
`;

const CheckIcon = styled.span`
  color: ${p => p.theme.SUCCESS_COLOR};
  font-size: 15px;
  font-weight: 700;
`;

const AccordionAnswerPreview = styled.div`
  font-size: 15px;
  color: ${p => p.theme.ACCENT_COLOR};
  font-weight: 600;
  padding: 4px 12px;
  background: ${p => p.theme.ACCENT_COLOR}15;
  border-radius: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
`;

const AccordionScaleContainer = styled.div`
  padding: 20px 16px 16px 16px;
  border-top: 1px solid ${p => p.theme.BORDER_COLOR};
  animation: slideDown 0.3s ease;
  
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @media (max-width: 768px) {
    padding: 16px 12px 12px 12px;  /* ✅ PRIDANÉ */
  }
`;


const AccordionScaleButtons = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 16px;
`;

const AccordionScaleButton = styled.button`
  flex: 1;
  padding: 10px 6px;
  border: 2px solid ${p => p.checked ? p.theme.ACCENT_COLOR : p.theme.BORDER_COLOR};
  border-radius: 8px;
  background: ${p => p.checked ? p.theme.ACCENT_COLOR : p.theme.CARD_BACKGROUND};
  color: ${p => p.checked ? '#ffffff' : p.theme.PRIMARY_TEXT_COLOR};
  font-size: 15px;
  font-weight: ${p => p.checked ? '700' : '600'};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${p => p.checked ? p.theme.ACCENT_COLOR : p.theme.HOVER_OVERLAY};
    border-color: ${p => p.theme.ACCENT_COLOR};
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
  @media (max-width: 768px) {
  padding: 14px 4px;  /* ✅ Väčší padding */
  font-size: 12px;    /* ✅ Väčší font pre čísla */
  min-height: 48px;   /* ✅ Väčšia výška */
  font-weight: 700;   /* ✅ Tučnejšie čísla */
}

`;

const AccordionScaleLabels = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 15px;
  color: ${p => p.theme.PRIMARY_TEXT_COLOR};
  margin-bottom: 16px;
  opacity: 0.8;
`;

const AccordionScaleDescriptions = styled.div`
  background: ${p => p.theme.ACCENT_COLOR}15;
  border-radius: 6px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const AccordionScaleDescItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;  /* ✅ ZMENŠENÉ z 15px */
  color: ${p => p.isSelected ? p.theme.ACCENT_COLOR : p.theme.PRIMARY_TEXT_COLOR};
  font-weight: ${p => p.isSelected ? '600' : '400'};
  padding: 4px 8px;
  border-radius: 4px;
  background: ${p => p.isSelected ? p.theme.ACCENT_COLOR + '20' : 'transparent'};
  
  .number {
    font-weight: 700;
    min-width: 20px;
  }
  
  .description {
    flex: 1;
    line-height: 1.4;  /* ✅ PRIDANÉ */
  }
  
  ${p => p.isSelected && `
    &::before {
      content: '→';
      color: ${p.theme.ACCENT_COLOR};
      font-weight: 700;
    }
  `}
  
  /* ✅ Mobile */
  @media (max-width: 768px) {
    font-size: 12px;
    gap: 6px;
    padding: 3px 6px;
    
    .number {
      min-width: 16px;
      font-size: 12px;
    }
  }
`;

const ComparisonQuestionBox = styled.div`
  background: ${p => p.theme.SURFACE_COLOR};
  border: 2px solid ${p => p.theme.BORDER_COLOR};
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  
  strong {
    display: block;
    color: ${p => p.theme.ACCENT_COLOR};
    font-size: 15px;
    font-weight: 700;
    margin-bottom: 8px;
  }
  
  p {
    margin: 8px 0;
    line-height: 1.6;
    color: ${p => p.theme.PRIMARY_TEXT_COLOR};
  }

  br {
    display: block;
    content: "";
    margin: 2px 0; /* ← malá medzera namiesto celého riadku */
  }
`;

// ==========================================
// STYLED COMPONENTS - RADIO & CHECKBOX
// ==========================================

const RadioGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`;

const RadioOption = styled.label`
  display: flex;
  align-items: center;
  padding: 12px 14px;
  cursor: pointer;
  transition: background 0.2s ease;
  background: transparent;
  border-radius: 4px;
  
  &:hover {
    background: ${p => p.theme.HOVER_OVERLAY};
  }
  
  input[type="radio"] {
    appearance: none;
    width: 15px;
    height: 15px;
    border: 2px solid ${p => p.theme.BORDER_COLOR};
    border-radius: 50%;
    margin-right: 14px;
    cursor: pointer;
    position: relative;
    flex-shrink: 0;
    transition: all 0.2s ease;
    
    &:checked {
      border-color: ${p => p.theme.ACCENT_COLOR};
      
      &::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 9px;
        height: 9px;
        border-radius: 50%;
        background: ${p => p.theme.ACCENT_COLOR};
      }
    }
    
    &:hover {
      border-color: ${p => p.theme.ACCENT_COLOR};
    }
  }
  
  span {
    color: ${p => p.theme.PRIMARY_TEXT_COLOR};
    font-size: 15px;
    line-height: 1.5;
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`;

const CheckboxOption = styled.label`
  display: flex;
  align-items: center;
  padding: 12px 14px;
  cursor: pointer;
  transition: background 0.2s ease;
  background: transparent;
  border-radius: 4px;
  
  &:hover {
    background: ${p => p.theme.HOVER_OVERLAY};
  }
  
  input[type="checkbox"] {
    appearance: none;
    width: 15px;
    height: 15px;
    border: 2px solid ${p => p.theme.BORDER_COLOR};
    border-radius: 2px;
    margin-right: 14px;
    cursor: pointer;
    position: relative;
    flex-shrink: 0;
    transition: all 0.2s ease;
    
    &:checked {
      background: ${p => p.theme.ACCENT_COLOR};
      border-color: ${p => p.theme.ACCENT_COLOR};
      
      &::after {
        content: '';
        position: absolute;
        left: 5px;
        top: 2px;
        width: 4px;
        height: 9px;
        border: solid white;
        border-width: 0 2px 2px 0;
        transform: rotate(45deg);
      }
    }
    
    &:hover {
      border-color: ${p => p.theme.ACCENT_COLOR};
    }
  }
  
  span {
    color: ${p => p.theme.PRIMARY_TEXT_COLOR};
    font-size: 15px;
    line-height: 1.5;
  }
`;

// ==========================================
// STYLED COMPONENTS - LIKERT SCALE
// ==========================================

const ScaleContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin: 16px 0;
`;

const ScaleButtonWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
`;

const ScaleRadioLabel = styled.label`
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  
  input[type="radio"] {
    appearance: none;
    width: 15px;
    height: 15px;
    border: 2px solid ${p => p.theme.BORDER_COLOR};
    border-radius: 50%;
    cursor: pointer;
    position: relative;
    transition: all 0.2s ease;
    margin-bottom: 4px;
    
    &:checked {
      border-color: ${p => p.theme.ACCENT_COLOR};
      
      &::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 9px;
        height: 9px;
        border-radius: 50%;
        background: ${p => p.theme.ACCENT_COLOR};
      }
    }
    
    &:hover {
      border-color: ${p => p.theme.ACCENT_COLOR};
      background: ${p => p.theme.ACCENT_COLOR}10;
    }
  }
  
  .scale-number {
    font-size: 15px;
    font-weight: 600;
    color: ${p => p.theme.PRIMARY_TEXT_COLOR};
    margin-bottom: 4px;
  }
`;

const ScaleValueLabel = styled.span`
  font-size: 15px;
  color: ${p => p.theme.PRIMARY_TEXT_COLOR};
  text-align: center;
  line-height: 1.3;
  word-break: break-word;
  hyphens: auto;
  max-width: 100%;
  opacity: 0.8;
`;

const ScaleLabels = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 15px;
  color: ${p => p.theme.PRIMARY_TEXT_COLOR};
  opacity: 0.8;
`;

// ==========================================
// STYLED COMPONENTS - TEXT INPUTS
// ==========================================

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid ${p => p.theme.BORDER_COLOR};
  border-radius: 4px;
  font-size: 15px;
  background: ${p => p.theme.CARD_BACKGROUND};
  color: ${p => p.theme.PRIMARY_TEXT_COLOR};
  
  &:focus {
    outline: none;
    border-color: ${p => p.theme.ACCENT_COLOR};
  }
  
  &::placeholder {
    color: ${p => p.theme.PRIMARY_TEXT_COLOR};
    opacity: 0.5;
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 1px solid ${p => p.theme.BORDER_COLOR};
  border-radius: 8px;
  font-size: 15px;
  font-family: inherit;
  background: ${p => p.theme.CARD_BACKGROUND};
  color: ${p => p.theme.PRIMARY_TEXT_COLOR};
  resize: vertical;
  min-height: 80px;
  line-height: 1.5;
  
  &:focus {
    outline: none;
    border-color: ${p => p.theme.ACCENT_COLOR};
  }
  
  &::placeholder {
    color: ${p => p.theme.PRIMARY_TEXT_COLOR};
    opacity: 0.5;
  }
`;

const BinaryGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`;

const BinaryOption = styled.label`
  display: flex;
  align-items: center;
  padding: 12px 14px;
  cursor: pointer;
  transition: background 0.2s ease;
  background: transparent;
  border-radius: 4px;
  
  &:hover {
    background: ${p => p.theme.HOVER_OVERLAY};
  }
  
  input[type="radio"] {
    appearance: none;
    width: 15px;
    height: 15px;
    border: 2px solid ${p => p.theme.BORDER_COLOR};
    border-radius: 50%;
    margin-right: 14px;
    cursor: pointer;
    position: relative;
    flex-shrink: 0;
    transition: all 0.2s ease;
    
    &:checked {
      border-color: ${p => p.theme.ACCENT_COLOR};
      
      &::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 9px;
        height: 9px;
        border-radius: 50%;
        background: ${p => p.theme.ACCENT_COLOR};
      }
    }
    
    &:hover {
      border-color: ${p => p.theme.ACCENT_COLOR};
    }
  }
  
  span {
    color: ${p => p.theme.PRIMARY_TEXT_COLOR};
    font-size: 15px;
    font-weight: 500;
  }
`;

const LadderContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`;

const LadderOption = styled.label`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 12px 14px;
  cursor: pointer;
  transition: background 0.2s ease;
  background: transparent;
  border-radius: 4px;
  
  &:hover {
    background: ${p => p.theme.HOVER_OVERLAY};
  }
  
  input[type="radio"] {
    appearance: none;
    width: 15px;
    height: 15px;
    border: 2px solid ${p => p.theme.BORDER_COLOR};
    border-radius: 50%;
    margin-right: 14px;
    cursor: pointer;
    position: relative;
    flex-shrink: 0;
    transition: all 0.2s ease;
    
    &:checked {
      border-color: ${p => p.theme.ACCENT_COLOR};
      
      &::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 9px;
        height: 9px;
        border-radius: 50%;
        background: ${p => p.theme.ACCENT_COLOR};
      }
    }
    
    &:hover {
      border-color: ${p => p.theme.ACCENT_COLOR};
    }
  }
  
  .ladder-content {
    display: flex;
    align-items: center;
    flex: 0;
    color: ${p => p.theme.PRIMARY_TEXT_COLOR};
    font-size: 15px;
  }
  
  .ladder-number {
    font-size: 15px;
    font-weight: 700;
    color: ${p => p.theme.ACCENT_COLOR};
    margin-left: 0;
  }
`;

const PreferNotToSayOption = styled.label`
  display: flex;
  align-items: center;
  padding: 12px 14px;
  margin-top: 8px;
  cursor: pointer;
  transition: background 0.2s ease;
  background: transparent;
  border-radius: 4px;
  border-top: 1px solid ${p => p.theme.BORDER_COLOR};
  
  &:hover {
    background: ${p => p.theme.HOVER_OVERLAY};
  }
  
  input[type="checkbox"] {
    appearance: none;
    width: 15px;
    height: 15px;
    border: 2px solid ${p => p.theme.BORDER_COLOR};
    border-radius: 2px;
    margin-right: 14px;
    cursor: pointer;
    position: relative;
    flex-shrink: 0;
    transition: all 0.2s ease;
    
    &:checked {
      background: ${p => p.theme.ACCENT_COLOR};
      border-color: ${p => p.theme.ACCENT_COLOR};
      
      &::after {
        content: '';
        position: absolute;
        left: 5px;
        top: 2px;
        width: 4px;
        height: 9px;
        border: solid white;
        border-width: 0 2px 2px 0;
        transform: rotate(45deg);
      }
    }
    
    &:hover {
      border-color: ${p => p.theme.ACCENT_COLOR};
    }
  }
  
  span {
    color: ${p => p.theme.PRIMARY_TEXT_COLOR};
    font-size: 15px;
  }
`;

// ==========================================
// STYLED COMPONENTS - NUMBER SELECT
// ==========================================

const NumberSelectContainer = styled.div`
  margin-top: 12px;
`;

const NumberSelectInstruction = styled.div`
  font-size: 15px;
  color: ${p => p.theme.PRIMARY_TEXT_COLOR};
  margin-bottom: 12px;
  opacity: 0.8;
`;

const NumberGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(45px, 1fr));
  gap: 8px;
`;

const NumberButton = styled.button`
  padding: 10px;
  border: 2px solid ${p => p.checked ? p.theme.ACCENT_COLOR : p.theme.BORDER_COLOR};
  border-radius: 6px;
  background: ${p => p.checked ? p.theme.ACCENT_COLOR : p.theme.CARD_BACKGROUND};
  color: ${p => p.checked ? '#ffffff' : p.theme.PRIMARY_TEXT_COLOR};
  font-size: 15px;
  font-weight: ${p => p.checked ? '700' : '500'};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${p => p.checked ? p.theme.ACCENT_COLOR : p.theme.HOVER_OVERLAY};
    border-color: ${p => p.theme.ACCENT_COLOR};
  }
`;

const SelectedNumbers = styled.div`
  margin-top: 12px;
  padding: 10px;
  background: ${p => p.theme.ACCENT_COLOR}15;
  border: 1px solid ${p => p.theme.ACCENT_COLOR}60;
  border-radius: 6px;
  font-size: 15px;
  color: ${p => p.theme.ACCENT_COLOR};
`;



const ErrorText = styled.div`
  color: ${p => p.theme.ACCENT_COLOR_2 || p.theme.ERROR_COLOR};
  margin-bottom: 16px;
  text-align: center;
  font-size: 15px;
  font-weight: 600;
  padding: 12px;
  background: rgba(255, 0, 0, 0.1);
  border-radius: 8px;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 24px;
  gap: 12px;
`;



// ==========================================
// KONŠTANTY
// ==========================================

const COMPONENT_ID = 'questionnaire3b';


const EP_NORMAL = [
  { id: 'ep1', text: 'Európska únia má skrytý plán systematicky zničiť suverenitu členských štátov.', scale: [1, 2, 3, 4, 5, 6, 7], scaleLabels: { min: 'Rozhodne nesúhlasím', max: 'Rozhodne súhlasím' }, scaleValueLabels: ['Rozhodne nesúhlasím', 'Takmer úplne nesúhlasím', 'Skôr nesúhlasím', 'Neutrálny postoj', 'Skôr súhlasím', 'Takmer úplne súhlasím', 'Rozhodne súhlasím'] },
  { id: 'ep2', text: 'Rozhodnutia EÚ sú transparentné a robené Európskym parlamentom a zvolenými poslancami.', scale: [1, 2, 3, 4, 5, 6, 7], scaleLabels: { min: 'Rozhodne nesúhlasím', max: 'Rozhodne súhlasím' }, scaleValueLabels: ['Rozhodne nesúhlasím', 'Takmer úplne nesúhlasím', 'Skôr nesúhlasím', 'Neutrálny postoj', 'Skôr súhlasím', 'Takmer úplne súhlasím', 'Rozhodne súhlasím'] },
  { id: 'ep3', text: 'Európske inštitúcie a mainstreamové médiá spolupracujú na tom, aby pred občanmi zatajili skutočné negatívne dôsledky rozhodnutí EÚ.', scale: [1, 2, 3, 4, 5, 6, 7], scaleLabels: { min: 'Rozhodne nesúhlasím', max: 'Rozhodne súhlasím' }, scaleValueLabels: ['Rozhodne nesúhlasím', 'Takmer úplne nesúhlasím', 'Skôr nesúhlasím', 'Neutrálny postoj', 'Skôr súhlasím', 'Takmer úplne súhlasím', 'Rozhodne súhlasím'] },
  { id: 'ep4', text: 'EÚ rešpektuje a chráni národné kultúry a tradície všetkých členských štátov.', scale: [1, 2, 3, 4, 5, 6, 7], scaleLabels: { min: 'Rozhodne nesúhlasím', max: 'Rozhodne súhlasím' }, scaleValueLabels: ['Rozhodne nesúhlasím', 'Takmer úplne nesúhlasím', 'Skôr nesúhlasím', 'Neutrálny postoj', 'Skôr súhlasím', 'Takmer úplne súhlasím', 'Rozhodne súhlasím'] },
  { id: 'ep5', text: 'EÚ zámerne obchádza demokratické procesy a ignoruje vôľu občanov, pretože sú riadené skrytou agendou globálnych elít.', scale: [1, 2, 3, 4, 5, 6, 7], scaleLabels: { min: 'Rozhodne nesúhlasím', max: 'Rozhodne súhlasím' }, scaleValueLabels: ['Rozhodne nesúhlasím', 'Takmer úplne nesúhlasím', 'Skôr nesúhlasím', 'Neutrálny postoj', 'Skôr súhlasím', 'Takmer úplne súhlasím', 'Rozhodne súhlasím'] },
  { id: 'ep6', text: 'Regulácie EÚ sú navrhnuté aby chránili hospodárstvo všetkých členských štátov vrátane Slovenska, nie aby mu ublížili.', scale: [1, 2, 3, 4, 5, 6, 7], scaleLabels: { min: 'Rozhodne nesúhlasím', max: 'Rozhodne súhlasím' }, scaleValueLabels: ['Rozhodne nesúhlasím', 'Takmer úplne nesúhlasím', 'Skôr nesúhlasím', 'Neutrálny postoj', 'Skôr súhlasím', 'Takmer úplne súhlasím', 'Rozhodne súhlasím'] },
  { id: 'ep7', text: 'Migračná kríza bola naplánovaná autoritami EÚ.', scale: [1, 2, 3, 4, 5, 6, 7], scaleLabels: { min: 'Rozhodne nesúhlasím', max: 'Rozhodne súhlasím' }, scaleValueLabels: ['Rozhodne nesúhlasím', 'Takmer úplne nesúhlasím', 'Skôr nesúhlasím', 'Neutrálny postoj', 'Skôr súhlasím', 'Takmer úplne súhlasím', 'Rozhodne súhlasím'] },
  {
            id: 'attention_check_9',
            text: 'Pozor kontrolná otázka. Prosím vyberte číslo 3.',
            scale: [1, 2, 3, 4, 5],
          },
];

const EP_VARIED = [
  { id: 'epv1', text: 'Štáty si zachovávajú svoju suverenitu v rámci EÚ.', scale: [1, 2, 3, 4, 5, 6, 7], scaleLabels: { min: 'Rozhodne nesúhlasím', max: 'Rozhodne súhlasím' }, scaleValueLabels: ['Rozhodne nesúhlasím', 'Takmer úplne nesúhlasím', 'Skôr nesúhlasím', 'Neutrálny postoj', 'Skôr súhlasím', 'Takmer úplne súhlasím', 'Rozhodne súhlasím'] },
  { id: 'epv2', text: 'Rozhodnutia EÚ v skutočnosti nerobí Európsky parlament, ale tajná skupina globálnych elít a veľkých korporácií.', scale: [1, 2, 3, 4, 5, 6, 7], scaleLabels: { min: 'Rozhodne nesúhlasím', max: 'Rozhodne súhlasím' }, scaleValueLabels: ['Rozhodne nesúhlasím', 'Takmer úplne nesúhlasím', 'Skôr nesúhlasím', 'Neutrálny postoj', 'Skôr súhlasím', 'Takmer úplne súhlasím', 'Rozhodne súhlasím'] },
  { id: 'epv3', text: 'Európske inštitúcie a mainstreamové médiá transparentne informujú občanov o rozhodnutiach EÚ.', scale: [1, 2, 3, 4, 5, 6, 7], scaleLabels: { min: 'Rozhodne nesúhlasím', max: 'Rozhodne súhlasím' }, scaleValueLabels: ['Rozhodne nesúhlasím', 'Takmer úplne nesúhlasím', 'Skôr nesúhlasím', 'Neutrálny postoj', 'Skôr súhlasím', 'Takmer úplne súhlasím', 'Rozhodne súhlasím'] },
  { id: 'epv4', text: 'EÚ má skrytý plán na zničenie národných kultúr a tradícií v prospech multikulturalizmu a liberálnych hodnôt.', scale: [1, 2, 3, 4, 5, 6, 7], scaleLabels: { min: 'Rozhodne nesúhlasím', max: 'Rozhodne súhlasím' }, scaleValueLabels: ['Rozhodne nesúhlasím', 'Takmer úplne nesúhlasím', 'Skôr nesúhlasím', 'Neutrálny postoj', 'Skôr súhlasím', 'Takmer úplne súhlasím', 'Rozhodne súhlasím'] },
  { id: 'epv5', text: 'Všetky rozhodnutia EÚ sú prijaté v plne transparentných procesoch, kde všetci poslanci verejne hlasujú, a žiadna krajina nie je nútená ich nasledovať.', scale: [1, 2, 3, 4, 5, 6, 7], scaleLabels: { min: 'Rozhodne nesúhlasím', max: 'Rozhodne súhlasím' }, scaleValueLabels: ['Rozhodne nesúhlasím', 'Takmer úplne nesúhlasím', 'Skôr nesúhlasím', 'Neutrálny postoj', 'Skôr súhlasím', 'Takmer úplne súhlasím', 'Rozhodne súhlasím'] },
  { id: 'epv6', text: 'EÚ vedome zavádza škodlivé regulácie s cieľom ekonomicky zničiť Slovensko a prinútiť nás byť úplne závislí na Bruseli.', scale: [1, 2, 3, 4, 5, 6, 7], scaleLabels: { min: 'Rozhodne nesúhlasím', max: 'Rozhodne súhlasím' }, scaleValueLabels: ['Rozhodne nesúhlasím', 'Takmer úplne nesúhlasím', 'Skôr nesúhlasím', 'Neutrálny postoj', 'Skôr súhlasím', 'Takmer úplne súhlasím', 'Rozhodne súhlasím'] },
  { id: 'epv7', text: 'Migračná kríza bola prirodzená udalosť, nie naplánovaná autoritami EÚ.', scale: [1, 2, 3, 4, 5, 6, 7], scaleLabels: { min: 'Rozhodne nesúhlasím', max: 'Rozhodne súhlasím' }, scaleValueLabels: ['Rozhodne nesúhlasím', 'Takmer úplne nesúhlasím', 'Skôr nesúhlasím', 'Neutrálny postoj', 'Skôr súhlasím', 'Takmer úplne súhlasím', 'Rozhodne súhlasím'] },
  {
            id: 'attention_check_9v',
            text: 'Pozor kontrolná otázka. Prosím vyberte číslo 3.',
            scale: [1, 2, 3, 4, 5],
          },
];


// ==========================================
// DEFINÍCIA 9 STRÁNOK DOTAZNÍKA
// ==========================================

// ==========================================
// DEFINÍCIA PAGES - KOMPLETNÝ DOTAZNÍK
// ==========================================

const getPAGES =(questionVersion) => [
  

  // ==========================================
  // STRANA 8: KONŠPIRAČNÉ PRESVEDČENIA (ACCORDION)
  // ==========================================
    {
    id: 'konspiracia_presvedcenia',
    randomize: true,
    instruction: 'Pokračujeme ďalej! Nižšie nájdete sériu tvrdení. Pri každom tvrdení prosím vyjadrite, do akej miery s ním súhlasíte, na škále od 1 do 7. Neexistujú správne alebo nesprávne odpovede.',
    questions: [
      {
        id: 'konspiracia_presvedcenia_accordion',
        text: '',
        type: 'accordion-likert',
        required: true,
        questions: questionVersion === 'A' ? EP_VARIED : EP_NORMAL
      }
    ]
  },


  // ==========================================
  // STRANA 7: DÔVERA (ACCORDION)
  // ==========================================
  {
    id: 'dovera',
    randomize: true,
    instruction: 'Nižšie nájdete zoznam rôznych inštitúcií EÚ. Pri každej inštitúcií prosím vyjadrite, do akej miery im dôverujete, na škále od 1 do 10. Ak inštitúciu nepoznáte zvoľte prosím možnosť neviem/nepoznám. Neexistujú správne alebo nesprávne odpovede.',
    questions: [
      {
        id: 'dovera_accordion',
        text: '',
        type: 'accordion-likert',
        required: true,
        extraOption: { value: 'Neviem/nepoznám', label: 'Neviem/nepoznám ' },
        questions: [
          {
            id: 'id1',
            text: 'Európsky parlament',
            scale: [1,2,3,4,5,6,7,8,9,10],
            scaleLabels: { min: 'Absolútne nedôverujem', max: 'Absolútne dôverujem' },
            anchorLabels: {
              5: 'Skôr nedôverujem',
              6: 'Skôr dôverujem',
            }
          },
          {
            id: 'id2',
            text: 'Európska rada',
            scale: [1,2,3,4,5,6,7,8,9,10],
            scaleLabels: { min: 'Absolútne nedôverujem', max: 'Absolútne dôverujem' },
            anchorLabels: {
              5: 'Skôr nedôverujem',
              6: 'Skôr dôverujem',
            }
          },
          {
            id: 'id3',
            text: 'Rada Európskej únie',
            scale: [1,2,3,4,5,6,7,8,9,10],
            scaleLabels: { min: 'Absolútne nedôverujem', max: 'Absolútne dôverujem' },
            anchorLabels: {
              5: 'Skôr nedôverujem',
              6: 'Skôr dôverujem',
            }
          },
          {
            id: 'id4',
            text: 'Európska komisia',
            scale: [1,2,3,4,5,6,7,8,9,10],
            scaleLabels: { min: 'Absolútne nedôverujem', max: 'Absolútne dôverujem' },
            anchorLabels: {
              5: 'Skôr nedôverujem',
              6: 'Skôr dôverujem',
            }
          },
          {
            id: 'id5',
            text: 'Súdny dvor Európskej únie',
            scale: [1,2,3,4,5,6,7,8,9,10],
            scaleLabels: { min: 'Absolútne nedôverujem', max: 'Absolútne dôverujem' },
            anchorLabels: {
              5: 'Skôr nedôverujem',
              6: 'Skôr dôverujem',
            }
          },
          {
            id: 'id6',
            text: 'Európska centrálna banka',
            scale: [1,2,3,4,5,6,7,8,9,10],
            scaleLabels: { min: 'Absolútne nedôverujem', max: 'Absolútne dôverujem' },
            anchorLabels: {
              5: '5kôr nedôverujem',
              6: 'Skôr dôverujem',
            }
          },
          {
            id: 'id7',
            text: 'Európsky dvor audítorov',
            scale: [1,2,3,4,5,6,7,8,9,10],
            scaleLabels: { min: 'Absolútne nedôverujem', max: 'Absolútne dôverujem' },
            anchorLabels: {
              5: 'Skôr nedôverujem',
              6: 'Skôr dôverujem',
            }
          }
        ]
      }
    ]
  },

];


export { getPAGES };




// ==========================================
// HLAVNÝ KOMPONENT
// ==========================================

const Questionnaire3B = () => {
  const navigate = useNavigate();
  const { dataManager, userId } = useUserStats();
  const responseManager = getResponseManager(dataManager);

  const [currentPage, setCurrentPage] = useState(0);
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState('');
  const [questionErrors, setQuestionErrors] = useState({});
  const [startTime] = useState(Date.now());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeAccordionId, setActiveAccordionId] = useState(null);
  const [activeQuestionId, setActiveQuestionId] = useState(null);
  const { questionVersion } = useUserStats();
  
  const questionRefs = useRef({});
  const shuffledOrderRef = useRef({});
  const PAGES = getPAGES(questionVersion);
  // Funkcia pre Fisher-Yates shuffle
  const shuffleArray = (arr) => {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  useEffect(() => {
    PAGES.forEach(page => {
      if (!page.randomize) return;
      page.questions.forEach(q => {
        if (q.type === 'accordion-likert' && q.questions) {
          if (!shuffledOrderRef.current[q.id]) {
            shuffledOrderRef.current[q.id] = shuffleArray(
              q.questions.map((_, idx) => idx)
            );
          }
        }
      });
    });
  }, [PAGES]);
  // Načítanie uložených odpovedí
  useEffect(() => {
    const loadSaved = async () => {
      if (!userId) return;
      const saved = await responseManager.loadResponses(userId, COMPONENT_ID);
      if (saved.answers && Object.keys(saved.answers).length > 0) {
        setAnswers(saved.answers);
      }
    };
    loadSaved();
  }, [userId, responseManager]);

  // Reset errors pri zmene stránky
  useEffect(() => {
    setQuestionErrors({});
    setError('');
    setActiveAccordionId(null);
    setActiveQuestionId(null);
  }, [currentPage]);

  // Kontrola podmienok zobrazenia otázky
  const shouldShowQuestion = (question, responses) => {
    if (!question.showIf) return true;

    const { questionId, value, operator = '==' } = question.showIf;
    const responseValue = responses[questionId];

    if (responseValue === undefined || responseValue === null) return false;

    switch (operator) {
      case 'includes':
        return Array.isArray(responseValue) && responseValue.includes(value);
      case '==':
        return responseValue === value;
      case '!=':
        return responseValue !== value;
      case '>':
        return responseValue > value;
      case '<':
        return responseValue < value;
      default:
        return false;
    }
  };

  // Zmena odpovede s auto-save
  const handleAnswer = async (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
    setQuestionErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[questionId];
      return newErrors;
    });
    
    await responseManager.saveAnswer(userId, COMPONENT_ID, questionId, value);

    // Scroll len pre radio, binary, likert — a nie keď je vybrané "Iné"
    const page = PAGES[currentPage];
    const question = page.questions.find(q => q.id === questionId);
    const scrollTypes = ['radio', 'binary', 'likert','ladder'];
    
    const shouldScroll = 
      question &&
      scrollTypes.includes(question.type) &&
      value !== '__custom__' &&          // ← nie keď je "Iné" vybrané
      !String(value).startsWith('__custom__'); // ← ani keď sa píše do "Iné"

    if (shouldScroll) {
      const allQuestions = page.questions.filter(q =>  q.type !== 'accordion-likert');
      const currentIndex = allQuestions.findIndex(q => q.id === questionId);

      if (currentIndex !== -1 && currentIndex < allQuestions.length - 1) {
        const nextQuestion = allQuestions[currentIndex + 1];
        const nextElement = questionRefs.current[nextQuestion.id];

        setTimeout(() => {
          setActiveQuestionId(nextQuestion.id); // ← presunuté sem
          if (nextElement) {
            const isMobile = window.innerWidth <= 768;
            const offset = isMobile ? 180 : 150;
            const elementPosition = nextElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;
            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
          }
        }, 150);
      }
    }
  };


  // Checkbox handler
  const handleCheckboxChange = async (questionId, optionValue) => {
    const currentValues = answers[questionId] || [];
    const newValues = currentValues.includes(optionValue)
      ? currentValues.filter(v => v !== optionValue)
      : [...currentValues, optionValue];
    
    await handleAnswer(questionId, newValues);
  };


  // Pridaj do Questionnaire0 komponentu hore:

  // Number select handler
  const handleNumberSelect = async (questionId, number, multiple) => {
    if (multiple) {
      const currentValues = answers[questionId] || [];
      const newValues = currentValues.includes(number)
        ? currentValues.filter(n => n !== number)
        : [...currentValues, number].sort((a, b) => a - b);
      await handleAnswer(questionId, newValues);
    } else {
      await handleAnswer(questionId, number);
    }
  };
  // Accordion handler
  const handleAccordionClick = (subQuestionId) => {
    setActiveAccordionId(activeAccordionId === subQuestionId ? null : subQuestionId);
  };

  // Accordion handler
  const handleAccordionAnswer = async (accordionQuestions, subQuestionId, scaleValue) => {
    await handleAnswer(subQuestionId, scaleValue);
    
    setQuestionErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[subQuestionId];
      return newErrors;
    });
    
    const currentIndex = accordionQuestions.findIndex(q => q.id === subQuestionId);
    
    if (currentIndex < accordionQuestions.length - 1) {
      setTimeout(() => {
        const nextQuestion = accordionQuestions[currentIndex + 1];
        setActiveAccordionId(nextQuestion.id);
        
        const nextElement = questionRefs.current[nextQuestion.id];
        if (nextElement) {
          const isMobile = window.innerWidth <= 768;
          const offset = isMobile ? 180 : 150; // ← zvýšený mobile offset
          
          setTimeout(() => {
            const elementPosition = nextElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;
            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
          }, 150); // ← väčší delay pre plynulejší scroll
        }
      }, 300);
    } else {
      setTimeout(() => {
        setActiveAccordionId(null);
      }, 300);
    }
  };

  

  // Validácia stránky
  const validatePage = () => {
  const page = PAGES[currentPage];
  const errors = {};
  let hasError = false;

  const validateQuestion = (question) => {
      if (!shouldShowQuestion(question, answers)) return;
      if (!question.required) return;

      const answer = answers[question.id];

      if (answer === undefined || answer === null || answer === '') {
        errors[question.id] = 'Táto otázka je povinná.';
        hasError = true;
      }

      if (question.type === 'checkbox' && (!Array.isArray(answer) || answer.length === 0)) {
        errors[question.id] = 'Vyberte aspoň jednu možnosť.';
        hasError = true;
      }
    };

    page.questions.forEach(question => {
      if (question.type === 'accordion-likert' && question.questions) {
        question.questions.forEach(subQuestion => {
          const answer = answers[subQuestion.id];
          if (answer === undefined || answer === null || answer === '') {
            errors[subQuestion.id] = 'Táto otázka je povinná.';
            hasError = true;
          }
        });
      } else {
        validateQuestion(question);
      }
    });


    setQuestionErrors(errors);

    if (hasError) {
      setError('Prosím vyplňte všetky povinné otázky.');
      const firstErrorId = Object.keys(errors)[0];
      if (firstErrorId && questionRefs.current[firstErrorId]) {
        // ✅ OPRAVENÉ: väčší offset pre chybové otázky
        const element = questionRefs.current[firstErrorId];
        const isMobile = window.innerWidth <= 768;
        const offset = isMobile ? 100 : 180; // väčší offset pre desktop
        
        setTimeout(() => {
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - offset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }, 100);
      }
    }


    return !hasError;
  };

  // Ďalšia strana
  const handleNext = async () => {
    if (!validatePage()) return;

    if (currentPage < PAGES.length - 1) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      handleSubmit();
    }
  };

  // Predošlá strana
  const handleBack = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Odoslanie dotazníka
  // Odoslanie dotazníka
  // Odoslanie dotazníka
  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      
      // ✅ Ulož všetky odpovede s metadata
      await responseManager.saveMultipleAnswers(userId, COMPONENT_ID, answers, {
        timespent_seconds: timeSpent,
        mission: 'mission3',
        questionnaire: '3b',
        completed_at: new Date().toISOString(),
        device: window.innerWidth <= 768 ? 'mobile' : 'desktop'
      });

      // ✅ OPRAVENÉ: Označ misi ako completed priamo v progress
      const progress = await dataManager.loadUserProgress(userId);
      progress.mission3_questbCompleted = true;
      await dataManager.saveProgress(userId, progress);

      // skupinová navigácia:
      progress.mission3_questbCompleted = true;
      await dataManager.saveProgress(userId, progress);
      navigate('/mission3/outro');

      
    } catch (err) {
      console.error('❌ Error submitting questionnaire:', err);
      setError('Chyba pri odosielaní dotazníka. Skúste to znova prosím.');
      setIsSubmitting(false);
    }
  };


  // ==========================================
  // RENDER FUNKCIE
  // ==========================================

  const renderQuestionInput = (question) => {
  const value = answers[question.id];

  switch (question.type) {
    case 'accordion-likert':
      const rawQuestions = question.questions || [];
      const order = shuffledOrderRef.current[question.id];
      const accordionQuestions = order
        ? order.map(idx => rawQuestions[idx])
        : rawQuestions;

      return (
        <AccordionQuestionList>
          {accordionQuestions.map((subQuestion, index) => {
            const subValue = answers[subQuestion.id];
            const isActive = activeAccordionId === subQuestion.id;
            const isCompleted = subValue !== undefined && subValue !== null;
            const hasError = questionErrors[subQuestion.id];
            
            

            
            return (
              <AccordionQuestionItem
                key={subQuestion.id}
                ref={el => (questionRefs.current[subQuestion.id] = el)}
                isActive={isActive}
                isCompleted={isCompleted}
                hasError={hasError}
              >
                <AccordionQuestionHeader
                  onClick={() => handleAccordionClick(subQuestion.id)}
                >
                  <AccordionQuestionTitle>
                    <AccordionQuestionNumber>{index + 1}.</AccordionQuestionNumber>
                    <AccordionQuestionText hasError={hasError}>
                      <span dangerouslySetInnerHTML={{ 
                        __html: parseMarkdown(subQuestion.text) 
                      }} />
                    </AccordionQuestionText>
                  </AccordionQuestionTitle>

                  
                  <AccordionQuestionStatus>
                    {isCompleted && !hasError && (
                      <>
                        <CheckIcon>✓</CheckIcon>
                        <AccordionAnswerPreview>
                           {subValue}
                        </AccordionAnswerPreview>
                      </>
                    )}
                    {!isCompleted && !hasError && (
                      <span style={{ color: p => p.theme.WARNING_COLOR, fontSize: '15px', fontWeight: '500' }}>
                        
                      </span>
                    )}
                    {hasError && (
                      <span style={{ color: p => p.theme.ERROR_COLOR, fontSize: '15px', fontWeight: '600' }}>
                        ⚠ Povinné
                      </span>
                    )}
                  </AccordionQuestionStatus>
                </AccordionQuestionHeader>
                
                {isActive && (
                  <AccordionScaleContainer>
                    {/* POROVNÁVACIE OTÁZKY - s boxom a labelmi */}
                    {subQuestion.content ? (
                      <>
                        {/* Box s contentom */}
                        <ComparisonQuestionBox>
                          <div dangerouslySetInnerHTML={{ 
                            __html: parseMarkdown(subQuestion.content) 
                          }} />
                        </ComparisonQuestionBox>
                        
                        {/* Scale buttons */}
                        <AccordionScaleButtons>
                          {subQuestion.scale.map(scaleValue => (
                            <AccordionScaleButton
                              key={scaleValue}
                              type="button"
                              checked={subValue === scaleValue}
                              onClick={() => handleAccordionAnswer(accordionQuestions, subQuestion.id, scaleValue)}
                            >
                              {scaleValue}
                            </AccordionScaleButton>
                          ))}
                        </AccordionScaleButtons>
                        
                        {subQuestion.scaleLabels && (
                          <AccordionScaleLabels>
                            <span>{subQuestion.scaleLabels.min}</span>
                            
                            {/* Anchor labely uprostred */}
                            {subQuestion.anchorLabels && 
                              Object.entries(subQuestion.anchorLabels).map(([key, label]) => (
                                <span key={key} style={{ fontSize: '15px', textAlign: 'center' }}>
                                  {label}
                                </span>
                              ))
                            }
                            
                            <span>{subQuestion.scaleLabels.max}</span>
                          </AccordionScaleLabels>
                        )}
                        
                        {subQuestion.scaleValueLabels && (
                          <AccordionScaleDescriptions>
                            {subQuestion.scale.map((scaleValue, idx) => (
                              <AccordionScaleDescItem
                                key={scaleValue}
                                isSelected={subValue === scaleValue}
                              >
                                <span className="number">{scaleValue}:</span>
                                <span className="description">
                                  {subQuestion.scaleValueLabels[idx]}
                                </span>
                              </AccordionScaleDescItem>
                            ))}
                          </AccordionScaleDescriptions>
                        )}
                      </>
                    ) : (
                      <>
                        {/* Normálne accordion otázky */}
                        <AccordionScaleButtons>
                          {subQuestion.scale.map(scaleValue => (
                            <AccordionScaleButton
                              key={scaleValue}
                              type="button"
                              checked={subValue === scaleValue}
                              onClick={() => handleAccordionAnswer(accordionQuestions, subQuestion.id, scaleValue)}
                            >
                              {scaleValue}
                            </AccordionScaleButton>
                          ))}
                        </AccordionScaleButtons>
                        
                        {subQuestion.scaleLabels && (
                          <AccordionScaleLabels>
                            <span>{subQuestion.scaleLabels.min}</span>
                            <span>{subQuestion.scaleLabels.max}</span>
                          </AccordionScaleLabels>
                        )}
                        
                        {subQuestion.scaleValueLabels && (
                          <AccordionScaleDescriptions>
                            {subQuestion.scale.map((scaleValue, idx) => (
                              <AccordionScaleDescItem
                                key={scaleValue}
                                isSelected={subValue === scaleValue}
                              >
                                <span className="number">{scaleValue}:</span>
                                <span className="description">
                                  {subQuestion.scaleValueLabels[idx]}
                                </span>
                              </AccordionScaleDescItem>
                            ))}
                          </AccordionScaleDescriptions>
                        )}
                      </>
                    )}

                    {/* Neviem tlačidlo (dôvera) */}
                    {question.extraOption && (
                      <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(0,0,0,0.1)' }}>
                        <AccordionScaleButton
                          type="button"
                          checked={subValue === question.extraOption.value}
                          onClick={() => handleAccordionAnswer(
                            accordionQuestions,
                            subQuestion.id,
                            question.extraOption.value
                          )}
                          style={{ width: '100%', flex: 'none' }}
                        >
                          {question.extraOption.label}
                        </AccordionScaleButton>
                      </div>
                    )}
                  </AccordionScaleContainer>
                )}
                </AccordionQuestionItem>
                );
                })}
                </AccordionQuestionList>
                );

      case 'radio':
      // ✅ Kontrola, či je vybraté "Iné" (hodnota neexistuje v definovaných options)
      const isOtherSelected = value && !question.options.find(o => o.value === value);
      
      return (
        <RadioGroup>
          {question.options.map(option => (
            <RadioOption key={option.value}>
              <input
                type="radio"
                name={question.id}
                value={option.value}
                checked={value === option.value}
                onChange={() => handleAnswer(question.id, option.value)}
              />
              <span>{option.label}</span>
            </RadioOption>
          ))}
          
          {/* ✅ "Iné" možnosť */}
          {question.hasOther && (
            <>
              <RadioOption>
                <input
                  type="radio"
                  name={question.id}
                  value="__custom_other__"
                  checked={isOtherSelected}
                  onChange={() => handleAnswer(question.id, '__custom__')}
                />
                <span>{question.otherLabel || 'Iné (prosím špecifikujte)'}</span>
              </RadioOption>
              
              {/* ✅ Input zobrazený len keď je "Iné" vybrané */}
              {isOtherSelected && (
                <div style={{ 
                  marginTop: '8px', 
                  paddingLeft: '36px',
                  width: 'calc(100% - 36px)' 
                }}>
                  <Input
                    type="text"
                    placeholder="Zadajte text..."
                    value={value.startsWith('__custom__') ? value.substring(10) : value}
                    onChange={(e) => handleAnswer(question.id, '__custom__' + e.target.value)}
                    autoFocus
                  />
                </div>
              )}
            </>
          )}
        </RadioGroup>
      );


      case 'checkbox':
        return (
          <CheckboxGroup>
            {question.options.map(option => (
              <CheckboxOption key={option.value}>
                <input
                  type="checkbox"
                  checked={Array.isArray(value) && value.includes(option.value)}
                  onChange={() => handleCheckboxChange(question.id, option.value)}
                />
                <span>{option.label}</span>
              </CheckboxOption>
            ))}
          </CheckboxGroup>
        );

      case 'likert':
        return (
          <>
            <ScaleContainer>
              {question.scale.map((scaleValue, idx) => (
                <ScaleButtonWrapper key={scaleValue}>
                  <ScaleRadioLabel>
                    <input
                      type="radio"
                      name={question.id}
                      value={scaleValue}
                      checked={value === scaleValue}
                      onChange={() => handleAnswer(question.id, scaleValue)}
                    />
                    <div className="scale-number">{scaleValue}</div>
                  </ScaleRadioLabel>
                  {question.scaleValueLabels && question.scaleValueLabels[idx] && (
                    <ScaleValueLabel>{question.scaleValueLabels[idx]}</ScaleValueLabel>
                  )}
                </ScaleButtonWrapper>
              ))}
            </ScaleContainer>
            {question.scaleLabels && (
              <ScaleLabels>
                <span>{question.scaleLabels.min}</span>
                <span>{question.scaleLabels.max}</span>
              </ScaleLabels>
            )}
          </>
        );

      case 'ladder':
      return (
        <>
          {/* ✅ PRIDAJ LABEL HORE */}
          {question.scaleLabels && (
            <ScaleLabels style={{ marginBottom: '8px' }}>
              <span>{question.scaleLabels.max}</span>
            </ScaleLabels>
          )}
          
          <LadderContainer>
            {question.scale.map(scaleValue => (
              <LadderOption key={scaleValue}>
                <input
                  type="radio"
                  name={question.id}
                  value={scaleValue}
                  checked={value === scaleValue}
                  onChange={() => handleAnswer(question.id, scaleValue)}
                />
                <div className="ladder-content">
                  <span className="ladder-number">{scaleValue}</span>
                </div>
              </LadderOption>
            ))}
          </LadderContainer>
          
          {/* ✅ LABEL DOLE */}
          {question.scaleLabels && (
            <ScaleLabels style={{ marginTop: '8px' }}>
              <span>{question.scaleLabels.min}</span>
            </ScaleLabels>
          )}
          
          {question.hasPreferNotToSay && (
            <PreferNotToSayOption>
              <input
                type="checkbox"
                checked={value === 'prefer_not_to_say'}
                onChange={() => handleAnswer(question.id, 'prefer_not_to_say')}
              />
              <span>Preferujem neuvádzať</span>
            </PreferNotToSayOption>
          )}
        </>
      );


      case 'binary':
        return (
          <BinaryGroup>
            {question.options.map(option => (
              <BinaryOption key={option.value}>
                <input
                  type="radio"
                  name={question.id}
                  value={option.value}
                  checked={value === option.value}
                  onChange={() => handleAnswer(question.id, option.value)}
                />
                <span>{option.label}</span>
              </BinaryOption>
            ))}
          </BinaryGroup>
        );

      case 'number':
        return (
          <Input
            type="number"
            min={question.min}
            max={question.max}
            placeholder={question.placeholder}
            value={value || ''}
            onChange={(e) => handleAnswer(question.id, parseInt(e.target.value) || '')}
          />
        );

      case 'text':
        return (
          <Input
            type="text"
            placeholder={question.placeholder}
            value={value || ''}
            onChange={(e) => handleAnswer(question.id, e.target.value)}
          />
        );

      case 'textarea':
        return (
          <Textarea
            placeholder={question.placeholder}
            value={value || ''}
            onChange={(e) => handleAnswer(question.id, e.target.value)}
          />
        );

      case 'number-select':
        const selectedNumbers = Array.isArray(value) ? value : (value ? [value] : []);
        return (
          <NumberSelectContainer>
            {question.instruction && (
              <NumberSelectInstruction>{question.instruction}</NumberSelectInstruction>
            )}
            <NumberGrid>
              {Array.from({ length: question.max - question.min + 1 }, (_, i) => i + question.min).map(num => (
                <NumberButton
                  key={num}
                  type="button"
                  checked={selectedNumbers.includes(num)}
                  onClick={() => handleNumberSelect(question.id, num, question.multiple)}
                >
                  {num}
                </NumberButton>
              ))}
            </NumberGrid>
            {selectedNumbers.length > 0 && (
              <SelectedNumbers>
                <strong>Vybrané:</strong> {selectedNumbers.join(', ')}
              </SelectedNumbers>
            )}
          </NumberSelectContainer>
        );

      default:
        return null;
    }
  };

  const renderQuestion = (question, index) => {
    if (!shouldShowQuestion(question, answers)) return null;
    if (question.type === 'accordion-likert') {
      return (
        <div key={question.id}>
          {renderQuestionInput(question)}
        </div>
      );
    }

    const hasError = questionErrors[question.id];

    return (
      <QuestionCard
        key={question.id}
        ref={el => (questionRefs.current[question.id] = el)}
        hasError={hasError}
        isActive={activeQuestionId === question.id}
      >
        {/* ✅ ZMENENÉ: Použitie ReactMarkdown pre text s markdown */}
        <Question>
          { `${index + 1}. `}
          {question.text.includes('**') || question.text.includes('\\n') ? (
            <ReactMarkdown>{question.text}</ReactMarkdown>
          ) : (
            question.text
          )}
        </Question>

        {renderQuestionInput(question)}

        {hasError && <QuestionError>{hasError}</QuestionError>}
      </QuestionCard>
    );
  };


  // ==========================================
  // RENDER HLAVNÉHO UI
  // ==========================================

  const page = PAGES[currentPage];
  const progress = ((currentPage + 1) / PAGES.length) * 100;
  const mainQuestions = page.questions;

 return (
  <Layout>
      <MobileWrapper>
      <Container>
        <Card>
          <ProgressText>
            Strana {currentPage + 1} z {PAGES.length}
          </ProgressText>
          <ProgressBar>
            <ProgressFill progress={progress} />
          </ProgressBar>

          
          {page.instruction && (
            <DetectiveTipSmall
              tip={page.instruction}  // ← SPRÁVNY PROP
              detectiveName="Inšpektor Kritan"
              style={{ textAlign: "justify" }}
            />
          )}

          {error && <ErrorText>{error}</ErrorText>}


            {mainQuestions.map((question, index) => renderQuestion(question, index))}


            <ButtonContainer>
              <StyledButton
                onClick={handleBack}
                disabled={currentPage === 0}
                variant="secondary"
              >
                ← Späť
              </StyledButton>
              <StyledButton
                onClick={handleNext}
                disabled={isSubmitting}
                accent
              >
                {isSubmitting ? 'Ukladám...' : (currentPage < PAGES.length - 1 ? 'Ďalej →' : 'Odoslať')}
              </StyledButton>
            </ButtonContainer>


          </Card>
        </Container>
      </MobileWrapper>
    </Layout>
  );
};

export default Questionnaire3B;
