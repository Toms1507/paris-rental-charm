import React from "react";
import { Composition, Folder } from "remotion";
import "./theme";
import { WhySpinelle, WHY_DURATION } from "./ads/WhySpinelle";
import { Nights90, NIGHTS_DURATION } from "./ads/Nights90";
import { Reviews, REVIEWS_DURATION } from "./ads/Reviews";
import { ToutCompris, TOUT_COMPRIS_DURATION } from "./ads/ToutCompris";

const ADS = [
  { id: "PourquoiSpinelle", component: WhySpinelle, duration: WHY_DURATION },
  { id: "Regle90Nuits", component: Nights90, duration: NIGHTS_DURATION },
  { id: "AvisVoyageurs", component: Reviews, duration: REVIEWS_DURATION },
  { id: "ToutCompris20", component: ToutCompris, duration: TOUT_COMPRIS_DURATION },
];

// 9:16 pour Reels, TikTok et Stories ; 4:5 pour le fil Instagram / Facebook.
const FORMATS = [
  { suffix: "9x16", width: 1080, height: 1920 },
  { suffix: "4x5", width: 1080, height: 1350 },
];

export const Root: React.FC = () => (
  <>
    {FORMATS.map((f) => (
      <Folder key={f.suffix} name={`Format-${f.suffix}`}>
        {ADS.map((ad) => (
          <Composition
            key={ad.id}
            id={`${ad.id}-${f.suffix}`}
            component={ad.component}
            durationInFrames={ad.duration}
            fps={30}
            width={f.width}
            height={f.height}
          />
        ))}
      </Folder>
    ))}
  </>
);
