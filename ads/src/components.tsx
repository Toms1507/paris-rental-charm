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

/** Format vertical (9:16) ou flux (4:5). */
export const useLayout = () => {
  const { width, height } = useVideoConfig();
  const vertical = height / width > 1.5;
  return {
    vertical,
    width,
    height,
    // Marges hors des zones masquées par l'interface des Reels / TikTok / Stories.
    safeTop: vertical ? 250 : 90,
    safeBottom: vertical ? 400 : 90,
    padX: vertical ? 80 : 90,
  };
};

export const useSpring = (delay = 0, config: Parameters<typeof spring>[0]["config"] = {}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping: 200, ...config } });
};

/** Photo plein cadre avec lent zoom (effet Ken Burns). */
export const KenBurns: React.FC<{
  src: string;
  zoom?: [number, number];
  pan?: [number, number];
  position?: string;
  style?: React.CSSProperties;
}> = ({ src, zoom = [1.05, 1.18], pan = [0, 0], position = "center", style }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });
  const scale = interpolate(t, [0, 1], zoom);
  const x = interpolate(t, [0, 1], pan);
  return (
    <AbsoluteFill style={{ overflow: "hidden", ...style }}>
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

/** Apparition d'un bloc : glissement vers le haut + fondu + léger flou. */
export const Reveal: React.FC<{
  delay?: number;
  y?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ delay = 0, y = 40, children, style }) => {
  const p = useSpring(delay);
  return (
    <div
      style={{
        opacity: p,
        transform: `translateY(${(1 - p) * y}px)`,
        filter: `blur(${(1 - p) * 8}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Titre qui apparaît mot par mot. Les mots entre *astérisques* sont surlignés. */
export const WordReveal: React.FC<{
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
  stagger = 3,
  size,
  color = C.white,
  accent = C.sky,
  weight = 600,
  align = "center",
  lineHeight = 1.08,
  font = FONT_DISPLAY,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // Espaces insécables avant ? : ! » et après « pour éviter une ponctuation seule en début de ligne.
  const lines = text.replace(/ ([?:!»])/g, "\u00a0$1").replace(/« /g, "«\u00a0").split("\n");
  let i = 0;
  return (
    <div
      style={{
        fontFamily: font,
        fontSize: size,
        fontWeight: weight,
        lineHeight,
        letterSpacing: "-0.015em",
        color,
        textAlign: align,
      }}
    >
      {lines.map((line, li) => (
        <div key={li}>
          {line.split(" ").map((raw, wi) => {
            const highlighted = raw.startsWith("*") || raw.endsWith("*");
            const word = raw.replaceAll("*", "");
            const p = spring({
              frame: frame - delay - i++ * stagger,
              fps,
              config: { damping: 16, stiffness: 140, mass: 0.6 },
            });
            return (
              <span
                key={wi}
                style={{
                  display: "inline-block",
                  marginRight: "0.24em",
                  opacity: interpolate(p, [0, 0.4], [0, 1], { extrapolateRight: "clamp" }),
                  transform: `translateY(${(1 - p) * 0.5}em)`,
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

export const Eyebrow: React.FC<{ children: React.ReactNode; color?: string; delay?: number }> = ({
  children,
  color = C.sky,
  delay = 0,
}) => {
  const p = useSpring(delay);
  return (
    <div
      style={{
        fontFamily: FONT_SANS,
        fontWeight: 700,
        fontSize: 30,
        letterSpacing: `${0.12 + (1 - p) * 0.2}em`,
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

/** Fond de marque : dégradé bleu nuit avec les facettes du logo en filigrane. */
export const BrandBackground: React.FC<{ light?: boolean }> = ({ light = false }) => {
  const frame = useCurrentFrame();
  const rot = frame * 0.06;
  const stroke = light ? "rgba(33,63,108,0.07)" : "rgba(152,204,235,0.08)";
  return (
    <AbsoluteFill
      style={{
        background: light
          ? `radial-gradient(ellipse at 50% 30%, ${C.white} 0%, ${C.sand} 70%)`
          : `radial-gradient(ellipse at 50% 35%, ${C.navy} 0%, ${C.ink} 75%)`,
      }}
    >
      <svg
        viewBox="0 0 100 100"
        style={{
          position: "absolute",
          width: "160%",
          left: "-30%",
          top: "50%",
          transform: `translateY(-50%) rotate(${rot}deg)`,
        }}
      >
        {[46, 36, 26, 16].map((r, k) => (
          <polygon
            key={k}
            points={pentagon(50, 50, r)}
            fill="none"
            stroke={stroke}
            strokeWidth={0.25}
          />
        ))}
        {pentagonPoints(50, 50, 46).map(([x, y], k) => (
          <line key={k} x1={50} y1={50} x2={x} y2={y} stroke={stroke} strokeWidth={0.2} />
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

/** Voile sombre pour garder le texte lisible sur une photo. */
export const Scrim: React.FC<{ strength?: number; from?: "bottom" | "center" }> = ({
  strength = 0.75,
  from = "center",
}) => (
  <AbsoluteFill
    style={{
      background:
        from === "center"
          ? `radial-gradient(ellipse at center, rgba(17,29,48,${strength}) 0%, rgba(17,29,48,${strength * 0.8}) 55%, rgba(17,29,48,${strength * 0.6}) 100%)`
          : `linear-gradient(to top, rgba(17,29,48,${strength + 0.15}) 0%, rgba(17,29,48,${strength}) 45%, rgba(17,29,48,0.15) 100%)`,
    }}
  />
);

export const Logo: React.FC<{ variant?: "color" | "white"; width: number; delay?: number }> = ({
  variant = "white",
  width,
  delay = 0,
}) => {
  const p = useSpring(delay, { damping: 14, stiffness: 120 });
  return (
    <Img
      src={img(variant === "white" ? "logo-blanc.png" : "logo.png")}
      style={{
        width,
        opacity: interpolate(p, [0, 0.5], [0, 1], { extrapolateRight: "clamp" }),
        transform: `scale(${0.85 + p * 0.15})`,
      }}
    />
  );
};

/** Bouton d'appel à l'action avec pulsation et reflet. */
export const CtaButton: React.FC<{ label: string; delay?: number; size?: number }> = ({
  label,
  delay = 0,
  size = 44,
}) => {
  const frame = useCurrentFrame();
  const p = useSpring(delay, { damping: 12, stiffness: 160 });
  const local = Math.max(0, frame - delay - 15);
  const pulse = 1 + Math.sin(local / 7) * 0.025 * Math.min(1, local / 15);
  const shine = interpolate((local % 75) / 75, [0, 0.45], [-40, 140], {
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        display: "inline-flex",
        alignItems: "center",
        gap: 20,
        padding: `${size * 0.6}px ${size * 1.1}px`,
        borderRadius: 999,
        background: C.sky,
        color: C.ink,
        fontFamily: FONT_SANS,
        fontWeight: 700,
        fontSize: size,
        opacity: p,
        transform: `scale(${(0.6 + 0.4 * p) * pulse})`,
        boxShadow: `0 20px 60px -10px rgba(152,204,235,0.55)`,
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: `${shine}%`,
          width: "30%",
          background: "linear-gradient(100deg, transparent, rgba(255,255,255,0.6), transparent)",
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
  x: (
    <>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </>
  ),
  arrow: (
    <>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
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
  euro: (
    <>
      <path d="M4 10h12" />
      <path d="M4 14h9" />
      <path d="M19 6a7.7 7.7 0 0 0-5.2-2A7.9 7.9 0 0 0 6 12c0 4.4 3.5 8 7.8 8 2 0 3.8-.8 5.2-2" />
    </>
  ),
};

export const Icon: React.FC<{
  name: keyof typeof ICONS | string;
  size: number;
  color?: string;
  strokeWidth?: number;
}> = ({ name, size, color = C.sky, strokeWidth = 2 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ flexShrink: 0 }}
  >
    {ICONS[name]}
  </svg>
);

const STAR =
  "M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z";

export const Stars: React.FC<{ size: number; delay?: number; color?: string }> = ({
  size,
  delay = 0,
  color = "#F5B83D",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ display: "flex", gap: size * 0.15 }}>
      {Array.from({ length: 5 }, (_, k) => {
        const p = spring({
          frame: frame - delay - k * 4,
          fps,
          config: { damping: 9, stiffness: 180 },
        });
        return (
          <svg key={k} width={size} height={size} viewBox="0 0 24 24" style={{ transform: `scale(${p})` }}>
            <path d={STAR} fill={color} />
          </svg>
        );
      })}
    </div>
  );
};

/** Compteur animé (ex. 0 → 20 %). */
export const Counter: React.FC<{
  from: number;
  to: number;
  delay?: number;
  duration?: number;
  format?: (n: number) => string;
  style?: React.CSSProperties;
}> = ({ from, to, delay = 0, duration = 30, format = (n) => String(n), style }) => {
  const frame = useCurrentFrame();
  const v = interpolate(frame, [delay, delay + duration], [from, to], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  return <span style={{ fontVariantNumeric: "tabular-nums", ...style }}>{format(Math.round(v))}</span>;
};

/** Ligne de liste cochée qui apparaît. */
export const CheckRow: React.FC<{
  label: string;
  delay?: number;
  size?: number;
  color?: string;
  icon?: string;
  iconColor?: string;
  strike?: boolean;
}> = ({ label, delay = 0, size = 42, color = C.white, icon = "check", iconColor = C.sky, strike }) => {
  const frame = useCurrentFrame();
  const p = useSpring(delay, { damping: 15, stiffness: 150 });
  const strikeP = strike
    ? interpolate(frame, [delay + 10, delay + 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 0;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: size * 0.55,
        opacity: p,
        transform: `translateX(${(1 - p) * -60}px)`,
        fontFamily: FONT_SANS,
        fontWeight: 500,
        fontSize: size,
        color,
        lineHeight: 1.2,
      }}
    >
      <div
        style={{
          width: size * 1.45,
          height: size * 1.45,
          borderRadius: 999,
          background: icon === "x" ? "rgba(255,255,255,0.08)" : "rgba(152,204,235,0.16)",
          border: `2px solid ${icon === "x" ? "rgba(255,255,255,0.25)" : iconColor}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${p})`,
          flexShrink: 0,
        }}
      >
        <Icon name={icon} size={size * 0.85} color={iconColor} strokeWidth={3} />
      </div>
      <span style={{ position: "relative" }}>
        {label}
        {strike ? (
          <span
            style={{
              position: "absolute",
              left: 0,
              top: "54%",
              height: 4,
              width: `${strikeP * 100}%`,
              background: C.sky,
              borderRadius: 2,
            }}
          />
        ) : null}
      </span>
    </div>
  );
};

/** Bloc de conclusion commun à toutes les publicités. */
export const CtaScene: React.FC<{
  title: string;
  subtitle?: string;
  button?: string;
  photo?: string;
}> = ({
  title,
  subtitle = "Audit gratuit · réponse sous 24 h · sans engagement",
  button = "Estimer mes revenus",
  photo = "paris-coucher-de-soleil.jpg",
}) => {
  const L = useLayout();
  return (
    <AbsoluteFill>
      <KenBurns src={photo} zoom={[1.15, 1.02]} />
      <Scrim strength={0.78} />
      <AbsoluteFill
        style={{
          padding: `${L.safeTop}px ${L.padX}px ${L.safeBottom}px`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          textAlign: "center",
        }}
      >
        <Logo width={L.vertical ? 560 : 480} />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: L.vertical ? 44 : 30 }}>
          <WordReveal text={title} size={L.vertical ? 92 : 80} delay={8} />
          <Reveal delay={24}>
            <div style={{ fontFamily: FONT_SANS, fontSize: L.vertical ? 38 : 34, color: "rgba(255,255,255,0.88)" }}>
              {subtitle}
            </div>
          </Reveal>
          <div style={{ marginTop: L.vertical ? 20 : 6 }}>
            <CtaButton label={button} delay={34} size={L.vertical ? 46 : 42} />
          </div>
        </div>
        <Reveal delay={46}>
          <div
            style={{
              fontFamily: FONT_SANS,
              fontWeight: 700,
              fontSize: L.vertical ? 40 : 34,
              color: C.white,
              letterSpacing: "0.02em",
            }}
          >
            {BRAND.url}
            <span style={{ color: C.sky, margin: "0 18px" }}>·</span>
            {BRAND.phone}
          </div>
        </Reveal>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
