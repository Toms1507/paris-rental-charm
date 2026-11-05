"""Compose une petite musique house/pop positive (120 BPM) pour les publicités.

Musique générée de toutes pièces par ce script : aucun échantillon externe, donc aucun
problème de droits sur YouTube / Google Ads.

    python3 music/generate.py 30 public/music/track-30.wav

Le morceau est calé sur une grille de 120 BPM (1 temps = 0,5 s = 15 images à 30 i/s) et se
termine par un accord final qui résonne (à 4 s pour 6 s, 14 s pour 15 s, 28 s pour 30 s).
"""

import sys
import wave

import numpy as np
from scipy.signal import butter, lfilter, sosfilt

SR = 44100
BPM = 120
BEAT = 60 / BPM
BAR = BEAT * 4
rng = np.random.default_rng(7)


def note_hz(n: int) -> float:
    """Numéro MIDI → fréquence."""
    return 440.0 * 2 ** ((n - 69) / 12)


def env(n: int, attack: float, decay: float) -> np.ndarray:
    t = np.arange(n) / SR
    a = np.clip(t / max(attack, 1e-4), 0, 1)
    return a * np.exp(-t / decay)


def saw(freq: float, n: int, phase: float = 0.0) -> np.ndarray:
    t = np.arange(n) / SR
    return 2 * ((t * freq + phase) % 1) - 1


def lowpass(x: np.ndarray, cutoff: float, order: int = 2) -> np.ndarray:
    sos = butter(order, cutoff, "low", fs=SR, output="sos")
    return sosfilt(sos, x)


def highpass(x: np.ndarray, cutoff: float, order: int = 2) -> np.ndarray:
    sos = butter(order, cutoff, "high", fs=SR, output="sos")
    return sosfilt(sos, x)


def bandpass(x: np.ndarray, lo: float, hi: float) -> np.ndarray:
    sos = butter(2, [lo, hi], "band", fs=SR, output="sos")
    return sosfilt(sos, x)


def add(buf: np.ndarray, sig: np.ndarray, at: float, gain: float = 1.0) -> None:
    i = int(at * SR)
    if i >= len(buf):
        return
    j = min(len(buf), i + len(sig))
    buf[i:j] += sig[: j - i] * gain


# --- Instruments -------------------------------------------------------------------------

def kick() -> np.ndarray:
    n = int(0.45 * SR)
    t = np.arange(n) / SR
    # Grosse caisse douce et courte : présente sans « boum boum ».
    f = 62 + 70 * np.exp(-t / 0.025)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-t / 0.11)
    click = highpass(rng.standard_normal(n), 2000) * np.exp(-t / 0.003) * 0.12
    return (body + click) * 0.8


def clap() -> np.ndarray:
    n = int(0.3 * SR)
    t = np.arange(n) / SR
    noise = bandpass(rng.standard_normal(n), 900, 5000)
    e = np.zeros(n)
    for k, d in enumerate([0.0, 0.011, 0.022]):
        i = int(d * SR)
        e[i:] += np.exp(-(t[: n - i]) / (0.012 if k < 2 else 0.12))
    tone = np.sin(2 * np.pi * 190 * t) * np.exp(-t / 0.05) * 0.3
    return (noise * e * 0.6 + tone) * 0.9


def hat(open_: bool = False) -> np.ndarray:
    n = int((0.18 if open_ else 0.05) * SR)
    noise = highpass(rng.standard_normal(n), 7500, 4)
    return noise * env(n, 0.001, 0.06 if open_ else 0.012)


def bass_note(midi: int, length: float) -> np.ndarray:
    n = int(length * SR)
    f = note_hz(midi)
    x = saw(f, n) * 0.6 + np.sin(2 * np.pi * f * np.arange(n) / SR) * 0.7
    x = lowpass(x, 700)
    return x * env(n, 0.004, length * 0.7)


def pad_chord(midis: list[int], length: float, stereo_side: int) -> np.ndarray:
    n = int(length * SR)
    x = np.zeros(n)
    for m in midis:
        for det in (-0.12, 0.0, 0.12):
            x += saw(note_hz(m + det + stereo_side * 0.04), n, rng.random())
    x = lowpass(x / (len(midis) * 3), 1900)
    a = np.clip(np.arange(n) / (0.02 * SR), 0, 1)
    r = np.clip((n - np.arange(n)) / (0.05 * SR), 0, 1)
    return x * a * r


def pluck(midi: int) -> np.ndarray:
    n = int(0.35 * SR)
    f = note_hz(midi)
    t = np.arange(n) / SR
    x = np.sin(2 * np.pi * f * t) + 0.35 * saw(f, n) + 0.2 * np.sin(4 * np.pi * f * t)
    return lowpass(x, 5000) * env(n, 0.002, 0.09)


def riser(length: float) -> np.ndarray:
    n = int(length * SR)
    t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    out = np.zeros(n)
    # Bruit blanc filtré dont la fréquence monte (traité par blocs).
    block = 2048
    for i in range(0, n, block):
        p = i / n
        cut = 400 + 9000 * p**2
        b, a = butter(2, cut, "low", fs=SR)
        out[i : i + block] = lfilter(b, a, noise[i : i + block])
    return out * (t / length) ** 2 * 0.8


def impact() -> np.ndarray:
    n = int(1.6 * SR)
    t = np.arange(n) / SR
    f = 40 + 60 * np.exp(-t / 0.08)
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.5)
    noise = lowpass(rng.standard_normal(n), 3000) * np.exp(-t / 0.25) * 0.3
    return sub + noise


