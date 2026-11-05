import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { Card, Icon, KenBurns, useSpring } from "./components";
import { C, FONT_SANS } from "./theme";

// Petits montages qui accompagnent l'arrivée des mots clés (dessinés à 680 px de large).

const W = 680;

/** Photo qui passe du noir et blanc à la couleur (et s'illumine) à l'image `at`. */
export const ColorizePhoto: React.FC<{ src: string; from: number; to: number; at?: number; position?: string }> = ({ src, from, to, at = 0, position }) => {
  const frame = useCurrentFrame();
  const g = interpolate(frame, [at, at + 18], [from, to], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
  return (
    <AbsoluteFill style={{ filter: `grayscale(${g}) brightness(${1 - g * 0.1})` }}>
      <KenBurns src={src} zoom={[1.03, 1.1]} position={position} />
    </AbsoluteFill>
  );
};

/** Reflet de lumière qui traverse l'image. */
export const LightSweep: React.FC<{ at: number; duration?: number }> = ({ at, duration = 26 }) => {
  const frame = useCurrentFrame();
  const x = interpolate(frame, [at, at + duration], [-60, 160], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.quad) });
  const o = interpolate(frame, [at, at + 4, at + duration - 4, at + duration], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: o * 0.55, mixBlendMode: "screen" }}>
      <div
        style={{
          position: "absolute",
          top: "-20%",
          bottom: "-20%",
          left: `${x}%`,
          width: "35%",
          background: "linear-gradient(100deg, transparent, rgba(255,226,170,0.55), transparent)",
          transform: "skewX(-18deg)",
        }}
      />
    </AbsoluteFill>
  );
};

const DAYS = 28;
// Jours « réservés » dans l'illustration (ordre de remplissage).
const BOOKED = [3, 4, 5, 9, 10, 11, 12, 16, 17, 18, 19, 23, 24, 25, 26, 6, 13, 20, 27, 1, 8, 15, 22];

/** Calendrier : vide (logement inoccupé) ou qui se remplit (logement loué). */
export const CalendarCard: React.FC<{ mode: "empty" | "filling"; delay: number }> = ({ mode, delay }) => {
  const frame = useCurrentFrame();
  const filled = mode === "filling" ? Math.floor(interpolate(frame, [delay + 6, delay + 40], [0, BOOKED.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })) : 0;
  const booked = new Set(BOOKED.slice(0, filled));
  const empty = mode === "empty";
  return (
    <Card delay={delay} style={{ width: W }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontWeight: 700, fontSize: 30, color: C.navy }}>
          <Icon name="calendar" size={32} color={C.navy} strokeWidth={2.4} /> Votre calendrier
        </div>
        <Pill delay={delay + (empty ? 14 : 30)} tone={empty ? "muted" : "dark"}>
          {empty ? "Aucune réservation" : "Réservé"}
        </Pill>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 10, marginTop: 26 }}>
        {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
          <div key={i} style={{ textAlign: "center", fontSize: 22, fontWeight: 700, color: C.muted }}>
            {d}
          </div>
        ))}
        {Array.from({ length: DAYS }, (_, i) => {
          const on = booked.has(i);
          return (
            <div
              key={i}
              style={{
                height: 58,
                borderRadius: 14,
                background: on ? C.navy : empty ? "#EEF1F5" : C.sand,
                border: `2px solid ${on ? C.navy : C.border}`,
                color: on ? C.white : empty ? "#B4BCC6" : C.muted,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                fontWeight: 700,
                transition: "none",
              }}
            >
              {i + 1}
            </div>
          );
        })}
      </div>
    </Card>
  );
};

/** Location longue durée : un loyer qui ne bouge pas. */
export const RentCard: React.FC<{ delay: number }> = ({ delay }) => {
  const frame = useCurrentFrame();
  const draw = interpolate(frame, [delay + 6, delay + 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <Card delay={delay} style={{ width: W }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontWeight: 700, fontSize: 30, color: C.navy }}>Location longue durée</div>
        <Pill delay={delay + 24} tone="muted">
          Loyer fixe
        </Pill>
      </div>
      <svg width={600} height={200} style={{ marginTop: 26, overflow: "visible" }}>
        {[0.25, 0.5, 0.75].map((g) => (
          <line key={g} x1={0} x2={600} y1={200 * g} y2={200 * g} stroke={C.border} strokeDasharray="6 8" />
        ))}
        <line x1={0} x2={600 * draw} y1={140} y2={140} stroke="#9AA6B4" strokeWidth={6} strokeLinecap="round" />
        <circle cx={600 * draw} cy={140} r={11} fill="#9AA6B4" stroke={C.white} strokeWidth={4} />
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, color: C.muted, fontWeight: 500 }}>
        {["Jan", "Mar", "Mai", "Juil", "Sep", "Nov"].map((m) => (
          <span key={m}>{m}</span>
        ))}
      </div>
    </Card>
  );
};

/** « De A à Z » : les services s'enchaînent sur une ligne. */
export const ServiceChain: React.FC<{ delay: number }> = ({ delay }) => {
  const frame = useCurrentFrame();
  const items = ["Annonce", "Prix", "Voyageurs", "Ménage", "Entretien", "Suivi"];
  const line = interpolate(frame, [delay, delay + 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
  return (
    <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 18, fontFamily: FONT_SANS }}>
      <div style={{ position: "absolute", left: 40, right: 40, top: "50%", height: 4, background: C.border, borderRadius: 2 }} />
      <div style={{ position: "absolute", left: 40, width: `calc((100% - 80px) * ${line})`, top: "50%", height: 4, background: C.navy, borderRadius: 2 }} />
      <Letter delay={delay}>A</Letter>
      {items.map((t, i) => (
        <Pill key={t} delay={delay + 4 + i * 4} tone="dark">
          {t}
        </Pill>
      ))}
      <Letter delay={delay + 30}>Z</Letter>
    </div>
  );
};

const Letter: React.FC<{ delay: number; children: React.ReactNode }> = ({ delay, children }) => {
  const p = useSpring(delay, { damping: 200, stiffness: 140 });
  return (
    <div
      style={{
        position: "relative",
        width: 80,
        height: 80,
        borderRadius: 99,
        background: C.sky,
        color: C.ink,
        fontFamily: "Fraunces",
        fontWeight: 700,
        fontSize: 44,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: p,
        transform: `scale(${0.6 + 0.4 * p})`,
      }}
    >
      {children}
    </div>
  );
};

const Pill: React.FC<{ delay: number; tone: "dark" | "muted"; children: React.ReactNode }> = ({ delay, tone, children }) => {
  const p = useSpring(delay, { damping: 200, stiffness: 140 });
  return (
    <div
      style={{
        position: "relative",
        padding: "12px 22px",
        borderRadius: 999,
        background: tone === "dark" ? C.navy : "#EEF1F5",
        color: tone === "dark" ? C.white : C.muted,
        fontFamily: FONT_SANS,
        fontWeight: 700,
        fontSize: 24,
        whiteSpace: "nowrap",
        opacity: p,
        transform: `translateY(${(1 - p) * 14}px)`,
      }}
    >
      {children}
    </div>
  );
};
