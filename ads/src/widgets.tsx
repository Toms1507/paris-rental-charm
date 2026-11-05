import React from "react";
import { Easing, Img, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Card, Icon, Stars, useSpring } from "./components";
import { C, FONT_DISPLAY, FONT_SANS, img } from "./theme";

// Petites interfaces animées qui illustrent chaque service (dessinées à 680 px de large).

export const WIDGET_W = 680;

const Title: React.FC<{ icon: string; children: React.ReactNode }> = ({ icon, children }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 16, fontWeight: 700, fontSize: 30, color: C.navy }}>
    <div style={{ width: 54, height: 54, borderRadius: 16, background: C.sand, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Icon name={icon} size={30} color={C.navy} strokeWidth={2.4} />
    </div>
    {children}
  </div>
);

const Chip: React.FC<{ children: React.ReactNode; delay: number; dark?: boolean }> = ({ children, delay, dark }) => {
  const p = useSpring(delay, { damping: 10, stiffness: 220 });
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        padding: "12px 22px",
        borderRadius: 999,
        background: dark ? C.navy : "#E8F3FB",
        color: dark ? C.white : C.navy,
        fontWeight: 700,
        fontSize: 26,
        transform: `scale(${p})`,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </div>
  );
};

const Shutter: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [at, at + 1, at + 6], [0, 0.95, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <div style={{ position: "absolute", inset: 0, background: "white", opacity: o }} />;
};

export const ListingWidget: React.FC = () => {
  const frame = useCurrentFrame();
  const zoom = interpolate(frame, [0, 60], [1.15, 1], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  return (
    <Card style={{ width: WIDGET_W, padding: 26 }}>
      <div style={{ position: "relative", height: 380, borderRadius: 22, overflow: "hidden" }}>
        <Img src={img("appartement-balcon.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${zoom})` }} />
        <Shutter at={6} />
        <Shutter at={21} />
        <div style={{ position: "absolute", top: 18, left: 18 }}>
          <Chip delay={10}>
            <Icon name="camera" size={26} color={C.navy} strokeWidth={2.4} /> Photos pro
          </Chip>
        </div>
      </div>
      <div style={{ padding: "26px 10px 8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 36 }}>Appartement de charme</div>
          <div style={{ fontSize: 26, color: C.muted, marginTop: 6 }}>Paris · logement entier</div>
        </div>
        <Stars size={30} delay={14} stagger={2} />
      </div>
    </Card>
  );
};

export const PlatformsWidget: React.FC = () => {
  const notif = useSpring(30, { damping: 12, stiffness: 180 });
  return (
    <div style={{ width: WIDGET_W, display: "flex", flexDirection: "column", gap: 26, alignItems: "center" }}>
      <Card style={{ width: WIDGET_W }}>
        <Title icon="globe">Votre annonce publiée sur</Title>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginTop: 28 }}>
          <Chip delay={6}>Airbnb</Chip>
          <Chip delay={10}>Booking.com</Chip>
          <Chip delay={14}>Abritel</Chip>
          <Chip delay={18}>Réservations directes</Chip>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 28, fontSize: 26, color: C.muted, fontWeight: 500 }}>
          <Icon name="calendar" size={28} color={C.steel} /> Calendriers synchronisés
        </div>
      </Card>
      <div
        style={{
          alignSelf: "stretch",
          display: "flex",
          alignItems: "center",
          gap: 20,
          padding: "22px 28px",
          borderRadius: 26,
          background: "rgba(255,255,255,0.96)",
          boxShadow: "0 30px 60px -20px rgba(0,0,0,0.5)",
          transform: `translateY(${(1 - notif) * -60}px) scale(${0.8 + notif * 0.2})`,
          opacity: notif,
          fontFamily: FONT_SANS,
        }}
      >
        <div style={{ width: 60, height: 60, borderRadius: 18, background: C.navy, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="bell" size={32} color={C.white} />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 28, color: C.ink }}>Nouvelle réservation</div>
          <div style={{ fontSize: 24, color: C.muted }}>Confirmée et ajoutée au calendrier</div>
        </div>
      </div>
    </div>
  );
};

// Courbe illustrative (pas de vraies valeurs) : le prix suit la demande.
const CURVE = [52, 48, 62, 78, 70, 58, 66, 88, 95, 80, 64, 72, 90];

export const PriceWidget: React.FC = () => {
  const frame = useCurrentFrame();
  const draw = interpolate(frame, [6, 44], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const w = 600;
  const h = 260;
  const pts = CURVE.map((v, i) => [(i / (CURVE.length - 1)) * w, h - (v / 100) * h] as const);
  const path = pts.map(([x, y], i) => `${i ? "L" : "M"}${x},${y}`).join(" ");
  const area = `${path} L${w},${h} L0,${h} Z`;
  const len = 1400;
  const head = pts[Math.min(pts.length - 1, Math.floor(draw * (pts.length - 1)))]!;
  const tags = [
    { i: 3, label: "Salon" },
    { i: 8, label: "Week-end" },
    { i: 12, label: "Vacances" },
  ];
  return (
    <Card style={{ width: WIDGET_W }}>
      <Title icon="trending">Prix de la nuit</Title>
      <svg width={w} height={h + 20} style={{ marginTop: 70, overflow: "visible" }}>
        <defs>
          <linearGradient id="area" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={C.sky} stopOpacity="0.55" />
            <stop offset="1" stopColor={C.sky} stopOpacity="0" />
          </linearGradient>
          <clipPath id="reveal">
            <rect x={0} y={-40} width={w * draw} height={h + 80} />
          </clipPath>
        </defs>
        {[0.25, 0.5, 0.75].map((g) => (
          <line key={g} x1={0} x2={w} y1={h * g} y2={h * g} stroke={C.border} strokeDasharray="6 8" />
        ))}
        <path d={area} fill="url(#area)" clipPath="url(#reveal)" />
        <path d={path} fill="none" stroke={C.navy} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={len} strokeDashoffset={len * (1 - draw)} />
        <circle cx={head[0]} cy={head[1]} r={12} fill={C.navy} stroke={C.white} strokeWidth={4} />
        {tags.map((t) => {
          const [x, y] = pts[t.i]!;
          const visible = draw * (pts.length - 1) >= t.i;
          return visible ? (
            <g key={t.label} transform={`translate(${x}, ${y - 34})`}>
              <TagPop label={t.label} start={6 + (38 * t.i) / (pts.length - 1)} />
            </g>
          ) : null;
        })}
      </svg>
      <div style={{ marginTop: 10 }}>
        <Chip delay={40} dark>
          Ajusté chaque jour
        </Chip>
      </div>
    </Card>
  );
};

const TagPop: React.FC<{ label: string; start: number }> = ({ label, start }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - start, fps, config: { damping: 10, stiffness: 240 } });
  const width = label.length * 15 + 34;
  return (
    <g transform={`scale(${p})`}>
      <rect x={-width / 2} y={-24} width={width} height={42} rx={21} fill={C.sky} />
      <text x={0} y={5} textAnchor="middle" fontFamily={FONT_SANS} fontWeight={700} fontSize={22} fill={C.ink}>
        {label}
      </text>
    </g>
  );
};

