import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import {
  BrandBackground,
  CheckRow,
  ContactLine,
  CtaButton,
  KenBurns,
  Logo,
  Scrim,
  SlideIn,
  Speaker,
  SpokenLine,
  useLayout,
} from "./components";
import { C, FONT_DISPLAY, FONT_SANS } from "./theme";
import { Line, VoiceLine } from "./voice";

// Scènes « adresse directe » : quelqu'un parle aux propriétaires, phrase par phrase.
// Le texte affiché est exactement celui de la voix off (voir VOIX-OFF.md).


const Column: React.FC<{ children: React.ReactNode; align?: "center" | "left"; gap?: number }> = ({ children, align = "center", gap = 34 }) => {
  const L = useLayout();
  return (
    <AbsoluteFill
      style={{
        padding: `${L.padTop}px ${L.padX}px ${L.padBottom}px`,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: align === "center" ? "center" : "flex-start",
        textAlign: align,
        gap,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/** Une phrase dite face caméra, sur une photo. */
export const SpeakScene: React.FC<{ photo: string; l: Line; position?: string }> = ({ photo, l, position }) => {
  const L = useLayout();
  return (
    <AbsoluteFill>
      <KenBurns src={photo} zoom={[1.03, 1.1]} position={position} />
      <Scrim strength={0.66} />
      <Column>
        <Speaker talkingUntil={l.end} />
        <SpokenLine text={l.show} starts={l.starts} size={L.fs(96, 80, 104)} maxWidth={L.landscape ? 1500 : undefined} />
      </Column>
      <VoiceLine id={l.id} />
    </AbsoluteFill>
  );
};

/** Logo + phrase, sur fond clair. */
export const SpeakLogoScene: React.FC<{ l: Line; chain?: React.ReactNode }> = ({ l, chain }) => {
  const L = useLayout();
  return (
    <AbsoluteFill>
      <BrandBackground light />
      <Column gap={L.fs(60, 44, 50)}>
        <Logo variant="color" width={L.fs(760, 640, 700)} />
        <SpokenLine text={l.show} starts={l.starts} size={L.fs(84, 72, 80)} color={C.ink} accent={C.navy} maxWidth={L.landscape ? 1500 : undefined} />
        {chain ? <div style={{ transform: `scale(${L.fs(0.62, 0.62, 1.25)})`, marginTop: L.fs(10, 10, 30) }}>{chain}</div> : null}
      </Column>
      <VoiceLine id={l.id} />
    </AbsoluteFill>
  );
};

/** Un service : phrase dite à gauche, interface animée à droite (paysage). */
export const SpeakBenefitScene: React.FC<{
  photo: string;
  l: Line;
  sub?: string;
  widget: React.ReactNode;
  /** Remplace la photo de fond (ex. photo qui reprend ses couleurs). */
  background?: React.ReactNode;
  overlay?: React.ReactNode;
}> = ({ photo, l, sub, widget, background, overlay }) => {
  const L = useLayout();
  const textBlock = (
    <div style={{ display: "flex", flexDirection: "column", gap: 30, alignItems: L.landscape ? "flex-start" : "center" }}>
      <Speaker talkingUntil={l.end} />
      <SpokenLine text={l.show} starts={l.starts} size={L.fs(80, 62, 82)} align={L.landscape ? "left" : "center"} />
      {sub ? <SlideIn delay={Math.min(l.end - 6, 30)} dist={16}>
        <div style={{ fontFamily: FONT_SANS, fontSize: L.fs(36, 30, 36), lineHeight: 1.35, color: "rgba(255,255,255,0.88)", textAlign: L.landscape ? "left" : "center" }}>
          {sub}
        </div>
      </SlideIn> : null}
    </div>
  );
  const scale = L.fs(1.1, 0.85, 1.2);
  const w = <div style={{ transform: `scale(${scale})`, transformOrigin: L.landscape ? "center right" : "center" }}>{widget}</div>;
  return (
    <AbsoluteFill>
      {background ?? <KenBurns src={photo} zoom={[1.03, 1.1]} />}
      <Scrim strength={0.7} direction={L.landscape ? "left" : "center"} />
      {overlay}
      <AbsoluteFill
        style={{
          padding: `${L.padTop}px ${L.padX}px ${L.padBottom}px`,
          display: L.landscape ? "grid" : "flex",
          gridTemplateColumns: L.landscape ? "860px 1fr" : undefined,
          flexDirection: "column",
          alignItems: "center",
          justifyItems: L.landscape ? "start" : undefined,
          justifyContent: "center",
          gap: L.fs(70, 40, 60),
        }}
      >
        {L.portrait ? (
          <>
            {w}
            {textBlock}
          </>
        ) : (
          <>
            {textBlock}
            <div style={{ justifySelf: "end" }}>{w}</div>
          </>
        )}
      </AbsoluteFill>
      <VoiceLine id={l.id} />
    </AbsoluteFill>
  );
};

/** L'offre : la phrase puis le tarif. */
export const SpeakOfferScene: React.FC<{ l: Line }> = ({ l }) => {
  const L = useLayout();
  // Le tarif apparaît quand la voix dit « vingt pour cent » (8e mot).
  const after = l.starts[7] ?? l.end;
  return (
    <AbsoluteFill>
      <BrandBackground />
      <Column gap={L.fs(50, 30, 44)}>
        <Speaker talkingUntil={l.end} />
        <SpokenLine text={l.show} starts={l.starts} size={L.fs(84, 66, 84)} />
        <SlideIn delay={after - 2} dist={24}>
          <div style={{ display: "flex", flexDirection: L.landscape ? "row" : "column", alignItems: "center", gap: L.fs(30, 20, 80), marginTop: 10 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 18 }}>
              <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: L.fs(200, 150, 190), color: C.white, lineHeight: 1 }}>
                20<span style={{ color: C.sky }}>&nbsp;%</span>
              </span>
              <span style={{ fontFamily: FONT_SANS, fontWeight: 700, fontSize: L.fs(38, 32, 38), color: C.sky }}>tout compris</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 22, alignItems: "flex-start" }}>
              <CheckRow label="0 € de frais de mise en place" delay={after} size={L.fs(40, 32, 38)} />
              <CheckRow label="Sans engagement de durée" delay={after + 6} size={L.fs(40, 32, 38)} />
            </div>
          </div>
        </SlideIn>
      </Column>
      <VoiceLine id={l.id} />
    </AbsoluteFill>
  );
};

