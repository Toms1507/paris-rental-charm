import React from "react";
import { linearTiming, springTiming, TransitionPresentation, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";

export type Scene = {
  /** Durée en images (30 i/s). */
  d: number;
  el: React.ReactNode;
  /** Transition vers la scène suivante. */
  t?: "fade" | "slide" | "wipe";
};

const T = 14;

export const seriesDuration = (scenes: Scene[]) =>
  scenes.reduce((sum, s, i) => sum + s.d - (i < scenes.length - 1 ? T : 0), 0);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const presentation = (t: Scene["t"]): TransitionPresentation<any> => {
  if (t === "slide") return slide({ direction: "from-bottom" });
  if (t === "wipe") return wipe({ direction: "from-left" });
  return fade();
};

export const SceneSeries: React.FC<{ scenes: Scene[] }> = ({ scenes }) => (
  <TransitionSeries>
    {scenes.flatMap((s, i) => {
      const nodes = [
        <TransitionSeries.Sequence key={`s${i}`} durationInFrames={s.d}>
          {s.el}
        </TransitionSeries.Sequence>,
      ];
      if (i < scenes.length - 1) {
        nodes.push(
          <TransitionSeries.Transition
            key={`t${i}`}
            presentation={presentation(s.t)}
            timing={
              s.t === "slide"
                ? springTiming({ config: { damping: 200 }, durationInFrames: T })
                : linearTiming({ durationInFrames: T })
            }
          />,
        );
      }
      return nodes;
    })}
  </TransitionSeries>
);
