import React from "react";
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from "remotion";
import {
  BEAT,
  BrandBackground,
  CheckRow,
  ContactLine,
  Counter,
  CtaButton,
  Eyebrow,
  Flash,
  KenBurns,
  Logo,
  Punch,
  Scrim,
  SlamText,
  SlideIn,
  useBeatPulse,
  useLayout,
} from "./components";
import { C, FONT_DISPLAY, FONT_SANS } from "./theme";

const Frame: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => {
  const L = useLayout();
  return (
    <AbsoluteFill
      style={{
        padding: `${L.padTop}px ${L.padX}px ${L.padBottom}px`,
        justifyContent: "center",
        alignItems: "center",
        ...style,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/** Accroche : photo + question qui claque. */
export const HookScene: React.FC<{ photo: string; eyebrow: string; text: string }> = ({ photo, eyebrow, text }) => {
  const L = useLayout();
  return (
    <AbsoluteFill>
      <KenBurns src={photo} zoom={[1.35, 1.1]} />
      <Scrim strength={0.62} />
      <Frame style={{ gap: 36 }}>
        <Eyebrow size={L.fs(30, 28, 30)}>{eyebrow}</Eyebrow>
        <SlamText text={text} size={L.fs(118, 100, 132)} delay={3} stagger={3} />
      </Frame>
      <Flash strength={0.7} />
    </AbsoluteFill>
  );
};

/** Logo sur fond clair + promesse. */
export const LogoScene: React.FC<{ text: string }> = ({ text }) => {
  const L = useLayout();
  return (
    <AbsoluteFill>
      <BrandBackground light />
      <Frame style={{ gap: L.fs(70, 50, 50) }}>
        <Logo variant="color" width={L.fs(820, 700, 760)} />
        <SlamText text={text} size={L.fs(92, 80, 84)} color={C.ink} accent={C.navy} delay={12} stagger={3} />
      </Frame>
      <Flash strength={0.9} />
    </AbsoluteFill>
  );
};

/** Un service : photo plein cadre, interface animée et titre. */
export const BenefitScene: React.FC<{
  photo: string;
  index: number;
  total: number;
  title: string;
  sub: string;
  widget: React.ReactNode;
  position?: string;
}> = ({ photo, index, total, title, sub, widget, position }) => {
  const L = useLayout();
  const text = (
    <div style={{ display: "flex", flexDirection: "column", gap: L.fs(22, 14, 24), alignItems: L.landscape ? "flex-start" : "center", maxWidth: L.landscape ? 820 : undefined }}>
      <Punch delay={2} from={2}>
        <div
          style={{
            fontFamily: FONT_SANS,
            fontWeight: 700,
            fontSize: L.fs(28, 24, 28),
            letterSpacing: "0.14em",
            color: C.ink,
            background: C.sky,
            padding: "10px 22px",
            borderRadius: 999,
          }}
        >
          {String(index).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </div>
      </Punch>
      <SlamText text={title} size={L.fs(84, 64, 88)} align={L.landscape ? "left" : "center"} delay={4} stagger={2} />
      <SlideIn delay={12} dist={40}>
        <div
          style={{
            fontFamily: FONT_SANS,
            fontSize: L.fs(38, 32, 38),
            lineHeight: 1.3,
            color: "rgba(255,255,255,0.9)",
            textAlign: L.landscape ? "left" : "center",
          }}
        >
          {sub}
        </div>
      </SlideIn>
    </div>
  );
  const scale = L.fs(1.15, 0.88, 1.28);
  const w = (
    <div style={{ transform: `scale(${scale})`, transformOrigin: L.landscape ? "center right" : "center", margin: L.portrait ? "60px 0" : 0 }}>
      {widget}
    </div>
  );
  return (
    <AbsoluteFill>
      <KenBurns src={photo} zoom={[1.3, 1.08]} pan={[0, index % 2 ? -30 : 30]} position={position} />
      <Scrim strength={0.68} direction={L.landscape ? "left" : "center"} />
      <Frame
        style={{
          flexDirection: L.landscape ? "row" : "column",
          justifyContent: L.landscape ? "space-between" : "center",
          gap: L.fs(60, 34, 60),
        }}
      >
        {L.landscape ? (
          <>
            {text}
            {w}
          </>
        ) : L.portrait ? (
          <>
            {w}
            {text}
          </>
        ) : (
          <>
            {text}
            {w}
          </>
        )}
      </Frame>
    </AbsoluteFill>
  );
};

/** Enchaînement ultra-rapide : un mot et une photo par temps. */
export const MontageScene: React.FC<{ items: { photo: string; word: string }[] }> = ({ items }) => {
  const L = useLayout();
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      {items.map((it, i) => (
        <Sequence key={i} from={i * BEAT} durationInFrames={i === items.length - 1 ? BEAT + 6 : BEAT}>
          <MontageShot photo={it.photo} word={it.word} i={i} size={L.fs(150, 130, 170)} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

const MontageShot: React.FC<{ photo: string; word: string; i: number; size: number }> = ({ photo, word, i, size }) => {
  const frame = useCurrentFrame();
  const rot = interpolate(frame, [0, BEAT], [i % 2 ? -2 : 2, 0], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ transform: `rotate(${rot}deg) scale(1.04)` }}>
      <KenBurns src={photo} zoom={[1.35, 1.15]} pulse={false} />
      <Scrim strength={0.55} />
      <Frame>
        <Punch from={2.2}>
          <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: size, color: C.white, letterSpacing: "-0.02em", textShadow: "0 6px 40px rgba(0,0,0,0.4)" }}>
            {word}
            <span style={{ color: C.sky }}>.</span>
          </div>
        </Punch>
      </Frame>
      <Flash strength={0.45} />
    </AbsoluteFill>
  );
};

export const ReviewScene: React.FC<{ widget: React.ReactNode }> = ({ widget }) => {
  const L = useLayout();
  return (
    <AbsoluteFill>
      <BrandBackground />
      <Frame style={{ flexDirection: L.landscape ? "row" : "column", gap: L.fs(60, 34, 90) }}>
        <SlamText
          text={L.landscape ? "Des voyageurs\n*ravis*,\ndes avis\n*5 étoiles*" : "Des voyageurs *ravis*,\ndes avis *5 étoiles*"}
          size={L.fs(84, 66, 92)}
          align={L.landscape ? "left" : "center"}
          stagger={2}
        />
        <div style={{ transform: `scale(${L.fs(1.15, 0.9, 1.1)})` }}>{widget}</div>
      </Frame>
    </AbsoluteFill>
  );
};

export const OfferScene: React.FC = () => {
  const L = useLayout();
  const beat = useBeatPulse(6);
  const checks = (
    <div style={{ display: "flex", flexDirection: "column", gap: L.fs(30, 20, 30), alignItems: "flex-start" }}>
      <CheckRow label="0 € de frais de mise en place" delay={14} size={L.fs(46, 38, 46)} />
      <CheckRow label="Sans engagement de durée" delay={20} size={L.fs(46, 38, 46)} />
      <CheckRow label="Vous ne payez que si c'est loué" delay={26} size={L.fs(46, 38, 46)} />
    </div>
  );
  return (
    <AbsoluteFill>
      <BrandBackground />
      <Frame style={{ flexDirection: L.landscape ? "row" : "column", gap: L.fs(60, 34, 120) }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Eyebrow size={L.fs(30, 26, 30)}>Un seul tarif, tout compris</Eyebrow>
          <div
            style={{
              fontFamily: FONT_DISPLAY,
              fontWeight: 700,
              fontSize: L.fs(340, 250, 330),
              lineHeight: 1,
              color: C.white,
              transform: `scale(${1 + beat * 0.03})`,
            }}
          >
            <Counter from={0} to={20} delay={0} duration={14} />
            <span style={{ color: C.sky }}>&nbsp;%</span>
          </div>
          <SlideIn delay={8} dist={30}>
            <div style={{ fontFamily: FONT_SANS, fontSize: L.fs(42, 36, 40), color: C.white, fontWeight: 500 }}>
              des revenus encaissés
            </div>
          </SlideIn>
        </div>
        {checks}
      </Frame>
      <Flash strength={0.5} />
    </AbsoluteFill>
  );
};

/** Fin : titre, bouton, contact. Le logo claque sur l'accord final de la musique (`hit`). */
export const CtaScene: React.FC<{ title: string; button: string; sub?: string; photo?: string; hit: number }> = ({
  title,
  button,
  sub = "Réponse sous 24 h · sans engagement",
  photo = "paris-coucher-de-soleil.jpg",
  hit,
}) => {
  const L = useLayout();
  return (
    <AbsoluteFill>
      <KenBurns src={photo} zoom={[1.25, 1.05]} />
      <Scrim strength={0.76} />
      <Frame style={{ gap: L.fs(46, 28, 34) }}>
        <Sequence from={hit} layout="none">
          <Logo width={L.fs(600, 470, 500)} />
        </Sequence>
        <SlamText text={title} size={L.fs(100, 78, 92)} delay={0} stagger={3} />
        <SlideIn delay={10} dist={30}>
          <div style={{ fontFamily: FONT_SANS, fontSize: L.fs(40, 32, 36), color: "rgba(255,255,255,0.9)", textAlign: "center" }}>{sub}</div>
        </SlideIn>
        <CtaButton label={button} delay={14} size={L.fs(50, 42, 46)} />
        <ContactLine size={L.fs(40, 32, 36)} delay={20} />
      </Frame>
      <Flash at={hit} strength={0.6} />
    </AbsoluteFill>
  );
};

/** Ouverture de la publicité de 6 s : accroche + logo dans le même plan. */
export const BumperOpen: React.FC = () => {
  const L = useLayout();
  return (
    <AbsoluteFill>
      <KenBurns src="hero-salon.jpg" zoom={[1.35, 1.12]} />
      <Scrim strength={0.66} />
      <Frame style={{ gap: L.fs(50, 34, 40) }}>
        <Logo width={L.fs(620, 500, 520)} />
        <SlamText text={"Votre location Airbnb\n*gérée* *de* *A* *à* *Z*"} size={L.fs(100, 82, 96)} delay={6} stagger={2} />
      </Frame>
      <Flash strength={0.7} />
    </AbsoluteFill>
  );
};

