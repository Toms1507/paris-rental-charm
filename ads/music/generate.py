"""Compose la musique des publicités : lounge parisien chic, 120 BPM (en demi-tempo).

Piano électrique, basse ronde, claquements de doigts, nappe de cordes et petite mélodie
de célesta. Pensée pour des propriétaires : élégante, chaleureuse et positive, sans grosse
caisse envahissante. Musique générée de toutes pièces par ce script (aucun échantillon
externe) : aucun problème de droits sur YouTube / Google Ads.

    python3 music/generate.py 30 public/music/track-30.wav

Le montage est calé sur cette grille (1 temps = 0,5 s = 15 images à 30 i/s). Le morceau se
termine par un accord final qui résonne (à 28 s pour 30 s, 14 s pour 15 s, 4 s pour 6 s).
"""

import sys
import wave

import numpy as np
from scipy.signal import butter, sosfilt

SR = 44100
BPM = 120
BEAT = 60 / BPM
BAR = BEAT * 4
rng = np.random.default_rng(11)


def hz(n: float) -> float:
    return 440.0 * 2 ** ((n - 69) / 12)


def lowpass(x, cutoff, order=2):
    return sosfilt(butter(order, cutoff, "low", fs=SR, output="sos"), x)


def highpass(x, cutoff, order=2):
    return sosfilt(butter(order, cutoff, "high", fs=SR, output="sos"), x)


def bandpass(x, lo, hi):
    return sosfilt(butter(2, [lo, hi], "band", fs=SR, output="sos"), x)


def add(buf, sig, at, gain=1.0):
    i = int(at * SR)
    if i >= len(buf):
        return
    j = min(len(buf), i + len(sig))
    buf[i:j] += sig[: j - i] * gain


def tt(length):
    return np.arange(int(length * SR)) / SR


# --- Instruments -------------------------------------------------------------------------

def rhodes(midi, length=1.6, vel=1.0):
    """Piano électrique (synthèse FM) : attaque cristalline, corps chaud."""
    t = tt(length)
    f = hz(midi)
    index = 1.6 * vel * np.exp(-t / 0.35) + 0.25
    mod = np.sin(2 * np.pi * f * t)
    body = np.sin(2 * np.pi * f * t + index * mod)
    tine = np.sin(2 * np.pi * f * 7.0 * t) * np.exp(-t / 0.03) * 0.25 * vel
    amp = np.exp(-t / 0.9) * np.clip(t / 0.003, 0, 1)
    release = np.clip((len(t) - np.arange(len(t))) / (0.08 * SR), 0, 1)
    return (body + tine) * amp * release * vel


def celesta(midi, vel=1.0):
    t = tt(1.4)
    f = hz(midi)
    x = np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * f * 2 * t) * np.exp(-t / 0.2)
    x += 0.12 * np.sin(2 * np.pi * f * 4.02 * t) * np.exp(-t / 0.06)
    return x * np.exp(-t / 0.45) * np.clip(t / 0.002, 0, 1) * vel


def bass(midi, length):
    """Basse ronde façon contrebasse/électrique au doigt."""
    t = tt(length)
    f = hz(midi)
    x = np.sin(2 * np.pi * f * t) + 0.45 * np.sin(4 * np.pi * f * t) + 0.15 * np.sin(6 * np.pi * f * t)
    x *= np.exp(-t / 0.5) * np.clip(t / 0.006, 0, 1)
    x *= np.clip((len(t) - np.arange(len(t))) / (0.03 * SR), 0, 1)
    return lowpass(x, 900)


def strings(midis, length):
    t = tt(length)
    x = np.zeros(len(t))
    for m in midis:
        for det in (-0.08, 0.0, 0.07):
            ph = rng.random()
            x += 2 * ((t * hz(m + det) + ph) % 1) - 1
    x = lowpass(x / (len(midis) * 3), 1300, 2)
    att = np.clip(t / 0.5, 0, 1)
    rel = np.clip((len(t) - np.arange(len(t))) / (0.4 * SR), 0, 1)
    vib = 1 + 0.03 * np.sin(2 * np.pi * 5 * t)
    return x * att * rel * vib


def soft_kick():
    t = tt(0.3)
    f = 55 + 45 * np.exp(-t / 0.03)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.12)


def snap():
    t = tt(0.12)
    x = bandpass(rng.standard_normal(len(t)), 1800, 4200) * np.exp(-t / 0.018)
    x += np.sin(2 * np.pi * 1200 * t) * np.exp(-t / 0.01) * 0.3
    return x


def shaker():
    t = tt(0.07)
    return highpass(rng.standard_normal(len(t)), 6000) * np.exp(-t / 0.018) * np.clip(t / 0.008, 0, 1)


def swell(length):
    """Montée douce (bruit filtré qui s'ouvre) avant l'accord final."""
    t = tt(length)
    noise = rng.standard_normal(len(t))
    out = np.zeros(len(t))
    block = 2048
    for i in range(0, len(t), block):
        p = i / len(t)
        out[i : i + block] = sosfilt(butter(2, 300 + 5000 * p**2, "low", fs=SR, output="sos"), noise[i : i + block])
    return out * (t / length) ** 2


def chime_tail(length):
    """Scintillement de fin (arpège très rapide de célesta)."""
    out = np.zeros(int(length * SR))
    for k, m in enumerate([84, 88, 91, 95, 96]):
        add(out, celesta(m, 0.5), k * 0.06)
    return out


# --- Harmonie et mélodie -----------------------------------------------------------------

