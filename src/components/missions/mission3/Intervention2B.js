// src/components/missions/mission2/Intervention1A.js

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams }                 from 'react-router-dom';
import styled                                           from 'styled-components';
import Layout                                           from '../../../styles/Layout';
import StyledButton                                     from '../../../styles/StyledButton';
import DetectiveTipSmall                                from '../../shared/DetectiveTipSmall';
import { useUserStats }                                 from '../../../contexts/UserStatsContext';
import { getResponseManager }                           from '../../../utils/ResponseManager';
import SectionAudioPlayer from '../../shared/SectionAudioPlayer';                   // ✅ komponent

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
  color: ${p => p.theme.PRIMARY_TEXT_COLOR};
  text-align: center;
  margin-bottom: 8px;
  font-size: 20px;
  font-weight: 700;
`;


const PageSubtitle = styled.p`
  color: ${p => p.theme.SECONDARY_TEXT_COLOR};
  text-align: center;
  font-size: 14px;
  margin-bottom: 24px;
`;


const ModuleTitle = styled.h3`
  color: ${p => p.theme.ACCENT_COLOR};
  font-size: 17px;
  font-weight: 700;
  margin: 28px 0 14px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid ${p => p.theme.ACCENT_COLOR}44;
`;
const BodyText = styled.p`
  color: ${p => p.theme.PRIMARY_TEXT_COLOR};
  font-size: 15px;
  line-height: 1.8;
  margin-bottom: 14px;
`;


const ItemLabel = styled.strong`
  color: ${p => p.theme.PRIMARY_TEXT_COLOR};
  display: block;
  margin-bottom: 2px;
  font-size: 15px;
`;


const ItemDesc = styled.span`
  color: ${p => p.theme.SECONDARY_TEXT_COLOR};
  font-size: 14px;
  line-height: 1.6;
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
`;


const NestedList = styled.ol`
  list-style-type: lower-alpha;
  padding-left: 20px;
  margin-top: 6px;
  display: flex;
  flex-direction: column;
  gap: 5px;
`;


const NestedItem = styled.li`
  font-size: 14px;
  color: ${p => p.theme.SECONDARY_TEXT_COLOR};
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
  font-size: 13px;
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
  background: ${p => p.open ? p.theme.ACCENT_COLOR + '11' : p.theme.CARD_BACKGROUND};
  border: none;
  cursor: pointer;
  text-align: left;
  transition: background 0.2s ease;

  &:hover {
    background: ${p => p.theme.ACCENT_COLOR}18;
  }
`;


const AccordionHeaderText = styled.span`
  font-size: 15px;
  font-weight: 600;
  color: ${p => p.read ? p.theme.ACCENT_COLOR : p.theme.PRIMARY_TEXT_COLOR};
  display: flex;
  align-items: center;
  gap: 8px;
`;


const AccordionChevron = styled.span`
  font-size: 13px;
  color: ${p => p.theme.SECONDARY_TEXT_COLOR};
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
  font-size: 11px;
  font-weight: 700;
  color: ${p => p.theme.ACCENT_COLOR};
  background: ${p => p.theme.ACCENT_COLOR}22;
  border-radius: 4px;
  padding: 2px 6px;
