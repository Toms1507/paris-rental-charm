import React from "react";
import { AbsoluteFill, Img } from "remotion";
import {
  BrandBackground,
  CtaScene,
  Eyebrow,
  KenBurns,
  Reveal,
  Scrim,
  Stars,
  useLayout,
  useSpring,
  WordReveal,
} from "../components";
import { Scene, SceneSeries, seriesDuration } from "../series";
import { C, FONT_DISPLAY, FONT_SANS, img } from "../theme";

// Preuve sociale : extraits fidèles des avis Airbnb publiés sur le site (src/content/site.ts).

type Quote = { name: string; from: string; date: string; photo: string; text: string; translated?: boolean };

const QUOTES: Quote[] = [
  {
    name: "Feli",
    from: "Augsbourg, Allemagne",
    date: "déc. 2025",
    photo: "feli.jpg",
    text: "« La communication était merveilleuse. On m'a toujours répondu très rapidement… Je ne peux que le recommander à tout le monde. »",
    translated: true,
  },
  {
    name: "Mathilde",
    from: "Chanteloup-les-Vignes",
    date: "juin 2025",
    photo: "mathilde-chanteloup.jpg",
    text: "« Tom est un hôte hyper accueillant, gentil et sympa. Il est à l'écoute réactif pour répondre et disponible pour toute demande. »",
  },
  {
    name: "Mathilde",
    from: "Rouen",
    date: "avr. 2026",
    photo: "mathilde-rouen.jpg",
    text: "« Emplacement idéal en plein cœur de la ville ! Tom nous a fourni de nombreux conseils pour découvrir la ville. Parfait pour un we ! »",
  },
];

const Intro: React.FC = () => {
  const L = useLayout();
  return (
    <AbsoluteFill>
      <KenBurns src="chambre-parisienne-portrait.jpg" zoom={[1.2, 1.05]} />
      <Scrim strength={0.68} />
      <AbsoluteFill
        style={{
          padding: `${L.safeTop}px ${L.padX}px ${L.safeBottom}px`,
          justifyContent: "center",
          alignItems: "center",
          gap: 50,
        }}
      >
        <Stars size={L.vertical ? 110 : 90} delay={4} />
        <WordReveal
          text={"Ce que disent\n*nos* *voyageurs*"}
          size={L.vertical ? 108 : 92}
          delay={22}
          stagger={4}
        />
        <Reveal delay={40}>
          <div style={{ fontFamily: FONT_SANS, fontSize: L.vertical ? 38 : 34, color: "rgba(255,255,255,0.85)" }}>
            Avis 5 étoiles publiés sur Airbnb
          </div>
        </Reveal>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const QuoteCard: React.FC<{ q: Quote }> = ({ q }) => {
  const L = useLayout();
  const p = useSpring(2, { damping: 18 });
  return (
    <AbsoluteFill>
      <BrandBackground />
      <AbsoluteFill
        style={{
          padding: `${L.safeTop}px ${L.padX}px ${L.safeBottom}px`,
          justifyContent: "center",
        }}
      >
        <div
          style={{
            background: C.white,
            borderRadius: 40,
            padding: L.vertical ? "70px 64px" : "56px 56px",
            boxShadow: "0 50px 100px -30px rgba(0,0,0,0.55)",
            transform: `translateY(${(1 - p) * 120}px) rotate(${(1 - p) * -3}deg)`,
            opacity: p,
            display: "flex",
            flexDirection: "column",
            gap: L.vertical ? 44 : 32,
          }}
        >
          <Stars size={L.vertical ? 62 : 52} delay={10} />
          <div
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: L.vertical ? 60 : 50,
              lineHeight: 1.25,
              color: C.ink,
              fontWeight: 400,
            }}
          >
            <WordReveal
              text={q.text}
              size={L.vertical ? 60 : 50}
              color={C.ink}
              weight={400}
              align="left"
              lineHeight={1.25}
              delay={14}
              stagger={1}
            />
          </div>
          <Reveal delay={30}>
            <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
              <Img
                src={img(q.photo)}
                style={{ width: 110, height: 110, borderRadius: 999, objectFit: "cover" }}
              />
              <div style={{ fontFamily: FONT_SANS }}>
                <div style={{ fontWeight: 700, fontSize: 40, color: C.ink }}>{q.name}</div>
                <div style={{ fontSize: 30, color: C.muted }}>
                  {q.from} · {q.date}
                  {q.translated ? " · traduit" : ""}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Equation: React.FC = () => {
  const L = useLayout();
  const lines = [
    { t: "Voyageurs ravis", c: C.white },
    { t: "Meilleurs avis", c: C.white },
    { t: "Plus de réservations", c: C.sky },
  ];
  return (
    <AbsoluteFill>
      <BrandBackground />
      <AbsoluteFill
        style={{
          padding: `${L.safeTop}px ${L.padX}px ${L.safeBottom}px`,
          justifyContent: "center",
          alignItems: "center",
          gap: L.vertical ? 30 : 18,
        }}
      >
        <Eyebrow>Le cercle vertueux</Eyebrow>
        {lines.map((l, i) => (
          <React.Fragment key={l.t}>
            {i > 0 ? (
              <Reveal delay={i * 18 - 6}>
                <div style={{ fontFamily: FONT_SANS, fontSize: 60, color: C.sky, lineHeight: 1 }}>↓</div>
              </Reveal>
            ) : null}
            <Reveal delay={i * 18 + 4}>
              <div
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontWeight: 600,
                  fontSize: L.vertical ? 92 : 76,
                  color: l.c,
                  textAlign: "center",
                }}
              >
                {l.t}
              </div>
            </Reveal>
          </React.Fragment>
        ))}
        <Reveal delay={66}>
          <div
            style={{
              marginTop: 30,
              fontFamily: FONT_SANS,
              fontSize: L.vertical ? 38 : 34,
              color: "rgba(255,255,255,0.85)",
              textAlign: "center",
            }}
          >
            On soigne chaque séjour pour faire grimper votre annonce.
          </div>
        </Reveal>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const scenes: Scene[] = [
  { d: 84, el: <Intro />, t: "slide" },
  ...QUOTES.map((q): Scene => ({ d: 96, el: <QuoteCard q={q} />, t: "slide" })),
  { d: 110, el: <Equation />, t: "fade" },
  {
    d: 150,
    el: <CtaScene title={"Confiez-nous\n*votre* *logement*"} photo="hero-salon.jpg" button="Audit gratuit" />,
  },
];

export const REVIEWS_DURATION = seriesDuration(scenes);

export const Reviews: React.FC = () => <SceneSeries scenes={scenes} />;
