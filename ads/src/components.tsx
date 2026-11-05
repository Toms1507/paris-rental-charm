import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { BRAND, C, FONT_DISPLAY, FONT_SANS, img } from "./theme";

/** 120 BPM à 30 i/s : un temps = 15 images. Toutes les coupes tombent sur un temps. */
export const BEAT = 15;

export type Orient = "portrait" | "square" | "landscape";

export const useLayout = () => {
  const { width, height } = useVideoConfig();
  const r = height / width;
  const orient: Orient = r > 1.4 ? "portrait" : r < 0.8 ? "landscape" : "square";
  return {
    orient,
    portrait: orient === "portrait",
    landscape: orient === "landscape",
    square: orient === "square",
    width,
    height,
    // Marges hors des zones masquées par l'interface YouTube (Shorts, in-stream).
    padTop: orient === "portrait" ? 230 : orient === "square" ? 80 : 90,
    padBottom: orient === "portrait" ? 380 : orient === "square" ? 80 : 120,
    padX: orient === "portrait" ? 80 : orient === "square" ? 80 : 130,
    /** Taille de police selon le format : [portrait, carré, paysage]. */
    fs: (p: number, s: number, l: number) => (orient === "portrait" ? p : orient === "square" ? s : l),
  };
};

export const useSpring = (delay = 0, config: Parameters<typeof spring>[0]["config"] = {}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping: 200, ...config } });
};

/** 1 sur chaque temps, puis retombe : pour faire « battre » l'image avec la musique. */
export const useBeatPulse = (decay = 5) => {
  const frame = useCurrentFrame();
  return Math.exp(-(frame % BEAT) / decay);
};

/** Photo plein cadre : zoom continu + petit coup de zoom à chaque temps. */
export const KenBurns: React.FC<{
  src: string;
  zoom?: [number, number];
  pan?: [number, number];
  position?: string;
  pulse?: boolean;
}> = ({ src, zoom = [1.04, 1.12], pan = [0, 0], position = "center", pulse = false }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const beat = useBeatPulse(4);
  const t = interpolate(frame, [0, durationInFrames], [0, 1], { extrapolateRight: "clamp", easing: Easing.inOut(Easing.sin) });
  // Zoom limité pour rester doux même si une scène passe une plage plus large.
  const [z0, z1] = zoom;
  const scale = interpolate(t, [0, 1], [Math.min(z0, 1.12), Math.min(z1, 1.12)]) * (pulse ? 1 + beat * 0.01 : 1);
  const x = interpolate(t, [0, 1], pan);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Img
        src={img(src)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: position,
          transform: `scale(${scale}) translateX(${x}px)`,
        }}
      />
    </AbsoluteFill>
  );
};

