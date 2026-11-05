import React from "react";
import { AbsoluteFill, Easing, Img, Sequence, interpolate, useCurrentFrame } from "remotion";
import { BrandBackground, CheckRow, ContactLine, CtaButton, Icon, Scrim, SlideIn, SpokenLine, useLayout, useSpring } from "./components";
import { C, FONT_DISPLAY, FONT_SANS, img } from "./theme";
import { Line, VoiceLine } from "./voice";

// Scènes de la publicité avec voix off. Le texte affiché est celui de la voix
// (voice/script.json) et chaque mot apparaît quand il est prononcé.

const ease = { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) } as const;

const Column: React.FC<{ children: React.ReactNode; gap?: number }> = ({ children, gap = 34 }) => {
  const L = useLayout();
  return (
    <AbsoluteFill
      style={{
        padding: `${L.padTop}px ${L.padX}px ${L.padBottom}px`,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        gap,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/** Ouverture « cinéma » : bandes noires qui s'ouvrent et caméra qui se pose. */
export const CinemaOpen: React.FC = () => {
  const frame = useCurrentFrame();
  const L = useLayout();
  const p = interpolate(frame, [0, 16], [0, 1], ease);
  const bar = (1 - p) * L.height * 0.5;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: bar, background: C.ink }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: bar, background: C.ink }} />
    </AbsoluteFill>
  );
};

