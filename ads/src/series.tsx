import React from "react";
import { linearTiming, TransitionPresentation, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { BEAT } from "./components";

export type Scene = {
  /** Durée en temps musicaux (1 temps = 0,5 s). */
  beats: number;
  el: React.ReactNode;
  /** Transition vers la scène suivante. */
  t?: "fade" | "left" | "up" | "wipe";
};

/** Transitions très courtes (0,2 s), lancées pile sur le temps. */
const T = 6;

export const seriesDuration = (scenes: Scene[]) => scenes.reduce((sum, s) => sum + s.beats * BEAT, 0);

/** Image (depuis le début de la vidéo) où commence la scène n. */
export const sceneStart = (scenes: Scene[], n: number) =>
  scenes.slice(0, n).reduce((sum, s) => sum + s.beats * BEAT, 0);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const presentation = (t: Scene["t"]): TransitionPresentation<any> => {
  if (t === "left") return slide({ direction: "from-right" });
  if (t === "up") return slide({ direction: "from-bottom" });
  if (t === "wipe") return wipe({ direction: "from-left" });
  return fade();
};

// Chaque scène dure (temps × 15) + T images, la transition empiète de T images sur la
// suivante : les scènes démarrent donc exactement sur un temps de la musique.
export const SceneSeries: React.FC<{ scenes: Scene[] }> = ({ scenes }) => (
  <TransitionSeries>
    {scenes.flatMap((s, i) => {
      const last = i === scenes.length - 1;
      const nodes = [
        <TransitionSeries.Sequence key={`s${i}`} durationInFrames={s.beats * BEAT + (last ? 0 : T)}>
          {s.el}
        </TransitionSeries.Sequence>,
      ];
      if (!last) {
        nodes.push(
          <TransitionSeries.Transition key={`t${i}`} presentation={presentation(s.t)} timing={linearTiming({ durationInFrames: T })} />,
        );
      }
      return nodes;
    })}
  </TransitionSeries>
);
