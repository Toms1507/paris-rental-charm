import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import {
  BrandBackground,
  CheckRow,
  Counter,
  CtaScene,
  Eyebrow,
  Icon,
  KenBurns,
  Logo,
  Reveal,
  Scrim,
  useLayout,
  useSpring,
  WordReveal,
} from "../components";
import { Scene, SceneSeries, seriesDuration } from "../series";
import { BRAND, C, FONT_DISPLAY, FONT_SANS } from "../theme";

// « Pourquoi choisir Spinelle » : accroche → problème → solution → 5 raisons → offre → appel à l'action.

const Hook: React.FC = () => {
  const L = useLayout();
  return (
    <AbsoluteFill>
      <KenBurns src="hero-salon.jpg" zoom={[1.25, 1.08]} position="50% 50%" />
      <Scrim strength={0.7} />
      <AbsoluteFill
        style={{
          padding: `${L.safeTop}px ${L.padX}px ${L.safeBottom}px`,
          justifyContent: "center",
          alignItems: "center",
          gap: 40,
        }}
      >
        <Eyebrow>Propriétaires à Paris</Eyebrow>
        <WordReveal
          text={"Et si votre\nappartement\n*travaillait* *pour* *vous* ?"}
          size={L.vertical ? 112 : 96}
          delay={6}
          stagger={4}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const PAINS = [
  "Les messages à 23 h",
  "Le ménage entre chaque séjour",
  "Les remises de clés",
  "Les prix à revoir chaque jour",
  "La règle des 90 nuits",
];

const Pain: React.FC = () => {
  const L = useLayout();
  const frame = useCurrentFrame();
  const out = interpolate(frame, [92, 104], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const answer = useSpring(100, { damping: 14 });
  return (
    <AbsoluteFill>
      <BrandBackground />
      <AbsoluteFill
        style={{
          padding: `${L.safeTop}px ${L.padX}px ${L.safeBottom}px`,
          justifyContent: "center",
          gap: L.vertical ? 46 : 30,
          opacity: out,
        }}
      >
        <WordReveal
          text="Louer en courte durée, c'est aussi…"
          size={L.vertical ? 70 : 60}
          align="left"
          stagger={2}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: L.vertical ? 34 : 22, marginTop: 20 }}>
          {PAINS.map((p, i) => (
            <CheckRow key={p} label={p} icon="x" iconColor="#FF8A8A" delay={18 + i * 12} size={L.vertical ? 52 : 42} />
          ))}
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: L.padX }}>
        <div
          style={{
            opacity: answer,
            transform: `scale(${0.8 + answer * 0.2})`,
            fontFamily: FONT_DISPLAY,
            fontWeight: 600,
            fontSize: L.vertical ? 104 : 90,
            color: C.white,
            textAlign: "center",
            lineHeight: 1.08,
          }}
        >
          …sauf si on
          <br />
          <span style={{ color: C.sky }}>s'en occupe.</span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const BrandReveal: React.FC = () => {
  const L = useLayout();
  return (
    <AbsoluteFill>
      <BrandBackground light />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 70, padding: L.padX }}>
        <Logo variant="color" width={L.vertical ? 780 : 700} />
        <WordReveal
          text={`${BRAND.slogan[0]}\n*${BRAND.slogan[1].replaceAll(" ", "* *")}*`}
          size={L.vertical ? 66 : 58}
          color={C.ink}
          accent={C.navy}
          delay={16}
          stagger={2}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

type Reason = { icon: string; title: string; text: string; photo: string; position?: string };

const REASONS: Reason[] = [
  {
    icon: "camera",
    title: "Une annonce qui se démarque",
    text: "Photos pro, titre et description travaillés pour Airbnb et Booking.",
    photo: "chambre-parisienne.jpg",
  },
  {
    icon: "trending",
    title: "Des prix ajustés chaque jour",
    text: "Selon la saison, les événements parisiens et la demande du quartier.",
    photo: "toits-de-paris.jpg",
  },
  {
    icon: "message",
    title: "Vos voyageurs gérés 7j/7",
    text: "Réponse en moins d'une heure, arrivées et départs organisés.",
    photo: "remise-des-cles.jpg",
  },
  {
    icon: "sparkles",
    title: "Un ménage de niveau hôtel",
    text: "Linge professionnel et contrôle après chaque départ.",
    photo: "lit-linge-hotelier.jpg",
  },
  {
    icon: "shield",
    title: "La conformité, c'est nous",
    text: "Enregistrement en mairie, plafond des 90 nuits, taxe de séjour.",
    photo: "vue-sacre-coeur.jpg",
  },
];

