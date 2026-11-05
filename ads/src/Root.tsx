import React from "react";
import { Composition, Folder } from "remotion";
import "./theme";
import { AD15, AD30, AD6, AD_VOICE } from "./ads";

const ADS = [
  { id: "SpinelleVoixOff", ...AD_VOICE },
  { id: "Spinelle30s", ...AD30 },
  { id: "Spinelle15s", ...AD15 },
  { id: "Spinelle6s", ...AD6 },
];

// Formats Google Ads / YouTube : 16:9 (in-stream), 9:16 (Shorts), 1:1 (Demand Gen, Discover).
const FORMATS = [
  { suffix: "16x9", width: 1920, height: 1080 },
  { suffix: "9x16", width: 1080, height: 1920 },
  { suffix: "1x1", width: 1080, height: 1080 },
];

export const Root: React.FC = () => (
  <>
    {FORMATS.map((f) => (
      <Folder key={f.suffix} name={`Format-${f.suffix}`}>
        {ADS.map((ad) => (
          <Composition
            key={ad.id}
            id={`${ad.id}-${f.suffix}`}
            component={ad.Ad}
            durationInFrames={ad.frames}
            fps={30}
            width={f.width}
            height={f.height}
          />
        ))}
      </Folder>
    ))}
  </>
);
