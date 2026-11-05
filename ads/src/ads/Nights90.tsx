import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import {
  BrandBackground,
  CheckRow,
  Counter,
  CtaScene,
  Eyebrow,
  KenBurns,
  Reveal,
  Scrim,
  useLayout,
  WordReveal,
} from "../components";
import { Scene, SceneSeries, seriesDuration } from "../series";
import { C, FONT_DISPLAY, FONT_SANS } from "../theme";
import { MARKET } from "../market";

// Angle « marché actuel » : le plafond de 90 nuits à Paris rend chaque nuit plus précieuse.

const Countdown: React.FC = () => {
  const L = useLayout();
  const frame = useCurrentFrame();
  const shake = frame > 44 && frame < 52 ? Math.sin(frame * 3) * 6 : 0;
  return (
    <AbsoluteFill>
      <KenBurns src="toits-de-paris.jpg" zoom={[1.2, 1.05]} />
      <Scrim strength={0.72} />
      <AbsoluteFill
        style={{
          padding: `${L.safeTop}px ${L.padX}px ${L.safeBottom}px`,
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <Eyebrow>Location courte durée à Paris</Eyebrow>
        <div
          style={{
            fontFamily: FONT_DISPLAY,
            fontWeight: 700,
            fontSize: L.vertical ? 400 : 330,
            lineHeight: 1,
            color: C.white,
            marginTop: 30,
            transform: `translateX(${shake}px)`,
          }}
        >
          <Counter from={365} to={90} delay={6} duration={38} />
        </div>
        <Reveal delay={30}>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: L.vertical ? 74 : 64, color: C.sky, fontWeight: 600 }}>
            nuits par an, maximum.
          </div>
        </Reveal>
        <Reveal delay={48}>
          <div
            style={{
              marginTop: 40,
              fontFamily: FONT_SANS,
              fontSize: L.vertical ? 38 : 34,
              color: "rgba(255,255,255,0.85)",
              lineHeight: 1.35,
              maxWidth: 860,
            }}
          >
            C'est le plafond pour louer une résidence principale à Paris depuis le 1er janvier 2025.
          </div>
        </Reveal>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const EveryNight: React.FC = () => {
  const L = useLayout();
  return (
    <AbsoluteFill>
      <BrandBackground />
      <AbsoluteFill
        style={{ padding: `${L.safeTop}px ${L.padX}px ${L.safeBottom}px`, justifyContent: "center" }}
      >
        <WordReveal
          text={"Moins de nuits.\nAlors chaque nuit\ndoit *rapporter* *plus.*"}
          size={L.vertical ? 104 : 88}
          stagger={4}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Bars: React.FC = () => {
  const L = useLayout();
  const frame = useCurrentFrame();
  const max = Math.max(...MARKET.prices.map((p) => p.price));
  const barMax = L.vertical ? 700 : 560;
  return (
    <AbsoluteFill>
      <BrandBackground light />
      <AbsoluteFill
        style={{
          padding: `${L.safeTop}px ${L.padX}px ${L.safeBottom}px`,
          justifyContent: "center",
        }}
      >
        <Eyebrow color={C.navy}>Le marché aujourd'hui</Eyebrow>
        <WordReveal
          text="Prix médian d'une nuit à Paris"
          size={L.vertical ? 74 : 62}
          color={C.ink}
          align="left"
          delay={4}
          stagger={2}
        />
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 26,
            height: barMax + 120,
            marginTop: L.vertical ? 60 : 30,
          }}
        >
          {MARKET.prices.map((p, i) => {
            const delay = 16 + i * 8;
            const grow = interpolate(frame, [delay, delay + 26], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.out(Easing.cubic),
            });
            return (
              <div key={p.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
                <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: L.vertical ? 58 : 50, color: C.navy, opacity: grow }}>
                  <Counter from={0} to={p.price} delay={delay} duration={26} />
                  &nbsp;€
                </div>
                <div
                  style={{
                    width: "100%",
                    height: (p.price / max) * barMax * grow,
                    borderRadius: "22px 22px 6px 6px",
                    background: `linear-gradient(to top, ${C.navy}, ${i === MARKET.prices.length - 1 ? C.sky : C.steel})`,
                  }}
                />
                <div style={{ fontFamily: FONT_SANS, fontWeight: 700, fontSize: L.vertical ? 32 : 28, color: C.muted, textAlign: "center" }}>
                  {p.label}
                </div>
              </div>
            );
          })}
        </div>
        <Reveal delay={60}>
          <div style={{ marginTop: 30, fontFamily: FONT_SANS, fontSize: 24, color: C.muted }}>
            {MARKET.source}
          </div>
        </Reveal>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Method: React.FC = () => {
  const L = useLayout();
  const size = L.vertical ? 46 : 38;
  return (
    <AbsoluteFill>
      <BrandBackground />
      <AbsoluteFill
        style={{ padding: `${L.safeTop}px ${L.padX}px ${L.safeBottom}px`, justifyContent: "center", gap: L.vertical ? 60 : 36 }}
      >
        <WordReveal
          text={"Notre méthode pour\n*optimiser* *chaque* *nuit*"}
          size={L.vertical ? 80 : 68}
          align="left"
          stagger={3}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: L.vertical ? 34 : 22 }}>
          <CheckRow label="Prix ajustés chaque jour" delay={20} size={size} />
          <CheckRow label="Annonce optimisée pour le classement" delay={30} size={size} />
          <CheckRow label="Ménage hôtelier = meilleurs avis" delay={40} size={size} />
          <CheckRow label="Plafond et déclarations suivis" delay={50} size={size} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const scenes: Scene[] = [
  { d: 120, el: <Countdown />, t: "fade" },
  { d: 70, el: <EveryNight />, t: "wipe" },
  { d: 130, el: <Bars />, t: "slide" },
  { d: 110, el: <Method />, t: "fade" },
  { d: 150, el: <CtaScene title={"Estimez les revenus\nde *votre* *bien*"} photo="appartement-balcon.jpg" /> },
];

export const NIGHTS_DURATION = seriesDuration(scenes);

export const Nights90: React.FC = () => <SceneSeries scenes={scenes} />;
