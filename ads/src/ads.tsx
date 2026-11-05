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


// --- Publicité avec voix off (version principale) ------------------------------------------
import { SpeakBenefitScene, SpeakCtaScene, SpeakLogoScene, SpeakOfferScene } from "./talk";
import { line, TOTAL_SECONDS } from "./voice";
import { CalendarCard, ColorizePhoto, LightSweep, RentCard, ServiceChain } from "./montage";

const V = (id: string) => line(id);
const voiceScenes: Scene[] = [
  {
    beats: V("hook1").beats,
    el: (
      <SpeakBenefitScene
        photo="chambre-parisienne.jpg"
        l={V("hook1")}
        background={<ColorizePhoto src="chambre-parisienne.jpg" from={0} to={1} at={V("hook1").starts[4]!} />}
        widget={<CalendarCard mode="empty" delay={V("hook1").starts[4]! - 2} />}
      />
    ),
    t: "fade",
  },
  {
    beats: V("hook2").beats,
    el: (
      <SpeakBenefitScene
        photo="hero-paris.jpg"
        l={V("hook2")}
        background={<ColorizePhoto src="hero-paris.jpg" from={0.85} to={0.85} />}
        widget={<RentCard delay={V("hook2").starts[2]!} />}
      />
    ),
    t: "fade",
  },
  {
    beats: V("hook3").beats,
    el: (
      <SpeakBenefitScene
        photo="paris-coucher-de-soleil.jpg"
        l={V("hook3")}
        background={<ColorizePhoto src="paris-coucher-de-soleil.jpg" from={1} to={0} at={V("hook3").starts[5]!} />}
        overlay={<LightSweep at={V("hook3").starts[5]!} />}
        widget={<CalendarCard mode="filling" delay={V("hook3").starts[5]! - 4} />}
      />
    ),
    t: "fade",
  },
  { beats: V("logo").beats, el: <SpeakLogoScene l={V("logo")} chain={<ServiceChain delay={V("logo").starts[8]!} />} />, t: "fade" },
  { beats: V("annonce").beats, el: <SpeakBenefitScene photo="appartement-balcon.jpg" l={V("annonce")} sub="Photos pro · Airbnb, Booking, Abritel" widget={<ListingWidget />} overlay={<LightSweep at={V("annonce").starts[6]!} />} />, t: "fade" },
  { beats: V("prix").beats, el: <SpeakBenefitScene photo="toits-de-paris.jpg" l={V("prix")} sub="Selon la saison, les événements et la demande" widget={<PriceWidget />} />, t: "fade" },
  { beats: V("voyageurs").beats, el: <SpeakBenefitScene photo="remise-des-cles.jpg" l={V("voyageurs")} sub="Messages, arrivées et départs gérés pour vous" widget={<ChatWidget />} />, t: "fade" },
  { beats: V("menage").beats, el: <SpeakBenefitScene photo="lit-linge-hotelier.jpg" l={V("menage")} sub="Linge professionnel et contrôle après chaque séjour" widget={<CleanWidget />} overlay={<LightSweep at={V("menage").starts[3]!} />} />, t: "fade" },
  { beats: V("suivi").beats, el: <SpeakBenefitScene photo="chambre-parisienne-portrait.jpg" l={V("suivi")} sub="Un récapitulatif clair, en toute transparence" widget={<RecapWidget />} />, t: "fade" },
  { beats: V("offre").beats, el: <SpeakOfferScene l={V("offre")} />, t: "fade" },
];
// Accord final de la musique à TOTAL - 2 s : le logo apparaît à cet instant.
voiceScenes.push({
  beats: V("cta").beats,
  el: <SpeakCtaScene l={V("cta")} hit={(TOTAL_SECONDS - 2) * 30 - sceneStart(voiceScenes, voiceScenes.length)} />,
});

const voiceFrames = seriesDuration(voiceScenes);
const VoiceAd: React.FC = () => (
  <AbsoluteFill style={{ background: "#111D30" }}>
    <SceneSeries scenes={voiceScenes} />
    <Audio
      src={staticFile(`music/track-${TOTAL_SECONDS}.wav`)}
      volume={(f) =>
        interpolate(f, [0, voiceFrames - 80, voiceFrames - 50, voiceFrames - 6, voiceFrames], [0.2, 0.2, 0.5, 0.5, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      }
    />
  </AbsoluteFill>
);
export const AD_VOICE = { Ad: VoiceAd, frames: voiceFrames };