/** Éclair blanc au début d'une scène (effet « flash » de coupe). */
export const Flash: React.FC<{ at?: number; strength?: number }> = ({ at = 0, strength: s = 0.55 }) => {
  const strength = Math.min(s, 0.15);
  const frame = useCurrentFrame();
  const o = interpolate(frame, [at, at + 1, at + 7], [0, strength, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return <AbsoluteFill style={{ background: C.white, opacity: o, pointerEvents: "none" }} />;
};

/** Apparition « punch » : arrive en grand puis se pose, avec flou de mouvement. */
export const Punch: React.FC<{
  delay?: number;
  from?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ delay = 0, from = 1.5, children, style }) => {
  const p = useSpring(delay, { damping: 200, stiffness: 120 });
  from = 1 + Math.min(from - 1, 0.08);
  return (
    <div
      style={{
        opacity: interpolate(p, [0, 0.25], [0, 1], { extrapolateRight: "clamp" }),
        transform: `scale(${interpolate(p, [0, 1], [from, 1])})`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Glissement rapide depuis un côté. */
export const SlideIn: React.FC<{
  delay?: number;
  dir?: "left" | "right" | "up" | "down";
  dist?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ delay = 0, dir = "up", dist = 80, children, style }) => {
  const p = useSpring(delay, { damping: 200, stiffness: 130 });
  const d = (1 - p) * dist;
  const tr =
    dir === "left" ? `translateX(${-d}px)` : dir === "right" ? `translateX(${d}px)` : dir === "down" ? `translateY(${-d}px)` : `translateY(${d}px)`;
  return (
    <div style={{ opacity: p, transform: tr, ...style }}>
      {children}
    </div>
  );
};

/** Titre qui claque mot par mot. Les mots entre *astérisques* passent en bleu ciel. */
export const SlamText: React.FC<{
  text: string;
  delay?: number;
  stagger?: number;
  size: number;
  color?: string;
  accent?: string;
  weight?: number;
  align?: "left" | "center";
  lineHeight?: number;
  font?: string;
}> = ({
  text,
  delay = 0,
  stagger = 2,
  size,
  color = C.white,
  accent = C.sky,
  weight = 700,
  align = "center",
  lineHeight = 1.05,
  font = FONT_DISPLAY,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // Espaces insécables avant ? : ! » et après « (pas de ponctuation seule en début de ligne).
  const lines = text.replace(/ ([?:!»])/g, " $1").replace(/« /g, "« ").split("\n");
  let i = 0;
  return (
    <div
      style={{
        fontFamily: font,
        fontSize: size,
        fontWeight: weight,
        lineHeight,
        letterSpacing: "-0.02em",
        color,
        textAlign: align,
        textShadow: color === C.white ? "0 4px 30px rgba(0,0,0,0.35)" : undefined,
      }}
    >
      {lines.map((line, li) => (
        <div key={li}>
          {line.split(" ").map((raw, wi) => {
            const highlighted = raw.includes("*");
            const word = raw.replaceAll("*", "");
            const p = spring({
              frame: frame - delay - i++ * stagger,
              fps,
              config: { damping: 200, stiffness: 140 },
            });
            return (
              <span
                key={wi}
                style={{
                  display: "inline-block",
                  marginRight: "0.22em",
                  opacity: p,
                  transform: `translateY(${(1 - p) * 0.25}em)`,
                  color: highlighted ? accent : undefined,
                }}
              >
                {word}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export const Eyebrow: React.FC<{ children: React.ReactNode; color?: string; delay?: number; size?: number }> = ({
  children,
  color = C.sky,
  delay = 0,
  size = 30,
}) => {
  const p = useSpring(delay);
  return (
    <div
      style={{
        fontFamily: FONT_SANS,
        fontWeight: 700,
        fontSize: size,
        letterSpacing: `${0.14 + (1 - p) * 0.3}em`,
        textTransform: "uppercase",
        color,
        opacity: p,
        display: "flex",
        alignItems: "center",
        gap: 18,
      }}
    >
      <span style={{ width: 56 * p, height: 3, background: color, display: "inline-block" }} />
      {children}
    </div>
  );
};

/** Fond de marque : dégradé bleu nuit et facettes du logo qui tournent et battent. */
export const BrandBackground: React.FC<{ light?: boolean }> = ({ light = false }) => {
  const frame = useCurrentFrame();
  const beat = useBeatPulse(6);
  const rot = frame * 0.04;
  const stroke = light ? "rgba(33,63,108,0.09)" : "rgba(152,204,235,0.12)";
  return (
    <AbsoluteFill
      style={{
        background: light
          ? `radial-gradient(ellipse at 50% 40%, ${C.white} 0%, ${C.sand} 75%)`
          : `radial-gradient(ellipse at 50% 40%, #2A4F86 0%, ${C.navy} 35%, ${C.ink} 85%)`,
        overflow: "hidden",
      }}
    >
      <svg
        viewBox="0 0 100 100"
        style={{
          position: "absolute",
          width: "170%",
          aspectRatio: "1",
          left: "-35%",
          top: "50%",
          transform: `translateY(-50%) rotate(${rot}deg) scale(${1 + beat * 0})`,
        }}
      >
        {[46, 36, 26, 16, 8].map((r, k) => (
          <polygon key={k} points={pentagon(50, 50, r)} fill="none" stroke={stroke} strokeWidth={0.28} />
        ))}
        {pentagonPoints(50, 50, 46).map(([x, y], k) => (
          <line key={k} x1={50} y1={50} x2={x} y2={y} stroke={stroke} strokeWidth={0.22} />
        ))}
      </svg>
    </AbsoluteFill>
  );
};

const pentagonPoints = (cx: number, cy: number, r: number) =>
  Array.from({ length: 5 }, (_, k) => {
    const a = -Math.PI / 2 + (k * 2 * Math.PI) / 5;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const;
  });
const pentagon = (cx: number, cy: number, r: number) =>
  pentagonPoints(cx, cy, r)
    .map(([x, y]) => `${x},${y}`)
    .join(" ");

/** Voile bleu nuit pour garder le texte lisible sur une photo. */
export const Scrim: React.FC<{ strength?: number; direction?: "center" | "bottom" | "left" }> = ({
  strength = 0.7,
  direction = "center",
}) => {
  const c = (a: number) => `rgba(17,29,48,${Math.min(1, a)})`;
  const bg =
    direction === "bottom"
      ? `linear-gradient(to top, ${c(strength + 0.2)} 0%, ${c(strength)} 45%, ${c(strength * 0.35)} 100%)`
      : direction === "left"
        ? `linear-gradient(to right, ${c(strength + 0.2)} 0%, ${c(strength)} 45%, ${c(strength * 0.3)} 100%)`
        : `radial-gradient(ellipse at center, ${c(strength)} 0%, ${c(strength * 0.85)} 60%, ${c(strength * 0.7)} 100%)`;
  return <AbsoluteFill style={{ background: bg }} />;
};

export const Logo: React.FC<{ variant?: "color" | "white"; width: number; delay?: number }> = ({
  variant = "white",
  width,
  delay = 0,
}) => (
  <Punch delay={delay} from={1.4}>
    <Img src={img(variant === "white" ? "logo-blanc.png" : "logo.png")} style={{ width, display: "block" }} />
  </Punch>
);

/** Bouton d'appel à l'action : pulsation sur le temps + reflet. */
export const CtaButton: React.FC<{ label: string; delay?: number; size?: number }> = ({
  label,
  delay = 0,
  size = 44,
}) => {
  const frame = useCurrentFrame();
  const p = useSpring(delay, { damping: 200, stiffness: 120 });
  const beat = 0;
  const local = Math.max(0, frame - delay);
  const shine = interpolate((local % 45) / 45, [0, 0.5], [-40, 140], { extrapolateRight: "clamp" });
  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        display: "inline-flex",
        alignItems: "center",
        gap: 20,
        padding: `${size * 0.62}px ${size * 1.15}px`,
        borderRadius: 999,
        background: C.sky,
        color: C.ink,
        fontFamily: FONT_SANS,
        fontWeight: 700,
        fontSize: size,
        opacity: p,
        transform: `translateY(${(1 - p) * 20}px)`,
        boxShadow: `0 20px 70px -10px rgba(152,204,235,${0.45 + beat * 0.3})`,
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: `${shine}%`,
          width: "30%",
          background: "linear-gradient(100deg, transparent, rgba(255,255,255,0.65), transparent)",
          transform: "skewX(-20deg)",
        }}
      />
      <span style={{ position: "relative" }}>{label}</span>
      <Icon name="arrow" size={size * 1.05} color={C.ink} strokeWidth={2.6} />
    </div>
  );
};

const ICONS: Record<string, React.ReactNode> = {
  check: <path d="M20 6 9 17l-5-5" />,
  arrow: (
    <>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </>
  ),
  trending: (
    <>
      <path d="M22 7 13.5 15.5 8.5 10.5 2 17" />
      <path d="M16 7h6v6" />
    </>
  ),
  message: <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />,
  shield: (
    <>
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  camera: (
    <>
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3" />
    </>
  ),
  sparkles: (
    <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
  ),
  key: (
    <>
      <circle cx="7.5" cy="15.5" r="5.5" />
      <path d="m21 2-9.6 9.6" />
      <path d="m15.5 7.5 3 3L22 7l-3-3" />
    </>
  ),
  wrench: (
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  ),
  chart: (
    <>
      <path d="M3 3v18h18" />
      <path d="M18 17V9" />
      <path d="M13 17V5" />
      <path d="M8 17v-3" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </>
  ),
  calendar: (
    <>
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M16 2v4" />
      <path d="M8 2v4" />
      <path d="M3 10h18" />
    </>
  ),
  bell: (
    <>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </>
  ),
};

export const Icon: React.FC<{ name: string; size: number; color?: string; strokeWidth?: number }> = ({
  name,
  size,
  color = C.sky,
  strokeWidth = 2,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ flexShrink: 0, display: "block" }}
  >
    {ICONS[name]}
  </svg>
);

const STAR =
  "M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z";

export const Stars: React.FC<{ size: number; delay?: number; stagger?: number; color?: string }> = ({
  size,
  delay = 0,
  stagger = 3,
  color = "#F5B83D",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ display: "flex", gap: size * 0.15 }}>
      {Array.from({ length: 5 }, (_, k) => {
        const p = spring({ frame: frame - delay - k * stagger, fps, config: { damping: 200, stiffness: 160 } });
        return (
          <svg key={k} width={size} height={size} viewBox="0 0 24 24" style={{ transform: `scale(${p})` }}>
            <path d={STAR} fill={color} />
          </svg>
        );
      })}
    </div>
  );
};

export const Counter: React.FC<{
  from: number;
  to: number;
  delay?: number;
  duration?: number;
  style?: React.CSSProperties;
}> = ({ from, to, delay = 0, duration = 30, style }) => {
  const frame = useCurrentFrame();
  const v = interpolate(frame, [delay, delay + duration], [from, to], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  return <span style={{ fontVariantNumeric: "tabular-nums", ...style }}>{Math.round(v)}</span>;
};

export const CheckRow: React.FC<{ label: string; delay?: number; size?: number; color?: string; dark?: boolean }> = ({
  label,
  delay = 0,
  size = 42,
  color,
  dark = false,
}) => {
  const p = useSpring(delay, { damping: 200, stiffness: 140 });
  const accent = dark ? C.navy : C.sky;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: size * 0.5,
        opacity: p,
        transform: `translateX(${(1 - p) * -50}px)`,
        fontFamily: FONT_SANS,
        fontWeight: 500,
        fontSize: size,
        color: color ?? (dark ? C.ink : C.white),
        lineHeight: 1.2,
      }}
    >
      <div
        style={{
          width: size * 1.35,
          height: size * 1.35,
          borderRadius: 999,
          background: dark ? C.navy : "rgba(152,204,235,0.18)",
          border: `2px solid ${accent}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${p})`,
          flexShrink: 0,
        }}
      >
        <Icon name="check" size={size * 0.8} color={dark ? C.white : C.sky} strokeWidth={3.2} />
      </div>
      <span>{label}</span>
    </div>
  );
};

/** Carte blanche des petites interfaces animées. */
export const Card: React.FC<{ children: React.ReactNode; style?: React.CSSProperties; delay?: number }> = ({
  children,
  style,
  delay = 0,
}) => {
  const p = useSpring(delay, { damping: 200, stiffness: 110 });
  return (
    <div
      style={{
        background: C.white,
        borderRadius: 34,
        padding: 40,
        boxShadow: "0 40px 90px -25px rgba(0,0,0,0.55)",
        transform: `translateY(${(1 - p) * 50}px)`,
        opacity: interpolate(p, [0, 0.3], [0, 1], { extrapolateRight: "clamp" }),
        fontFamily: FONT_SANS,
        color: C.ink,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const ContactLine: React.FC<{ size: number; delay?: number }> = ({ size, delay = 0 }) => (
  <SlideIn delay={delay} dir="up" dist={30}>
    <div style={{ fontFamily: FONT_SANS, fontWeight: 700, fontSize: size, color: C.white, letterSpacing: "0.02em", whiteSpace: "nowrap" }}>
      {BRAND.url}
      <span style={{ color: C.sky, margin: "0 18px" }}>·</span>
      {BRAND.phone}
    </div>
  </SlideIn>
);

/** Nombre d'images par mot pour les sous-titres « parlés » (~3,5 mots par seconde). */
export const WORD_FRAMES = 8;

export const spokenDuration = (text: string) => text.replace(/\n/g, " ").split(" ").filter(Boolean).length * WORD_FRAMES;

/**
 * Sous-titres « parlés » : les mots apparaissent au rythme de la parole, le mot en cours
 * est surligné. Tous les mots sont placés dès le départ : l'alignement ne bouge jamais.
 */
export const SpokenLine: React.FC<{
  text: string;
  delay?: number;
  size: number;
  align?: "left" | "center";
  color?: string;
  accent?: string;
  maxWidth?: number;
  /** Image de début de chaque mot (calée sur la voix off) ; sinon rythme régulier. */
  starts?: number[];
}> = ({ text, delay = 0, size, align = "center", color = C.white, accent = C.sky, maxWidth, starts }) => {
  const frame = useCurrentFrame();
  const lines = text.replace(/ ([?:!»])/g, " $1").replace(/« /g, "« ").split("\n");
  let i = 0;
  return (
    <div
      style={{
        fontFamily: FONT_DISPLAY,
        fontWeight: 600,
        fontSize: size,
        lineHeight: 1.12,
        letterSpacing: "-0.015em",
        color,
        textAlign: align,
        maxWidth,
        textShadow: color === C.white ? "0 3px 24px rgba(0,0,0,0.45)" : undefined,
      }}
    >
      {lines.map((line, li) => (
        <div key={li}>
          {line.split(" ").map((raw, wi) => {
            const idx = i++;
            const start = starts?.[idx] ?? delay + idx * WORD_FRAMES;
            const next = starts?.[idx + 1] ?? start + WORD_FRAMES;
            const highlighted = raw.includes("*");
            const word = raw.replaceAll("*", "");
            const o = interpolate(frame, [start, start + 4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const active = frame >= start && frame < next + 2;
            return (
              <span
                key={wi}
                style={{
                  display: "inline-block",
                  marginRight: "0.24em",
                  opacity: o,
                  transform: `translateY(${(1 - o) * 0.12}em)`,
                  color: highlighted || active ? accent : undefined,
                }}
              >
                {word}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

/** Étiquette « qui parle » avec petite onde sonore, pour l'effet d'adresse directe. */
export const Speaker: React.FC<{ talkingUntil: number; delay?: number; light?: boolean }> = ({ talkingUntil, delay = 0, light = false }) => {
  const frame = useCurrentFrame();
  const p = useSpring(delay, { damping: 200, stiffness: 120 });
  const talking = frame >= delay && frame < talkingUntil;
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 16,
        padding: "12px 24px 12px 12px",
        borderRadius: 999,
        background: light ? "rgba(33,63,108,0.08)" : "rgba(17,29,48,0.55)",
        border: `1px solid ${light ? "rgba(33,63,108,0.15)" : "rgba(152,204,235,0.35)"}`,
        opacity: p,
        transform: `translateY(${(1 - p) * 12}px)`,
        fontFamily: FONT_SANS,
        fontWeight: 700,
        fontSize: 26,
        color: light ? C.navy : C.white,
      }}
    >
      <div style={{ width: 52, height: 52, borderRadius: 99, background: C.white, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Img src={img("logo-mark.png")} style={{ width: 36 }} />
      </div>
      {BRAND.name}
      <div style={{ display: "flex", alignItems: "center", gap: 4, height: 26, marginLeft: 4 }}>
        {[0, 1, 2, 3].map((k) => {
          const h = talking ? 8 + 16 * Math.abs(Math.sin((frame + k * 3.3) / 3.1)) : 6;
          return <span key={k} style={{ width: 4, height: h, borderRadius: 2, background: C.sky }} />;
        })}
      </div>
    </div>
  );
};
