import React from "react";
import { AbsoluteFill, Audio, interpolate, staticFile } from "remotion";
import { BEAT } from "./components";
import {
  BenefitScene,
  BumperOpen,
  CtaScene,
  HookScene,
  LogoScene,
  MontageScene,
  OfferScene,
  ReviewScene,
} from "./scenes";
import { Scene, SceneSeries, sceneStart, seriesDuration } from "./series";
import {
  ChatWidget,
  CleanWidget,
  ListingWidget,
  MaintenanceWidget,
  PlatformsWidget,
  PriceWidget,
  RecapWidget,
  ReviewWidget,
} from "./widgets";

// Les trois publicités. Durées en temps musicaux (120 BPM : 2 temps = 1 s).
// La musique (music/generate.py) joue son accord final à `hit` : la scène finale y fait
// claquer le logo.

const Track: React.FC<{ seconds: number; frames: number }> = ({ seconds, frames }) => (
  <Audio
    src={staticFile(`music/track-${seconds}.wav`)}
    volume={(f) => interpolate(f, [frames - 8, frames], [0.6, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
  />
);

const BENEFITS = [
  { photo: "chambre-parisienne.jpg", title: "Une annonce qui *fait* *envie*", sub: "Photos pro, titre et description optimisés", widget: <ListingWidget /> },
  { photo: "hero-paris.jpg", title: "Visible *partout*", sub: "Airbnb, Booking, Abritel, calendriers synchronisés", widget: <PlatformsWidget /> },
  { photo: "toits-de-paris.jpg", title: "Le *bon* *prix*, chaque jour", sub: "Ajusté selon la saison, les événements et la demande", widget: <PriceWidget /> },
  { photo: "remise-des-cles.jpg", title: "Vos voyageurs *chouchoutés*", sub: "Messages, arrivées et départs gérés 7j/7", widget: <ChatWidget /> },
  { photo: "lit-linge-hotelier.jpg", title: "Ménage *de* *niveau* *hôtel*", sub: "Linge professionnel fourni et contrôle après chaque séjour", widget: <CleanWidget /> },
  { photo: "cles-entree.jpg", title: "Les imprévus, *c'est* *nous*", sub: "Maintenance et petits travaux pris en charge", widget: <MaintenanceWidget /> },
  { photo: "chambre-parisienne-portrait.jpg", title: "Vous suivez *tout*", sub: "Un récapitulatif clair de vos revenus chaque mois", widget: <RecapWidget /> },
];

const withAudio = (scenes: Scene[], seconds: number) => {
  const frames = seriesDuration(scenes);
  const Ad: React.FC = () => (
    <AbsoluteFill style={{ background: "#111D30" }}>
      <SceneSeries scenes={scenes} />
      <Track seconds={seconds} frames={frames} />
    </AbsoluteFill>
  );
  return { Ad, frames };
};


// --- 30 s : la publicité complète ----------------------------------------------------------
const scenes30: Scene[] = [
  { beats: 4, el: <HookScene photo="hero-salon.jpg" eyebrow="Propriétaires à Paris" text={"Louez votre bien\n*sans* *lever* *le*\n*petit* *doigt.*"} />, t: "fade" },
  { beats: 4, el: <LogoScene text={"On s'occupe de *tout.*"} />, t: "left" },
  ...BENEFITS.map((b, i): Scene => ({
    beats: 4,
    el: <BenefitScene photo={b.photo} index={i + 1} total={BENEFITS.length} title={b.title} sub={b.sub} widget={b.widget} />,
    t: i % 3 === 2 ? "wipe" : "left",
  })),
  { beats: 4, el: <ReviewScene widget={<ReviewWidget />} />, t: "fade" },
  {
    beats: 6,
    el: (
      <MontageScene
        items={[
          { photo: "appartement-balcon.jpg", word: "Annonce" },
          { photo: "remise-des-cles.jpg", word: "Voyageurs" },
          { photo: "lit-serviettes.jpg", word: "Ménage" },
          { photo: "paris-rooftops.jpg", word: "Prix" },
          { photo: "vue-sacre-coeur.jpg", word: "Entretien" },
          { photo: "hero-salon.jpg", word: "Sérénité" },
        ]}
      />
    ),
    t: "fade",
  },
  { beats: 6, el: <OfferScene />, t: "up" },
];
scenes30.push({
  beats: 8,
  el: <CtaScene title={"Combien peut rapporter\n*votre* *logement* ?"} button="Mon estimation gratuite" hit={56 * BEAT - sceneStart(scenes30, scenes30.length)} />,
});

// --- 15 s : la version courte -------------------------------------------------------------
const scenes15: Scene[] = [
  { beats: 4, el: <HookScene photo="hero-salon.jpg" eyebrow="Propriétaires à Paris" text={"Votre location\n*gérée* *de* *A* *à* *Z*"} />, t: "fade" },
  { beats: 4, el: <LogoScene text={"On s'occupe de *tout.*"} />, t: "fade" },
  {
    beats: 8,
    el: (
      <MontageScene
        items={[
          { photo: "chambre-parisienne.jpg", word: "Photos pro" },
          { photo: "hero-paris.jpg", word: "Annonces" },
          { photo: "toits-de-paris.jpg", word: "Prix" },
          { photo: "remise-des-cles.jpg", word: "Voyageurs" },
          { photo: "lit-linge-hotelier.jpg", word: "Ménage" },
          { photo: "lit-serviettes.jpg", word: "Linge" },
          { photo: "cles-entree.jpg", word: "Entretien" },
          { photo: "appartement-balcon.jpg", word: "Sérénité" },
        ]}
      />
    ),
    t: "fade",
  },
  { beats: 6, el: <OfferScene />, t: "up" },
];
scenes15.push({
  beats: 8,
  el: <CtaScene title={"Confiez-nous\n*votre* *logement*"} button="Audit gratuit" hit={28 * BEAT - sceneStart(scenes15, scenes15.length)} />,
});

// --- 6 s : format « bumper » YouTube (non désactivable) -------------------------------------
const scenes6: Scene[] = [
  { beats: 4, el: <BumperOpen />, t: "fade" },
  {
    beats: 4,
    el: (
      <MontageScene
        items={[
          { photo: "chambre-parisienne.jpg", word: "Annonce" },
          { photo: "remise-des-cles.jpg", word: "Voyageurs" },
          { photo: "lit-linge-hotelier.jpg", word: "Ménage" },
          { photo: "toits-de-paris.jpg", word: "Revenus" },
        ]}
      />
    ),
    t: "fade",
  },
];
scenes6.push({
  beats: 4,
  el: <CtaScene title="Audit *gratuit*" button="Estimer mes revenus" sub="20 % tout compris · sans engagement" hit={8 * BEAT - sceneStart(scenes6, scenes6.length)} />,
});

export const AD30 = withAudio(scenes30, 30);
export const AD15 = withAudio(scenes15, 15);
export const AD6 = withAudio(scenes6, 6);

