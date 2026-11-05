import React from "react";
import { AbsoluteFill } from "remotion";
import {
  BrandBackground,
  CheckRow,
  CtaScene,
  KenBurns,
  Reveal,
  Scrim,
  useLayout,
  WordReveal,
} from "../components";
import { Scene, SceneSeries, seriesDuration } from "../series";
import { Offer } from "./WhySpinelle";
import { C, FONT_SANS } from "../theme";

// Offre : tout ce qui est inclus, puis le prix unique de 20 %.

const Question: React.FC = () => {
  const L = useLayout();
  return (
    <AbsoluteFill>
      <KenBurns src="cles-entree.jpg" zoom={[1.22, 1.06]} />
      <Scrim strength={0.66} />
      <AbsoluteFill
        style={{
          padding: `${L.safeTop}px ${L.padX}px ${L.safeBottom}px`,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <WordReveal
          text={"Combien coûte\nune conciergerie\n*Airbnb* *à* *Paris* ?"}
          size={L.vertical ? 108 : 92}
          stagger={4}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const INCLUDED = [
  "Photos professionnelles",
  "Annonces Airbnb, Booking, Abritel",
  "Prix ajustés chaque jour",
  "Messages voyageurs 7j/7",
  "Arrivées et départs",
  "Ménage hôtelier et linge",
  "Maintenance et petits travaux",
  "Déclarations et taxe de séjour",
  "Récapitulatif mensuel",
];

const Included: React.FC = () => {
  const L = useLayout();
  const size = L.vertical ? 44 : 31;
  return (
    <AbsoluteFill>
      <BrandBackground />
      <AbsoluteFill
        style={{
          padding: `${L.safeTop - (L.vertical ? 30 : 30)}px ${L.padX}px ${L.safeBottom - (L.vertical ? 60 : 30)}px`,
          justifyContent: "center",
          gap: L.vertical ? 50 : 28,
        }}
      >
        <WordReveal text="Chez nous, *tout* est inclus :" size={L.vertical ? 74 : 60} align="left" stagger={2} />
        <div style={{ display: "flex", flexDirection: "column", gap: L.vertical ? 24 : 14 }}>
          {INCLUDED.map((item, i) => (
            <CheckRow key={item} label={item} delay={12 + i * 7} size={size} />
          ))}
        </div>
        <Reveal delay={12 + INCLUDED.length * 7 + 4}>
          <div style={{ fontFamily: FONT_SANS, fontSize: L.vertical ? 36 : 30, color: C.sky, fontWeight: 700 }}>
            Sans abonnement. Sans frais cachés.
          </div>
        </Reveal>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const scenes: Scene[] = [
  { d: 75, el: <Question />, t: "wipe" },
  { d: 130, el: <Included />, t: "slide" },
  { d: 115, el: <Offer />, t: "fade" },
  { d: 150, el: <CtaScene title={"Vous ne payez\nque *si* *c'est* *loué*"} button="Demander mon audit" /> },
];

export const TOUT_COMPRIS_DURATION = seriesDuration(scenes);

export const ToutCompris: React.FC = () => <SceneSeries scenes={scenes} />;
