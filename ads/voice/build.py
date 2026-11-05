"""Génère la voix off (voix neuronale Kokoro, voix française « ff_siwis ») phrase par phrase.

    python3 -I voice/build.py <dossier du modèle>

Le dossier du modèle contient kokoro-q8.onnx (paquet npm kokoro-q8-shards, fichiers
concaténés) et voices.npz (voix ff_siwis du paquet npm kokoro-js). Produit
public/voice/<id>.wav et src/voice-timings.json (durée de chaque phrase et instant de
chaque mot, estimé d'après la longueur phonétique des mots).
"""

import json
import subprocess
import re
import sys
from pathlib import Path

import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

ROOT = Path(__file__).resolve().parent.parent
SPEED = 1.18
VOICE = "ff_siwis"

model_dir = Path(sys.argv[1])
k = Kokoro(str(model_dir / "kokoro-q8.onnx"), str(model_dir / "voices.npz"))
lines = json.loads((ROOT / "voice/script.json").read_text())
out_dir = ROOT / "public/voice"
out_dir.mkdir(parents=True, exist_ok=True)

result = {}
for line in lines:
    audio, sr = k.create(line["say"], voice=VOICE, speed=SPEED, lang="fr-fr")
    # Fondu de 10 ms aux extrémités et petit souffle de 60 ms au début.
    f = int(0.01 * sr)
    audio[:f] *= np.linspace(0, 1, f)
    audio[-f:] *= np.linspace(1, 0, f)
    audio = np.concatenate([np.zeros(int(0.06 * sr), dtype=audio.dtype), audio])
    raw = out_dir / f"{line['id']}.raw.wav"
    sf.write(raw, audio, sr)
    # Traitement « studio » : coupe des graves inutiles, compression douce, présence,
    # puis niveau broadcast (-16 LUFS).
    subprocess.run(
        ["ffmpeg", "-v", "error", "-y", "-i", str(raw), "-af",
         "highpass=f=80,rubberband=pitch=0.965:formant=preserved,"
         "acompressor=threshold=-24dB:ratio=3:attack=8:release=120:makeup=2,"
         "equalizer=f=230:t=q:w=1:g=3,equalizer=f=4500:t=q:w=1.4:g=-3,equalizer=f=10000:t=q:w=1:g=1.5,"
         "deesser=i=0.5,aecho=0.8:0.5:16|29:0.08|0.05,loudnorm=I=-16:TP=-1.5:LRA=6", "-ar", "48000", str(out_dir / f"{line['id']}.wav")],
        check=True,
    )
    raw.unlink()
    dur = len(audio) / sr

    # Instant de chaque mot : réparti selon le nombre de phonèmes, pauses comprises.
    # Même découpage que les sous-titres : la ponctuation isolée reste collée au mot précédent.
    words = re.sub(r" ([?:!»])", "\u00a0\\1", line["say"]).split(" ")
    weights = []
    for w in words:
        ph = k.tokenizer.phonemize(re.sub(r"[^\w'-]", "", w) or w, "fr-fr")
        weight = max(1, len(ph.replace(" ", "")))
        if re.search(r"[.?!]$", w):
            weight += 6  # pause de fin de phrase
        elif w.endswith(","):
            weight += 3
        weights.append(weight)
    total = sum(weights)
    speech_start, speech_end = 0.06, dur - 0.05
    t, times = speech_start, []
    for wgt in weights:
        times.append(round(t, 3))
        t += (speech_end - speech_start) * wgt / total
    result[line["id"]] = {"duration": round(dur, 3), "wordStarts": times}
    print(f"{line['id']:10s} {dur:5.2f} s")

# Durée de chaque scène en temps musicaux (120 BPM : 1 temps = 0,5 s) : la phrase démarre
# 4 images après le début de la scène et laisse une petite respiration après.
import math

LEAD = 4 / 30
ids = [l["id"] for l in lines]
for i in ids[:-1]:
    result[i]["beats"] = max(4, math.ceil((LEAD + result[i]["duration"] + 0.2) / 0.5))
# Dernière scène : la phrase, puis au moins 2,5 s pour le bouton et le logo ; durée totale
# arrondie à une mesure entière (2 s) pour que la musique finisse sur l'accord final.
last = ids[-1]
used = sum(result[i]["beats"] for i in ids[:-1])
beats = math.ceil((LEAD + result[last]["duration"] + 2.2) / 0.5)
needed = beats
# Durée imposée : 25 s (50 temps). La dernière scène absorbe le reste.
TARGET_BEATS = 50
if used + beats > TARGET_BEATS:
    raise SystemExit(f"Texte trop long pour 25 s : {(used + beats) / 2} s")
beats = TARGET_BEATS - used
# Le temps en trop va d'abord au montage et à l'offre, pas à la fin.
for extra_to in ["montage", "offre", "montage", "hook3", "logo", "offre"] * 2:
    if beats <= needed or extra_to not in result:
        break
    result[extra_to]["beats"] += 1
    beats -= 1
result[last]["beats"] = beats
total_beats = sum(result[i]["beats"] for i in ids)
result["_total"] = {"beats": total_beats, "seconds": total_beats // 2}

(ROOT / "src/voice-timings.json").write_text(json.dumps(result, indent=1))
print("parole", round(sum(r["duration"] for k2, r in result.items() if k2 != "_total"), 2), "s · vidéo", total_beats / 2, "s")