/** Phrase à gauche, visuel animé à droite (paysage) ; empilés sinon. */
export const SpeakBenefitScene: React.FC<{
  photo?: string;
  l: Line;
  sub?: string;
  widget: React.ReactNode;
  background: React.ReactNode;
  overlay?: React.ReactNode;
}> = ({ l, sub, widget, background, overlay }) => {
  const L = useLayout();
  const textBlock = (
    <div style={{ display: "flex", flexDirection: "column", gap: 30, alignItems: L.landscape ? "flex-start" : "center" }}>
      <SpokenLine text={l.show} starts={l.starts} size={L.fs(84, 64, 90)} align={L.landscape ? "left" : "center"} />
      {sub ? (
        <SlideIn delay={Math.min(l.end - 4, 26)} dist={16}>
          <div style={{ fontFamily: FONT_SANS, fontSize: L.fs(36, 30, 36), lineHeight: 1.35, color: "rgba(255,255,255,0.88)", textAlign: L.landscape ? "left" : "center" }}>
            {sub}
          </div>
        </SlideIn>
      ) : null}
    </div>
  );
  const w = <div style={{ transform: `scale(${L.fs(1.1, 0.85, 1.2)})`, transformOrigin: L.landscape ? "center right" : "center" }}>{widget}</div>;
  return (
    <AbsoluteFill>
      {background}
      <Scrim strength={0.7} direction={L.landscape ? "left" : "center"} />
      {overlay}
      <AbsoluteFill
        style={{
          padding: `${L.padTop}px ${L.padX}px ${L.padBottom}px`,
          display: L.landscape ? "grid" : "flex",
          gridTemplateColumns: L.landscape ? "880px 1fr" : undefined,
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

/** Logo dévoilé par un cercle qui s'ouvre, puis la phrase et la chaîne de services. */
export const SpeakLogoScene: React.FC<{ l: Line; chain?: React.ReactNode }> = ({ l, chain }) => {
  const L = useLayout();
  const frame = useCurrentFrame();
  const r = interpolate(frame, [0, 16], [0, 75], ease);
  return (
    <AbsoluteFill>
      <BrandBackground light />
      <Column gap={L.fs(56, 40, 46)}>
        <div style={{ clipPath: `circle(${r}% at 50% 50%)` }}>
          <Img src={img("logo.png")} style={{ width: L.fs(760, 640, 700), display: "block" }} />
        </div>
        <SpokenLine text={l.show} starts={l.starts} size={L.fs(84, 72, 84)} color={C.ink} accent={C.navy} maxWidth={L.landscape ? 1500 : undefined} />
        {chain ? <div style={{ transform: `scale(${L.fs(0.62, 0.62, 1.25)})`, marginTop: L.fs(10, 10, 30) }}>{chain}</div> : null}
      </Column>
      <VoiceLine id={l.id} />
    </AbsoluteFill>
  );
};

type Tile = { photo: string; icon: string; label: string };

/**
 * Montage en mosaïque : chaque service s'ouvre dans sa case au moment où il est dit,
 * puis chaque case reçoit sa coche ; la phrase reste au centre dans un panneau.
 */
export const SpeakGridScene: React.FC<{ l: Line; tiles: Tile[] }> = ({ l, tiles }) => {
  const L = useLayout();
  const frame = useCurrentFrame();
  const done = l.starts[tiles.length] ?? l.end;
  const zoomOut = interpolate(frame, [done, done + 20], [1, 0.94], ease);
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      <AbsoluteFill
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gridTemplateRows: "1fr 1fr",
          gap: 10,
          padding: 10,
          transform: `scale(${zoomOut})`,
        }}
      >
        {tiles.map((t, i) => {
          const at = (l.starts[i] ?? 0) - 2;
          const open = interpolate(frame, [at, at + 12], [0, 1], ease);
          const tick = useSpringAt(done + i * 3);
          return (
            <div key={t.label} style={{ position: "relative", overflow: "hidden", borderRadius: 18, background: C.navy }}>
              <div style={{ position: "absolute", inset: 0, clipPath: `inset(${(1 - open) * 50}% ${(1 - open) * 50}% round 18px)` }}>
                <Img
                  src={img(t.photo)}
                  style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${1.25 - 0.15 * open + interpolate(frame, [at, at + 120], [0, 0.06], ease)})` }}
                />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(17,29,48,0.75), rgba(17,29,48,0.1) 55%)" }} />
                <div
                  style={{
                    position: "absolute",
                    left: 28,
                    bottom: 26,
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "12px 24px 12px 14px",
                    borderRadius: 999,
                    background: C.white,
                    fontFamily: FONT_SANS,
                    fontWeight: 700,
                    fontSize: 30,
                    color: C.navy,
                    transform: `translateY(${(1 - open) * 30}px)`,
                    opacity: open,
                  }}
                >
                  <div style={{ width: 46, height: 46, borderRadius: 99, background: C.sand, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon name={t.icon} size={26} color={C.navy} strokeWidth={2.4} />
                  </div>
                  {t.label}
                </div>
                <div
                  style={{
                    position: "absolute",
                    right: 26,
                    top: 24,
                    width: 64,
                    height: 64,
                    borderRadius: 99,
                    background: C.sky,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transform: `scale(${tick})`,
                  }}
                >
                  <Icon name="check" size={38} color={C.ink} strokeWidth={3.4} />
                </div>
              </div>
            </div>
          );
        })}
      </AbsoluteFill>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div
          style={{
            padding: L.landscape ? "42px 64px" : L.portrait ? "40px 50px" : "30px 36px",
            borderRadius: 32,
            background: "rgba(17,29,48,0.88)",
            border: "1px solid rgba(152,204,235,0.35)",
            boxShadow: "0 40px 100px -20px rgba(0,0,0,0.6)",
            maxWidth: L.fs(900, 860, 1240),
          }}
        >
          <SpokenLine text={l.show} starts={l.starts} size={L.fs(70, 56, 74)} />
        </div>
      </AbsoluteFill>
      <VoiceLine id={l.id} />
    </AbsoluteFill>
  );
};

const useSpringAt = (delay: number) => useSpring(delay, { damping: 200, stiffness: 160 });

/** L'offre : phrase et garanties à gauche, jauge « 20 % » qui se dessine à droite. */
export const SpeakOfferScene: React.FC<{ l: Line }> = ({ l }) => {
  const L = useLayout();
  const frame = useCurrentFrame();
  // La jauge se dessine quand la voix dit « vingt pour cent » (8e mot).
  const at = l.starts[7] ?? l.end;
  const draw = interpolate(frame, [at - 2, at + 22], [0, 1], ease);
  const ring = useSpring(at - 10, { damping: 200, stiffness: 110 });
  const R = 190;
  const circ = 2 * Math.PI * R;
  const gauge = (
    <div style={{ position: "relative", width: 2 * R + 60, height: 2 * R + 60, opacity: ring, transform: `scale(${0.9 + 0.1 * ring})` }}>
      <svg width={2 * R + 60} height={2 * R + 60} style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}>
        <circle cx={R + 30} cy={R + 30} r={R} fill="none" stroke="rgba(152,204,235,0.18)" strokeWidth={26} />
        <circle cx={R + 30} cy={R + 30} r={R} fill="none" stroke={C.sky} strokeWidth={26} strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - 0.2 * draw)} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 150, color: C.white, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
          {Math.round(20 * draw)}
          <span style={{ color: C.sky }}>&nbsp;%</span>
        </div>
        <div style={{ fontFamily: FONT_SANS, fontWeight: 700, fontSize: 32, color: C.sky, marginTop: 8 }}>tout compris</div>
      </div>
    </div>
  );
  return (
    <AbsoluteFill>
      <BrandBackground />
      <AbsoluteFill
        style={{
          padding: `${L.padTop}px ${L.padX}px ${L.padBottom}px`,
          display: L.landscape ? "grid" : "flex",
          gridTemplateColumns: L.landscape ? "880px 1fr" : undefined,
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 50,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 40, alignItems: L.landscape ? "flex-start" : "center" }}>
          <SpokenLine text={l.show} starts={l.starts} size={L.fs(84, 64, 90)} align={L.landscape ? "left" : "center"} />
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <CheckRow label="0 € de frais de mise en place" delay={at + 8} size={L.fs(40, 32, 40)} />
            <CheckRow label="Sans engagement de durée" delay={at + 14} size={L.fs(40, 32, 40)} />
          </div>
        </div>
        <div style={{ justifySelf: "end" }}>{gauge}</div>
      </AbsoluteFill>
      <VoiceLine id={l.id} />
    </AbsoluteFill>
  );
};

/** Curseur qui vient cliquer sur le bouton (effet « passez à l'action »). */
const ClickCursor: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  const move = interpolate(frame, [at, at + 22], [0, 1], ease);
  const press = interpolate(frame, [at + 24, at + 27, at + 32], [1, 0.82, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ripple = interpolate(frame, [at + 25, at + 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const x = interpolate(move, [0, 1], [420, 0]);
  const y = interpolate(move, [0, 1], [260, 0]);
  return (
    <div style={{ position: "absolute", left: "62%", top: "55%", pointerEvents: "none" }}>
      {ripple > 0 && ripple < 1 ? (
        <div
          style={{
            position: "absolute",
            left: -80 * ripple,
            top: -80 * ripple,
            width: 160 * ripple,
            height: 160 * ripple,
            borderRadius: 999,
            border: `4px solid ${C.white}`,
            opacity: 1 - ripple,
          }}
        />
      ) : null}
      <svg width={54} height={64} viewBox="0 0 24 28" style={{ position: "absolute", left: -6, top: -4, transform: `translate(${x}px, ${y}px) scale(${press})`, transformOrigin: "6px 4px", opacity: move > 0 ? 1 : 0, filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.45))" }}>
        <path d="M3 2 L3 22 L8.5 17 L12.5 26 L16 24.5 L12 15.8 L19.5 15.8 Z" fill={C.white} stroke={C.ink} strokeWidth={1.4} strokeLinejoin="round" />
      </svg>
    </div>
  );
};

/** Fin : phrase, bouton cliqué par un curseur, contact ; le logo arrive sur l'accord final. */
export const SpeakCtaScene: React.FC<{ l: Line; hit: number; photo?: string }> = ({ l, hit, photo = "paris-coucher-de-soleil.jpg" }) => {
  const L = useLayout();
  const frame = useCurrentFrame();
  const after = l.end;
  const press = interpolate(frame, [after + 30, after + 33, after + 38], [1, 0.95, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const logoR = interpolate(frame, [hit, hit + 16], [0, 75], ease);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: `scale(${interpolate(frame, [0, 200], [1.04, 1.12], ease)})` }}>
        <Img src={img(photo)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>
      <Scrim strength={0.76} />
      <Column gap={L.fs(40, 26, 34)}>
        <div style={{ height: L.fs(150, 120, 130), display: "flex", alignItems: "center", clipPath: `circle(${logoR}% at 50% 50%)` }}>
          <Sequence from={hit} layout="none">
            <Img src={img("logo-blanc.png")} style={{ width: L.fs(560, 440, 480), display: "block" }} />
          </Sequence>
        </div>
        <SpokenLine text={l.show} starts={l.starts} size={L.fs(96, 76, 100)} />
        <SlideIn delay={after - 4} dist={16}>
          <div style={{ fontFamily: FONT_SANS, fontSize: L.fs(38, 30, 36), color: "rgba(255,255,255,0.9)" }}>Réponse sous 24 h · sans engagement</div>
        </SlideIn>
        <div style={{ position: "relative", transform: `scale(${press})` }}>
          <CtaButton label="Mon estimation gratuite" delay={after + 2} size={L.fs(48, 40, 48)} />
          <ClickCursor at={after + 8} />
        </div>
        <ContactLine size={L.fs(38, 30, 34)} delay={after + 12} />
      </Column>
      <VoiceLine id={l.id} />
    </AbsoluteFill>
  );
};
