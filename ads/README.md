# Publicités vidéo Spinelle (Remotion)

Quatre publicités vidéo, chacune en deux formats :

| Composition | Durée | Angle |
| --- | --- | --- |
| `PourquoiSpinelle` | ~28 s | Accroche → problème → 5 raisons → offre 20 % → appel à l'action. Pour faire découvrir la marque à une audience froide. |
| `Regle90Nuits` | ~17 s | Marché actuel : plafond de 90 nuits à Paris, prix médians par nuit (données Inside Airbnb du site), méthode. Pour les propriétaires déjà sensibilisés. |
| `AvisVoyageurs` | ~19 s | Preuve sociale : avis Airbnb 5★ reproduits fidèlement. Pour le reciblage. |
| `ToutCompris20` | ~14 s | Offre : tout ce qui est inclus, 20 %, aucun frais si le logement n'est pas loué. Pour le reciblage et la conversion. |

Formats : `-9x16` (1080×1920 : Reels, TikTok, Stories, Shorts) et `-4x5` (1080×1350 : fil Instagram et Facebook).
En 9:16, le texte reste hors des zones masquées par l'interface (250 px en haut, 400 px en bas).

## Commandes

```bash
cd ads
npm install
npm run studio          # aperçu et retouches dans le navigateur
npm run render          # rend les 8 vidéos dans ads/out/
node render-all.mjs Regle90   # rend une seule publicité
node render-all.mjs --stills  # images de contrôle
```

## Modifier

- Couleurs, polices, site web et téléphone : `src/theme.ts` (`BRAND`). **Le domaine `spinelleconciergerie.fr` est provisoire dans le site : à vérifier avant diffusion.**
- Textes : un fichier par publicité dans `src/ads/`.
- Prix médians : lus directement dans `../src/content/market-paris.ts`, que le site met à jour automatiquement. Un nouveau rendu reprend les derniers chiffres.

Les vidéos n'ont pas de musique : ajoutez un son tendance directement dans Meta ou TikTok (plus efficace et sans problème de droits). Tout le texte est à l'écran, donc les vidéos fonctionnent aussi sans le son.
