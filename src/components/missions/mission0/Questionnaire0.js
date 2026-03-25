// src/components/missions/mission0/Questionnaire0.js
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
  text-align: ${p => p.justify ? 'justify' : 'left'};
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

// ==========================================
// STYLED COMPONENTS - FEEDBACK & UI
// ==========================================

const FeedbackSection = styled.div`
  margin-top: 32px;
  padding-top: 24px;
  border-top: 2px dashed ${p => p.theme.BORDER_COLOR};
`;

const FeedbackTitle = styled.h3`
  color: ${p => p.theme.ACCENT_COLOR};
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  
`;

const FeedbackSubtitle = styled.p`
  color: ${p => p.theme.PRIMARY_TEXT_COLOR};
  font-size: 15px;
  margin-bottom: 16px;
  opacity: 0.8;
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

const COMPONENT_ID = 'questionnaire0';

// ==========================================
// HELPER FUNKCIA - FEEDBACK OTÁZKY
// ==========================================

// ==========================================
// HELPER FUNKCIA - FEEDBACK OTÁZKY
// ==========================================

const createFeedbackQuestions = (blockId, questionCount) => {
  // ✅ OPRAVENÉ: Ak je questionCount 0, skús získať z accordion questions
  let actualCount = questionCount;
  
  // Pre stránky s accordion-likert, spočítaj sub-questions
  if (questionCount === 0) {
    const page = PAGES.find(p => p.id === blockId);
    if (page) {
      const accordionQuestion = page.questions.find(q => q.type === 'accordion-likert');
      if (accordionQuestion && accordionQuestion.questions) {
        actualCount = accordionQuestion.questions.length;
      }
    }
  }
  
  // Ak stále nemáme count, vráť prázdne pole
  if (actualCount === 0) {
    console.warn(`⚠️ No questions found for feedback in block: ${blockId}`);
    return [];
  }
  
  return [
    {
      id: `spatna_vazba_${blockId}_oblasti`,
      text: 'V ktorých oblastiach ste mali problémy? (Môžete vybrať viacero možností)',
      type: 'checkbox',
      isFeedback: true,
      required: false,
      options: [
        { value: 'zrozumitelnost', label: 'Zrozumiteľnosť otázok a tvrdení' },
        { value: 'jednoznacnost', label: 'Jednoznačnosť otázok a tvrdení' },
        { value: 'stupnica', label: 'Nevhodnosť hodnotiacej stupnice' },
        { value: 'ine', label: 'Iné problémy' }
      ]
    },
    {
      id: `spatna_vazba_${blockId}_zrozumitelnost`,
      text: 'Ktoré otázky a tvrdenia boli menej zrozumiteľné?',
      type: 'number-select',
      isFeedback: true,
      min: 1,
      max: actualCount, // ✅ POUŽIJE SPRÁVNY POČET
      multiple: true,
      instruction: 'Vyberte čísla otázok a tvrdení',
      required: false,
      showIf: {
        questionId: `spatna_vazba_${blockId}_oblasti`,
        operator: 'includes',
        value: 'zrozumitelnost'
      }
    },
    {
      id: `spatna_vazba_${blockId}_jednoznacnost`,
      text: 'Ktoré otázky a tvrdenia boli menej jednoznačné (slová, pojmy, formulácia...)?',
      type: 'number-select',
      isFeedback: true,
      min: 1,
      max: actualCount, // ✅ POUŽIJE SPRÁVNY POČET
      multiple: true,
      instruction: 'Vyberte čísla otázok a tvrdení',
      required: false,
      showIf: {
        questionId: `spatna_vazba_${blockId}_oblasti`,
        operator: 'includes',
        value: 'jednoznacnost'
      }
    },
    {
      id: `spatna_vazba_${blockId}_stupnica`,
      text: 'Pri ktorých otázkach a tvrdeniach ste mali problém vyjadriť svoj skutočný postoj vzhľadom na hodnotiacu stupnicu?',
      type: 'number-select',
      isFeedback: true,
      min: 1,
      max: actualCount, // ✅ POUŽIJE SPRÁVNY POČET
      multiple: true,
      instruction: 'Vyberte čísla otázok a tvrdení',
      required: false,
      showIf: {
        questionId: `spatna_vazba_${blockId}_oblasti`,
        operator: 'includes',
        value: 'stupnica'
      }
    },
    {
      id: `spatna_vazba_${blockId}_ine`,
      text: 'Popíšte iné problémy, ktoré ste mali s otázkami a tvrdeniami v tejto časti:',
      type: 'textarea',
      isFeedback: true,
      placeholder: 'Popíšte iné problémy...',
      required: false,
      showIf: {
        questionId: `spatna_vazba_${blockId}_oblasti`,
        operator: 'includes',
        value: 'ine'
      }
    }
  ];
};


// ==========================================
// DEFINÍCIA 9 STRÁNOK DOTAZNÍKA
// ==========================================

// ==========================================
// DEFINÍCIA PAGES - KOMPLETNÝ DOTAZNÍK
// ==========================================

const PAGES = [
  // ==========================================
  // STRANA 1: DEMOGRAFIA (bez zmeny)
  // ==========================================
  {
    id: 'demografia',
    instruction: 'Nasleduje séria otázok o vás. Tieto informácie nám pomôžu pochopiť, ako sa líšia názory a skúsenosti medzi rôznymi skupinami ľudí.',
    questions: [
      {
        id: 'd1_pohlavie',
        text: 'Som:',
        type: 'binary',
        required: true,
        options: [
          { value: 'muz', label: 'Muž' },
          { value: 'zena', label: 'Žena' },
          { value: 'ine', label: 'Iné' }
        ]
      },
      {
        id: 'd2_vek',
        text: 'Zadajte váš vek:',
        type: 'number',
        required: true,
        min: 18,
        max: 120,
        placeholder: 'Váš vek'
      },
      {
        id: 'd3_vzdelanie',
        text: 'Vyberte vaše najvyššie dosiahnuté vzdelanie:',
        type: 'radio',
        required: true,
        options: [
          { value: 'zakladne', label: 'Základné vzdelanie' },
          { value: 'nizsie_stredne', label: 'Stredné vzdelanie bez maturity' },
          { value: 'uplne_stredne', label: 'Stredné vzdelanie s maturitou' },
          { value: 'vys_1', label: 'Vysokoškolské vzdelanie 1. stupňa (bakalárske)' },
          { value: 'vys_2', label: 'Vysokoškolské vzdelanie 2. stupňa (magisterské, inžinierske, doktorské)' },
          { value: 'vys_3', label: 'Vysokoškolské vzdelanie 3. stupňa (doktorandské)' }
        ]
      },
      {
        id: 'd4_pracovna_situacia',
        text: 'Vyberte vašu aktuálnu situáciu:',
        type: 'radio',
        required: true,
        hasOther: true,
        otherLabel: 'Iné (prosím špecifikujte)',
        options: [
          { value: 'plny_uvazok', label: 'Zamestnaný/á na plný úväzok' },
          { value: 'skrateny_uvazok', label: 'Zamestnaný/á na skrátený úväzok' },
          { value: 'zivnost', label: 'Podnikanie ako SZČO (napr. živnosť)' },
          { value: 'student', label: 'Študent/ka' },
          { value: 'dochodok', label: 'Starobný dôchodok' },
          { value: 'materska', label: 'Na materskej alebo otcovskej dovolenke' },
          { value: 'nezamestany', label: 'Nezamestnaný/á' }
        ]
      },
      {
        id: 'd5_rodinny_stav',
        text: 'Vyberte váš aktuálny rodinný stav:',
        type: 'radio',
        required: true,
        hasOther: true,
        otherLabel: 'Iné (prosím špecifikujte)',
        options: [
          { value: 'slobodny', label: 'Slobodný/á bez partnera' },
          { value: 'manzelstvo', label: 'V manželstve alebo registrovanom partnerstve' },
          { value: 'partnerstvo', label: 'V partnerskom vzťahu (bez formálneho zväzku)' },
          { value: 'rozvedeny', label: 'Rozvedený/á' },
          { value: 'ovdoveny', label: 'Ovdovený/á' },
          { value: 'prefer_not', label: 'Preferujem neuvádzať' }
        ]
      },
      {
        id: 'd6_miesto_bydliska',
        text: 'Vyberte kraj v ktorom žijete:',
        type: 'radio',
        required: true,
        hasOther: true,
        otherLabel: 'Iné (prosím špecifikujte)',
        options: [
          { value: 'ba', label: 'Bratislavský kraj' },
          { value: 'tt', label: 'Trnavský kraj' },
          { value: 'tn', label: 'Trenčiansky kraj' },
          { value: 'nr', label: 'Nitriansky kraj' },
          { value: 'za', label: 'Žilinský kraj' },
          { value: 'bb', label: 'Banskobystrický kraj' },
          { value: 'po', label: 'Prešovský kraj' },
          { value: 'ke', label: 'Košický kraj' }
        ]
      },
      {
        id: 'd7_socialny_rebrik',
        text: 'Predstavte si, že tento rebrík predstavuje postavenie ľudí na Slovensku. Na úplnom vrchole rebríka sú ľudia, ktorí sú na tom najlepšie. Ľudia ktorí majú najviac peňazí, najlepšie vzdelanie, a najrešpektovanejšiu prácu. Na spodu rebríka sú ľudia, ktorí sú na tom najhoršie. Ľudia, ktorí majú najmenej peňazí, najhoršie vzdelanie, a najmenej rešpektovanú prácu, poprípade žiadnu prácu. Čím vyššie ste v tomto rebríku, tým bližšie ste ľuďom na úplnom vrchole a čím ste nižšie, tým ste bližšie ľuďom na samom spodku. Prosím, vyberte si číslo priečky rebríka, na ktorej si myslíte, že vo svojom živote aktuálne ste, v porovnaní s ostatnými ľuďmi na Slovensku.',
        type: 'ladder',
        required: true,
        scale: [10, 9, 8, 7, 6, 5, 4, 3, 2, 1],  // ← OTOČENÉ: 10 hore, 1 dole
        scaleLabels: {
          min: 'Najnižší status',  // → pri čísle 1 (dole)
          max: 'Najvyšší status'   // → pri čísle 10 (hore)
        }
      },
      {
        id: 'd8_politicka_orientacia',
        text: 'Na nasledujúcej škále označte, kam by ste sa zaradili z hľadiska politickej orientácie.',
        type: 'radio',
        required: true,
        options: [
          { value: '1', label: 'Silne konzervatívne orientovaný/á' },
          { value: '2', label: 'Skôr konzervatívne orientovaný/á' },
          { value: '3', label: 'Stred' },
          { value: '4', label: 'Skôr liberálne orientovaný/á' },
          { value: '5', label: 'Silne liberálne orientovaný/á' },
          { value: 'prefer_not', label: 'Nechcem uviesť' }
        ]
      }

    ]
  },

  // ==========================================
  // STRANA 2: RELIGIOZITA (ACCORDION)
  // ==========================================
  {
    id: 'religiozita',
    randomize: true,
    instruction: 'Nasledujúce otázky sa týkajú vášho vzťahu k náboženstvu. Neexistujú správne alebo nesprávne odpovede.',
    questions: [
      {
        id: 'religiozita_accordion',
        text: '',
        type: 'accordion-likert',
        required: true,
        questions: [
          {
            id: 'ora1',
            text: 'Ako často navštevujete kostol alebo iné náboženské stretnutia?',
            scale: [1, 2, 3, 4, 5, 6],
            scaleLabels: { min: 'Nikdy', max: 'Viackrát do týždňa' },
            scaleValueLabels: ['Nikdy', 'Raz za rok alebo menej', 'Niekoľkokrát za rok', 'Približne raz za mesiac', 'Približne raz za týždeň', 'Viackrát do týždňa']
          },
          {
            id: 'nora1',
            text: 'Ako často sa venujete súkromným náboženským aktivitám (modlitba, meditácia, čítanie svätých textov)?',
            scale: [1, 2, 3, 4, 5, 6],
            scaleLabels: { min: 'Málokedy alebo nikdy', max: 'Viackrát denne' },
            scaleValueLabels: ['Málokedy alebo nikdy', 'Niekoľkokrát za mesiac', 'Raz za týždeň', 'Dva alebo viackrát za týždeň', 'Denne', 'Viackrát denne']
          },
          {
            id: 'ir1',
            text: 'Vo svojom živote prežívam prítomnosť božského (t. j. Boha).',
            scale: [1, 2, 3, 4, 5],
            scaleLabels: { min: 'Rozhodne neplatí', max: 'Rozhodne platí' },
            scaleValueLabels: ['Rozhodne to o mne neplatí', 'Skôr to o mne neplatí', 'Nie som si istý/á', 'Skôr to o mne platí', 'Rozhodne to o mne platí']
          },
          {
            id: 'ir2',
            text: 'Moje náboženské presvedčenie sú základom môjho prístupu k životu.',
            scale: [1, 2, 3, 4, 5],
            scaleLabels: { min: 'Rozhodne neplatí', max: 'Rozhodne platí' },
            scaleValueLabels: ['Rozhodne to o mne neplatí', 'Skôr to o mne neplatí', 'Nie som si istý/á', 'Skôr to o mne platí', 'Rozhodne to o mne platí']
          },
          {
            id: 'ir3',
            text: 'Snažím sa prenášať svoje náboženstvo do všetkých oblastí môjho života.',
            scale: [1, 2, 3, 4, 5],
            scaleLabels: { min: 'Rozhodne neplatí', max: 'Rozhodne platí' },
            scaleValueLabels: ['Rozhodne to o mne neplatí', 'Skôr to o mne neplatí', 'Nie som si istý/á', 'Skôr to o mne platí', 'Rozhodne to o mne platí']
          }
        ]
      }
    ]
  },

  // ==========================================
  // STRANA 3: FREKVENCIA MÉDIÍ (ACCORDION)
  // ==========================================
  {
    id: 'media',
    instruction: 'Nasleduje zoznam rôznych médií a platforiem, z ktorých môžete získavať informácie (napríklad o spoločenskom dianí, politike, zdraví, ekonomike a pod.). Pri každom médiu a platforme označte, ako často ho používate ako zdroj informácií, pomocou škály od 1 do 7. Ak dané médium vôbec nepoznáte alebo ho nepoužívate, označte prosím „1. Nikdy". Neexistujú správne alebo nesprávne odpovede.',
    questions: [
      {
        id: 'media_accordion',
        text: '',
        type: 'accordion-likert',
        required: true,
        questions: [
          // Televízne spravodajstvo
          { id: 'ts1', text: 'Televízne noviny TV Markíza', scale: [1, 2, 3, 4, 5, 6, 7], scaleLabels: { min: 'Nikdy', max: 'Denne' }, scaleValueLabels: ['Nikdy', 'Menej ako raz mesačne', 'Približne raz mesačne', 'Niekoľkokrát mesačne', 'Približne raz týždenne', 'Niekoľkokrát týždenne', 'Denne'] },
          { id: 'ts2', text: 'Správy STVR', scale: [1, 2, 3, 4, 5, 6, 7], scaleLabels: { min: 'Nikdy', max: 'Denne' }, scaleValueLabels: ['Nikdy', 'Menej ako raz mesačne', 'Približne raz mesačne', 'Niekoľkokrát mesačne', 'Približne raz týždenne', 'Niekoľkokrát týždenne', 'Denne'] },
          { id: 'ts3', text: 'Noviny TV JOJ', scale: [1, 2, 3, 4, 5, 6, 7], scaleLabels: { min: 'Nikdy', max: 'Denne' }, scaleValueLabels: ['Nikdy', 'Menej ako raz mesačne', 'Približne raz mesačne', 'Niekoľkokrát mesačne', 'Približne raz týždenne', 'Niekoľkokrát týždenne', 'Denne'] },
          { id: 'ts4', text: 'Správy TA3', scale: [1, 2, 3, 4, 5, 6, 7], scaleLabels: { min: 'Nikdy', max: 'Denne' }, scaleValueLabels: ['Nikdy', 'Menej ako raz mesačne', 'Približne raz mesačne', 'Niekoľkokrát mesačne', 'Približne raz týždenne', 'Niekoľkokrát týždenne', 'Denne'] },
          {
            id: 'attention_check_1',
            text: 'Pozor kontrolná otázka. Prosím vyberte číslo 4.',
            type: 'radio',
            required: true,
            options: [
              { value: '1', label: '1' },
              { value: '2', label: '2' },
              { value: '3', label: '3' },
              { value: '4', label: '4' },
              { value: '5', label: '5' },
            ]
          },

          // Online a tlač
          { id: 'ot1', text: 'SME', scale: [1, 2, 3, 4, 5, 6, 7], scaleLabels: { min: 'Nikdy', max: 'Denne' }, scaleValueLabels: ['Nikdy', 'Menej ako raz mesačne', 'Približne raz mesačne', 'Niekoľkokrát mesačne', 'Približne raz týždenne', 'Niekoľkokrát týždenne', 'Denne'] },
          { id: 'ot2', text: 'Denník N', scale: [1, 2, 3, 4, 5, 6, 7], scaleLabels: { min: 'Nikdy', max: 'Denne' }, scaleValueLabels: ['Nikdy', 'Menej ako raz mesačne', 'Približne raz mesačne', 'Niekoľkokrát mesačne', 'Približne raz týždenne', 'Niekoľkokrát týždenne', 'Denne'] },
          { id: 'ot3', text: 'Pravda', scale: [1, 2, 3, 4, 5, 6, 7], scaleLabels: { min: 'Nikdy', max: 'Denne' }, scaleValueLabels: ['Nikdy', 'Menej ako raz mesačne', 'Približne raz mesačne', 'Niekoľkokrát mesačne', 'Približne raz týždenne', 'Niekoľkokrát týždenne', 'Denne'] },
          { id: 'ot4', text: 'Aktuality', scale: [1, 2, 3, 4, 5, 6, 7], scaleLabels: { min: 'Nikdy', max: 'Denne' }, scaleValueLabels: ['Nikdy', 'Menej ako raz mesačne', 'Približne raz mesačne', 'Niekoľkokrát mesačne', 'Približne raz týždenne', 'Niekoľkokrát týždenne', 'Denne'] },
          { id: 'ot5', text: 'Nový Čas', scale: [1, 2, 3, 4, 5, 6, 7], scaleLabels: { min: 'Nikdy', max: 'Denne' }, scaleValueLabels: ['Nikdy', 'Menej ako raz mesačne', 'Približne raz mesačne', 'Niekoľkokrát mesačne', 'Približne raz týždenne', 'Niekoľkokrát týždenne', 'Denne'] },
          { id: 'ot6', text: 'Hospodárske noviny', scale: [1, 2, 3, 4, 5, 6, 7], scaleLabels: { min: 'Nikdy', max: 'Denne' }, scaleValueLabels: ['Nikdy', 'Menej ako raz mesačne', 'Približne raz mesačne', 'Niekoľkokrát mesačne', 'Približne raz týždenne', 'Niekoľkokrát týždenne', 'Denne'] },
          { id: 'ot7', text: 'Postoj', scale: [1, 2, 3, 4, 5, 6, 7], scaleLabels: { min: 'Nikdy', max: 'Denne' }, scaleValueLabels: ['Nikdy', 'Menej ako raz mesačne', 'Približne raz mesačne', 'Niekoľkokrát mesačne', 'Približne raz týždenne', 'Niekoľkokrát týždenne', 'Denne'] },
          { id: 'ot8', text: 'Trend', scale: [1, 2, 3, 4, 5, 6, 7], scaleLabels: { min: 'Nikdy', max: 'Denne' }, scaleValueLabels: ['Nikdy', 'Menej ako raz mesačne', 'Približne raz mesačne', 'Niekoľkokrát mesačne', 'Približne raz týždenne', 'Niekoľkokrát týždenne', 'Denne'] },
          
          // Alternatívne médiá
          { id: 'am1', text: 'Hlavné správy', scale: [1, 2, 3, 4, 5, 6, 7], scaleLabels: { min: 'Nikdy', max: 'Denne' }, scaleValueLabels: ['Nikdy', 'Menej ako raz mesačne', 'Približne raz mesačne', 'Niekoľkokrát mesačne', 'Približne raz týždenne', 'Niekoľkokrát týždenne', 'Denne'] },
          { id: 'am2', text: 'Zem a vek', scale: [1, 2, 3, 4, 5, 6, 7], scaleLabels: { min: 'Nikdy', max: 'Denne' }, scaleValueLabels: ['Nikdy', 'Menej ako raz mesačne', 'Približne raz mesačne', 'Niekoľkokrát mesačne', 'Približne raz týždenne', 'Niekoľkokrát týždenne', 'Denne'] },
          { id: 'am3', text: 'Slobodný vysielač', scale: [1, 2, 3, 4, 5, 6, 7], scaleLabels: { min: 'Nikdy', max: 'Denne' }, scaleValueLabels: ['Nikdy', 'Menej ako raz mesačne', 'Približne raz mesačne', 'Niekoľkokrát mesačne', 'Približne raz týždenne', 'Niekoľkokrát týždenne', 'Denne'] },
          { id: 'am4', text: 'Protiprúd', scale: [1, 2, 3, 4, 5, 6, 7], scaleLabels: { min: 'Nikdy', max: 'Denne' }, scaleValueLabels: ['Nikdy', 'Menej ako raz mesačne', 'Približne raz mesačne', 'Niekoľkokrát mesačne', 'Približne raz týždenne', 'Niekoľkokrát týždenne', 'Denne'] },
          { id: 'am5', text: 'Extraplus', scale: [1, 2, 3, 4, 5, 6, 7], scaleLabels: { min: 'Nikdy', max: 'Denne' }, scaleValueLabels: ['Nikdy', 'Menej ako raz mesačne', 'Približne raz mesačne', 'Niekoľkokrát mesačne', 'Približne raz týždenne', 'Niekoľkokrát týždenne', 'Denne'] },
          { id: 'am6', text: 'Infovojna', scale: [1, 2, 3, 4, 5, 6, 7], scaleLabels: { min: 'Nikdy', max: 'Denne' }, scaleValueLabels: ['Nikdy', 'Menej ako raz mesačne', 'Približne raz mesačne', 'Niekoľkokrát mesačne', 'Približne raz týždenne', 'Niekoľkokrát týždenne', 'Denne'] },
          { id: 'am7', text: 'Parlamentné listy', scale: [1, 2, 3, 4, 5, 6, 7], scaleLabels: { min: 'Nikdy', max: 'Denne' }, scaleValueLabels: ['Nikdy', 'Menej ako raz mesačne', 'Približne raz mesačne', 'Niekoľkokrát mesačne', 'Približne raz týždenne', 'Niekoľkokrát týždenne', 'Denne'] },
          { id: 'am8', text: 'Vaša pravda', scale: [1, 2, 3, 4, 5, 6, 7], scaleLabels: { min: 'Nikdy', max: 'Denne' }, scaleValueLabels: ['Nikdy', 'Menej ako raz mesačne', 'Približne raz mesačne', 'Niekoľkokrát mesačne', 'Približne raz týždenne', 'Niekoľkokrát týždenne', 'Denne'] },
          { id: 'am9', text: 'E-report', scale: [1, 2, 3, 4, 5, 6, 7], scaleLabels: { min: 'Nikdy', max: 'Denne' }, scaleValueLabels: ['Nikdy', 'Menej ako raz mesačne', 'Približne raz mesačne', 'Niekoľkokrát mesačne', 'Približne raz týždenne', 'Niekoľkokrát týždenne', 'Denne'] },
          // Sociálne médiá
          { id: 'sm1', text: 'Facebook', scale: [1, 2, 3, 4, 5, 6, 7], scaleLabels: { min: 'Nikdy', max: 'Denne' }, scaleValueLabels: ['Nikdy', 'Menej ako raz mesačne', 'Približne raz mesačne', 'Niekoľkokrát mesačne', 'Približne raz týždenne', 'Niekoľkokrát týždenne', 'Denne'] },
          { id: 'sm2', text: 'YouTube', scale: [1, 2, 3, 4, 5, 6, 7], scaleLabels: { min: 'Nikdy', max: 'Denne' }, scaleValueLabels: ['Nikdy', 'Menej ako raz mesačne', 'Približne raz mesačne', 'Niekoľkokrát mesačne', 'Približne raz týždenne', 'Niekoľkokrát týždenne', 'Denne'] },
          { id: 'sm3', text: 'Instagram', scale: [1, 2, 3, 4, 5, 6, 7], scaleLabels: { min: 'Nikdy', max: 'Denne' }, scaleValueLabels: ['Nikdy', 'Menej ako raz mesačne', 'Približne raz mesačne', 'Niekoľkokrát mesačne', 'Približne raz týždenne', 'Niekoľkokrát týždenne', 'Denne'] },
          { id: 'sm4', text: 'TikTok', scale: [1, 2, 3, 4, 5, 6, 7], scaleLabels: { min: 'Nikdy', max: 'Denne' }, scaleValueLabels: ['Nikdy', 'Menej ako raz mesačne', 'Približne raz mesačne', 'Niekoľkokrát mesačne', 'Približne raz týždenne', 'Niekoľkokrát týždenne', 'Denne'] },
          { id: 'sm5', text: 'Telegram', scale: [1, 2, 3, 4, 5, 6, 7], scaleLabels: { min: 'Nikdy', max: 'Denne' }, scaleValueLabels: ['Nikdy', 'Menej ako raz mesačne', 'Približne raz mesačne', 'Niekoľkokrát mesačne', 'Približne raz týždenne', 'Niekoľkokrát týždenne', 'Denne'] },
          { id: 'sm6', text: 'X (Twitter)', scale: [1, 2, 3, 4, 5, 6, 7], scaleLabels: { min: 'Nikdy', max: 'Denne' }, scaleValueLabels: ['Nikdy', 'Menej ako raz mesačne', 'Približne raz mesačne', 'Niekoľkokrát mesačne', 'Približne raz týždenne', 'Niekoľkokrát týždenne', 'Denne'] },
          { id: 'sm7', text: 'Threads', scale: [1, 2, 3, 4, 5, 6, 7], scaleLabels: { min: 'Nikdy', max: 'Denne' }, scaleValueLabels: ['Nikdy', 'Menej ako raz mesačne', 'Približne raz mesačne', 'Niekoľkokrát mesačne', 'Približne raz týždenne', 'Niekoľkokrát týždenne', 'Denne'] }
        ]
      }
    ]
  },

  // ==========================================
  // STRANA 4-8: Pokračovanie v ďalšej správe...
  // ==========================================
  // ==========================================
  // STRANA 4: TOLERANCIA (ACCORDION)
  // ==========================================
  {
    id: 'tolerancia',
    randomize: true,
    instruction: 'Nižšie nájdete sériu tvrdení o rôznych aspektoch spôsobu, ako by ľudia mali žiť a ako sa máme vzájomne brať v ohľade na ich odlišnosti. Prosím, vyjadrite svoju úroveň súhlasu s každým tvrdením na škále od 1 do 7. Neexistujú správne alebo nesprávne odpovede.',
    questions: [
      {
        id: 'tolerancia_accordion',
        text: '',
        type: 'accordion-likert',
        required: true,
        questions: [
          // Autonómia
          { id: 'ac1', text: 'Ľudia by mali mať právo žiť, ako chcú.', scale: [1, 2, 3, 4, 5, 6, 7], scaleLabels: { min: 'Rozhodne nesúhlasím', max: 'Rozhodne súhlasím' }, scaleValueLabels: ['Rozhodne nesúhlasím', 'Takmer úplne nesúhlasím', 'Skôr nesúhlasím', 'Neutrálny postoj', 'Skôr súhlasím', 'Takmer úplne súhlasím', 'Rozhodne súhlasím'] },
          { id: 'ac2', text: 'Je dôležité, aby ľudia mali slobodu žiť svoj život tak, ako si vyberú.', scale: [1, 2, 3, 4, 5, 6, 7], scaleLabels: { min: 'Rozhodne nesúhlasím', max: 'Rozhodne súhlasím' }, scaleValueLabels: ['Rozhodne nesúhlasím', 'Takmer úplne nesúhlasím', 'Skôr nesúhlasím', 'Neutrálny postoj', 'Skôr súhlasím', 'Takmer úplne súhlasím', 'Rozhodne súhlasím'] },
          { id: 'ac3', text: 'Ľudia môžu žiť ako chcú, pokiaľ neubližujú iným.', scale: [1, 2, 3, 4, 5, 6, 7], scaleLabels: { min: 'Rozhodne nesúhlasím', max: 'Rozhodne súhlasím' }, scaleValueLabels: ['Rozhodne nesúhlasím', 'Takmer úplne nesúhlasím', 'Skôr nesúhlasím', 'Neutrálny postoj', 'Skôr súhlasím', 'Takmer úplne súhlasím', 'Rozhodne súhlasím'] },
          
          // Rešpekt
          { id: 'r1', text: 'Rešpektujem presvedčenia a názory iných ľudí.', scale: [1, 2, 3, 4, 5, 6, 7], scaleLabels: { min: 'Rozhodne nesúhlasím', max: 'Rozhodne súhlasím' }, scaleValueLabels: ['Rozhodne nesúhlasím', 'Takmer úplne nesúhlasím', 'Skôr nesúhlasím', 'Neutrálny postoj', 'Skôr súhlasím', 'Takmer úplne súhlasím', 'Rozhodne súhlasím'] },
          { id: 'r2', text: 'Mám rešpekt voči presvedčeniam a názorom iných ľudí, aj keď s nimi nesúhlasím.', scale: [1, 2, 3, 4, 5, 6, 7], scaleLabels: { min: 'Rozhodne nesúhlasím', max: 'Rozhodne súhlasím' }, scaleValueLabels: ['Rozhodne nesúhlasím', 'Takmer úplne nesúhlasím', 'Skôr nesúhlasím', 'Neutrálny postoj', 'Skôr súhlasím', 'Takmer úplne súhlasím', 'Rozhodne súhlasím'] },
          { id: 'r3', text: 'Vadí mi, že niektorí ľudia majú iné tradície a spôsob života.', scale: [1, 2, 3, 4, 5, 6, 7], scaleLabels: { min: 'Rozhodne nesúhlasím', max: 'Rozhodne súhlasím' }, scaleValueLabels: ['Rozhodne nesúhlasím', 'Takmer úplne nesúhlasím', 'Skôr nesúhlasím', 'Neutrálny postoj', 'Skôr súhlasím', 'Takmer úplne súhlasím', 'Rozhodne súhlasím'] },
          
          // Aprecácia
          { id: 'ap1', text: 'Rád/a trávim čas s ľuďmi, ktorí sú iní ako ja.', scale: [1, 2, 3, 4, 5, 6, 7], scaleLabels: { min: 'Rozhodne nesúhlasím', max: 'Rozhodne súhlasím' }, scaleValueLabels: ['Rozhodne nesúhlasím', 'Takmer úplne nesúhlasím', 'Skôr nesúhlasím', 'Neutrálny postoj', 'Skôr súhlasím', 'Takmer úplne súhlasím', 'Rozhodne súhlasím'] },
          { id: 'ap2', text: 'Mám rád/a ľudí, ktorí ma podnecujú, aby som rozmýšľal/a o svete iným spôsobom.', scale: [1, 2, 3, 4, 5, 6, 7], scaleLabels: { min: 'Rozhodne nesúhlasím', max: 'Rozhodne súhlasím' }, scaleValueLabels: ['Rozhodne nesúhlasím', 'Takmer úplne nesúhlasím', 'Skôr nesúhlasím', 'Neutrálny postoj', 'Skôr súhlasím', 'Takmer úplne súhlasím', 'Rozhodne súhlasím'] },
          { id: 'ap3', text: 'Rozmanitosť tradícií a spôsobov života je prínosom pre našu spoločnosť.', scale: [1, 2, 3, 4, 5, 6, 7], scaleLabels: { min: 'Rozhodne nesúhlasím', max: 'Rozhodne súhlasím' }, scaleValueLabels: ['Rozhodne nesúhlasím', 'Takmer úplne nesúhlasím', 'Skôr nesúhlasím', 'Neutrálny postoj', 'Skôr súhlasím', 'Takmer úplne súhlasím', 'Rozhodne súhlasím'] }
        ]
      }
    ]
  },

  // ==========================================
  // STRANA 5: KONŠPIRAČNÁ MENTALITA (ACCORDION)
  // ==========================================
  {
    id: 'konspiracia_mentalita',
    randomize: true,
    instruction: 'Nižšie nájdete sériu tvrdení. Pri každom tvrdení prosím vyjadrite, do akej miery s ním súhlasíte, na škále od 1 do 7. Neexistujú správne alebo nesprávne odpovede.',
    questions: [
      {
        id: 'konspiracia_mentalita_accordion',
        text: '',
        type: 'accordion-likert',
        required: true,
        questions: [
          { id: 'km1', text: 'Myslím si, že sa vo svete dejú mnohé veľmi dôležité veci, o ktorých sa verejnosť nikdy nedozvie.', scale: [1, 2, 3, 4, 5, 6, 7], scaleLabels: { min: 'Rozhodne nesúhlasím', max: 'Rozhodne súhlasím' }, scaleValueLabels: ['Rozhodne nesúhlasím', 'Takmer úplne nesúhlasím', 'Skôr nesúhlasím', 'Neutrálny postoj', 'Skôr súhlasím', 'Takmer úplne súhlasím', 'Rozhodne súhlasím'] },
          { id: 'km2', text: 'Myslím si, že politici zvyčajne nehovoria ľuďom skutočné motívy svojich rozhodnutí.', scale: [1, 2, 3, 4, 5, 6, 7], scaleLabels: { min: 'Rozhodne nesúhlasím', max: 'Rozhodne súhlasím' }, scaleValueLabels: ['Rozhodne nesúhlasím', 'Takmer úplne nesúhlasím', 'Skôr nesúhlasím', 'Neutrálny postoj', 'Skôr súhlasím', 'Takmer úplne súhlasím', 'Rozhodne súhlasím'] },
          { id: 'km3', text: 'Myslím si, že vládne agentúry úzko monitorujú všetkých občanov.', scale: [1, 2, 3, 4, 5, 6, 7], scaleLabels: { min: 'Rozhodne nesúhlasím', max: 'Rozhodne súhlasím' }, scaleValueLabels: ['Rozhodne nesúhlasím', 'Takmer úplne nesúhlasím', 'Skôr nesúhlasím', 'Neutrálny postoj', 'Skôr súhlasím', 'Takmer úplne súhlasím', 'Rozhodne súhlasím'] },
          { id: 'km4', text: 'Myslím si, že udalosti, ktoré sa na prvý pohľad zdajú nesúvisiace, sú často výsledkom tajných aktivít.', scale: [1, 2, 3, 4, 5, 6, 7], scaleLabels: { min: 'Rozhodne nesúhlasím', max: 'Rozhodne súhlasím' }, scaleValueLabels: ['Rozhodne nesúhlasím', 'Takmer úplne nesúhlasím', 'Skôr nesúhlasím', 'Neutrálny postoj', 'Skôr súhlasím', 'Takmer úplne súhlasím', 'Rozhodne súhlasím'] },
          { id: 'km5', text: 'Myslím si, že existujú tajné organizácie, ktoré veľmi vplývajú na politické rozhodnutia.', scale: [1, 2, 3, 4, 5, 6, 7], scaleLabels: { min: 'Rozhodne nesúhlasím', max: 'Rozhodne súhlasím' }, scaleValueLabels: ['Rozhodne nesúhlasím', 'Takmer úplne nesúhlasím', 'Skôr nesúhlasím', 'Neutrálny postoj', 'Skôr súhlasím', 'Takmer úplne súhlasím', 'Rozhodne súhlasím'] }
        ]
      }
    ]
  },

  // ==========================================
  // STRANA 6: SYMBOLICKÉ OHROZENIE (ACCORDION)
  // ==========================================
  {
    id: 'symbolicke_ohrozenie',
    randomize: true,
    instruction: 'Niektorí ľudia tvrdia, že existujú isté skupiny ľudí či krajiny, ktoré ohrozujú ich vlastnú identitu a hodnoty. Do akej miery máte vy osobne pocit, že nasledujúce skupiny alebo krajiny ohrozujú Vašu identitu a hodnoty? Pri každej položke označte svoju odpoveď na škále od 1 do 5. Neexistujú správne alebo nesprávne odpovede.',
    questions: [
        {
          id: 'symbolicke_ohrozenie_accordion',
          text: '',
          type: 'accordion-likert',
          required: true,
          questions: [
          {
            id: 'sh1',
            text: 'Západné spoločnosti a ich spôsob života',
            scale: [1, 2, 3, 4, 5],
            scaleLabels: { min: 'Vôbec neohrozuje', max: 'Veľmi ohrozuje' },
            scaleValueLabels: [
              'Vôbec neohrozuje moju identitu a hodnoty',
              'Skôr neohrozuje moju identitu a hodnoty',
              'Ani neohrozuje, ani neohrozuje (neutrálny postoj)',
              'Skôr ohrozuje moju identitu a hodnoty',
              'Veľmi ohrozuje moju identitu a hodnoty'
            ]
          },
          {
            id: 'sh2',
            text: 'Európska únia',
            scale: [1, 2, 3, 4, 5],
            scaleLabels: { min: 'Vôbec neohrozuje', max: 'Veľmi ohrozuje' },
            scaleValueLabels: [
              'Vôbec neohrozuje moju identitu a hodnoty',
              'Skôr neohrozuje moju identitu a hodnoty',
              'Ani neohrozuje, ani neohrozuje (neutrálny postoj)',
              'Skôr ohrozuje moju identitu a hodnoty',
              'Veľmi ohrozuje moju identitu a hodnoty'
            ]
          },
          {
            id: 'sh3',
            text: 'Spojené štáty americké',
            scale: [1, 2, 3, 4, 5],
            scaleLabels: { min: 'Vôbec neohrozuje', max: 'Veľmi ohrozuje' },
            scaleValueLabels: [
              'Vôbec neohrozuje moju identitu a hodnoty',
              'Skôr neohrozuje moju identitu a hodnoty',
              'Ani neohrozuje, ani neohrozuje (neutrálny postoj)',
              'Skôr ohrozuje moju identitu a hodnoty',
              'Veľmi ohrozuje moju identitu a hodnoty'
            ]
          },
          {
            id: 'attention_check_2',
            text: 'Pozor kontrolná otázka. Prosím vyberte číslo 2.',
            type: 'radio',
            required: true,
            options: [
              { value: '1', label: '1' },
              { value: '2', label: '2' },
              { value: '3', label: '3' },
              { value: '4', label: '4' },
              { value: '5', label: '5' },
            ]
          },
          {
            id: 'sh4',
            text: 'Ruská federácia',
            scale: [1, 2, 3, 4, 5],
            scaleLabels: { min: 'Vôbec neohrozuje', max: 'Veľmi ohrozuje' },
            scaleValueLabels: [
              'Vôbec neohrozuje moju identitu a hodnoty',
              'Skôr neohrozuje moju identitu a hodnoty',
              'Ani neohrozuje, ani neohrozuje (neutrálny postoj)',
              'Skôr ohrozuje moju identitu a hodnoty',
              'Veľmi ohrozuje moju identitu a hodnoty'
            ]
          }
        ]
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
            scaleValueLabels: [
              'Absolútne nedôverujem',  // 1
              'Takmer vôbec nedôverujem', // 2
              'Prevažne nedôverujem',   // 3
              'Skôr nedôverujem',       // 4
              'Mierne nedôverujem',     // 5
              'Mierne dôverujem',       // 6
              'Skôr dôverujem',         // 7
              'Prevažne dôverujem',     // 8
              'Takmer úplne dôverujem', // 9
              'Absolútne dôverujem'     // 10
            ]
          },
          {
            id: 'id2',
            text: 'Európska rada',
            scale: [1,2,3,4,5,6,7,8,9,10],
            scaleLabels: { min: 'Absolútne nedôverujem', max: 'Absolútne dôverujem' },
            scaleValueLabels: [
              'Absolútne nedôverujem',  // 1
              'Takmer vôbec nedôverujem', // 2
              'Prevažne nedôverujem',   // 3
              'Skôr nedôverujem',       // 4
              'Mierne nedôverujem',     // 5
              'Mierne dôverujem',       // 6
              'Skôr dôverujem',         // 7
              'Prevažne dôverujem',     // 8
              'Takmer úplne dôverujem', // 9
              'Absolútne dôverujem'     // 10
            ]
          },
          {
            id: 'id3',
            text: 'Rada Európskej únie',
            scale: [1,2,3,4,5,6,7,8,9,10],
            scaleLabels: { min: 'Absolútne nedôverujem', max: 'Absolútne dôverujem' },
            scaleValueLabels: [
              'Absolútne nedôverujem',  // 1
              'Takmer vôbec nedôverujem', // 2
              'Prevažne nedôverujem',   // 3
              'Skôr nedôverujem',       // 4
              'Mierne nedôverujem',     // 5
              'Mierne dôverujem',       // 6
              'Skôr dôverujem',         // 7
              'Prevažne dôverujem',     // 8
              'Takmer úplne dôverujem', // 9
              'Absolútne dôverujem'     // 10
            ]
          },
          {
            id: 'id4',
            text: 'Európska komisia',
            scale: [1,2,3,4,5,6,7,8,9,10],
            scaleLabels: { min: 'Absolútne nedôverujem', max: 'Absolútne dôverujem' },
            scaleValueLabels: [
              'Absolútne nedôverujem',  // 1
              'Takmer vôbec nedôverujem', // 2
              'Prevažne nedôverujem',   // 3
              'Skôr nedôverujem',       // 4
              'Mierne nedôverujem',     // 5
              'Mierne dôverujem',       // 6
              'Skôr dôverujem',         // 7
              'Prevažne dôverujem',     // 8
              'Takmer úplne dôverujem', // 9
              'Absolútne dôverujem'     // 10
            ]
          },
          {
            id: 'id5',
            text: 'Súdny dvor Európskej únie',
            scale: [1,2,3,4,5,6,7,8,9,10],
            scaleLabels: { min: 'Absolútne nedôverujem', max: 'Absolútne dôverujem' },
            scaleValueLabels: [
              'Absolútne nedôverujem',  // 1
              'Takmer vôbec nedôverujem', // 2
              'Prevažne nedôverujem',   // 3
              'Skôr nedôverujem',       // 4
              'Mierne nedôverujem',     // 5
              'Mierne dôverujem',       // 6
              'Skôr dôverujem',         // 7
              'Prevažne dôverujem',     // 8
              'Takmer úplne dôverujem', // 9
              'Absolútne dôverujem'     // 10
            ]
          },
          {
            id: 'id6',
            text: 'Európska centrálna banka',
            scale: [1,2,3,4,5,6,7,8,9,10],
            scaleLabels: { min: 'Absolútne nedôverujem', max: 'Absolútne dôverujem' },
            scaleValueLabels: [
              'Absolútne nedôverujem',  // 1
              'Takmer vôbec nedôverujem', // 2
              'Prevažne nedôverujem',   // 3
              'Skôr nedôverujem',       // 4
              'Mierne nedôverujem',     // 5
              'Mierne dôverujem',       // 6
              'Skôr dôverujem',         // 7
              'Prevažne dôverujem',     // 8
              'Takmer úplne dôverujem', // 9
              'Absolútne dôverujem'     // 10
            ]
          },
          {
            id: 'id7',
            text: 'Európsky dvor audítorov',
            scale: [1,2,3,4,5,6,7,8,9,10],
            scaleLabels: { min: 'Absolútne nedôverujem', max: 'Absolútne dôverujem' },
            scaleValueLabels: [
              'Absolútne nedôverujem',  // 1
              'Takmer vôbec nedôverujem', // 2
              'Prevažne nedôverujem',   // 3
              'Skôr nedôverujem',       // 4
              'Mierne nedôverujem',     // 5
              'Mierne dôverujem',       // 6
              'Skôr dôverujem',         // 7
              'Prevažne dôverujem',     // 8
              'Takmer úplne dôverujem', // 9
              'Absolútne dôverujem'     // 10
            ]
          }
        ]
      }
    ]
  },


  // ==========================================
  // STRANA 8: KONŠPIRAČNÉ PRESVEDČENIA (ACCORDION)
  // ==========================================
  {
    id: 'konspiracia_presvedcenia',
    randomize: true,
    instruction: 'Nižšie nájdete sériu tvrdení. Pri každom tvrdení prosím vyjadrite, do akej miery s ním súhlasíte, na škále od 1 do 7. Neexistujú správne alebo nesprávne odpovede.',
    questions: [
      {
        id: 'konspiracia_presvedcenia_accordion',
        text: '',
        type: 'accordion-likert',
        required: true,
        questions: [
          // EÚ konšpiračné presvedčenia
          { id: 'ep1', text: 'Európska únia má skrytý plán systematicky zničiť suverenitu členských štátov.', scale: [1, 2, 3, 4, 5, 6, 7], scaleLabels: { min: 'Rozhodne nesúhlasím', max: 'Rozhodne súhlasím' }, scaleValueLabels: ['Rozhodne nesúhlasím', 'Takmer úplne nesúhlasím', 'Skôr nesúhlasím', 'Neutrálny postoj', 'Skôr súhlasím', 'Takmer úplne súhlasím', 'Rozhodne súhlasím'] },
          { id: 'ep2', text: 'Rozhodnutia EÚ sú transparentné a robené Európskym parlamentom a zvolenými poslancami.', scale: [1, 2, 3, 4, 5, 6, 7], scaleLabels: { min: 'Rozhodne nesúhlasím', max: 'Rozhodne súhlasím' }, scaleValueLabels: ['Rozhodne nesúhlasím', 'Takmer úplne nesúhlasím', 'Skôr nesúhlasím', 'Neutrálny postoj', 'Skôr súhlasím', 'Takmer úplne súhlasím', 'Rozhodne súhlasím'] },
          { id: 'ep3', text: 'Európske inštitúcie a mainstreamové médiá spolupracujú na tom, aby pred občanmi zatajili skutočné negatívne dôsledky rozhodnutí EÚ.', scale: [1, 2, 3, 4, 5, 6, 7], scaleLabels: { min: 'Rozhodne nesúhlasím', max: 'Rozhodne súhlasím' }, scaleValueLabels: ['Rozhodne nesúhlasím', 'Takmer úplne nesúhlasím', 'Skôr nesúhlasím', 'Neutrálny postoj', 'Skôr súhlasím', 'Takmer úplne súhlasím', 'Rozhodne súhlasím'] },
          { id: 'ep4', text: 'EÚ rešpektuje a chráni národné kultúry a tradície všetkých členských štátov.', scale: [1, 2, 3, 4, 5, 6, 7], scaleLabels: { min: 'Rozhodne nesúhlasím', max: 'Rozhodne súhlasím' }, scaleValueLabels: ['Rozhodne nesúhlasím', 'Takmer úplne nesúhlasím', 'Skôr nesúhlasím', 'Neutrálny postoj', 'Skôr súhlasím', 'Takmer úplne súhlasím', 'Rozhodne súhlasím'] },
          { id: 'ep5', text: 'EÚ zámerne obchádza demokratické procesy a ignoruje vôľu občanov, pretože sú riadené skrytou agendou globálnych elít.', scale: [1, 2, 3, 4, 5, 6, 7], scaleLabels: { min: 'Rozhodne nesúhlasím', max: 'Rozhodne súhlasím' }, scaleValueLabels: ['Rozhodne nesúhlasím', 'Takmer úplne nesúhlasím', 'Skôr nesúhlasím', 'Neutrálny postoj', 'Skôr súhlasím', 'Takmer úplne súhlasím', 'Rozhodne súhlasím'] },
          { id: 'ep6', text: 'Regulácie EÚ sú navrhnuté aby chránili hospodárstvo všetkých členských štátov vrátane Slovenska, nie aby mu ublížili.', scale: [1, 2, 3, 4, 5, 6, 7], scaleLabels: { min: 'Rozhodne nesúhlasím', max: 'Rozhodne súhlasím' }, scaleValueLabels: ['Rozhodne nesúhlasím', 'Takmer úplne nesúhlasím', 'Skôr nesúhlasím', 'Neutrálny postoj', 'Skôr súhlasím', 'Takmer úplne súhlasím', 'Rozhodne súhlasím'] },
          { id: 'ep7', text: 'Migračná kríza bola naplánovaná autoritami EÚ.', scale: [1, 2, 3, 4, 5, 6, 7], scaleLabels: { min: 'Rozhodne nesúhlasím', max: 'Rozhodne súhlasím' }, scaleValueLabels: ['Rozhodne nesúhlasím', 'Takmer úplne nesúhlasím', 'Skôr nesúhlasím', 'Neutrálny postoj', 'Skôr súhlasím', 'Takmer úplne súhlasím', 'Rozhodne súhlasím'] },
          {
            id: 'attention_check_3',
            text: 'Pozor kontrolná otázka. Prosím vyberte číslo 1.',
            type: 'radio',
            required: true,
            options: [
              { value: '1', label: '1' },
              { value: '2', label: '2' },
              { value: '3', label: '3' },
              { value: '4', label: '4' },
              { value: '5', label: '5' },
            ]
          },
          // EÚ konšpiračné presvedčenia variované
          { id: 'epv1', text: 'Štáty si zachovávajú svoju suverenitu v rámci EÚ.', scale: [1, 2, 3, 4, 5, 6, 7], scaleLabels: { min: 'Rozhodne nesúhlasím', max: 'Rozhodne súhlasím' }, scaleValueLabels: ['Rozhodne nesúhlasím', 'Takmer úplne nesúhlasím', 'Skôr nesúhlasím', 'Neutrálny postoj', 'Skôr súhlasím', 'Takmer úplne súhlasím', 'Rozhodne súhlasím'] },
          { id: 'epv2', text: 'Rozhodnutia EÚ v skutočnosti nerobí Európsky parlament, ale tajná skupina globálnych elít a veľkých korporácií.', scale: [1, 2, 3, 4, 5, 6, 7], scaleLabels: { min: 'Rozhodne nesúhlasím', max: 'Rozhodne súhlasím' }, scaleValueLabels: ['Rozhodne nesúhlasím', 'Takmer úplne nesúhlasím', 'Skôr nesúhlasím', 'Neutrálny postoj', 'Skôr súhlasím', 'Takmer úplne súhlasím', 'Rozhodne súhlasím'] },
          { id: 'epv3', text: 'Európske inštitúcie a mainstreamové médiá transparentne informujú občanov o rozhodnutiach EÚ.', scale: [1, 2, 3, 4, 5, 6, 7], scaleLabels: { min: 'Rozhodne nesúhlasím', max: 'Rozhodne súhlasím' }, scaleValueLabels: ['Rozhodne nesúhlasím', 'Takmer úplne nesúhlasím', 'Skôr nesúhlasím', 'Neutrálny postoj', 'Skôr súhlasím', 'Takmer úplne súhlasím', 'Rozhodne súhlasím'] },
          { id: 'epv4', text: 'EÚ má skrytý plán na zničenie národných kultúr a tradícií v prospech multikulturalizmu a liberálnych hodnôt.', scale: [1, 2, 3, 4, 5, 6, 7], scaleLabels: { min: 'Rozhodne nesúhlasím', max: 'Rozhodne súhlasím' }, scaleValueLabels: ['Rozhodne nesúhlasím', 'Takmer úplne nesúhlasím', 'Skôr nesúhlasím', 'Neutrálny postoj', 'Skôr súhlasím', 'Takmer úplne súhlasím', 'Rozhodne súhlasím'] },
          { id: 'epv5', text: 'Všetky rozhodnutia EÚ sú prijaté v plne transparentných procesoch, kde všetci poslanci verejne hlasujú, a žiadna krajina nie je nútená ich nasledovať.', scale: [1, 2, 3, 4, 5, 6, 7], scaleLabels: { min: 'Rozhodne nesúhlasím', max: 'Rozhodne súhlasím' }, scaleValueLabels: ['Rozhodne nesúhlasím', 'Takmer úplne nesúhlasím', 'Skôr nesúhlasím', 'Neutrálny postoj', 'Skôr súhlasím', 'Takmer úplne súhlasím', 'Rozhodne súhlasím'] },
          { id: 'epv6', text: 'EÚ vedome zavádza škodlivé regulácie s cieľom ekonomicky zničiť Slovensko a prinútiť nás byť úplne závislí na Bruseli.', scale: [1, 2, 3, 4, 5, 6, 7], scaleLabels: { min: 'Rozhodne nesúhlasím', max: 'Rozhodne súhlasím' }, scaleValueLabels: ['Rozhodne nesúhlasím', 'Takmer úplne nesúhlasím', 'Skôr nesúhlasím', 'Neutrálny postoj', 'Skôr súhlasím', 'Takmer úplne súhlasím', 'Rozhodne súhlasím'] },
          { id: 'epv7', text: 'Migračná kríza bola prirodzená udalosť, nie naplánovaná autoritami EÚ.', scale: [1, 2, 3, 4, 5, 6, 7], scaleLabels: { min: 'Rozhodne nesúhlasím', max: 'Rozhodne súhlasím' }, scaleValueLabels: ['Rozhodne nesúhlasím', 'Takmer úplne nesúhlasím', 'Skôr nesúhlasím', 'Neutrálny postoj', 'Skôr súhlasím', 'Takmer úplne súhlasím', 'Rozhodne súhlasím'] },
        ]
      }
    ]
  },

  // ==========================================
  // STRANA 9: SOCIÁLNA ŽIADOSTIVOSŤ (bez zmeny - binary)
  // ==========================================
  {
    id: 'socialna_ziadostivost',
    randomize: true,
    instruction: 'Nižšie nájdete sériu tvrdení. Prečítajte si každé tvrdenie pozorne a rozhodnite sa, či je pre vás pravdivé alebo nepravdivé. Nie sú tu správne alebo nesprávne odpovede – ide o to, ako vnímate sami seba. Označte vašu odpoveď kliknutím na tlačidlo pravda alebo nepravda vedľa každého tvrdenia.',
    questions: [
      { id: 'sds1', text: 'Niekedy je pre mňa ťažké pokračovať v práci, ak ma nikto nepodporí.', type: 'binary', required: true, options: [{ value: 'pravda', label: 'Pravdivé' }, { value: 'nepravda', label: 'Nepravda' }] },
      { id: 'sds2', text: 'Niekedy sa cítim rozčúlený/rozčúlená, keď si nemôžem dosiahnuť to, čo chcem.', type: 'binary', required: true, options: [{ value: 'pravda', label: 'Pravda' }, { value: 'nepravda', label: 'Nepravda' }] },
      { id: 'sds3', text: 'Niekoľkokrát som sa vzdal/vzdala robenia niečoho, pretože som nemal/mala dôveru v svoje schopnosti.', type: 'binary', required: true, options: [{ value: 'pravda', label: 'Pravda' }, { value: 'nepravda', label: 'Nepravda' }] },
      { id: 'sds4', text: 'Boli časy, keď som sa chcel/chcela búriť voči ľuďom vo funkcii, aj keď som vedel/vedela, že majú pravdu.', type: 'binary', required: true, options: [{ value: 'pravda', label: 'Pravda' }, { value: 'nepravda', label: 'Nepravda' }] },
      { id: 'sds5', text: 'Bez ohľadu na to, s kým som v rozhovore, som vždy dobrý/dobrá poslucháč/poslucháčka.', type: 'binary', required: true, options: [{ value: 'pravda', label: 'Pravda' }, { value: 'nepravda', label: 'Nepravda' }] },
      { id: 'sds6', text: 'Boli okamžiky, keď som zneužil/zneužila niekoho.', type: 'binary', required: true, options: [{ value: 'pravda', label: 'Pravda' }, { value: 'nepravda', label: 'Nepravda' }] },
      { id: 'sds7', text: 'Vždy som ochotný/ochotná priznať, keď spravím chybu.', type: 'binary', required: true, options: [{ value: 'pravda', label: 'Pravda' }, { value: 'nepravda', label: 'Nepravda' }] },
      { id: 'sds8', text: 'Niekedy sa pokúšam pomstiť sa namiesto toho, aby som odpustil/odpustila a zabudol/zabudla.', type: 'binary', required: true, options: [{ value: 'pravda', label: 'Pravda' }, { value: 'nepravda', label: 'Nepravda' }] },
      { id: 'sds9', text: 'Som vždy zdvorilý/zdvorilá, dokonca aj voči ľuďom, ktorí sú nepriaznivo naladení.', type: 'binary', required: true, options: [{ value: 'pravda', label: 'Pravda' }, { value: 'nepravda', label: 'Nepravda' }] },
      { id: 'sds10', text: 'Nikdy som sa nehneval/nenahnevala, keď ľudia vyjadrili nápady veľmi odlišné od tých mojich.', type: 'binary', required: true, options: [{ value: 'pravda', label: 'Pravda' }, { value: 'nepravda', label: 'Nepravda' }] },
      { id: 'sds11', text: 'Boli časy, keď som bol/bola dosť žiarlivý/žiarlivá na dobrú náladu druhých.', type: 'binary', required: true, options: [{ value: 'pravda', label: 'Pravda' }, { value: 'nepravda', label: 'Nepravda' }] },
      { id: 'sds12', text: 'Niekedy som rozčúlený/rozčúlená, keď ľudia odo mňa niečo chcú.', type: 'binary', required: true, options: [{ value: 'pravda', label: 'Pravda' }, { value: 'nepravda', label: 'Nepravda' }] },
      { id: 'sds13', text: 'Nikdy som úmyselne nepovedal/nepovedala niečo, čo by niekoho zranilo.', type: 'binary', required: true, options: [{ value: 'pravda', label: 'Pravda' }, { value: 'nepravda', label: 'Nepravda' }] }
    ]
  },

  {
    id: 'porovnanie_vyznamov',
    instruction: 'Nižšie uvidíte páry tvrdení, ktoré ste už hodnotili. Vašou úlohou je teraz posúdiť, či tvrdenie A a tvrdenie B vyjadrujú rovnaký (tvrdenia hovoria to isté, len sú inak formulované) alebo opačný postoj (tvrdenia si navzájom odporujú, jedno popiera druhé). Pozorne si prečítajte tvrdenia a označte prosím vašu odpoveď bez ohľadu na to, či s tvrdeniami súhlasíte alebo nesúhlasíte.',
    questions: [
      {
        id: 'porovnanie_accordion',
        text: '',
        type: 'accordion-likert',
        required: true,
        questions: [
          {
            id: 'comp_1',
            text: 'Porovnanie tvrdení',
            content: '**Tvrdenie A:**\\n"Európska únia má skrytý plán systematicky zničiť suverenitu členských štátov."\\n\\n**Tvrdenie B:**\\n"Štáty si zachovávajú svoju suverenitu v rámci EÚ."\\n\\n**Tieto dve tvrdenia vyjadrujú...**',
            scale: [1, 2, 3, 4],
            scaleLabels: { min: 'Úplne opačný postoj', max: 'Úplne rovnaký postoj' },
            scaleValueLabels: ['Úplne opačný postoj', 'Skôr opačný postoj', 'Skôr rovnaký postoj', 'Úplne rovnaký postoj']
          },
          {
            id: 'comp_2',
            text: 'Porovnanie tvrdení',
            content: '**Tvrdenie A:**\\n"Rozhodnutia EÚ sú transparentné a robené Európskym parlamentom a zvolenými poslancami."\\n\\n**Tvrdenie B:**\\n"Rozhodnutia EÚ v skutočnosti nerobí Európsky parlament, ale tajná skupina globálnych elít a veľkých korporácií."\\n\\n**Tieto dve tvrdenia vyjadrujú...**',
            scale: [1, 2, 3, 4],
            scaleLabels: { min: 'Úplne opačný postoj', max: 'Úplne rovnaký postoj' },
            scaleValueLabels: ['Úplne opačný postoj', 'Skôr opačný postoj', 'Skôr rovnaký postoj', 'Úplne rovnaký postoj']
          },
          {
            id: 'comp_3',
            text: 'Porovnanie tvrdení',
            content: '**Tvrdenie A:**\\n"Európske inštitúcie a mainstreamové médiá spolupracujú na tom, aby pred občanmi zatajili skutočné negatívne dôsledky rozhodnutí EÚ."\\n\\n**Tvrdenie B:**\\n"Európske inštitúcie a mainstreamové médiá transparentne informujú občanov o rozhodnutiach EÚ."\\n\\n**Tieto dve tvrdenia vyjadrujú...**',
            scale: [1, 2, 3, 4],
            scaleLabels: { min: 'Úplne opačný postoj', max: 'Úplne rovnaký postoj' },
            scaleValueLabels: ['Úplne opačný postoj', 'Skôr opačný postoj', 'Skôr rovnaký postoj', 'Úplne rovnaký postoj']
          },
          {
            id: 'comp_4',
            text: 'Porovnanie tvrdení',
            content: '**Tvrdenie A:**\\n"EÚ rešpektuje a chráni národné kultúry a tradície všetkých členských štátov."\\n\\n**Tvrdenie B:**\\n"EÚ má skrytý plán na zničenie národných kultúr a tradícií v prospech multikulturalizmu a liberálnych hodnôt."\\n\\n**Tieto dve tvrdenia vyjadrujú...**',
            scale: [1, 2, 3, 4],
            scaleLabels: { min: 'Úplne opačný postoj', max: 'Úplne rovnaký postoj' },
            scaleValueLabels: ['Úplne opačný postoj', 'Skôr opačný postoj', 'Skôr rovnaký postoj', 'Úplne rovnaký postoj']
          },
          {
            id: 'comp_5',
            text: 'Porovnanie tvrdení',
            content: '**Tvrdenie A:**\\n"EÚ zámerne obchádza demokratické procesy a ignoruje vôľu občanov, pretože sú riadené skrytou agendou globálnych elít."\\n\\n**Tvrdenie B:**\\n"Všetky rozhodnutia EÚ sú prijaté v plne transparentných procesoch, kde všetci poslanci verejne hlasujú, a žiadna krajina nie je nútená ich nasledovať."\\n\\n**Tieto dve tvrdenia vyjadrujú...**',
            scale: [1, 2, 3, 4],
            scaleLabels: { min: 'Úplne opačný postoj', max: 'Úplne rovnaký postoj' },
            scaleValueLabels: ['Úplne opačný postoj', 'Skôr opačný postoj', 'Skôr rovnaký postoj', 'Úplne rovnaký postoj']
          },
          {
            id: 'comp_6',
            text: 'Porovnanie tvrdení',
            content: '**Tvrdenie A:**\\n"Regulácie EÚ sú navrhnuté aby chránili hospodárstvo všetkých členských štátov vrátane Slovenska, nie aby mu ublížili."\\n\\n**Tvrdenie B:**\\n"EÚ vedome zavádza škodlivé regulácie s cieľom ekonomicky zničiť Slovensko a prinútiť nás byť úplne závislí na Bruseli."\\n\\n**Tieto dve tvrdenia vyjadrujú...**',
            scale: [1, 2, 3, 4],
            scaleLabels: { min: 'Úplne opačný postoj', max: 'Úplne rovnaký postoj' },
            scaleValueLabels: ['Úplne opačný postoj', 'Skôr opačný postoj', 'Skôr rovnaký postoj', 'Úplne rovnaký postoj']
          },
          {
            id: 'comp_7',
            text: 'Porovnanie tvrdení',
            content: '**Tvrdenie A:**\\n"Migračná kríza bola naplánovaná autoritami EÚ."\\n\\n**Tvrdenie B:**\\n"Migračná kríza bola prirodzená udalosť, nie naplánovaná autoritami EÚ."\\n\\n**Tieto dve tvrdenia vyjadrujú...**',
            scale: [1, 2, 3, 4],
            scaleLabels: { min: 'Úplne opačný postoj', max: 'Úplne rovnaký postoj' },
            scaleValueLabels: ['Úplne opačný postoj', 'Skôr opačný postoj', 'Skôr rovnaký postoj', 'Úplne rovnaký postoj']
          }
        ]
      }
    ]
  },


].map(page => {
  // ✅ OPRAVENÉ: Počítaj všetky otázky vrátane accordion sub-questions
  let questionCount = 0;
  
  page.questions.forEach(q => {
    if (q.type === 'accordion-likert' && q.questions) {
      questionCount += q.questions.length;
    } else if (!q.isFeedback) {
      questionCount += 1;
    }
  });
  
  return {
    ...page,
    questions: [
      ...page.questions,
      ...createFeedbackQuestions(page.id, questionCount)
    ]
  };
});

export { PAGES, createFeedbackQuestions };




// ==========================================
// HLAVNÝ KOMPONENT
// ==========================================

const Questionnaire0 = () => {
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

  const questionRefs = useRef({});
  const shuffledOrderRef = useRef({});

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
  }, []);
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
    const scrollTypes = ['radio', 'binary', 'likert', 'ladder'];
    
    const shouldScroll = 
      question &&
      scrollTypes.includes(question.type) &&
      !question.isFeedback &&
      value !== '__custom__' &&          // ← nie keď je "Iné" vybrané
      !String(value).startsWith('__custom__'); // ← ani keď sa píše do "Iné"

    if (shouldScroll) {
      const allQuestions = page.questions.filter(q => !q.isFeedback && q.type !== 'accordion-likert');
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
      // Pre accordion-likert validuj všetky sub-questions
      if (question.type === 'accordion-likert' && question.questions) {
        question.questions.forEach(subQuestion => {
          // Sub-questions v accordion sú vždy required (okrem feedback)
          if (!subQuestion.isFeedback) {
            const answer = answers[subQuestion.id];
            if (answer === undefined || answer === null || answer === '') {
              errors[subQuestion.id] = 'Táto otázka je povinná.';
              hasError = true;
            }
          }
        });
      } else {
        // Normálne otázky
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
        time_spent_seconds: timeSpent,
        completed_at: new Date().toISOString(),
        device: window.innerWidth <= 768 ? 'mobile' : 'desktop'
      });

      // ✅ OPRAVENÉ: Označ misi ako completed priamo v progress
      const progress = await dataManager.loadUserProgress(userId);
      progress.mission0_completed = true; // ← SPRÁVNE
      await dataManager.saveProgress(userId, progress);
      
      console.log('✅ Questionnaire0 submitted successfully');
      navigate('/mission0/outro');
      
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
    const isFeedback = question.isFeedback;

    return (
      <QuestionCard
        key={question.id}
        ref={el => (questionRefs.current[question.id] = el)}
        hasError={hasError}
        isActive={activeQuestionId === question.id}
      >
        {/* ✅ ZMENENÉ: Použitie ReactMarkdown pre text s markdown */}
        <Question justify={question.type === 'ladder'}>
          {!isFeedback && `${index + 1}. `}
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
  const mainQuestions = page.questions.filter(q => !q.isFeedback);
  const feedbackQuestions = page.questions.filter(q => q.isFeedback);

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

            {feedbackQuestions.length > 0 && (
              <FeedbackSection>
                <FeedbackTitle>Spätná väzba</FeedbackTitle>
                <FeedbackSubtitle>
                  Pomôžte nám zlepšiť túto sekciu dotazníka (nepovinné)
                </FeedbackSubtitle>
                {feedbackQuestions.map((question) => renderQuestion(question, -1))}
              </FeedbackSection>
            )}

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

export default Questionnaire0;