const Bubble: React.FC<{ side: "left" | "right"; delay: number; children: React.ReactNode }> = ({ side, delay, children }) => {
  const p = useSpring(delay, { damping: 13, stiffness: 220 });
  const right = side === "right";
  return (
    <div
      style={{
        alignSelf: right ? "flex-end" : "flex-start",
        maxWidth: "82%",
        padding: "22px 28px",
        borderRadius: 28,
        borderBottomRightRadius: right ? 8 : 28,
        borderBottomLeftRadius: right ? 28 : 8,
        background: right ? C.navy : C.sand,
        color: right ? C.white : C.ink,
        fontSize: 29,
        lineHeight: 1.3,
        transform: `scale(${p})`,
        transformOrigin: right ? "bottom right" : "bottom left",
        opacity: p,
      }}
    >
      {children}
    </div>
  );
};

const Typing: React.FC<{ from: number; to: number }> = ({ from, to }) => {
  const frame = useCurrentFrame();
  if (frame < from || frame >= to) return null;
  return (
    <div style={{ alignSelf: "flex-end", display: "flex", gap: 8, padding: "20px 26px", borderRadius: 28, background: "#E8F3FB" }}>
      {[0, 1, 2].map((k) => (
        <span key={k} style={{ width: 13, height: 13, borderRadius: 99, background: C.navy, opacity: 0.35 + 0.65 * Math.abs(Math.sin((frame + k * 4) / 4)) }} />
      ))}
    </div>
  );
};

export const ChatWidget: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Card style={{ width: WIDGET_W, display: "flex", flexDirection: "column", gap: 20 }}>
      <Title icon="message">Messages voyageurs</Title>
      <Bubble side="left" delay={5}>
        Bonjour ! À quelle heure peut-on arriver ?
      </Bubble>
      <Typing from={12} to={22} />
      {frame >= 22 ? (
        <Bubble side="right" delay={22}>
          Quand vous voulez, l'arrivée est autonome. Bienvenue à Paris !
        </Bubble>
      ) : null}
      <div style={{ display: "flex", gap: 14, marginTop: 6 }}>
        <Chip delay={34} dark>
          Réponse en moins d'1 h
        </Chip>
        <Chip delay={38}>7j/7</Chip>
      </div>
    </Card>
  );
};