`;


// ── Accordion item ─────────────────────────────────────────────────────────────


const AccordionItem = ({ title, children, isRead, onRead }) => {
  const [open, setOpen] = useState(false);

  const handleToggle = () => {
    const next = !open;
    setOpen(next);
    if (next && !isRead) {
      onRead();
    }
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


// ── Obsah stránok ─────────────────────────────────────────────────────────────


const Page1Content = ({ readSections, markRead, playedAudios, markAudioPlayed }) => (  // ✅ rozšírené props
  <>
    <ModuleTitle>🧠 Konšpiračné presvedčenia</ModuleTitle>

    <AccordionItem
      title="Čo je to vlastne konšpiračné presvedčenie?"
      isRead={readSections.has('p1_s1')}
      onRead={() => markRead('p1_s1')}
    >
      {/* ✅ TESTOVACIA NAHRÁVKA */}
      <SectionAudioPlayer
        src="/sound/test1.mp3"
        audioId="p1_s1_audio"
        label="Prehrať nahrávku"
        played={!!playedAudios['p1_s1_audio']}
        onPlayed={markAudioPlayed}
      />
      <BodyText>
        Je to presvedčenie o tajnom a úmyselnom konaní mocných jednotlivcov a organizácií.
        Presvedčenie, že nejaká skupina sa snaží manipulovať situácie, udalosti alebo informácie
        za účelom dosiahnuť svoje skryté ciele.
      </BodyText>
    </AccordionItem>

    {/* zvyšok bezo zmeny — len odovzdaj props ďalej ak ich Page1Content nepoužíva */}
    <AccordionItem
      title="Aké sú ich spoločné znaky?"
      isRead={readSections.has('p1_s2')}
      onRead={() => markRead('p1_s2')}
    >
      <BodyText>
        Konšpiračné presvedčenia sa často vyskytujú v rôznych formách, ale majú niekoľko
        spoločných znakov. Keď si ich všimnete, viete, že sa pohybujete v území konšpiračných presvedčení:
      </BodyText>
      <ContentList>
        <ContentListItem>
          <ItemLabel>Údajné tajné sprisahanie</ItemLabel>
          <ItemDesc>Tvrdenie, že určitá skupina — či už vláda, inštitúcie, médiá alebo špecifická skupina ľudí — tajne a úmyselne koná.</ItemDesc>
        </ContentListItem>
        <ContentListItem>
          <ItemLabel>„Dôkazy" podporujúce presvedčenie</ItemLabel>
          <ItemDesc>Selektívne vybraté informácie, ktoré sa interpretujú ako „dôkaz". Protichodné alebo faktické dôkazy sa ignorujú alebo vyvrátia.</ItemDesc>
        </ContentListItem>
        <ContentListItem>
          <ItemLabel>Falošné tvrdenia</ItemLabel>
          <ItemDesc>Dezinformácie alebo čiastočné pravdy prezentované ako fakty.</ItemDesc>
        </ContentListItem>
        <ContentListItem>
          <ItemLabel>Rozdelenie sveta na dobro a zlo</ItemLabel>
          <ItemDesc>Čiernobiele videnie reality — polarizácia spoločnosti. Tí, čo veria presvedčeniu, sú „osvietení", tí ostatní sú „slepí", „manipulovaní" alebo „hlúpi".</ItemDesc>
        </ContentListItem>
        <ContentListItem>
          <ItemLabel>Obvinenie špecifických skupín ľudí</ItemLabel>
          <ItemDesc>Presvedčenia sú často zamerané na konkrétne etnické, náboženské, sociálne alebo politické skupiny. V mnohých prípadoch sú to menšiny alebo skupiny, ktoré sú už stigmatizované. To môže viesť k diskriminácii alebo násiliu.</ItemDesc>
        </ContentListItem>
      </ContentList>
    </AccordionItem>

    <AccordionItem
      title="Prečo sa im darí?"
      isRead={readSections.has('p1_s3')}
      onRead={() => markRead('p1_s3')}
    >
      <BodyText>
        Konšpiračné presvedčenia sa často objavujú ako logické vysvetlenie udalostí alebo
        situácií, ktoré sú ťažko zrozumiteľné, a dodávajú falošný pocit moci a vplyvu:
      </BodyText>
      <ContentList>
        <ContentListItem>
          <ItemLabel>Hľadanie vzorov a zmyslu</ItemLabel>
          <ItemDesc>Keď sa niečo deje, automaticky hľadáme odpovede na otázku „prečo?" a „kto za tým stojí?". Konšpiračné presvedčenia nám ponúkajú jednoduché odpovede. A jednoduché odpovede sú upokojujúce.</ItemDesc>
        </ContentListItem>
        <ContentListItem>
          <ItemLabel>Pocit kontroly a porozumenia</ItemLabel>
          <ItemDesc>Život je chaotický. Veci sa dejú bez toho, aby sme im rozumeli alebo ich mohli kontrolovať. To nás plní úzkosťou. Konšpiračné presvedčenia nám dávajú pocit, že sme niečo pochopili a že máme kontrolu.</ItemDesc>
        </ContentListItem>
        <ContentListItem>
          <ItemLabel>Súčasť komunity</ItemLabel>
          <ItemDesc>Keď veríme konšpiračnému presvedčeniu, sme súčasťou skupiny tých, čo vedia. Tí ostatní sú slepí. Cítime sa ako súčasť komunity, ktorá pozná „pravdu".</ItemDesc>
        </ContentListItem>
      </ContentList>
    </AccordionItem>

    <AccordionItem
      title="Ako vznikajú?"
      isRead={readSections.has('p1_s4')}
      onRead={() => markRead('p1_s4')}
    >
      <BodyText>Konšpiračné presvedčenia nevznikajú v prázdnote. Vznikajú v špecifických podmienkach:</BodyText>
      <ContentList>
        <ContentListItem>
          <ItemLabel>Udalosť alebo neistota</ItemLabel>
          <ItemDesc>Niečo sa stane, napr. pandémia, politický škandál, ekonomická kríza... alebo jednoducho nerozumieme nejakej udalosti, ktorá sa stala.</ItemDesc>
        </ContentListItem>
        <ContentListItem>
          <ItemLabel>Alternatívne vysvetlenie</ItemLabel>
          <ItemDesc>Nejaký jednotlivec alebo skupina vytvorí teóriu, ktorá spája pôvodnú neistotu s konkrétnym vinníkom. Táto teória je jednoduchá, emotívna a dáva „zmysel".</ItemDesc>
        </ContentListItem>
        <ContentListItem>
          <ItemLabel>Komunita a posilnenie</ItemLabel>
          <ItemDesc>Keď sa stretávajú ľudia s rovnakým presvedčením, vzájomne si ho potvrdzujú. Algoritmy sociálnych médií nám ukazujú viac a viac obsahu, ktorý nám potvrdzuje to, čo sledujeme. Presvedčenie sa posilňuje, pretože počujeme to isté opakovane.</ItemDesc>
        </ContentListItem>
      </ContentList>
    </AccordionItem>

    <AccordionItem
      title="Prečo ich ľudia šíria?"
      isRead={readSections.has('p1_s5')}
      onRead={() => markRead('p1_s5')}
    >
      <BodyText>Ľudia konšpiračné presvedčenia šíria z mnohých dôvodov a väčšinou si toho ani neuvedomujú:</BodyText>
      <ContentList>
        <ContentListItem>
          <ItemLabel>Chcú pomôcť</ItemLabel>
          <ItemDesc>Osoba verí, že objavila „pravdu", a chce ju zdieľať s ostatnými. Šírenie presvedčenia môže byť vnímané ako morálna povinnosť.</ItemDesc>
        </ContentListItem>
        <ContentListItem>
          <ItemLabel>Chcú byť časťou komunity</ItemLabel>
          <ItemDesc>Keď zdieľajú presvedčenie, sú súčasťou komunity. Dostávajú pozitívnu odozvu od ostatných — lajky, komentáre, pocit spolupatričnosti.</ItemDesc>
        </ContentListItem>
        <ContentListItem>
          <ItemLabel>Pocit moci a vplyvu</ItemLabel>
          <ItemDesc>Keď šíria konšpiračné presvedčenie a niekto mu verí, cítia pocit moci a vplyvu.</ItemDesc>
        </ContentListItem>
        <ContentListItem>
          <ItemLabel>Strach a úzkosť</ItemLabel>
          <ItemDesc>Keď sa bojím, prirodzene sa chcem deliť s ostatnými o svoje obavy.</ItemDesc>
        </ContentListItem>
        <ContentListItem>
          <ItemLabel>Algoritmy a sociálne médiá</ItemLabel>
          <ItemDesc>Algoritmy nám ponúkajú obsah, ktorý nás udržiava online. Čím viac naň reagujem — lajkami, komentovaním a zdieľaním — tým viac ho vidíme všetci. Konšpiračné presvedčenia sú ideálnou „potravou" pre algoritmy.</ItemDesc>
        </ContentListItem>
      </ContentList>
    </AccordionItem>

    <AccordionItem
      title="Sebareflexia — otázky, ktoré ti pomôžu"
      isRead={readSections.has('p1_s6')}
      onRead={() => markRead('p1_s6')}
    >
      <BodyText>
        Tieto sebareflektujúce otázky môžu byť užitočným nástrojom nielen pri odhaľovaní
        konšpiračných presvedčení, ale aj v každodennom živote:
      </BodyText>
      <ContentList>
        <ContentListItem>
          <ItemLabel>Ako som prišiel k tomuto názoru?</ItemLabel>
          <ItemDesc>Každé presvedčenie má pôvod. Keď si uvedomíte, odkiaľ pochádza vaše presvedčenie, môžete si položiť otázku: je to moje presvedčenie, alebo som ho len prevzal od ostatných?</ItemDesc>
          <NestedList>
            <NestedItem>Kde ste sa prvýkrát s týmto tvrdením stretli alebo kto vám o tom povedal?</NestedItem>
            <NestedItem>Ako dlho ste o tom presvedčený?</NestedItem>
            <NestedItem>Čo vás viedlo k tomu, aby ste tomu uverili v tú dobu?</NestedItem>
            <NestedItem>Skúmali ste to tvrdenie, alebo ste ho len prijali?</NestedItem>
          </NestedList>
        </ContentListItem>
        <ContentListItem>
          <ItemLabel>Čo ma presvedčilo, že je to pravda?</ItemLabel>
          <ItemDesc>Existuje rozdiel medzi tým, čo vás presvedčilo na základe faktov, a tým, čo vás presvedčilo na základe emócií.</ItemDesc>
          <NestedList>
            <NestedItem>Aké konkrétne dôkazy alebo argumenty vás presvedčili?</NestedItem>
            <NestedItem>Sú to faktické dôkazy (články, štúdie) alebo emócie (strach, hnev, pocit nespravodlivosti)?</NestedItem>
            <NestedItem>Overili ste si tieto dôkazy aj z iných zdrojov?</NestedItem>
            <NestedItem>Pozreli ste sa aj na argumenty, ktoré spochybňujú vaše presvedčenie?</NestedItem>
          </NestedList>
        </ContentListItem>
        <ContentListItem>
          <ItemLabel>Mám pocit, že existujú aj iné pohľady na túto tému?</ItemLabel>
          <ItemDesc>Každá téma má viacero legitímnych pohľadov.</ItemDesc>
          <NestedList>
            <NestedItem>Poznám ľudí, ktorí majú iný názor na túto tému?</NestedItem>
            <NestedItem>Ako sa cítim, keď s niekým nesúhlasím?</NestedItem>
            <NestedItem>Vidím v inom argumente čokoľvek, čo by malo zmysel? Alebo všetko automaticky odmietam?</NestedItem>
          </NestedList>
        </ContentListItem>
        <ContentListItem>
          <ItemLabel>Čo by mi pomohlo pochopiť veci z iného uhla pohľadu?</ItemLabel>
          <ItemDesc>Ak si dokážete predstaviť scenár, v ktorom by ste mohli zmeniť názor, je to dobrý signál. Ak nie, je to známka dogmy.</ItemDesc>
          <NestedList>
            <NestedItem>Ako by som sa cítil, keby som mal opačný názor?</NestedItem>
            <NestedItem>Aké dôkazy by ma presvedčili, že sa mýlim?</NestedItem>
            <NestedItem>Čo by som musel vidieť, počuť alebo skúsiť, aby som pochopil iný pohľad?</NestedItem>
            <NestedItem>Bolo v mojej minulosti obdobie, keď som zmenil názor? Čo ma k tomu viedlo?</NestedItem>
            <NestedItem>Bol som vždy presvedčený o tom istom, bez ohľadu na okolnosti?</NestedItem>
          </NestedList>
        </ContentListItem>
      </ContentList>
    </AccordionItem>
  </>
);


const Page2Content = ({ readSections, markRead }) => (
  <>
    <ModuleTitle>🏛️ Inštitúcie EÚ</ModuleTitle>

    <AccordionItem
      title="Aké sú inštitúcie EÚ a čo robia?"
      isRead={readSections.has('p2_s1')}
      onRead={() => markRead('p2_s1')}
    >
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

    <AccordionItem
      title="Ako EÚ zabezpečuje transparentnosť?"
      isRead={readSections.has('p2_s2')}
      onRead={() => markRead('p2_s2')}
    >
      <BodyText>
        Základným znakom dôveryhodnej inštitúcie je, ak sú transparentné a zodpovedné.
        EÚ má preto nástroje, ktoré zabezpečujú, že inštitúcie nepracujú v skrytosti.
      </BodyText>
      <ContentList>
        <ContentListItem><ItemLabel>Právo na prístup k dokumentom EÚ</ItemLabel><ItemDesc>Môže požiadať každý občan EÚ — inštitúcie musia odpovedať do 15 pracovných dní.</ItemDesc></ContentListItem>
        <ContentListItem><ItemLabel>Kto má povinnosť byť transparentný?</ItemLabel><ItemDesc>Všetky inštitúcie, orgány, úrady a agentúry EÚ — nielen tri hlavné inštitúcie.</ItemDesc></ContentListItem>
        <ContentListItem><ItemLabel>Aké dokumenty možno žiadať?</ItemLabel><ItemDesc>Rôzne typy dokumentov: rozpočty, zápisnice, e-maily, videozáznamy, zoznamy stretnutí a ďalšie.</ItemDesc></ContentListItem>
        <ContentListItem><ItemLabel>Proaktívna transparentnosť</ItemLabel><ItemDesc>Verejné online registre dokumentov a legislatívneho postupu, ktoré môžeš sledovať bez akejkoľvek žiadosti.</ItemDesc></ContentListItem>
        <ContentListItem><ItemLabel>Priama účasť občanov</ItemLabel><ItemDesc>Môžete podávať petície parlamentu, zúčastniť sa verejných konzultácií a iniciovať Európsku občiansku iniciatívu.</ItemDesc></ContentListItem>
      </ContentList>
    </AccordionItem>

    <AccordionItem
      title="Čo EÚ robí pre vás?"
      isRead={readSections.has('p2_s3')}
      onRead={() => markRead('p2_s3')}
    >
      <BodyText>
        Dôveryhodné inštitúcie nekonajú len efektívne a transparentne — konajú v záujme ľudí.
        Pozrite sa na konkrétne výhody, ktoré EÚ zabezpečuje:
      </BodyText>
      <ContentList>
        <ContentListItem><ItemLabel>Voľný pohyb</ItemLabel><ItemDesc>Môžete študovať, pracovať, žiť alebo odísť do dôchodku kdekoľvek v EÚ bez vízových obmedzení.</ItemDesc></ContentListItem>
        <ContentListItem><ItemLabel>Cenová ochrana</ItemLabel><ItemDesc>14-dňová lehota na vrátenie online nákupov, žiadne roamingové poplatky, ochrana bankových vkladov do 100 000 €.</ItemDesc></ContentListItem>
        <ContentListItem><ItemLabel>Vzdelávanie</ItemLabel><ItemDesc>Program Erasmus+ a možnosť študovať na akejkoľvek vysokej škole v rámci EÚ.</ItemDesc></ContentListItem>
        <ContentListItem><ItemLabel>Životné prostredie</ItemLabel><ItemDesc>Podpora ochrany životného prostredia a právne záväzný cieľ klimatickej neutrality do roku 2050.</ItemDesc></ContentListItem>
        <ContentListItem><ItemLabel>Zdravie</ItemLabel><ItemDesc>Európska karta zdravotného poistenia — lekárska starostlivosť v celej EÚ za rovnakých podmienok.</ItemDesc></ContentListItem>
        <ContentListItem><ItemLabel>Bezpečnosť</ItemLabel><ItemDesc>Prísne bezpečnostné štandardy pre hračky, potraviny a lieky patria medzi najprísnejšie na svete.</ItemDesc></ContentListItem>
      </ContentList>
    </AccordionItem>
  </>
);


const Page3Content = ({ readSections, markRead }) => (
  <>
    <ModuleTitle>🚦 Príspevkový semafor</ModuleTitle>

    <AccordionItem
      title="Základné tri otázky"
      isRead={readSections.has('p3_s1')}
      onRead={() => markRead('p3_s1')}
    >
      <BodyText>
        Poďme začať so základnými troma otázkami, z ktorých sa každá farba semaforu skladá:
      </BodyText>
      <ContentList>
        <ContentListItem><ItemLabel>Kto profituje?</ItemLabel><ItemDesc>Keď si čítate príspevok, zastavte sa a spýtajte sa: Kto to napísal? Kto má záujem, aby ste verili konkrétnemu príspevku?</ItemDesc></ContentListItem>
        <ContentListItem><ItemLabel>Odkiaľ to pochádza?</ItemLabel><ItemDesc>Spýtajte sa: Vidím konkrétny zdroj? Meno autora? Organizáciu? Link na článok? Alebo je to len príspevok bez akéhokoľvek predloženia dôkazov?</ItemDesc></ContentListItem>
        <ContentListItem><ItemLabel>Je príspevok bez emócií presvedčivý?</ItemLabel><ItemDesc>Predstavte si príspevok bez výkričníkov, bez veľkých písmen, bez urgencií, bez dramatických fotiek. Zostáva presvedčivý? Alebo sa sila informácie príspevku rozpadá?</ItemDesc></ContentListItem>
      </ContentList>
      <BodyText>Tieto tri otázky spolu fungujú ako detektívny nástroj. Keď si ich položíte, môžete všimnúť zámer tvorcu príspevku.</BodyText>
    </AccordionItem>

    <AccordionItem
      title="🔴 Červená — znaky manipulatívneho príspevku"
      isRead={readSections.has('p3_s2')}
      onRead={() => markRead('p3_s2')}
    >
      <BodyText>Ak sa tvorca pokúša o manipuláciu, často si môžete všimnúť tieto znaky:</BodyText>
      <ContentList>
        <ContentListItem><ItemLabel>Kto profituje?</ItemLabel><ItemDesc>Autor sa skrýva: účet môže byť anonymný, bez histórie, bez fotky alebo s fotkou, ktorá ho anonymizuje, bez informácií. Čo chce? Vašu pozornosť a vašu emóciu. Ako profituje? Z vášho konania: zdieľania, lajkovania, komentovania — vášho strachu a úzkosti.</ItemDesc></ContentListItem>
        <ContentListItem><ItemLabel>Odkiaľ to pochádza?</ItemLabel><ItemDesc>Príspevok môže byť od anonymného autora, bez uvedenia inštitúcie alebo organizácie. Bez konkrétneho zdroja odkiaľ čerpal. Ak autor neuvedie zdroj, poskytne informáciu, ktorú si nikto bez dodatočného úsilia nemôže overiť.</ItemDesc></ContentListItem>
        <ContentListItem><ItemLabel>Je príspevok bez emócií presvedčivý?</ItemLabel><ItemDesc>Príspevok je zameraný na emócie: snaží sa vyvolať strach, úzkosť, hnev, vzrušenie alebo šok. S výkričníkmi a veľkými písmenami príspevok apeluje na urgenciu („zdieľaj kým to nevymažú!"). Bez emócií v príspevku ostáva iba prázdne tvrdenie: bez faktov, bez zdrojov.</ItemDesc></ContentListItem>
      </ContentList>
    </AccordionItem>

    <AccordionItem
      title="🟠 Oranžová — znaky neistého príspevku"
      isRead={readSections.has('p3_s3')}
      onRead={() => markRead('p3_s3')}
    >
      <BodyText>Ako aj na cestách, predtým ako prejdeme na zelenú je dôležité dať si pozor na premávku — v takomto prípade môže ísť o manipulatívny príspevok, ale aj o dôveryhodný:</BodyText>
      <ContentList>
        <ContentListItem>
          <ItemLabel>Kto profituje?</ItemLabel>
          <ItemDesc>Autor sa čiastočne predstavuje: poznáte meno, inštitúciu alebo organizáciu. Môže sa ale stať, že niektoré informácie chýbajú, nie sú úplné alebo prípadne vymyslené.</ItemDesc>
          <NestedList>
            <NestedItem>Ak autor uvádza meno, ale bez detailov o kvalifikácii — pýtajte sa: Čo ho kvalifikuje na to, aby o tomto hovoril?</NestedItem>
            <NestedItem>Ak autor uvádza inštitúciu, ale bez overenia či naozaj v nej pracuje — pýtajte sa: Dá sa toto overiť?</NestedItem>
            <NestedItem>Ak sa autor rozhodol vynechať informácie — pýtajte sa: Prečo? Je to zámerné?</NestedItem>
          </NestedList>
        </ContentListItem>
        <ContentListItem>
          <ItemLabel>Odkiaľ to pochádza?</ItemLabel>
          <ItemDesc>Zdroje sú uvedené, ale nie sú úplné — napríklad „podľa štúdie" alebo „americkí vedci zistili" bez presného odkazu.</ItemDesc>
          <NestedList>
            <NestedItem>Sú zdroje zámerne skryté alebo len nedostatočne uvedené? Skúste si vyhľadať originálny zdroj.</NestedItem>
            <NestedItem>Má fotografia/video zmysel v jej pôvodnom kontexte?</NestedItem>
            <NestedItem>Bol autor presný? Má text aj iné presné informácie (mená, dátumy, miesta)?</NestedItem>
          </NestedList>
        </ContentListItem>
        <ContentListItem>
          <ItemLabel>Je príspevok bez emócií presvedčivý?</ItemLabel>
          <ItemDesc>Príspevok má určitú emotívnosť, ale nie extrémnu. Fakty sú tu, ale sú zvýraznené vyberaním — autor si zvolil tie, ktoré podporujú jeho názor.</ItemDesc>
          <NestedList>
            <NestedItem>Chce ma autor informovať alebo presvedčiť?</NestedItem>
            <NestedItem>Dôveryhodný príspevok vám povie fakty, nechá rozhodnutie na vás. Manipulatívny príspevok vám povie „Teraz viete, čo je správne".</NestedItem>
            <NestedItem>Prečo sú emócie práve takéto? Sú mierne, pretože téma je objektívna? Alebo sú mierne, aby bol príspevok ťažšie rozpoznateľný ako manipulatívny?</NestedItem>
          </NestedList>
        </ContentListItem>
      </ContentList>
      <BodyText>
        Dôveryhodný príspevok bez kontextu môže byť mätúci. Ale keď autor prezentuje nepravdivé
        alebo čiastočne pravdivé informácie vybrané tak, aby podporili jeho tvrdenie, to je
        najnebezpečnejšia forma manipulácie, pretože vyzerá ako fakt.
      </BodyText>
    </AccordionItem>

    <AccordionItem
      title="🟢 Zelená — znaky dôveryhodného príspevku"
      isRead={readSections.has('p3_s4')}
      onRead={() => markRead('p3_s4')}
    >
      <BodyText>Ak sa tvorca pokúša informovať o faktoch, často si môžete všimnúť tieto znaky:</BodyText>
      <ContentList>
        <ContentListItem><ItemLabel>Kto profituje?</ItemLabel><ItemDesc>Autor sa predstavuje — viete, kto je, prípadne v ktorej inštitúcii alebo organizácii pôsobí. V takýchto prípadoch často nejde o profit, ide o predanie informácie alebo vedomostí. Autor chce, aby ste boli informovaní, nie aby ste reagovali.</ItemDesc></ContentListItem>
        <ContentListItem><ItemLabel>Odkiaľ to pochádza?</ItemLabel><ItemDesc>Autora vieme identifikovať buď ako ľudskú osobu, inštitúciu alebo organizáciu. Zdroje sú jasne označené, poskytne nám odkazy alebo citácie. Fotografie a videá majú kontext: kedy, kde, kto ich urobil.</ItemDesc></ContentListItem>
        <ContentListItem><ItemLabel>Je príspevok bez emócií presvedčivý?</ItemLabel><ItemDesc>Fakty hovoria samé za seba. Informácie, tvrdenia, čísla a zdroje sú presvedčivé aj v pokojnom, neutrálnom tóne bez urgencií. Autor nemá potrebu dramatizácie — chce, aby ste boli informovaní, nie aby ste reagovali.</ItemDesc></ContentListItem>
      </ContentList>
    </AccordionItem>
  </>
);


// ── Konfigurácia stránok ──────────────────────────────────────────────────────


const REQUIRED_SECTIONS = [
  ['p1_s1', 'p1_s2', 'p1_s3', 'p1_s4', 'p1_s5', 'p1_s6'],
  ['p2_s1', 'p2_s2', 'p2_s3'],
  ['p3_s1', 'p3_s2', 'p3_s3', 'p3_s4'],
];


// ✅ NOVÉ — povinné nahrávky per stránka (prázdne pole = žiadna povinná)
const REQUIRED_AUDIOS = [
  ['p1_s1_audio'], // strana 0 — testovacia nahrávka je povinná
  [],              // strana 1
  [],              // strana 2
];

// ✅ Uprav PAGES content funkcie — pridaj playedAudios + markAudioPlayed
const PAGES = [
  {
    key: 'page0',
    title: 'Modul 1 — Konšpiračné presvedčenia',
    subtitle: 'Informačné očkovanie',
    content: (readSections, markRead, playedAudios, markAudioPlayed) =>
      <Page1Content readSections={readSections} markRead={markRead}
                    playedAudios={playedAudios} markAudioPlayed={markAudioPlayed} />,
    detectiveTipIntro: `
      <p><strong>S tvrdeniami, ktoré ste v predošlej časti mohli vidieť, sa pravdepodobne stretávate v bežnom živote každý deň.</strong></p>
      <p>Často sa vyskytujú na sociálnych sieťach v podobe rôznych príspevkov, komentárov, videí... každý môže mať inú formu. Ale všetky majú jednu vec spoločnú: <strong>chcú vás o niečom presvedčiť.</strong></p>
      <p>Konšpiračné presvedčenia hovoria o tom, že tajné skupiny manipulujú udalosti, spoločnosť alebo nám skrývajú „skutočnú pravdu". Ale prečo nám konšpiračné presvedčenia tak ľahko „padnú do siete"? <strong>Nie je to preto, že sme hlúpi</strong> — naše mozgy sú navrhnuté hľadať vzory a zmysel, ale niekedy hľadajú vzory a zmysel aj tam, kde neexistujú.</p>
      <p>Poďme sa spolu pozrieť na to, prečo nám konšpiračné presvedčenia tak ľahko padnú do siete, ako ich identifikovať a ako sa voči nim brániť.</p>
    `,
  },
  {
    key: 'page1',
    title: 'Modul 2 — Inštitúcie EÚ',
    subtitle: 'Budovanie dôvery',
    content: (readSections, markRead, playedAudios, markAudioPlayed) =>
      <Page2Content readSections={readSections} markRead={markRead}
                    playedAudios={playedAudios} markAudioPlayed={markAudioPlayed} />,
    detectiveTipIntro: `
      <p><strong>Prvú časť máte za sebou, nezabudnite si dať krátku prestávku a potom môžeme pokračovať.</strong></p>
      <p>V prvej časti sme sa zaoberali konšpiračnými presvedčeniami. Teraz sa poďme spolu pozrieť na <strong>inštitúcie EÚ</strong> — čo robia, ako fungujú a čo nám prinášajú.</p>
      <p>Európska únia ovplyvňuje váš každodenný život viac, než si možno uvedomujete. <strong>Oddýchnutý? Poďme na to!</strong></p>
    `,
  },
  {
    key: 'page2',
    title: 'Modul 3 — Príspevkový semafor',
    subtitle: 'Bonus',
    content: (readSections, markRead, playedAudios, markAudioPlayed) =>
      <Page3Content readSections={readSections} markRead={markRead}
                    playedAudios={playedAudios} markAudioPlayed={markAudioPlayed} />,
    detectiveTipIntro: `
      <p><strong>V tomto bonuse sa vrátime kúsok späť.</strong></p>
      <p>Naše mozgy sú prirodzene navrhnuté hľadať vzory. To naším predkom zachraňovalo život. Ale náš mozog sa stal tak dobrým v hľadaní vzorov, že ich niekedy vidí aj tam, kde neexistujú. <strong>Obzvlášť na sociálnych sieťach.</strong></p>
      <p>Ukážem vám jednoduchý nástroj — <strong>Príspevkový semafor</strong> — ktorý vám pomôže vidieť sociálne siete úplne inak.</p>
    `,
  },
];



const TOTAL_PAGES  = PAGES.length;
const COMPONENT_ID = 'mission3_intervention_b';


// ═══════════════════════════════════════════════════════════════════════════════
// Hlavný komponent
// ═══════════════════════════════════════════════════════════════════════════════


const Intervention2B = () => {
  const navigate                  = useNavigate();
  const { dataManager, userId }   = useUserStats();
  const responseManager           = useMemo(() => getResponseManager(dataManager), [dataManager]);
  const [searchParams]            = useSearchParams();
  const initialPage               = parseInt(searchParams.get('page') || '0', 10);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const startTime                 = useRef(Date.now());
  const savingAudioRef            = useRef(false); // ✅ NOVÉ

  const [readSections,  setReadSections]  = useState(() => PAGES.map(() => new Set()));
  const [playedAudios,  setPlayedAudios]  = useState({});  // ✅ NOVÉ — { [audioId]: true }

  // Guard
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

  // ✅ NOVÉ — uloží audioId do stavu aj do DB
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
      console.warn('[Intervention2B] audio save failed:', e);
    } finally {
      savingAudioRef.current = false;
    }
  }, [userId, responseManager]);

  const allRequiredRead   = REQUIRED_SECTIONS[currentPage].every(k => readSections[currentPage].has(k));
  const allRequiredPlayed = REQUIRED_AUDIOS[currentPage].every(id => playedAudios[id]);  // ✅ NOVÉ
  const canContinue       = allRequiredRead && allRequiredPlayed;                         // ✅ NOVÉ

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

  const page            = PAGES[currentPage];
  const isLastPage      = currentPage === TOTAL_PAGES - 1;
  const remainingSect   = REQUIRED_SECTIONS[currentPage].filter(k => !readSections[currentPage].has(k)).length;
  const remainingAudio  = REQUIRED_AUDIOS[currentPage].filter(id => !playedAudios[id]).length; // ✅ NOVÉ

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
            style={{ textAlign: "justify" }}
          />

          {/* ✅ Predaj playedAudios + markAudioPlayed do content */}
          {page.content(readSections[currentPage], markRead, playedAudios, markAudioPlayed)}

          <ButtonContainer>
            <StyledButton
              accent
              onClick={handleNext}
              disabled={isSubmitting || !canContinue}
            >
              {!allRequiredRead
                ? `Otvor všetky sekcie (zostáva: ${remainingSect})`
                : !allRequiredPlayed
                  ? `Vypočuj nahrávky (zostáva: ${remainingAudio})`   // ✅ NOVÉ
                  : isSubmitting
                    ? 'Ukladám...'
                    : isLastPage
                      ? '🎓 Dokončiť tréning!'
                      : 'Pokračovať ďalej →'}
            </StyledButton>
          </ButtonContainer>
        </Card>
      </Container>
    </Layout>
  );
};

export default Intervention2B;

