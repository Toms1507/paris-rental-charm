import React from "react";
import { Audio, Sequence, staticFile } from "remotion";
import script from "../voice/script.json";
import timings from "./voice-timings.json";

// Voix off : texte (voice/script.json) et minutage (src/voice-timings.json, produit par
// voice/build.py). La phrase démarre VOICE_LEAD images après le début de sa scène.

export const VOICE_LEAD = 4;

type Timing = { duration: number; wordStarts: number[]; beats: number };
const T = timings as unknown as Record<string, Timing> & { _total: { beats: number; seconds: number } };

export type LineId = (typeof script)[number]["id"];

export const line = (id: string) => {
  const s = script.find((l) => l.id === id);
  const t = T[id];
  if (!s || !t) throw new Error(`Phrase inconnue : ${id}`);
  return {
    id,
    show: s.show,
    beats: t.beats,
    /** Fin de la parole, en images depuis le début de la scène. */
    end: VOICE_LEAD + Math.round(t.duration * 30),
    starts: t.wordStarts.map((sec) => VOICE_LEAD + Math.round(sec * 30)),
  };
};

export type Line = ReturnType<typeof line>;

export const TOTAL_SECONDS = T._total.seconds;

export const VoiceLine: React.FC<{ id: string }> = ({ id }) => (
  <Sequence from={VOICE_LEAD} layout="none">
    <Audio src={staticFile(`voice/${id}.wav`)} volume={1} />
  </Sequence>
);