# Cmaj7 – Am7 – Dm7 – G7(13) : progression jazzy, chic et lumineuse.
CHORDS = [
    {"root": 36, "voicing": [52, 55, 59, 64], "pad": [64, 67, 71]},
    {"root": 33, "voicing": [55, 60, 64, 67], "pad": [64, 67, 72]},
    {"root": 38, "voicing": [53, 57, 60, 65], "pad": [65, 69, 72]},
    {"root": 31, "voicing": [53, 59, 62, 64], "pad": [65, 71, 74]},
]
# Mélodie en croches (8 par mesure), None = silence. Deux phrases qui se répondent.
MELODY_A = [
    [76, None, 79, None, 83, 81, 79, None],
    [76, None, 72, None, 74, 76, None, None],
    [77, None, 81, None, 84, 81, 77, None],
    [79, None, 77, 76, 74, None, 71, None],
]
MELODY_B = [
    [79, None, 83, None, 86, 84, 83, None],
    [81, None, 79, None, 76, 79, None, None],
    [77, 81, 84, None, 88, None, 86, 84],
    [83, None, 81, 79, 77, None, 74, None],
]
# Comping du piano : (position en temps, vélocité) — accords syncopés, façon bossa.
COMP = [(0, 1.0), (1.5, 0.7), (2.5, 0.8), (3.5, 0.6)]
# Basse : (position en temps, intervalle depuis la fondamentale, durée en temps).
BASS = [(0, 0, 1.4), (1.5, 7, 0.9), (2, 12, 0.5), (2.5, 7, 0.9), (3.5, 0, 0.45)]


def compose(total):
    groove_bars = int((total - 1.0) // BAR)
    n = int((total + 0.1) * SR)
    keys = np.zeros(n)
    low = np.zeros(n)
    pad = np.zeros(n)
    mel_l = np.zeros(n)
    mel_r = np.zeros(n)
    perc = np.zeros(n)
    fx = np.zeros(n)
    k, s, sh = soft_kick(), snap(), shaker()
    short = groove_bars <= 3  # version 6 s : tout démarre tout de suite

    for b in range(groove_bars):
        t0 = b * BAR
        ch = CHORDS[b % 4]
        last = b == groove_bars - 1 and not short
        for pos, vel in COMP:
            if last and pos > 2:
                continue
            for m in ch["voicing"]:
                add(keys, rhodes(m, BEAT * 1.4, vel), t0 + pos * BEAT, 0.22)
        for pos, iv, dur in BASS:
            add(low, bass(ch["root"] + iv, dur * BEAT), t0 + pos * BEAT, 0.55)
        if b >= 1 or short:
            for beat in range(4):
                tb = t0 + beat * BEAT
                if beat in (0, 2) and (b >= 2 or short):
                    add(perc, k, tb + (0.75 * BEAT if beat == 2 else 0), 0.55)
                if beat in (1, 3):
                    add(perc, s, tb, 0.42)
                for q in range(4):
                    add(perc, sh, tb + q * BEAT / 4, 0.05 + 0.04 * (q == 2))
        if b >= 3 or short:
            add(pad, strings(ch["pad"], BAR + 0.3), t0, 0.5)
        if b >= 2 or short:
            phrase = MELODY_A if (b // 4) % 2 == 0 else MELODY_B
            for q, m in enumerate(phrase[b % 4]):
                if m is not None:
                    note = celesta(m, 0.9 if q == 0 else 0.7)
                    add(mel_l, note, t0 + q * BEAT / 2, 0.3)
                    add(mel_r, note, t0 + q * BEAT / 2 + 0.012, 0.26)
        if last:
            add(fx, swell(BAR), t0, 0.12)
            for q in range(6):  # petit roulement de claquements
                add(perc, s, t0 + 2 * BEAT + q * BEAT / 3, 0.15 + q * 0.04)

    # Accord final : Cmaj9 qui résonne + scintillement.
    tf = groove_bars * BAR
    tail = total - tf + 0.1
    for m in [48, 52, 55, 59, 62, 64]:
        add(keys, rhodes(m, tail, 1.0), tf, 0.24)
    add(low, bass(36, min(tail, 1.8)), tf, 0.6)
    add(pad, strings([64, 67, 71, 74], tail), tf, 0.55)
    add(perc, k, tf, 0.5)
    ct = chime_tail(tail)
    add(mel_l, ct, tf + 0.05, 0.3)
    add(mel_r, ct, tf + 0.07, 0.3)

    # Écho stéréo léger sur la mélodie (croche pointée).
    d = int(BEAT * 0.75 * SR)
    for rep in range(1, 4):
        g = 0.33**rep
        src = mel_l if rep % 2 else mel_r
        dst = mel_r if rep % 2 else mel_l
        dst[d * rep :] += lowpass(src[: -d * rep], 4000) * g

    # Réverbération simple (quelques retards diffus) pour l'espace.
    def room(x):
        out = x.copy()
        for ms, g in [(29, 0.32), (41, 0.27), (53, 0.22), (71, 0.17), (97, 0.12), (131, 0.08)]:
            dd = int(ms / 1000 * SR)
            out[dd:] += lowpass(x[:-dd], 3500) * g
        return out

    keys_r = room(keys)
    left = keys_r * 1.0 + low * 0.9 + pad * 0.35 + room(mel_l) + perc * 0.8 + fx
    right = keys_r * 0.95 + low * 0.9 + pad * 0.4 + room(mel_r) + perc * 0.75 + fx
    st = np.stack([left, right], axis=1)
    st = np.tanh(st * 0.8)
    st /= np.max(np.abs(st)) / 0.89
    fade = int(0.1 * SR)
    st[-fade:] *= np.linspace(1, 0, fade)[:, None]
    return st


def main():
    total = float(sys.argv[1])
    out = sys.argv[2]
    audio = compose(total)
    with wave.open(out, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((audio * 32767).astype("<i2").tobytes())
    print(f"{out} : {len(audio) / SR:.2f} s")


if __name__ == "__main__":
    main()
