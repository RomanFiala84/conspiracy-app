import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams }                 from 'react-router-dom';
import styled                                           from 'styled-components';
import Layout                                           from '../../../styles/Layout';
import StyledButton                                     from '../../../styles/StyledButton';
import DetectiveTipSmall                                from '../../shared/DetectiveTipSmall';
import { useUserStats }                                 from '../../../contexts/UserStatsContext';
import { getResponseManager }                           from '../../../utils/ResponseManager';
import SectionAudioPlayer                               from '../../shared/SectionAudioPlayer';

// ── Styled Components ─────────────────────────────────────────────────────────

const Container = styled.div`
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
`;

const Card = styled.div`
  background: ${p => p.theme.CARD_BACKGROUND};
  border: 1px solid ${p => p.theme.BORDER_COLOR};
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 20px;
`;

const PageTitle = styled.h2`
  color: ${p => p.theme.ACCENT_COLOR};
  text-align: center;
  margin-bottom: 8px;
  font-size: 20px;
  font-weight: 700;
`;

const PageSubtitle = styled.p`
  color: ${p => p.theme.PRIMARY_TEXT_COLOR};
  text-align: center;
  font-size: 15px;
  margin-bottom: 24px;
`;

const ModuleTitle = styled.h3`
  color: ${p => p.theme.ACCENT_COLOR};
  font-size: 15px;
  font-weight: 700;
  margin: 28px 0 14px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid ${p => p.theme.PRIMARY_TEXT_COLOR}45;
`;

const BodyText = styled.p`
  color: ${p => p.theme.PRIMARY_TEXT_COLOR};
  font-size: 15px;
  line-height: 1.8;
  margin-bottom: 14px;
  text-align: left;
`;

const ItemLabel = styled.strong`
  color: ${p => p.theme.PRIMARY_TEXT_COLOR};
  display: block;
  margin-bottom: 2px;
  font-size: 15px;
`;

const ItemDesc = styled.span`
  color: ${p => p.theme.PRIMARY_TEXT_COLOR};
  font-size: 15px;
  line-height: 1.6;
  text-align: left;
`;

const ContentList = styled.ol`
  padding-left: 20px;
  margin: 8px 0 16px 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ContentListItem = styled.li`
  font-size: 15px;
  color: ${p => p.theme.PRIMARY_TEXT_COLOR};
  line-height: 1.7;
  text-align: left;
   &::marker {
    font-weight: 700;
  }
`;

const NestedList = styled.ol`
  list-style-type: decimal;
  padding-left: 20px;
  margin-top: 6px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  text-align: left;
  &::marker {
    font-weight: 700;
  }
`;

const NestedItem = styled.li`
  font-size: 15px;
  color: ${p => p.theme.PRIMARY_TEXT_COLOR};
  line-height: 1.6;
`;

const ProgressBar = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
`;

const ProgressTrack = styled.div`
  flex: 1;
  height: 6px;
  background: ${p => p.theme.BORDER_COLOR};
  border-radius: 3px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  width: ${p => p.pct}%;
  background: linear-gradient(to right, ${p => p.theme.ACCENT_COLOR}, ${p => p.theme.ACCENT_COLOR_2});
  transition: width 0.4s ease;
`;

const ProgressLabel = styled.span`
  font-size: 15px;
  font-weight: 600;
  color: ${p => p.theme.ACCENT_COLOR};
  white-space: nowrap;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 32px;
`;

// ── Accordion ─────────────────────────────────────────────────────────────────

const AccordionWrapper = styled.div`
  border: 1px solid ${p => p.theme.BORDER_COLOR};
  border-radius: 8px;
  margin-bottom: 12px;
  overflow: hidden;
`;

const AccordionHeader = styled.button`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 18px;
  background: ${p => p.open ? p.theme.ACCENT_COLOR + '15' : p.theme.CARD_BACKGROUND};
  border: none;
  cursor: pointer;
  text-align: left;
  transition: background 0.2s ease;
  &:hover { background: ${p => p.theme.ACCENT_COLOR}15; }
`;

const AccordionHeaderText = styled.span`
  font-size: 15px;
  font-weight: 600;
  color: ${p => p.read ? p.theme.PRIMARY_TEXT_COLOR : p.theme.PRIMARY_TEXT_COLOR};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const AccordionChevron = styled.span`
  font-size: 15px;
  color: ${p => p.theme.ACCENT_COLOR};
  transition: transform 0.25s ease;
  transform: ${p => p.open ? 'rotate(180deg)' : 'rotate(0deg)'};
`;

const AccordionBody = styled.div`
  padding: ${p => p.open ? '18px 20px' : '0 20px'};
  max-height: ${p => p.open ? '9999px' : '0'};
  overflow: hidden;
  transition: max-height 0.35s ease, padding 0.25s ease;
`;

const ReadBadge = styled.span`
  font-size: 10px;
  font-weight: 700;
  color: ${p => p.theme.ACCENT_COLOR};
  background: ${p => p.theme.ACCENT_COLOR}45;
  border-radius: 4px;
  padding: 2px 6px;
`;

// ── Semafor styled components ─────────────────────────────────────────────────

const SemaforContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  margin: 16px auto;
  width: 52px;
`;

const SemaforLight = styled.div`
  width: 25px;
  height: 25px;
  border-radius: 50%;
  background: ${p => p.active ? p.color : p.color + '45'};
  border: 2px solid ${p => p.color};
  box-shadow: ${p => p.active ? `0 0 12px ${p.color}88` : 'none'};
  transition: all 0.3s ease;
`;

const SemaforPole = styled.div`
  width: 8px;
  height: 60px;
  background: ${p => p.theme.BORDER_COLOR};
  border-radius: 4px;
  margin-top: 4px;
`;

const SemaforBody = styled.div`
  background: ${p => p.theme.CARD_BACKGROUND};
  border: 2px solid ${p => p.theme.BORDER_COLOR};
  border-radius: 12px;
  padding: 10px 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
`;

// ── Kvíz styled components ────────────────────────────────────────────────────

const QuizWrapper = styled.div`
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const QuizOption = styled.button`
  width: 100%;
  text-align: left;
  padding: 12px 16px;
  border-radius: 8px;
  border: 2px solid ${p =>
    p.correct ? '#22c55e' :
    p.wrong   ? '#ef4444' :
    p.theme.BORDER_COLOR};
  background: ${p =>
    p.correct ? '#22c55e18' :
    p.wrong   ? '#ef444418' :
    p.theme.CARD_BACKGROUND};
  color: ${p => p.theme.PRIMARY_TEXT_COLOR};
  font-size: 15px;
  cursor: ${p => p.disabled ? 'default' : 'pointer'};
  transition: all 0.2s ease;
  &:hover {
    background: ${p => !p.disabled ? p.theme.ACCENT_COLOR + '10' : undefined};
  }
`;

const QuizFeedback = styled.div`
  margin-top: 12px;
  padding: 14px 16px;
  border-radius: 8px;
  background: ${p => p.wrong
    ? `${p.theme.ERROR_COLOR}15`
    : `${p.theme.SUCCESS_COLOR}15`};
  border: 1px solid ${p => p.wrong
    ? `${p.theme.ERROR_COLOR}45`
    : `${p.theme.SUCCESS_COLOR}45`};
  color: ${p => p.theme.PRIMARY_TEXT_COLOR};
  font-size: 15px;
  line-height: 1.7;
