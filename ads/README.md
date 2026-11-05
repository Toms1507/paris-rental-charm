# Publicités vidéo Spinelle (Remotion) pour Google Ads / YouTube

Trois publicités, chacune en trois formats, avec musique.

| Composition | Durée | Usage Google Ads | Contenu |
| --- | --- | --- | --- |
| `Spinelle30s` | 30 s | In-stream désactivable (YouTube) | Accroche, logo, 7 services animés (annonce, diffusion, prix, voyageurs, ménage, imprévus, suivi), avis 5★, montage rapide, offre 20 %, appel à l'action |
| `Spinelle15s` | 15 s | In-stream non désactivable, Demand Gen | Accroche, logo, montage d'un mot par temps, offre 20 %, appel à l'action |
| `Spinelle6s` | 6 s | Bumper (non désactivable) | Logo + promesse, montage, appel à l'action |

Formats : `-16x9` (1920×1080 : YouTube in-stream), `-9x16` (1080×1920 : YouTube Shorts) et `-1x1` (1080×1080 : Demand Gen, Discover, Gmail).
Le texte reste hors des zones masquées par l'interface YouTube.

## Musique

`music/generate.py` compose la musique (house/pop positive, 120 BPM) entièrement par programme :
aucun échantillon ni morceau externe, donc aucune réclamation de droits d'auteur sur YouTube.
Le montage est calé sur ce tempo : chaque coupe tombe sur un temps et le logo final apparaît sur
l'accord final.

```bash
python3 music/generate.py 30 public/music/track-30.wav   # idem pour 15 et 6 (nécessite numpy et scipy)
```

## Commandes

```bash
cd ads
npm install
npm run studio                 # aperçu et retouches dans le navigateur
npm run render                 # rend les 9 vidéos dans ads/out/
node render-all.mjs Spinelle6s # rend une seule publicité (tous formats)
node render-all.mjs --stills   # images de contrôle
```

## Modifier

- Couleurs, polices, site web et téléphone : `src/theme.ts` (`BRAND`). **Le domaine `spinelleconciergerie.fr` est provisoire dans le site : à vérifier avant diffusion.**
- Textes et ordre des scènes : `src/ads.tsx`. Scènes : `src/scenes.tsx`. Interfaces animées : `src/widgets.tsx`.
- Photos : `public/img/` (copiées depuis le site). Pour en ajouter, déposez le fichier et utilisez son nom dans `src/ads.tsx`.