const ReasonScene: React.FC<{ r: Reason; index: number }> = ({ r, index }) => {
  const L = useLayout();
  const card = useSpring(4);
  const photoH = L.vertical ? 900 : 560;
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      <BrandBackground />
      <AbsoluteFill style={{ padding: `${L.safeTop - (L.vertical ? 40 : 20)}px ${L.padX}px ${L.safeBottom}px` }}>
        <div
          style={{
            position: "relative",
            height: photoH,
            borderRadius: 36,
            overflow: "hidden",
            transform: `scale(${0.94 + card * 0.06})`,
            opacity: card,
            boxShadow: "0 40px 80px -30px rgba(0,0,0,0.6)",
          }}
        >
          <KenBurns src={r.photo} zoom={[1.08, 1.22]} pan={[10, -20]} position={r.position} />
          <div
            style={{
              position: "absolute",
              top: 30,
              left: 30,
              padding: "12px 26px",
              borderRadius: 999,
              background: "rgba(17,29,48,0.75)",
              color: C.white,
              fontFamily: FONT_SANS,
              fontWeight: 700,
              fontSize: 28,
              letterSpacing: "0.08em",
            }}
          >
            RAISON {index + 1} / {REASONS.length}
          </div>
        </div>
        <div style={{ marginTop: L.vertical ? 70 : 44, display: "flex", flexDirection: "column", gap: 26 }}>
          <Reveal delay={8}>
            <div
              style={{
                width: 96,
                height: 96,
                borderRadius: 26,
                background: "rgba(152,204,235,0.15)",
                border: `2px solid ${C.sky}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name={r.icon} size={54} />
            </div>
          </Reveal>
          <WordReveal text={r.title} size={L.vertical ? 76 : 64} align="left" delay={12} stagger={2} />
          <Reveal delay={22}>
            <div
              style={{
                fontFamily: FONT_SANS,
                fontSize: L.vertical ? 44 : 36,
                lineHeight: 1.35,
                color: "rgba(255,255,255,0.82)",
              }}
            >
              {r.text}
            </div>
          </Reveal>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const Offer: React.FC = () => {
  const L = useLayout();
  return (
    <AbsoluteFill>
      <BrandBackground />
      <AbsoluteFill
        style={{
          padding: `${L.safeTop}px ${L.padX}px ${L.safeBottom}px`,
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <Eyebrow>Un seul tarif</Eyebrow>
        <div
          style={{
            fontFamily: FONT_DISPLAY,
            fontWeight: 700,
            fontSize: L.vertical ? 330 : 270,
            lineHeight: 1,
            color: C.white,
            marginTop: 20,
          }}
        >
          <Counter from={0} to={20} delay={6} duration={26} />
          <span style={{ color: C.sky }}>&nbsp;%</span>
        </div>
        <Reveal delay={22}>
          <div style={{ fontFamily: FONT_SANS, fontSize: L.vertical ? 46 : 40, color: C.white, fontWeight: 500 }}>
            des revenus encaissés, <b style={{ color: C.sky }}>tout compris</b>
          </div>
        </Reveal>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: L.vertical ? 30 : 20,
            marginTop: L.vertical ? 80 : 50,
            alignItems: "flex-start",
          }}
        >
          <CheckRow label="0 € de frais de mise en place" delay={34} size={L.vertical ? 46 : 38} />
          <CheckRow label="Sans engagement de durée" delay={44} size={L.vertical ? 46 : 38} />
          <CheckRow label="Vous ne payez que si c'est loué" delay={54} size={L.vertical ? 46 : 38} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const scenes: Scene[] = [
  { d: 84, el: <Hook />, t: "fade" },
  { d: 140, el: <Pain />, t: "wipe" },
  { d: 80, el: <BrandReveal />, t: "slide" },
  ...REASONS.map(
    (r, i): Scene => ({ d: 78, el: <ReasonScene r={r} index={i} />, t: i === REASONS.length - 1 ? "fade" : "slide" }),
  ),
  { d: 120, el: <Offer />, t: "fade" },
  { d: 150, el: <CtaScene title={"Combien peut rapporter\n*votre* *bien* ?"} /> },
];

export const WHY_DURATION = seriesDuration(scenes);

export const WhySpinelle: React.FC = () => <SceneSeries scenes={scenes} />;