const Tick: React.FC<{ label: string; delay: number }> = ({ label, delay }) => {
  const p = useSpring(delay, { damping: 11, stiffness: 230 });
  const frame = useCurrentFrame();
  const done = frame >= delay + 4;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 31, fontWeight: 500, opacity: 0.35 + 0.65 * Math.min(1, p) }}>
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 14,
          border: `3px solid ${C.navy}`,
          background: done ? C.navy : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${0.7 + 0.3 * p})`,
        }}
      >
        {done ? <Icon name="check" size={32} color={C.white} strokeWidth={3.4} /> : null}
      </div>
      {label}
    </div>
  );
};

export const CleanWidget: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "relative" }}>
      <Card style={{ width: WIDGET_W, display: "flex", flexDirection: "column", gap: 24 }}>
        <Title icon="sparkles">Après chaque départ</Title>
        <Tick label="Ménage de niveau hôtelier" delay={8} />
        <Tick label="Linge de lit et serviettes changés" delay={15} />
        <Tick label="Consommables réassortis" delay={22} />
        <Tick label="Contrôle qualité du logement" delay={29} />
      </Card>
      {[
        [-30, -40, 0],
        [WIDGET_W - 20, 30, 8],
        [WIDGET_W - 80, 380, 16],
        [-10, 330, 24],
      ].map(([x, y, d], k) => {
        const s = Math.max(0, Math.sin(((frame - d!) / 22) * Math.PI));
        return (
          <div key={k} style={{ position: "absolute", left: x, top: y, transform: `scale(${s}) rotate(${frame * 3}deg)` }}>
            <Icon name="sparkles" size={70} color={C.sky} strokeWidth={1.6} />
          </div>
        );
      })}
    </div>
  );
};

export const MaintenanceWidget: React.FC = () => {
  const frame = useCurrentFrame();
  const steps = [
    { icon: "bell", label: "Imprévu signalé", sub: "Fuite, panne, clé perdue…" },
    { icon: "wrench", label: "Intervention rapide", sub: "Notre équipe ou un artisan" },
    { icon: "shield", label: "Problème réglé", sub: "Compte rendu envoyé" },
  ];
  const fill = interpolate(frame, [8, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <Card style={{ width: WIDGET_W }}>
      <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 38 }}>
        <div style={{ position: "absolute", left: 35, top: 40, bottom: 40, width: 5, background: C.border, borderRadius: 3 }} />
        <div style={{ position: "absolute", left: 35, top: 40, height: `calc((100% - 80px) * ${fill})`, width: 5, background: C.navy, borderRadius: 3 }} />
        {steps.map((s, i) => {
          const on = fill >= i / (steps.length - 1) - 0.001;
          return (
            <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 26, position: "relative" }}>
              <div
                style={{
                  width: 74,
                  height: 74,
                  borderRadius: 99,
                  background: on ? C.navy : C.white,
                  border: `4px solid ${on ? C.navy : C.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transform: `scale(${on ? 1 : 0.85})`,
                }}
              >
                <Icon name={s.icon} size={36} color={on ? C.white : C.border} strokeWidth={2.4} />
              </div>
              <div style={{ opacity: on ? 1 : 0.35 }}>
                <div style={{ fontWeight: 700, fontSize: 32 }}>{s.label}</div>
                <div style={{ fontSize: 25, color: C.muted, marginTop: 4 }}>{s.sub}</div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

// Barres illustratives (pas de vraies valeurs).
const BARS = [40, 55, 48, 70, 82, 76, 90, 95, 72, 64, 58, 80];

export const RecapWidget: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Card style={{ width: WIDGET_W }}>
      <Title icon="chart">Votre récapitulatif mensuel</Title>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 200, marginTop: 30 }}>
        {BARS.map((b, i) => {
          const g = interpolate(frame, [6 + i * 2, 20 + i * 2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.back(1.6)) });
          return <div key={i} style={{ flex: 1, height: `${b * g}%`, borderRadius: "10px 10px 4px 4px", background: i === 7 ? C.navy : "#BFD9EC" }} />;
        })}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 28 }}>
        {["Nuits louées", "Prix moyen", "Revenus versés"].map((l, i) => {
          const p = interpolate(frame, [26 + i * 5, 34 + i * 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (
            <div key={l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 28, opacity: p, transform: `translateX(${(1 - p) * 30}px)` }}>
              <span style={{ color: C.muted }}>{l}</span>
              <Icon name="check" size={30} color={C.navy} strokeWidth={3} />
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export const ReviewWidget: React.FC = () => (
  <Card style={{ width: WIDGET_W, display: "flex", flexDirection: "column", gap: 26 }}>
    <Stars size={52} delay={6} />
    <div style={{ fontFamily: FONT_DISPLAY, fontSize: 40, lineHeight: 1.25 }}>
      « La communication était merveilleuse. On m'a toujours répondu très rapidement. »
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
      <Img src={img("feli.jpg")} style={{ width: 84, height: 84, borderRadius: 99, objectFit: "cover" }} />
      <div>
        <div style={{ fontWeight: 700, fontSize: 30 }}>Feli</div>
        <div style={{ fontSize: 24, color: C.muted }}>Avis Airbnb · traduit de l'allemand</div>
      </div>
    </div>
  </Card>
);