`;



const QuizQuestion = styled.p`
  font-size: 15px;
  font-weight: 600;
  color: ${p => p.theme.PRIMARY_TEXT_COLOR};
  margin-bottom: 8px;
`;

// ── Kvíz komponent ─────────────────────────────────────────────────────────────

const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    question: 'Ktoré tvrdenie najlepšie vystihuje právo na prístup k dokumentom EÚ?',
    options: [
      { id: 'a', text: 'Len novinári môžu požiadať o dokumenty EÚ.' },
      { id: 'b', text: 'Môže požiadať každý občan EÚ, ale musí vysvetliť dôvody.' },
      { id: 'c', text: 'Môže požiadať každý občan EÚ a inštitúcie musia odpovedať do 15 pracovných dní.' },
      { id: 'd', text: 'O dokumenty možno žiadať len cez vládu.' },
    ],
    correct: 'c',
    explanation: 'Právo na prístup k dokumentom EÚ je základné právo každého občana. Žiadať možno priamo inštitúciu - bez sprostredkovania cez vládu alebo iný orgán - a tá musí odpovedať v lehote pätnásť pracovných dní.',
    audioSrc: '/sound/detektivd3a.mp3',
    audioId: 'quiz_q1_audio',
  },
  {
    id: 'q2',
    question: 'Kto má povinnosť byť transparentný?',
    options: [
      { id: 'a', text: 'Len tri hlavné inštitúcie: parlament, rada a komisia.' },
      { id: 'b', text: 'Všetky inštitúcie, orgány, úrady a agentúry EÚ.' },
      { id: 'c', text: 'Len inštitúcie v Bruseli.' },
      { id: 'd', text: 'Len inštitúcie financované z rozpočtu EÚ.' },
    ],
    correct: 'b',
    explanation: 'Zmluvy a nariadenia rozšírili povinnosť transparentnosti na celý takzvaný trojuholník inštitúcií - teda nielen na Parlament, Radu a Komisiu, ale na všetky orgány, úrady a agentúry Európskej únie.',
    audioSrc: '/sound/detektivd3b.mp3',
    audioId: 'quiz_q2_audio',
  },
  {
    id: 'q3',
    question: 'Ktorý výber najlepšie opisuje, aké typy dokumentov môže občan žiadať od inštitúcií EÚ?',
    options: [
      { id: 'a', text: 'Len legislatívne návrhy a zákony.' },
      { id: 'b', text: 'Len zápisnice zo zasadnutí Parlamentu.' },
      { id: 'c', text: 'Rôzne typy dokumentov, napr. rozpočty, zápisnice, e-maily, videozáznamy, zoznamy stretnutí...' },
      { id: 'd', text: 'Iba anonymizované dokumenty staršie ako 5 rokov.' },
    ],
    correct: 'c',
    explanation: 'Právo na informácie zahŕňa široké spektrum dokumentov - nielen zákony a legislatívne návrhy, ale aj pracovné materiály, zápisnice zo zasadnutí, či videozáznamy.',
    audioSrc: '/sound/detektivd3c.mp3',
    audioId: 'quiz_q3_audio',
  },
  {
    id: 'q4',
    question: 'Ktorá možnosť je príkladom proaktívnej transparentnosti EÚ?',
    options: [
      { id: 'a', text: 'Odpoveď na žiadosť o dokument po zaplatení poplatku.' },
      { id: 'b', text: 'Verejné online registre dokumentov a legislatívneho postupu, ktoré môžete sledovať bez žiadosti.' },
      { id: 'c', text: 'Informácie len na požiadanie poslanca EP.' },
      { id: 'd', text: 'Dokumenty dostupné len v angličtine.' },
    ],
    correct: 'b',
    explanation: 'Parlament, Rada aj Komisia majú verejné registre dokumentov a nástroje na sledovanie vzniku zákonov krok za krokom.',
    audioSrc: '/sound/detektivd3d.mp3',
    audioId: 'quiz_q4_audio',
  },
  {
    id: 'q5',
    question: 'Ako môžu občania priamo vstupovať do rozhodovania EÚ?',
    options: [
      { id: 'a', text: 'Nemajú žiadnu možnosť, o všetkom rozhodujú len vlády.' },
      { id: 'b', text: 'Len prostredníctvom národných referend.' },
      { id: 'c', text: 'Môžu podávať petície parlamentu, zúčastniť sa verejných konzultácií a iniciovať Európsku občiansku iniciatívu.' },
      { id: 'd', text: 'Len ak sú členmi registrovaných mimovládnych organizácií.' },
    ],
    correct: 'c',
    explanation: 'Inštitúcie sú zaviazané viesť otvorený dialóg s občanmi. Existujú preto nástroje, ako petície, verejné konzultácie a občianske iniciatívy.',
    audioSrc: '/sound/detektivd3e.mp3',
    audioId: 'quiz_q5_audio',
  },
];

const QuizAccordion = ({ playedAudios, markAudioPlayed }) => {
  const [answers, setAnswers] = useState({});

  const handleAnswer = (qId, optId) => {
    if (answers[qId]) return;
    setAnswers(prev => ({ ...prev, [qId]: optId }));
  };

  return (
    <QuizWrapper>
      {QUIZ_QUESTIONS.map((q, idx) => {
        const selected = answers[q.id];
        const answered = !!selected;
        return (
          <AccordionWrapper key={q.id}>
            <AccordionHeader
              open={answered}
              onClick={() => {}}
              type="button"
              style={{ cursor: 'default' }}
            >
              <AccordionHeaderText read={answered}>
                {answered && <ReadBadge>✓</ReadBadge>}
                Otázka {idx + 1}
              </AccordionHeaderText>
            </AccordionHeader>
            <AccordionBody open={true}>
              <QuizQuestion>{q.question}</QuizQuestion>
              {q.options.map(opt => (
                <QuizOption
                  key={opt.id}
                  type="button"
                  disabled={answered}
                  correct={answered && opt.id === q.correct}
                  wrong={answered && selected === opt.id && opt.id !== q.correct}
                  onClick={() => handleAnswer(q.id, opt.id)}
                >
                  <strong>{opt.id.toUpperCase()})</strong> {opt.text}
                  {answered && opt.id === q.correct && ' ✓'}
                </QuizOption>
              ))}
              {answered && (
                <>
                  {selected === q.correct ? (
                    <QuizFeedback correct>
                      <strong>✅ Správna odpoveď!</strong>
                      <br />
                      {q.explanation}
                      <SectionAudioPlayer
                        src={q.audioSrc}
                        audioId={q.audioId}
                        label="Prehrať vysvetlenie"
                        played={!!playedAudios[q.audioId]}
                        onPlayed={markAudioPlayed}
                      />
                    </QuizFeedback>
                  ) : (
                    <QuizFeedback wrong>
                      <strong>❌ Nesprávna odpoveď.</strong>
                      <br />
                      {q.explanation}
                      <SectionAudioPlayer
                        src={q.audioSrc}
                        audioId={q.audioId}
                        label="Prehrať vysvetlenie"
                        played={!!playedAudios[q.audioId]}
                        onPlayed={markAudioPlayed}
                      />
                    </QuizFeedback>
                  )}
                </>
              )}
            </AccordionBody>
          </AccordionWrapper>
        );
      })}
    </QuizWrapper>
  );
};

// ── Semafor komponent ─────────────────────────────────────────────────────────

const TrafficSemafor = ({ active }) => (
  <SemaforContainer>
    <SemaforBody>
      <SemaforLight color="#ef4444" active={active === 'red'} />
      <SemaforLight color="#f97316" active={active === 'orange'} />
      <SemaforLight color="#22c55e" active={active === 'green'} />
    </SemaforBody>
    <SemaforPole />
  </SemaforContainer>
);

// ── Accordion item ─────────────────────────────────────────────────────────────

const AccordionItem = ({ title, children, isRead, onRead }) => {
  const [open, setOpen] = useState(false);

  const handleToggle = () => {
    const next = !open;
    setOpen(next);
    if (next && !isRead) onRead();
  };

  return (
    <AccordionWrapper>
      <AccordionHeader open={open} onClick={handleToggle} type="button">
        <AccordionHeaderText read={isRead}>
          {isRead && <ReadBadge>✓</ReadBadge>}
          {title}
        </AccordionHeaderText>
        <AccordionChevron open={open}>▼</AccordionChevron>
      </AccordionHeader>
      <AccordionBody open={open}>
        {children}
      </AccordionBody>
    </AccordionWrapper>
  );
};

// ── Page1Content ──────────────────────────────────────────────────────────────

const Page1Content = ({ readSections, markRead, playedAudios, markAudioPlayed }) => (
  <>
    <ModuleTitle></ModuleTitle>

    <AccordionItem title="Čo je to vlastne konšpiračné presvedčenie?" isRead={readSections.has('p1_s1')} onRead={() => markRead('p1_s1')}>
      <SectionAudioPlayer src="/sound/detektiv2.mp3" audioId="p1_s1_audio" label="Prehrať" played={!!playedAudios['p1_s1_audio']} onPlayed={markAudioPlayed} />
      <ContentList>
        <ContentListItem><ItemLabel>Čo sú to vlastne tie konšpiračné presvedčenia?</ItemLabel><ItemDesc>Konšpiračné presvedčenia hovoria o tom, že tajné skupiny manipulujú udalosti, spoločnosť alebo nám skrývajú skutočnú pravdu.</ItemDesc></ContentListItem>
        <ContentListItem><ItemLabel>Ale prečo nám konšpiračné presvedčenia tak ľahko „padnú do siete“?</ItemLabel><ItemDesc>Nie je to preto, že sme hlúpi, naše mozgy sú navrhnuté hľadať vzory a zmysel, ale niekedy hľadajú vzory a zmysel aj tam, kde neexistujú.</ItemDesc></ContentListItem>      </ContentList>
      <BodyText>Poďme sa spolu teraz pozrieť na to, prečo nám konšpiračné presvedčenia tak ľahko „padnú do siete“, ako ich identifikovať a ako sa voči nim brániť.<br /> Ale pozor! Predtým ako si pozriete odpovede k otázkam, skúste si ich najskôr zodpovedať pre seba v myšlienkach. Ste pripravený? Poďme na to!</BodyText>

    </AccordionItem>

    <AccordionItem title="Aké sú ich spoločné znaky?" isRead={readSections.has('p1_s2')} onRead={() => markRead('p1_s2')}>
      <SectionAudioPlayer src="/sound/detektiv3.mp3" audioId="p1_s2_audio" label="Prehrať" played={!!playedAudios['p1_s2_audio']} onPlayed={markAudioPlayed} />
      <BodyText>Konšpiračné presvedčenia sa často vyskytujú v rôznych formách, ale majú niekoľko spoločných znakov:</BodyText>
      <ContentList>
        <ContentListItem><ItemLabel>Údajné tajné sprisahanie</ItemLabel><ItemDesc>Tvrdenie, že určitá skupina, či už vláda, inštitúcie, médiá alebo špecifická skupina ľudí, tajne a úmyselne koná.</ItemDesc></ContentListItem>
        <ContentListItem><ItemLabel>„Dôkazy" podporujúce presvedčenie</ItemLabel><ItemDesc>Selektívne vybraté informácie, ktoré sa interpretujú ako „dôkaz". Protichodné alebo faktické dôkazy sa ignorujú alebo vyvrátia.</ItemDesc></ContentListItem>
        <ContentListItem><ItemLabel>Falošné tvrdenia</ItemLabel><ItemDesc>Dezinformácie alebo čiastočné pravdy prezentované ako fakty.</ItemDesc></ContentListItem>
        <ContentListItem><ItemLabel>Rozdelenie sveta na dobro a zlo</ItemLabel><ItemDesc> Čiernobiele videnie reality, inak povedané, polarizácia spoločnosti. Tí, čo veria presvedčeniu, sú „osvietení", tí ostatní sú „slepí", „manipulovaní" alebo „hlúpi".</ItemDesc></ContentListItem>
        <ContentListItem><ItemLabel>Obvinenie špecifických skupín ľudí</ItemLabel><ItemDesc>Presvedčenia sú často zamerané na konkrétne etnické, náboženské, sociálne alebo politické skupiny. V mnohých prípadoch sú to menšiny alebo skupiny, ktoré sú už stigmatizované. To môže viesť k diskriminácii alebo násiliu.</ItemDesc></ContentListItem>
      </ContentList>
    </AccordionItem>

    <AccordionItem title="Prečo sa im darí?" isRead={readSections.has('p1_s3')} onRead={() => markRead('p1_s3')}>
      <SectionAudioPlayer src="/sound/detektiv4.mp3" audioId="p1_s3_audio" label="Prehrať" played={!!playedAudios['p1_s3_audio']} onPlayed={markAudioPlayed} />
      <BodyText>Konšpiračné presvedčenia sa často objavujú ako logické vysvetlenie udalostí alebo situácií, ktoré sú ťažko zrozumiteľné, a dodávajú falošný pocit moci a vplyvu.</BodyText>
      <ContentList>
        <ContentListItem><ItemLabel>Hľadanie vzorov a zmyslu</ItemLabel><ItemDesc>Keď sa niečo deje, automaticky hľadáme odpovede na otázku prečo a kto za tým stojí. Konšpiračné presvedčenia nám ponúkajú jednoduché odpovede. A jednoduché odpovede sú upokojujúce.</ItemDesc></ContentListItem>
        <ContentListItem><ItemLabel>Pocit kontroly a porozumenia</ItemLabel><ItemDesc>Život je chaotický. Veci sa dejú bez toho, aby sme im rozumeli alebo ich mohli kontrolovať. To nás plní úzkosťou. Konšpiračné presvedčenia nám dávajú pocit, že sme niečo pochopili a že máme kontrolu.</ItemDesc></ContentListItem>
        <ContentListItem><ItemLabel>Súčasť komunity</ItemLabel><ItemDesc>Keď veríme konšpiračnému presvedčeniu, sme súčasťou skupiny tých, čo vedia. Tí ostatní sú slepí. Cítime sa ako súčasť komunity, ktorá pozná „pravdu".</ItemDesc></ContentListItem>
      </ContentList>
    </AccordionItem>

    <AccordionItem title="Ako vznikajú?" isRead={readSections.has('p1_s4')} onRead={() => markRead('p1_s4')}>
      <SectionAudioPlayer src="/sound/detektiv5.mp3" audioId="p1_s4_audio" label="Prehrať" played={!!playedAudios['p1_s4_audio']} onPlayed={markAudioPlayed} />
      <BodyText>Konšpiračné presvedčenia nevznikajú v prázdnote. Vznikajú v špecifických podmienkach.</BodyText>
      <ContentList>
        <ContentListItem><ItemLabel>Udalosť alebo neistota</ItemLabel><ItemDesc>Niečo sa stane, napríklad pandémia, politický škandál, ekonomická kríza... alebo jednoducho nerozumieme nejakej udalosti, ktorá sa stala.</ItemDesc></ContentListItem>
        <ContentListItem><ItemLabel>Alternatívne vysvetlenie</ItemLabel><ItemDesc>Nejaký jednotlivec alebo skupina vytvorí teóriu, ktorá spája pôvodnú neistotu s konkrétnym vinníkom. Táto teória je jednoduchá, emotívna a dáva „zmysel".</ItemDesc></ContentListItem>
        <ContentListItem><ItemLabel>Komunita a posilnenie</ItemLabel><ItemDesc>Keď sa stretávajú ľudia s rovnakým presvedčením, vzájomne si ho potvrdzujú. Algoritmy sociálnych médií nám ukazujú čoraz viac obsahu, ktorý potvrdzuje to, čo chceme počuť. Presvedčenie sa posilňuje, pretože počujeme to isté opakovane.</ItemDesc></ContentListItem>
      </ContentList>
    </AccordionItem>

    <AccordionItem title="Prečo ich ľudia šíria?" isRead={readSections.has('p1_s5')} onRead={() => markRead('p1_s5')}>
      <SectionAudioPlayer src="/sound/detektiv6.mp3" audioId="p1_s5_audio" label="Prehrať" played={!!playedAudios['p1_s5_audio']} onPlayed={markAudioPlayed} />
      <BodyText>Ľudia konšpiračné presvedčenia šíria z mnohých dôvodov a väčšinou si to ani neuvedomujú.</BodyText>
      <ContentList>
        <ContentListItem><ItemLabel>Chcú pomôcť</ItemLabel><ItemDesc>Osoba verí, že objavila „pravdu", a chce ju zdieľať s ostatnými. Šírenie presvedčenia môže byť vnímané ako morálna povinnosť.</ItemDesc></ContentListItem>
        <ContentListItem><ItemLabel>Chcú byť časťou komunity</ItemLabel><ItemDesc>Keď zdieľajú presvedčenie, sú súčasťou komunity. Dostávajú pozitívnu odozvu od ostatných - lajky, komentáre, pocit spolupatričnosti.</ItemDesc></ContentListItem>
        <ContentListItem><ItemLabel>Pocit moci a vplyvu</ItemLabel><ItemDesc>Keď šíria konšpiračné presvedčenie a niekto mu verí, cítia pocit moci a vplyvu.</ItemDesc></ContentListItem>
        <ContentListItem><ItemLabel>Strach a úzkosť</ItemLabel><ItemDesc>Keď sa bojíme, prirodzene sa chceme deliť s ostatnými o svoje obavy.</ItemDesc></ContentListItem>
        <ContentListItem><ItemLabel>Algoritmy a sociálne médiá</ItemLabel><ItemDesc>Algoritmy nám ponúkajú obsah, ktorý nás udržiava online. Čím viac naň reagujeme - lajkami, komentovaním a zdieľaním - tým viac ho vidíme všetci. Konšpiračné presvedčenia sú tak ideálnou „potravou" pre algoritmy.</ItemDesc></ContentListItem>
      </ContentList>
    </AccordionItem>

    <AccordionItem title="Sebareflexia" isRead={readSections.has('p1_s6')} onRead={() => markRead('p1_s6')}>
      <SectionAudioPlayer src="/sound/detektiv7v.mp3" audioId="p1_s66_audio" label="Prehrať" played={!!playedAudios['p1_s66_audio']} onPlayed={markAudioPlayed} />
      <BodyText>Teraz, keď sme si zopakovali, čo sú konšpiračné presvedčenia, aké majú znaky, prečo sa im darí, ako vznikajú a prečo ich ľudia šíria. Poďme sa znovu pozrieť hlbšie na seba samých, pomocou sebareflektujúcich otázok, ktoré nám môžu pomôcť pri ich rozoznávaní.</BodyText>
      <SectionAudioPlayer src="/sound/detektiv8.mp3" audioId="p1_s6_audio" label="Prehrať" played={!!playedAudios['p1_s6_audio']} onPlayed={markAudioPlayed} />
      <BodyText>Tieto sebareflektujúce otázky môžu byť užitočným nástrojom nielen pri odhaľovaní konšpiračných presvedčení, ale aj v každodennom živote.</BodyText>
      <ContentList>
        <ContentListItem>
          <ItemLabel>Ako som prišiel k tomuto názoru?</ItemLabel>
          <ItemDesc>Každé presvedčenie má pôvod. Keď si uvedomíte, odkiaľ pochádza vaše presvedčenie, môžete si položiť otázku: je to moje presvedčenie, alebo som ho len prevzal od ostatných?</ItemDesc>
          <ItemLabel>Premýšľajte o tom:</ItemLabel>
          <NestedList>
            <NestedItem>Kde ste sa prvýkrát s týmto tvrdením stretli?</NestedItem>    
            <NestedItem>Ako dlho ste o tom presvedčený?</NestedItem>        
            <NestedItem>Čo vás viedlo k tomu, aby ste tomu uverili?</NestedItem> 
            <NestedItem>A skúmali ste to tvrdenie, alebo ste ho len prijali?</NestedItem> 
          </NestedList>
        </ContentListItem>
        <ContentListItem>
          <ItemLabel>Čo ma presvedčilo, že je to pravda?</ItemLabel>
          <ItemDesc>Existuje rozdiel medzi tým, čo vás presvedčilo na základe faktov, a tým čo vás presvedčilo na základe emócií. </ItemDesc>
          <ItemLabel>Premýšľajte o tom:</ItemLabel>
          <NestedList>
            <NestedItem>Aké konkrétne dôkazy alebo argumenty vás presvedčili?</NestedItem> 
            <NestedItem>Sú to faktické dôkazy, ako články či štúdie, alebo emócie ako strach, hnev či pocit nespravodlivosti?</NestedItem> 
            <NestedItem>Overili ste si tieto dôkazy aj z iných zdrojov?</NestedItem> 
            <NestedItem>A pozreli ste sa aj na argumenty, ktoré spochybňujú vaše presvedčenie?</NestedItem> 
          </NestedList>
        </ContentListItem>
        <ContentListItem>
          <ItemLabel>Existujú aj iné pohľady na túto tému?</ItemLabel>
          <ItemDesc>Každá téma má viacero legitímnych pohľadov.</ItemDesc>
          <ItemLabel>Premýšľajte o tom:</ItemLabel>
          <NestedList>
            <NestedItem>Poznám ľudí, ktorí majú iný názor na konkrétnu tému?</NestedItem>
            <NestedItem>Ako sa cítim, keď s niekým nesúhlasím?</NestedItem> 
            <NestedItem>A vidím v inom argumente čokoľvek, čo by malo zmysel, alebo všetko automaticky odmietam?</NestedItem> 
          </NestedList>
        </ContentListItem>
        <ContentListItem>
          <ItemLabel>Čo by mi pomohlo pochopiť veci z iného uhla pohľadu?</ItemLabel>
          <ItemDesc>Toto je najhlbšia otázka. Ak si dokážete predstaviť situáciu, v ktorej by ste mohli zmeniť názor, je to dobrý znak otvorenosti.</ItemDesc>
          <ItemLabel>Premýšľajte o tom:</ItemLabel>
          <NestedList>
            <NestedItem>Ako by som sa cítil, keby som mal opačný názor?</NestedItem>
            <NestedItem>Aké dôkazy by ma presvedčili, že sa mýlim?</NestedItem>
            <NestedItem>Čo by som musel vidieť, počuť alebo skúsiť, aby som pochopil iný pohľad?</NestedItem>
            <NestedItem> A bolo v mojej minulosti obdobie, keď som zmenil názor, a čo ma k tomu viedlo?</NestedItem>
          </NestedList>
        </ContentListItem>
      </ContentList>
    </AccordionItem>
  </>
);

// ── Page2Content ──────────────────────────────────────────────────────────────

const Page2Content = ({ readSections, markRead, playedAudios, markAudioPlayed }) => (
  <>
    <ModuleTitle></ModuleTitle>

    <AccordionItem title="Aké sú inštitúcie EÚ a čo robia?" isRead={readSections.has('p2_s1')} onRead={() => markRead('p2_s1')}>
      <SectionAudioPlayer src="/sound/detektivd2.mp3" audioId="p2_s1_audio" label="Prehrať" played={!!playedAudios['p2_s1_audio']} onPlayed={markAudioPlayed} />
      <BodyText>Tieto inštitúcie EÚ sú najkľúčovejšie:</BodyText>
      <ContentList>
        <ContentListItem><ItemLabel>Európsky parlament</ItemLabel><ItemDesc>Priamo volený občanmi, rozhoduje o zákonoch a kontroluje ostatné inštitúcie.</ItemDesc></ContentListItem>
        <ContentListItem><ItemLabel>Európska rada</ItemLabel><ItemDesc>Hlavy štátov, určuje strategické smerovanie EÚ.</ItemDesc></ContentListItem>
        <ContentListItem><ItemLabel>Rada EÚ</ItemLabel><ItemDesc>Ministri krajín, vyjednávajú a prijímajú zákony spolu s parlamentom.</ItemDesc></ContentListItem>
        <ContentListItem><ItemLabel>Európska komisia</ItemLabel><ItemDesc>Výkonná moc, navrhuje zákony a zabezpečuje ich dodržiavanie.</ItemDesc></ContentListItem>
        <ContentListItem><ItemLabel>Súdny dvor EÚ</ItemLabel><ItemDesc>Súdna moc, zaručuje rovnaké právo pre všetkých vo všetkých 27 krajinách.</ItemDesc></ContentListItem>
        <ContentListItem><ItemLabel>Európska centrálna banka</ItemLabel><ItemDesc>Menová politika, udržiava stabilitu cien a chráni hodnotu eura.</ItemDesc></ContentListItem>
        <ContentListItem><ItemLabel>Európsky dvor audítorov</ItemLabel><ItemDesc>Finančná kontrola, kontroluje, či sú peniaze daňovníkov vynakladané správne.</ItemDesc></ContentListItem>
      </ContentList>
    </AccordionItem>

    <AccordionItem title="Ako EÚ zabezpečuje transparentnosť?" isRead={readSections.has('p2_s2')} onRead={() => markRead('p2_s2')}>
      <SectionAudioPlayer src="/sound/detektivd3.mp3" audioId="p2_s2_audio" label="Prehrať" played={!!playedAudios['p2_s2_audio']} onPlayed={markAudioPlayed} />
      <BodyText>
        Základným znakom dôveryhodnej inštitúcie je, ak je transparentná a zodpovedná. EÚ má preto nástroje, ktoré zabezpečujú, že inštitúcie nepracujú v skrytosti.
        Teraz si dajme krátky kvíz - ako si myslíte, že EÚ transparentnosť zabezpečuje? Označte, ktoré tvrdenia o fungovaní EÚ sú podľa vás pravdivé.
      </BodyText>
      <QuizAccordion playedAudios={playedAudios} markAudioPlayed={markAudioPlayed} />
    </AccordionItem>

    <AccordionItem title="Čo EÚ robí pre vás?" isRead={readSections.has('p2_s3')} onRead={() => markRead('p2_s3')}>
      <SectionAudioPlayer src="/sound/detektivd4.mp3" audioId="p2_s3_audio" label="Prehrať" played={!!playedAudios['p2_s3_audio']} onPlayed={markAudioPlayed} />
      <BodyText>Dôveryhodné inštitúcie nekonajú len efektívne a transparentne - konajú v záujme ľudí. Pozrite sa na konkrétne výhody, ktoré EÚ zabezpečuje.</BodyText>
      <ContentList>
        <ContentListItem><ItemLabel>Voľný pohyb</ItemLabel><ItemDesc>Môžete študovať, pracovať, žiť alebo odísť do dôchodku kdekoľvek v EÚ bez vízových obmedzení.</ItemDesc></ContentListItem>
        <ContentListItem><ItemLabel>Cenová ochrana</ItemLabel><ItemDesc>14 dňová lehota na vrátenie online nákupov, žiadne roamingové poplatky, ochrana bankových vkladov do sto tisíc eur.</ItemDesc></ContentListItem>
        <ContentListItem><ItemLabel>Vzdelávanie</ItemLabel><ItemDesc>Program Erasmus+ a možnosť študovať na akejkoľvek vysokej škole v rámci EÚ.</ItemDesc></ContentListItem>
        <ContentListItem><ItemLabel>Životné prostredie</ItemLabel><ItemDesc>Podpora ochrany životného prostredia a právne záväzný cieľ klimatickej neutrality do roku 2050.</ItemDesc></ContentListItem>
        <ContentListItem><ItemLabel>Zdravie</ItemLabel><ItemDesc>Európska karta zdravotného poistenia, lekárska starostlivosť v celej EÚ za rovnakých podmienok.</ItemDesc></ContentListItem>
        <ContentListItem><ItemLabel>Bezpečnosť</ItemLabel><ItemDesc>Prísne bezpečnostné štandardy pre hračky, potraviny a lieky patria medzi najprísnejšie na svete.</ItemDesc></ContentListItem>
      </ContentList>
    </AccordionItem>
  </>
);

// ── Page3Content ──────────────────────────────────────────────────────────────

const Page3Content = ({ readSections, markRead, playedAudios, markAudioPlayed }) => (
  <>
    <ModuleTitle></ModuleTitle>

    <AccordionItem title="Základné tri otázky" isRead={readSections.has('p3_s1')} onRead={() => markRead('p3_s1')}>
      <SectionAudioPlayer src="/sound/detektivb2v.mp3" audioId="p3_s1_audio" label="Prehrať" played={!!playedAudios['p3_s1_audio']} onPlayed={markAudioPlayed} />
      <BodyText>Manipulatívne príspevky môžu mať rôzne formy , všetky však majú jedno spoločné. Chcú ovplyvniť vaše presvedčenia, rozhodnutia a dôveru. Príspevkový semafor už poznáte. Pripomeňme si jeho tri základné otázky. Kto profituje? Odkiaľ to pochádza? Je príspevok bez emócií presvedčivý? Tieto tri otázky fungujú ako detektívny nástroj - pomôžu vám odhaliť zámer tvorcu príspevku.</BodyText>
      <SectionAudioPlayer src="/sound/detektivb3.mp3" audioId="p3_s11_audio" label="Prehrať" played={!!playedAudios['p3_s11_audio']} onPlayed={markAudioPlayed} />
      <BodyText>Manipulatívne príspevky môžu byť napríklad len vo forme reklamy alebo clickbaitu - teda návnady, ktorá láka na senzačný nadpis, ale obsah nesplní to, čo sľubuje. Ale iné môžu byť aj konšpiračné. Takýto typ príspevku je forma manipulácie, ktorá vytvára falošný obraz nielen o konkrétnych udalostiach, ale aj o tom, ako fungujú inštitúcie alebo svet. Takéto príspevky môžu ovplyvniť vaše presvedčenia, rozhodnutia a dôveru.
      Teraz si prezrite pozorne príspevkový semafor, pomôže vám rozpoznávať štruktúru príspevkov a odlišovať dôveryhodné od manipulatívnych, nech už majú akýkoľvek obsah.
      </BodyText>
      <BodyText>Poďme začať so základnými troma otázkami, z ktorých sa každá farba semaforu skladá.</BodyText>
      <ContentList>
        <ContentListItem><ItemLabel>Kto profituje?</ItemLabel><ItemDesc>Keď si čítate príspevok, zastavte sa a spýtajte sa: Kto to napísal? Kto má záujem, aby ste verili konkrétnemu príspevku?</ItemDesc></ContentListItem>
        <ContentListItem><ItemLabel>Odkiaľ to pochádza?</ItemLabel><ItemDesc>Vidím konkrétny zdroj? Meno autora? Organizáciu? Link na článok? Alebo je to len príspevok bez akéhokoľvek predloženia dôkazov?</ItemDesc></ContentListItem>
        <ContentListItem><ItemLabel>Je príspevok bez emócií presvedčivý?</ItemLabel><ItemDesc>Predstavte si príspevok bez výkričníkov, bez veľkých písmen, bez urgencií, bez dramatických fotiek. Zostáva presvedčivý? Alebo sa sila informácie príspevku rozpadá?</ItemDesc></ContentListItem>
      </ContentList>
      <BodyText>Tieto tri otázky spolu fungujú ako detektívny nástroj. Keď si ich položíte, môžete si všimnúť zámer tvorcu príspevku.</BodyText>
    </AccordionItem>

    <AccordionItem title="🔴 Znaky manipulatívneho príspevku" isRead={readSections.has('p3_s2')} onRead={() => markRead('p3_s2')}>
      <SectionAudioPlayer src="/sound/detektivb4.mp3" audioId="p3_s2_audio" label="Prehrať" played={!!playedAudios['p3_s2_audio']} onPlayed={markAudioPlayed} />
      <TrafficSemafor active="red" />
      <BodyText>Ak sa tvorca pokúša o manipuláciu, často si môžete všimnúť tieto znaky.</BodyText>
      <ContentList>
        <ContentListItem><ItemLabel>Kto profituje?</ItemLabel><ItemDesc>Autor sa skrýva: účet môže byť anonymný, bez histórie, bez fotky, alebo prípadne s fotkou, ktorá ho anonymizuje, bez informácií. Kto je teda autorom? Neviete. Čo chce? Vašu pozornosť a vašu emóciu. Ako profituje? Z vášho konania: zdieľania, lajkovania, komentovania - vášho strachu a úzkosti.</ItemDesc></ContentListItem>
        <ContentListItem><ItemLabel>Odkiaľ to pochádza?</ItemLabel><ItemDesc>Príspevok môže byť od anonymného autora, bez uvedenia inštitúcie alebo organizácie, bez konkrétneho zdroja odkiaľ čerpal. Prečo je dôležité uvádzať zdroj? Pre overenie informácie. Ak autor neuvedie zdroj, poskytne informáciu, ktorú si nikto bez dodatočného úsilia nemôže overiť.</ItemDesc></ContentListItem>
        <ContentListItem><ItemLabel>Je príspevok bez emócií presvedčivý?</ItemLabel><ItemDesc>Príspevok môže byť zameraný na emócie: snaží sa vyvolať strach, úzkosť, hnev, vzrušenie alebo šok, pomocou dramatického textu, fotky alebo videa. S výkričníkmi a veľkými písmenami príspevok apeluje na urgenciu - napríklad: zdieľaj kým to nevymažú. Vyvolaním emócií sa vás snaží presvedčiť. Spolieha sa napríklad na strach - rýchlo, inak je neskoro. Na hnev - toto je nespravodlivé. Alebo na vzrušenie - konečne sa dozviete pravdu. Bez emócií v príspevku ostáva iba prázdne tvrdenie bez faktov, bez zdrojov.</ItemDesc></ContentListItem>
      </ContentList>
    </AccordionItem>

    <AccordionItem title="🟠 Znaky neistého príspevku" isRead={readSections.has('p3_s3')} onRead={() => markRead('p3_s3')}>
      <SectionAudioPlayer src="/sound/detektivb5.mp3" audioId="p3_s3_audio" label="Prehrať" played={!!playedAudios['p3_s3_audio']} onPlayed={markAudioPlayed} />
      <TrafficSemafor active="orange" />
      <BodyText>Ako aj na cestách, predtým ako prejdeme na zelenú, je dôležité dať si pozor na premávku, pretože sa tam môže vyskytnúť niečo, čo môže mať rôzne dôsledky. V takomto prípade môže ísť o manipulatívny príspevok, ale pozor, aj o dôveryhodný. Preto je potrebné si všímať tieto znaky.</BodyText>
      <ContentList>
        <ContentListItem>
          <ItemLabel>Kto profituje?</ItemLabel>
          <ItemDesc>Autor sa čiastočne predstavuje: poznáte meno, inštitúciu alebo organizáciu. Môže sa ale stať, že niektoré informácie chýbajú, nie sú úplné, alebo prípadne vymyslené. V takomto prípade môže ísť o manipulatívny príspevok, ale aj o dôveryhodný. Preto si musíte dať pozor.</ItemDesc>
          <NestedList>
            <NestedItem>Ak autor uvádza svoje meno, ale bez detailov o svojej kvalifikácii - pýtajte sa: Čo ho kvalifikuje na to, aby o tomto hovoril? Všetci môžu hovoriť čokoľvek, ale nie všetci majú na to potrebné znalosti.</NestedItem>
            <NestedItem>Ak autor uvádza inštitúciu alebo organizáciu, ale bez overenia či naozaj v nej pracuje alebo existuje - pýtajte sa: Dá sa toto overiť? Ak sa autor rozhodol vynechať informácie - pýtajte sa: Prečo? Je to zámerné?</NestedItem>
          </NestedList>
        </ContentListItem>
        <ContentListItem>
          <ItemLabel>Odkiaľ to pochádza?</ItemLabel>
          <ItemDesc>Zdroje sú uvedené, ale nie sú úplné - napríklad „podľa štúdie" alebo „americkí vedci zistili" bez precízneho odkazu. Fotografia, prípadne video má kontext, ale bez všetkých detailov - viete čo, ale nie kedy, kde, odkiaľ a od koho pochádza. Informácie sa dajú čiastočne overiť, ale vyžaduje to úsilie. V takomto prípade tiež môže ísť o manipulatívny príspevok, ale aj o dôveryhodný, pretože nie vždy sú zdroje uvedené. Preto si musíte dať pozor a položte si tieto otázky.</ItemDesc>
          <NestedList>
            <NestedItem>Sú zdroje zámerne skryté alebo len nedostatočne uvedené? Skúste si vyhľadať originálny zdroj. Ak existuje a je vyhľadateľný, autor ho asi len nestihol uviesť - mohlo ísť len o chybu. Ak neexistuje alebo je falošný, môže ísť o nepravdivú informáciu a manipuláciu. </NestedItem>
            <NestedItem>Má fotografia alebo video zmysel v jej pôvodnom kontexte? Pozrite si, aký bol pôvodný kontext. Ak sa kontext zmenil, môže ísť o manipuláciu. Dôležité je si všimnúť, či nejde len o ilustračnú fotku, prípadne video.</NestedItem>
            <NestedItem>Bol autor presný? Má text aj iné presné informácie - mená, dátumy, miesta? Alebo sú všetky detaily vágne a neurčité? Ak sa jedná o faktografické informácie, autor nemá dôvod neudať ich.</NestedItem>
          </NestedList>
        </ContentListItem>
        <ContentListItem>
          <ItemLabel>Je príspevok bez emócií presvedčivý?</ItemLabel>
          <ItemDesc>Príspevok má určitú emotívnosť, ale nie extrémnu. Fakty sú tu, ale sú zvýraznené vyberaním — autor si zvolil tie, ktoré podporujú jeho názor. Bez emócií by príspevok stále mal zmysel, ale bol by menej zaujímavý. V takomto prípade tiež môže ísť o manipulatívny príspevok, ale aj o dôveryhodný, pretože nie vždy je emócia príspevku jasná. Preto si musíte dať pozor a položte si tieto otázky.</ItemDesc>
          <NestedList>
            <NestedItem>Chce ma autor informovať alebo presvedčiť? Dôveryhodný príspevok vám povie fakty a nechá rozhodnutie na vás. Manipulatívny príspevok vám povie: Teraz viete, čo je správne. </NestedItem>
            <NestedItem>Prečo sú emócie práve takéto? Ak sú emócie v príspevku mierne, spýtajte sa: Sú mierne, pretože téma je objektívna? Alebo sú mierne, aby bol príspevok ťažšie rozpoznateľný ako manipulatívny?</NestedItem>
          </NestedList>
        </ContentListItem>
      </ContentList>
      <BodyText>Dôveryhodný príspevok bez kontextu môže byť mätúci. Ale keď autor prezentuje nepravdivé alebo čiastočne pravdivé informácie vybrané tak, aby podporili jeho tvrdenie, to je najnebezpečnejšia forma manipulácie, pretože vyzerá ako fakt. Preto neodsudzujte príspevok ihneď, ale ani mu automaticky neverte. Sami si vždy overujte informácie.</BodyText>
    </AccordionItem>

    <AccordionItem title="🟢 Znaky dôveryhodného príspevku" isRead={readSections.has('p3_s4')} onRead={() => markRead('p3_s4')}>
      <SectionAudioPlayer src="/sound/detektivb6.mp3" audioId="p3_s4_audio" label="Prehrať" played={!!playedAudios['p3_s4_audio']} onPlayed={markAudioPlayed} />
      <TrafficSemafor active="green" />
      <BodyText>Ak sa tvorca pokúša informovať o faktoch, často si môžete všimnúť tieto znaky.</BodyText>
      <ContentList>
        <ContentListItem><ItemLabel>Kto profituje?</ItemLabel><ItemDesc>Autor sa predstavuje - viete, kto je, prípadne v ktorej inštitúcii alebo organizácii pôsobí. Ako autor profituje? V takýchto prípadoch často nejde o profit, ide o predanie informácie alebo vedomostí. Jediné, z čoho autor môže profitovať, je kvalita obsahu: presnosť, čitateľnosť, užitočnosť. A prečo? Autor chce, aby ste boli informovaní, nie aby ste reagovali.</ItemDesc></ContentListItem>
        <ContentListItem><ItemLabel>Odkiaľ to pochádza?</ItemLabel><ItemDesc>Autora vieme identifikovať buď ako ľudskú osobu, inštitúciu alebo organizáciu. Zdroje sú jasne označené, poskytne nám odkazy alebo citácie. Informácie majú svoj pôvod a môžete ich skontrolovať. Fotografie a videá majú kontext: kedy, kde, kto ich urobil. Môžete si overiť informácie. A prečo? Autor príspevku nemá potrebu vás o niečom presvedčiť, chce, aby ste sa presvedčili sami.</ItemDesc></ContentListItem>
        <ContentListItem><ItemLabel>Je príspevok bez emócií presvedčivý?</ItemLabel><ItemDesc>Je príspevok bez emócií presvedčivý? Fakty hovoria samé za seba. Informácie, tvrdenia, čísla a zdroje sú presvedčivé aj v pokojnom, neutrálnom tóne bez urgencií. Autor nemá potrebu dramatizácie. A prečo? Autor chce, aby ste boli informovaní, nie aby ste reagovali.</ItemDesc></ContentListItem>
      </ContentList>
    </AccordionItem>
  </>
);

// ── Konfigurácia stránok ──────────────────────────────────────────────────────

const REQUIRED_SECTIONS = [
  ['p1_s1', 'p1_s2', 'p1_s3', 'p1_s4', 'p1_s5', 'p1_s6'],
  ['p2_s1', 'p2_s2', 'p2_s3'],
  [],
];



const PAGES = [
  {
    key: 'page0',
    title: 'Konšpiračné presvedčenia',
    subtitle: 'Prípad: Kukučie hniezdo',
    content: (readSections, markRead, playedAudios, markAudioPlayed) =>
      <Page1Content readSections={readSections} markRead={markRead} playedAudios={playedAudios} markAudioPlayed={markAudioPlayed} />,
    detectiveTipIntro: `<p><strong>Vitajte v ďalšej časti tretej misie. Tréning, ktorý ste už absolvovali, vám dal nástroje využiteľné v každodennom živote. Jednotlivé časti si môžete prečítať, alebo si ich prehrať pomocou nahrávok, ktoré som pre vás pripravil. Poďme teda spolu znovu nahliadnuť do zákulisia konšpiračných presvedčení.</strong></p>`,
    detectiveTipIntroAudio: { src: '/sound/detektiv1v.mp3', audioId: 'tip_p0_audio' },
    detectiveTipOutro: `<p><strong>Výborne! Prvú časť máte za sebou, nezabudnite si dať krátku prestávku a potom môžeme pokračovať.</strong></p>`,
    detectiveTipOutroAudio: { src: '/sound/detektiv9.mp3', audioId: 'tip_p00_audio' },
  },
  {
    key: 'page1',
    title: 'Inštitúcie EÚ',
    subtitle: '',
    content: (readSections, markRead, playedAudios, markAudioPlayed) =>
      <Page2Content readSections={readSections} markRead={markRead} playedAudios={playedAudios} markAudioPlayed={markAudioPlayed} />,
    detectiveTipIntro: `<p><strong>V prvej časti sme sa znovu zaoberali konšpiračnými presvedčeniami. Poďme si teraz zopakovať, čo robia, ako fungujú a čo nám prinášajú inštitúcie Európskej únie. Oddýchli ste si? Ak áno, poďme na to!</strong></p>`,
    detectiveTipIntroAudio: { src: '/sound/detektivd1v.mp3', audioId: 'tip_p1_audio' },
    detectiveTipOutro: `<p><strong>Výborne! Máte opäť za sebou druhú časť tréningu. Teraz sa môžete ešte pozrieť na bonus, alebo prejsť k záveru tréningu a pokračovať do ďalšej časti.</strong></p>`,
    detectiveTipOutroAudio: { src: '/sound/detektivd5v.mp3', audioId: 'tip_p11_audio' },
  },
  {
    key: 'page2',
    title: 'Príspevkový semafor',
    subtitle: 'Bonus - dobrovoľné',
    content: (readSections, markRead, playedAudios, markAudioPlayed) =>
      <Page3Content readSections={readSections} markRead={markRead} playedAudios={playedAudios} markAudioPlayed={markAudioPlayed} />,
    detectiveTipIntro: `<p><strong>Pokračujeme ďalej bonusom! Ako som už spomínal, konšpiračné presvedčenia sa často vyskytujú na sociálnych sieťach vo forme rôznych príspevkov, komentárov, či videí. Poďme sa spolu znovu pozrieť na náš príspevkový semafor.</strong></p>`,
    detectiveTipIntroAudio: { src: '/sound/detektivb1v.mp3', audioId: 'tip_p2_audio' },
    detectiveTipOutro: `<p><strong>Výborne, zvládli ste to! Tréning máte za sebou. Teraz prejdeme v ďalšej časti znovu ku tvrdeniam. Keď ich budete čítať, skúste využiť poznatky, ktoré ste nadobudli. Hlavne sa nezabudnite spýtať samých seba tieto základné otázky: Ako ste prišli k tomuto názoru? Čo vás presvedčilo, že je to pravda? Máte pocit, že existujú aj iné pohľady na túto tému? Čo by vám pomohlo pochopiť veci z iného uhla pohľadu?</strong></p>`,
    detectiveTipOutroAudio: { src: '/sound/detektivz.mp3', audioId: 'tip_p22_audio' },
  },
];


const TOTAL_PAGES  = PAGES.length;
const COMPONENT_ID = 'mission3_intervention_a';

// ═══════════════════════════════════════════════════════════════════════════════
// Hlavný komponent
// ═══════════════════════════════════════════════════════════════════════════════

const Intervention2A = () => {
  const navigate                  = useNavigate();
  const { dataManager, userId }   = useUserStats();
  const responseManager           = useMemo(() => getResponseManager(dataManager), [dataManager]);
  const [searchParams]            = useSearchParams();
  const initialPage               = parseInt(searchParams.get('page') || '0', 10);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const startTime                 = useRef(Date.now());
  const savingAudioRef            = useRef(false);

  const [readSections,  setReadSections]  = useState(() => PAGES.map(() => new Set()));
  const [playedAudios,  setPlayedAudios]  = useState({});

  useEffect(() => {
    (async () => {
      const prog = await dataManager.loadUserProgress(userId);
      if (!prog.mission3_unlocked && !dataManager.isAdmin(userId)) {
        navigate('/mainmenu');
      }
    })();
  }, [dataManager, userId, navigate]);

  useEffect(() => { startTime.current = Date.now(); }, [currentPage]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  useEffect(() => {
    const autoSave = setInterval(async () => {
      const t = Math.floor((Date.now() - startTime.current) / 1000);
      await responseManager.saveAnswer(userId, COMPONENT_ID, 'time_spent_seconds', t, {
        last_autosave: new Date().toISOString(),
        current_page:  currentPage,
      });
    }, 5000);
    return () => clearInterval(autoSave);
  }, [userId, responseManager, currentPage]);

  const markRead = (sectionKey) => {
    setReadSections(prev =>
      prev.map((s, i) => i === currentPage ? new Set([...s, sectionKey]) : s)
    );
  };

  const markAudioPlayed = useCallback(async (audioId) => {
    if (!audioId) return;
    setPlayedAudios(prev => {
      if (prev[audioId]) return prev;
      return { ...prev, [audioId]: true };
    });
    if (savingAudioRef.current) return;
    savingAudioRef.current = true;
    try {
      await responseManager.saveAnswer(userId, COMPONENT_ID, 'audio_played', audioId, {
        timestamp: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('[Intervention2A] audio save failed:', e);
    } finally {
      savingAudioRef.current = false;
    }
  }, [userId, responseManager]);

  const page              = PAGES[currentPage];
  const tipAudio      = page.detectiveTipIntroAudio;
  const tipOutroAudio = page.detectiveTipOutroAudio;


  // Všetky povinné audios vrátane tip audia ak existuje
  

  const allRequiredRead   = REQUIRED_SECTIONS[currentPage].every(k => readSections[currentPage].has(k));
  const canContinue       = allRequiredRead;

  const handleNext = async () => {
    setIsSubmitting(true);
    try {
      if (currentPage < PAGES.length - 1) {
        setCurrentPage(prev => prev + 1);
        window.scrollTo(0, 0);
      } else {
        navigate('/mission3/questionnaire2b');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLastPage      = currentPage === TOTAL_PAGES - 1;
  const remainingSect   = REQUIRED_SECTIONS[currentPage].filter(k => !readSections[currentPage].has(k)).length;


  return (
    <Layout>
      <Container>
        <Card className="InterventionWrapper">
          <ProgressBar>
            <ProgressTrack>
              <ProgressFill pct={((currentPage + 1) / TOTAL_PAGES) * 100} />
            </ProgressTrack>
            <ProgressLabel>{currentPage + 1} / {TOTAL_PAGES}</ProgressLabel>
          </ProgressBar>

          <PageTitle>{page.title}</PageTitle>
          <PageSubtitle>{page.subtitle}</PageSubtitle>

          <DetectiveTipSmall
            key={`intro-${currentPage}`}
            tip={page.detectiveTipIntro}
            detectiveName="Inšpektor Kritan"
            autoOpen={true}
            autoOpenDelay={200}
            audioSrc={page.detectiveTipIntroAudio?.src}
            audioId={page.detectiveTipIntroAudio?.audioId}
            played={tipAudio ? !!playedAudios[tipAudio.audioId] : undefined}
            onPlayed={markAudioPlayed}
            style={{ textAlign: "justify" }}
          />

          {page.content(readSections[currentPage], markRead, playedAudios, markAudioPlayed)}
          {canContinue && (
            <DetectiveTipSmall
              key={`outro-${currentPage}`}
              tip={page.detectiveTipOutro}
              audioSrc={tipOutroAudio?.src}
              audioId={tipOutroAudio?.audioId}
              detectiveName="Inšpektor Kritan"
              autoOpen={true}
              autoOpenDelay={300}
              played={tipOutroAudio? !!playedAudios[tipOutroAudio.audioId] : undefined} 
              onPlayed={markAudioPlayed}
              style={{ textAlign: "justify" }}
            />
          )}

          <ButtonContainer>
            <StyledButton
              accent
              onClick={handleNext}
              disabled={isSubmitting || !canContinue}
            >
              {!allRequiredRead
                ? `Dokončite všetky sekcie (zostáva: ${remainingSect})`
                  : isSubmitting
                    ? 'Ukladám...'
                    : isLastPage
                      ? 'Pokračovať!'
                      : 'Pokračovať ďalej →'}
            </StyledButton>
          </ButtonContainer>
        </Card>
      </Container>
    </Layout>
  );
};

export default Intervention2A;