/** Fin : phrase, bouton, contact ; le logo arrive sur l'accord final (`hit`). */
export const SpeakCtaScene: React.FC<{ l: Line; hit: number; photo?: string }> = ({ l, hit, photo = "paris-coucher-de-soleil.jpg" }) => {
  const L = useLayout();
  const after = l.end;
  return (
    <AbsoluteFill>
      <KenBurns src={photo} zoom={[1.03, 1.1]} />
      <Scrim strength={0.74} />
      <Column gap={L.fs(40, 26, 34)}>
        <div style={{ height: L.fs(150, 120, 130), display: "flex", alignItems: "center" }}>
          <Sequence from={hit} layout="none">
            <Logo width={L.fs(560, 440, 470)} />
          </Sequence>
        </div>
        <Speaker talkingUntil={after} />
        <SpokenLine text={l.show} starts={l.starts} size={L.fs(96, 76, 96)} />
        <SlideIn delay={after - 4} dist={16}>
          <div style={{ fontFamily: FONT_SANS, fontSize: L.fs(38, 30, 36), color: "rgba(255,255,255,0.9)" }}>Réponse sous 24 h · sans engagement</div>
        </SlideIn>
        <CtaButton label="Mon estimation gratuite" delay={after + 4} size={L.fs(48, 40, 46)} />
        <ContactLine size={L.fs(38, 30, 34)} delay={after + 12} />
      </Column>
      <VoiceLine id={l.id} />
    </AbsoluteFill>
  );
};
