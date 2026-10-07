// Les 20 arrondissements de Paris : adresse des pages /conciergerie-paris/<slug>, nom usuel
// et principaux quartiers (quartiers administratifs et lieux connus).
export type Arrondissement = {
  n: number;
  /** Segment d'URL : « 1er », « 2e »… */
  slug: string;
  /** « 1er », « 11e » : forme courte pour les titres. */
  label: string;
  name: string;
  quartiers: string[];
};

const list: [number, string, string[]][] = [
  [1, "Louvre", ["Palais-Royal", "Les Halles", "Place Vendôme", "Saint-Germain-l'Auxerrois"]],
  [2, "Bourse", ["Sentier", "Montorgueil", "Vivienne", "Bonne-Nouvelle"]],
  [3, "Haut-Marais", ["Arts-et-Métiers", "Enfants-Rouges", "Archives", "Sainte-Avoye"]],
  [4, "Marais – Hôtel de Ville", ["Saint-Paul", "Île Saint-Louis", "Île de la Cité", "Notre-Dame"]],
  [5, "Panthéon", ["Quartier latin", "Jardin des Plantes", "Mouffetard", "Val-de-Grâce"]],
  [6, "Saint-Germain-des-Prés", ["Odéon", "Luxembourg", "Notre-Dame-des-Champs", "Monnaie"]],
  [7, "Invalides – Tour Eiffel", ["Gros-Caillou", "École militaire", "Saint-Thomas-d'Aquin"]],
  [8, "Champs-Élysées", ["Faubourg-du-Roule", "Madeleine", "Europe", "Monceau"]],
  [9, "Opéra", ["Pigalle", "Saint-Georges", "Chaussée-d'Antin", "Rochechouart"]],
  [
    10,
    "Canal Saint-Martin",
    ["Gare du Nord", "Gare de l'Est", "Porte Saint-Denis", "Hôpital Saint-Louis"],
  ],
  [
    11,
    "Bastille – Oberkampf",
    ["Folie-Méricourt", "Roquette", "Sainte-Marguerite", "Saint-Ambroise"],
  ],
  [12, "Bercy – Nation", ["Gare de Lyon", "Aligre", "Bel-Air", "Picpus"]],
  [13, "Butte-aux-Cailles", ["Gobelins", "Austerlitz", "Maison-Blanche", "Croulebarbe"]],
  [14, "Montparnasse", ["Denfert-Rochereau", "Plaisance", "Petit-Montrouge", "Parc Montsouris"]],
  [15, "Vaugirard – Beaugrenelle", ["Grenelle", "Javel", "Saint-Lambert", "Necker"]],
  [16, "Passy – Trocadéro", ["Auteuil", "Chaillot", "Porte Dauphine", "Muette"]],
  [17, "Batignolles", ["Ternes", "Plaine-Monceau", "Épinettes", "Clichy-Batignolles"]],
  [18, "Montmartre", ["Abbesses", "Goutte-d'Or", "Clignancourt", "La Chapelle"]],
  [19, "Buttes-Chaumont", ["La Villette", "Pont de Flandre", "Belleville", "Combat"]],
  [20, "Belleville – Ménilmontant", ["Père-Lachaise", "Charonne", "Saint-Fargeau", "Gambetta"]],
];

export const ARRONDISSEMENTS: Arrondissement[] = list.map(([n, name, quartiers]) => {
  const label = n === 1 ? "1er" : `${n}e`;
  return { n, slug: label, label, name, quartiers };
});

export const findArrondissement = (slug: string) => ARRONDISSEMENTS.find((a) => a.slug === slug);