# --- Arrangement -------------------------------------------------------------------------

# I – V – vi – IV en do majeur : la progression « feel good » par excellence.
CHORDS = [
    (48, [60, 64, 67, 72]),  # Do
    (43, [59, 62, 67, 71]),  # Sol
    (45, [60, 64, 69, 72]),  # La mineur
    (41, [60, 65, 69, 72]),  # Fa
]
# Motif d'arpège sur 16 doubles-croches (indices dans l'accord, +12 = octave).
ARP = [0, 2, 3, 2, 1, 3, 2, 1, 0, 2, 3, 2, 1, 3, 2, 3]


def compose(total: float) -> np.ndarray:
    # Groove jusqu'à la dernière mesure entière qui laisse au moins 1 s à l'accord final.
    groove_bars = int((total - 1.0) // BAR)
    n = int((total + 0.1) * SR)
    drums = np.zeros(n)
    bass = np.zeros(n)
    pad_l = np.zeros(n)
    pad_r = np.zeros(n)
    lead = np.zeros(n)
    fx = np.zeros(n)
    k, c, ho, hc = kick(), clap(), hat(True), hat(False)

    for b in range(groove_bars):
        t0 = b * BAR
        root, chord = CHORDS[b % 4]
        build = b == groove_bars - 1 and groove_bars > 2  # mesure de montée avant la fin
        for beat in range(4):
            tb = t0 + beat * BEAT
            if not (build and beat >= 2):
                add(drums, k, tb, 1.0)
            if beat in (1, 3):
                add(drums, c, tb, 0.38)
            add(drums, ho, tb + BEAT / 2, 0.15)
            for s in range(4):
                if s != 2:
                    add(drums, hc, tb + s * BEAT / 4, 0.06 + 0.03 * (s == 0))
            # Basse « house » sur les contretemps.
            add(bass, bass_note(root, BEAT / 2 * 0.9), tb + BEAT / 2, 0.75)
            if beat == 0:
                add(bass, bass_note(root, BEAT / 4), tb, 0.45)
        if build:
            for s in range(8):  # roulement de caisse claire
                add(drums, c, t0 + 2 * BEAT + s * BEAT / 4, 0.18 + s * 0.04)
            add(fx, riser(BAR), t0, 0.5)
        add(pad_l, pad_chord(chord, BAR, -1), t0, 1.0)
        add(pad_r, pad_chord(chord, BAR, 1), t0, 1.0)
        if b >= 1 or groove_bars <= 2:
            for s, idx in enumerate(ARP):
                m = chord[idx % 4] + 12 + (12 if s in (4, 12) else 0)
                add(lead, pluck(m), t0 + s * BEAT / 4, 0.32)

    # Accord final.
    tf = groove_bars * BAR
    root, chord = CHORDS[0]
    add(drums, k, tf, 0.8)
    add(drums, c, tf, 0.35)
    add(fx, impact(), tf, 0.25)
    fin = pad_chord(chord + [76], BAR + 0.1, 0) * np.exp(-np.arange(int((BAR + 0.1) * SR)) / SR / 0.8)
    add(pad_l, fin, tf, 1.3)
    add(pad_r, fin, tf, 1.3)
    add(bass, bass_note(root, 1.5) * np.exp(-np.arange(int(1.5 * SR)) / SR / 0.6), tf, 0.9)
    add(lead, pluck(chord[3] + 12), tf, 0.5)

    # Sidechain : les nappes « pompent » au rythme de la grosse caisse.
    t = np.arange(n) / SR
    phase = (t % BEAT) / BEAT
    duck = 1 - 0.3 * np.exp(-phase / 0.15)
    duck[t >= tf] = 1
    pad_l *= duck
    pad_r *= duck
    bass_d = lowpass(bass, 450) * (1 - 0.15 * np.exp(-phase / 0.1))

    # Écho ping-pong sur l'arpège (3 doubles-croches).
    d = int(BEAT * 0.75 * SR)
    lead_l, lead_r = lead.copy(), lead.copy() * 0.6
    echo = lead.copy()
    for rep in range(1, 5):
        echo = np.concatenate([np.zeros(d), echo[:-d]]) * 0.42
        (lead_r if rep % 2 else lead_l)[:] += lowpass(echo, 3500)

    left = drums * 0.6 + bass_d * 0.55 + pad_l * 0.4 + lead_l * 0.7 + fx
    right = drums * 0.6 + bass_d * 0.55 + pad_r * 0.4 + lead_r * 0.7 + fx
    st = np.stack([left, right], axis=1)
    st = np.stack([lowpass(st[:, 0], 12000), lowpass(st[:, 1], 12000)], axis=1)
    st = np.tanh(st * 0.9)  # très légère saturation douce
    st /= np.max(np.abs(st)) / 0.89
    fade = int(0.08 * SR)
    st[-fade:] *= np.linspace(1, 0, fade)[:, None]
    st[: int(0.004 * SR)] *= np.linspace(0, 1, int(0.004 * SR))[:, None]
    return st


def main() -> None:
    total = float(sys.argv[1])
    out = sys.argv[2]
    audio = compose(total)
    pcm = (audio * 32767).astype("<i2")
    with wave.open(out, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    print(f"{out} : {len(audio) / SR:.2f} s")


if __name__ == "__main__":
    main()
