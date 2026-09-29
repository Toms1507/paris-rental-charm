import { buildBarometre } from "@/content/barometre";
import { FACTS } from "@/content/market-facts";

export const SITE = {
  name: "Spinelle Conciergerie",
  tagline: "Conciergerie Airbnb à Paris et alentours",
  email: "simontom33@sfr.fr",
  phone: "+33 6 31 93 51 66",
  // Lien WhatsApp direct (numéro au format international, sans + ni espaces).
  whatsapp: "https://wa.me/33631935166",
  zone: "Paris et alentours",
  // Domaine définitif du site : à remplacer (ou définir VITE_SITE_URL) dès que le nom de domaine est acheté.
  // Il sert aux URL canoniques, au sitemap et aux images de partage.
  url:
    (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, "") ??
    "https://spinelleconciergerie.fr",
};

export const NAV = [
  { to: "/services", label: "Services" },
  { to: "/tarifs", label: "Tarifs" },
  { to: "/zones", label: "Zones" },
  { to: "/avis", label: "Avis" },
  { to: "/blog", label: "Blog" },
  { to: "/faq", label: "FAQ" },
  { to: "/contact", label: "Contact" },
] as const;

export const SERVICES = [
  {
    title: "Création et optimisation des annonces",
    text: "Photos professionnelles, titre et description travaillés pour le référencement Airbnb et Booking, paramétrage complet des calendriers et des règles de séjour.",
  },
  {
    title: "Visibilité et référencement de l'annonce",
    text: "Mots-clés, catégories, équipements mis en avant et réponses rapides : nous travaillons le classement de votre annonce dans les résultats Airbnb et Booking.",
  },
  {
    title: "Tarification dynamique",
    text: "Les prix sont ajustés chaque jour selon la saison, les événements parisiens et la demande du quartier pour maximiser vos revenus locatifs.",
  },
  {
    title: "Gestion des voyageurs 7j/7",
    text: "Réponses aux messages en moins d'une heure, sélection des voyageurs, remise des clés ou boîte à clés, assistance pendant tout le séjour.",
  },
  {
    title: "Ménage hôtelier et linge",
    text: "Équipe de ménage formée, linge de lit et de toilette professionnel, réassort des consommables entre chaque séjour.",
  },
  {
    title: "Maintenance et petits travaux",
    text: "Intervention rapide en cas de fuite, panne ou casse, suivi des artisans et compte rendu après chaque passage.",
  },
  {
    title: "Conformité et déclarations",
    text: "Numéro d'enregistrement en mairie, plafond des 90 nuits à Paris, taxe de séjour, assurance : on s'occupe des démarches avec vous.",
  },
];

export const STEPS = [
  {
    title: "1. Estimation gratuite",
    text: "Vous remplissez le formulaire avec les caractéristiques de votre bien. Nous revenons vers vous sous 24 h avec une estimation de revenus.",
  },
  {
    title: "2. Mise en place",
    text: "Shooting photo, création des annonces, équipement du logement, mise en place des accès et du linge.",
  },
  {
    title: "3. Location et suivi",
    text: "Nous gérons réservations, voyageurs, ménage et maintenance. Vous suivez vos revenus et récupérez votre logement quand vous le souhaitez.",
  },
];

// Avis de vrais clients. Textes à faire valider par chaque client avant la mise en ligne.
export const REVIEWS = [
  {
    name: "Émilie",
    place: "Appartement, Paris 1er",
    text: "Spinelle s'occupe de tout, de l'annonce au ménage. Les voyageurs sont bien accueillis, le logement est toujours impeccable et je n'ai plus à y penser.",
    rating: 5,
  },
  {
    name: "M. Garnier",
    place: "Appartement, Paris 14e",
    text: "Une équipe sérieuse et réactive. Je reçois un compte rendu clair chaque mois et je sais exactement ce qui se passe dans mon appartement.",
    rating: 5,
  },
  {
    name: "Propriétaire",
    place: "T2, La Défense",
    text: "Mon appartement est géré de A à Z, avec une communication simple et rapide. Je recommande pour tous ceux qui n'ont pas le temps de s'en occuper.",
    rating: 5,
  },
  {
    name: "Louis",
    place: "T1, Neuilly-sur-Seine",
    text: "Mise en ligne rapide, belles photos et un vrai suivi. Je peux compter sur l'équipe même le week-end.",
    rating: 5,
  },
];

export const FAQ = [
  {
    q: "Combien coûte une conciergerie Airbnb à Paris ?",
    a: "Chez Spinelle Conciergerie, la commission est de 20 % des revenus locatifs, sans abonnement ni frais de mise en place. Vous ne payez que lorsque votre logement est loué.",
  },
  {
    q: "Combien puis-je gagner avec mon logement en location courte durée ?",
    a: `Cela dépend du quartier, de la taille du logement, de sa capacité d'accueil et du nombre de nuits louées. D'après les données Inside Airbnb (${FACTS.period}), le prix médian d'une nuit dans un logement entier actif à Paris est de ${FACTS.price.studio} pour un studio, ${FACTS.price.oneBedroom} pour un logement d'une chambre et ${FACTS.price.twoBedrooms} pour deux chambres. Utilisez notre simulateur de revenus pour une première estimation, puis demandez un audit gratuit\u00a0: nous vous répondons sous 24\u00a0h avec une projection personnalisée.`,
  },
  {
    q: "Garantissez-vous un taux d'occupation ?",
    a: "Non, et nous nous méfions des conciergeries qui le font : l'occupation dépend de la saison, du quartier et du marché. Notre engagement est de tout mettre en œuvre pour la maximiser : annonce soignée, photos professionnelles, prix ajustés chaque jour, réponses rapides aux voyageurs et logement impeccable pour obtenir d'excellents avis.",
  },
  {
    q: "Le plafond de 90 nuits par an s'applique‑t‑il à mon bien ?",
    a: "Il concerne les résidences principales : depuis le 1er janvier 2025, Paris limite leur location en meublé de tourisme à 90 nuits par an (le plafond national reste de 120 nuits dans les communes qui ne l'ont pas abaissé). Pour une résidence secondaire, un changement d'usage est nécessaire. Nous étudions votre situation et vous indiquons le cadre légal applicable avant toute mise en ligne.",
  },
  {
    q: "Sur quelles plateformes mon logement sera‑t‑il publié ?",
    a: "Airbnb, Booking.com, Abritel/Vrbo et notre réseau direct, avec calendriers synchronisés pour éviter toute double réservation.",
  },
  {
    q: "Puis‑je bloquer des dates pour utiliser mon logement ?",
    a: "Oui, vous gardez la main sur votre calendrier. Il suffit de nous prévenir et nous bloquons les dates souhaitées.",
  },
  {
    q: "Quelles zones couvrez-vous ?",
    a: "Paris intra-muros (les 20 arrondissements) ainsi que la proche banlieue : Boulogne-Billancourt, Neuilly-sur-Seine, Levallois-Perret, Issy-les-Moulineaux, Montreuil, Saint-Ouen, Vincennes, Clichy, Saint-Denis et alentours.",
  },
  {
    q: "Qui s'occupe du ménage et du linge ?",
    a: "Notre équipe de ménage intervient après chaque départ, avec un protocole hôtelier et du linge professionnel fourni et blanchi par nos soins.",
  },
  {
    q: "Que se passe‑t‑il en cas de dégradation ?",
    a: "Nous sélectionnons les voyageurs, prenons un dépôt de garantie quand la plateforme le permet et gérons les déclarations de sinistre (AirCover, assurance PNO) de bout en bout.",
  },
];

export const ZONES = [
  {
    city: "Paris intra-muros",
    detail:
      "Marais, Le Louvre, Saint-Germain-des-Prés, Montmartre, Bastille, Batignolles, Canal Saint-Martin, Butte-aux-Cailles… des 1er au 20e arrondissement.",
  },
  {
    city: "Ouest parisien",
    detail:
      "Boulogne-Billancourt, Neuilly-sur-Seine, Levallois-Perret, Issy-les-Moulineaux, Puteaux, Courbevoie.",
  },
  {
    city: "Est parisien",
    detail: "Montreuil, Vincennes, Saint-Mandé, Charenton-le-Pont, Pantin, Les Lilas.",
  },
  {
    city: "Nord parisien",
    detail: "Saint-Ouen, Clichy, Saint-Denis, Aubervilliers, Le Pré-Saint-Gervais.",
  },
];

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  date: string;
  readingTime: string;
  sections: { heading: string; paragraphs: string[]; bullets?: string[] }[];
};

const ARTICLES: BlogPost[] = [
  {
    slug: "rentabilite-location-courte-duree-paris",
    title: "Location courte durée à Paris : quelle rentabilité en 2026 ?",
    description:
      "Prix médians par nuit, taux d'occupation réels, charges à prévoir : le point complet sur la rentabilité de la location courte durée à Paris et en proche banlieue.",
    date: "2026-09-10",
    readingTime: "7 min",
    sections: [
      {
        heading: "Combien rapporte un logement en courte durée à Paris ?",
        paragraphs: [
          `Le revenu d'une location courte durée dépend de deux chiffres\u00a0: le prix moyen par nuit et le nombre de nuits louées. D'après les données publiées par Inside Airbnb (${FACTS.period}, ${FACTS.listings} logements entiers actifs à Paris), voici les prix médians constatés par nuit\u00a0:`,
          "Trois facteurs expliquent la majeure partie de l'écart entre deux biens comparables : la qualité de l'annonce, la réactivité aux demandes de réservation et la finesse de la tarification jour par jour. Notre simulateur de revenus reprend ces données quartier par quartier.",
        ],
        bullets: [
          `Studio\u00a0: ${FACTS.price.studio} la nuit`,
          `Une chambre\u00a0: ${FACTS.price.oneBedroom} la nuit`,
          `Deux chambres\u00a0: ${FACTS.price.twoBedrooms} la nuit`,
          `Trois chambres et plus\u00a0: ${FACTS.price.threeBedrooms} la nuit`,
        ],
      },
      {
        heading: "Le taux d'occupation, nerf de la guerre",
        paragraphs: [
          `Les écarts d'occupation entre annonces sont considérables\u00a0: à Paris, la moitié des logements entiers actifs sont loués moins de ${FACTS.occupancyMedianRange} de l'année, tandis que les annonces les plus performantes dépassent ${FACTS.occupancyTop}. Un temps de réponse trop lent, des prix figés toute l'année et des photos médiocres expliquent souvent ce retard.`,
          "Aucune conciergerie sérieuse ne peut garantir un taux d'occupation : il dépend de la saison, du quartier et du marché. Notre travail consiste à mettre toutes les chances de votre côté pour le maximiser.",
          "Chaque heure de retard sur une demande de réservation fait baisser la probabilité de conversion. C'est la raison pour laquelle nous répondons en moins d'une heure, sept jours sur sept.",
        ],
      },
      {
        heading: "Les charges à anticiper",
        paragraphs: [
          "Avant de comparer avec une location classique, intégrez le ménage entre séjours, le linge, les consommables, la commission de la plateforme, la taxe de séjour et la commission de la conciergerie. Une fois ces postes déduits, l'écart reste très largement favorable à la courte durée sur Paris et la proche banlieue.",
        ],
      },
      {
        heading: "Faire estimer votre bien",
        paragraphs: [
          "La seule manière d'obtenir un chiffre fiable est de regarder votre quartier, votre étage, votre capacité d'accueil et la saisonnalité locale. Remplissez le formulaire d'estimation : vous recevez une projection de revenus personnalisée sous 24 h, sans engagement.",
        ],
      },
    ],
  },
  {
    slug: "regles-airbnb-paris-90-jours",
    title: "Règles Airbnb à Paris : 90 nuits, enregistrement, taxe de séjour",
    description:
      "Tout ce qu'un propriétaire doit savoir avant de louer en courte durée à Paris : numéro d'enregistrement, plafond de 90 nuits, changement d'usage et taxe de séjour.",
    date: "2026-08-22",
    readingTime: "6 min",
    sections: [
      {
        heading: "Le numéro d'enregistrement est obligatoire",
        paragraphs: [
          "À Paris et dans de nombreuses communes de la métropole, toute mise en location d'un meublé de tourisme doit être déclarée en mairie. Le numéro obtenu doit figurer sur chaque annonce, sous peine d'amende et de retrait de l'annonce par la plateforme.",
        ],
      },
      {
        heading: "Le plafond de 90 nuits pour une résidence principale",
        paragraphs: [
          "Depuis le 1er janvier 2025, une résidence principale ne peut plus être louée plus de 90 nuits par année civile à Paris. La loi du 19 novembre 2024, dite loi Le Meur, a permis aux communes d'abaisser le plafond national de 120 nuits, et Paris l'a fait. Les plateformes bloquent le calendrier au-delà de ce seuil.",
          "Pour une résidence secondaire, la location courte durée suppose un changement d'usage, avec compensation dans certains arrondissements. C'est un point à valider avant tout investissement.",
        ],
      },
      {
        heading: "Taxe de séjour et fiscalité",
        paragraphs: [
          "La taxe de séjour est collectée par la plateforme et reversée à la commune dans la plupart des cas. Côté impôts, les revenus relèvent des BIC : régime micro-BIC ou réel selon votre situation, ce dernier étant souvent plus avantageux dès qu'il y a des travaux ou un crédit.",
        ],
      },
      {
        heading: "Comment nous vous accompagnons",
        paragraphs: [
          "Nous vérifions le cadre applicable à votre adresse, préparons la déclaration en mairie, paramétrons les plafonds dans les calendriers et suivons la taxe de séjour. Vous restez conforme sans y consacrer de temps.",
        ],
      },
    ],
  },
  {
    slug: "optimiser-annonce-airbnb",
    title: "10 façons d'optimiser votre annonce Airbnb pour louer plus",
    description:
      "Titre, photos, équipements, avis, tarification : les leviers concrets qui font grimper la visibilité et le taux de réservation d'une annonce Airbnb à Paris.",
    date: "2026-07-30",
    readingTime: "5 min",
    sections: [
      {
        heading: "Travailler le titre et les premières photos",
        paragraphs: [
          "L'algorithme d'Airbnb met en avant les annonces qui convertissent. Or la décision du voyageur se joue sur la première photo et sur les six premiers mots du titre. Un titre qui associe le quartier, un atout fort et la capacité d'accueil performe presque toujours mieux qu'un titre générique.",
        ],
        bullets: [
          "Une photo d'ouverture lumineuse, prise à hauteur de poitrine",
          "Un titre du type « Montmartre — studio lumineux, 2 voyageurs »",
          "Vingt à trente photos, chaque pièce dans deux angles",
        ],
      },
      {
        heading: "Soigner les équipements qui sont filtrés",
        paragraphs: [
          "Les voyageurs filtrent sur le wifi, la machine à laver, la cuisine équipée, la climatisation et l'espace de travail. Ajouter un équipement filtré, c'est apparaître dans des recherches dont vous étiez auparavant exclu.",
        ],
      },
      {
        heading: "Accumuler des avis rapidement",
        paragraphs: [
          "Les premières semaines déterminent la trajectoire d'une annonce. Une tarification volontairement basse au lancement permet d'obtenir vite des avis 5 étoiles, puis de remonter les prix avec une bien meilleure visibilité.",
        ],
      },
      {
        heading: "Ajuster les prix tous les jours",
        paragraphs: [
          "Salon professionnel, match au Stade de France, vacances scolaires, pont de mai : la demande parisienne bouge en permanence. Une tarification revue quotidiennement permet de capter ces pics de demande, là où un prix fixe laisse de l'argent sur la table.",
        ],
      },
    ],
  },
  {
    slug: "conciergerie-ou-gestion-seule",
    title: "Conciergerie ou gestion en solo : que choisir à Paris ?",
    description:
      "Temps passé, revenus nets, tranquillité : comparaison honnête entre gérer soi-même sa location courte durée et confier son bien à une conciergerie parisienne.",
    date: "2026-07-05",
    readingTime: "5 min",
    sections: [
      {
        heading: "Le vrai coût du temps",
        paragraphs: [
          "Gérer une location courte durée demande plusieurs heures chaque mois : messages, check-in, ménage à coordonner, imprévus, réassorts. Ce temps a une valeur, et il tombe souvent au mauvais moment — le dimanche soir ou pendant vos vacances.",
        ],
      },
      {
        heading: "Ce que change une gestion professionnelle",
        paragraphs: [
          "Une conciergerie apporte trois choses difficiles à reproduire seul : un temps de réponse très court, une tarification dynamique quotidienne et une équipe de ménage fiable disponible en urgence. Ce sont trois leviers directs sur l'occupation et le prix moyen, qui viennent compenser la commission.",
        ],
        bullets: [
          "Une occupation travaillée grâce à la réactivité",
          "Prix moyen par nuit optimisé toute l'année",
          "Notes de propreté plus élevées, donc meilleur classement",
        ],
      },
      {
        heading: "Quand la gestion en solo reste pertinente",
        paragraphs: [
          "Si vous habitez à proximité, que vous avez du temps et un seul logement loué quelques semaines par an, gérer vous-même est tout à fait tenable. Dès que vous êtes loin, occupé ou multi-biens, la délégation devient souvent la solution la plus sereine.",
        ],
      },
    ],
  },
  {
    slug: "meilleurs-quartiers-airbnb-paris",
    title: "Les meilleurs quartiers de Paris pour louer en courte durée",
    description:
      "Arrondissements les plus chers, les plus accessibles et les plus loués : où votre logement se loue le mieux, d'après les données réelles du marché parisien.",
    date: "2026-06-18",
    readingTime: "6 min",
    sections: [
      {
        heading: "Les arrondissements les plus chers",
        paragraphs: [
          `D'après les données Inside Airbnb (${FACTS.period}), à taille de logement égale, les arrondissements où le prix par nuit est le plus élevé sont le ${FACTS.mostExpensive}. Le centre attire toute l'année une clientèle internationale.`,
        ],
      },
      {
        heading: "Prix accessibles et forte occupation",
        paragraphs: [
          `Les prix les plus accessibles se trouvent dans le ${FACTS.mostAffordable}, et les logements d'une chambre les plus loués sont dans le ${FACTS.bestOccupancy}. Un prix par nuit plus bas n'empêche pas une bonne rentabilité : tout dépend du taux d'occupation atteint.`,
        ],
      },
      {
        heading: "La proche banlieue, sous-estimée",
        paragraphs: [
          "Boulogne-Billancourt, Neuilly-sur-Seine, Levallois-Perret, Montreuil, Vincennes et Saint-Ouen profitent de la proximité de Paris, des salons de la Porte de Versailles et des grands événements. Aucune donnée publique ne couvre ces communes : nous réalisons donc une étude au cas par cas, à partir des annonces comparables.",
        ],
      },
      {
        heading: "Et votre quartier ?",
        paragraphs: [
          "Chaque rue a sa propre saisonnalité. Indiquez votre adresse approximative dans le formulaire d'estimation et nous vous envoyons les chiffres réellement observés autour de votre bien.",
        ],
      },
    ],
  },
];

export type City = {
  slug: string;
  name: string;
  /** Formulation utilisée dans les titres : « à Paris », « à Boulogne-Billancourt »… */
  inName: string;
  postalCode: string;
  /**
   * Niveau de prix indicatif de la ville, Paris = 115. Hors Paris, les données Inside Airbnb
   * n'existent pas : le simulateur applique ce ratio aux médianes parisiennes.
   */
  nightlyBase: number;
  intro: string;
  assets: string[];
  neighborhoods: string[];
};

// Pages locales /conciergerie-airbnb/<ville> : chaque page a un texte propre pour éviter le contenu dupliqué.
export const CITIES: City[] = [
  {
    slug: "paris",
    name: "Paris",
    inName: "à Paris",
    postalCode: "75000",
    nightlyBase: 115,
    intro:
      "Première destination touristique au monde, Paris attire toute l'année voyageurs de loisirs, clientèle d'affaires et visiteurs des grands salons. Nous gérons des studios, appartements et lofts dans les 20 arrondissements, avec une équipe qui connaît la saisonnalité propre à chaque quartier.",
    assets: [
      "Demande forte toute l'année : tourisme, salons, Fashion Week, événements sportifs",
      "Clientèle internationale prête à payer pour un logement bien situé",
      "Accompagnement sur l'enregistrement en mairie et le plafond de nuitées",
    ],
    neighborhoods: [
      "Marais",
      "Saint-Germain-des-Prés",
      "Montmartre",
      "Bastille",
      "Batignolles",
      "Canal Saint-Martin",
      "Belleville",
      "Montparnasse",
    ],
  },
  {
    slug: "boulogne-billancourt",
    name: "Boulogne-Billancourt",
    inName: "à Boulogne-Billancourt",
    postalCode: "92100",
    nightlyBase: 95,
    intro:
      "Aux portes du 16e arrondissement, Boulogne-Billancourt séduit une clientèle d'affaires attirée par les nombreux sièges sociaux de la ville, mais aussi les visiteurs de Roland-Garros et du Parc des Princes. Les appartements familiaux y trouvent facilement preneur.",
    assets: [
      "Métro lignes 9 et 10, accès direct au centre de Paris",
      "Forte demande pendant Roland-Garros et les matchs au Parc des Princes",
      "Voyageurs d'affaires en semaine, familles le week-end",
    ],
    neighborhoods: [
      "Centre-ville",
      "Point du Jour",
      "Silly-Gallieni",
      "Trapèze",
      "Les Princes-Marmottan",
    ],
  },
  {
    slug: "neuilly-sur-seine",
    name: "Neuilly-sur-Seine",
    inName: "à Neuilly-sur-Seine",
    postalCode: "92200",
    nightlyBase: 105,
    intro:
      "Entre l'Arc de Triomphe et La Défense, Neuilly-sur-Seine offre un cadre résidentiel recherché par une clientèle haut de gamme et les cadres en mission. Un logement soigné y justifie un prix par nuit élevé.",
    assets: [
      "Métro ligne 1 : Champs-Élysées et La Défense en quelques minutes",
      "Clientèle premium et séjours professionnels de moyenne durée",
      "Proximité du Bois de Boulogne et du Jardin d'Acclimatation",
    ],
    neighborhoods: ["Sablons", "Saint-James", "Bagatelle", "Île de la Jatte", "Madrid"],
  },
  {
    slug: "levallois-perret",
    name: "Levallois-Perret",
    inName: "à Levallois-Perret",
    postalCode: "92300",
    nightlyBase: 95,
    intro:
      "Ville dense et très bien desservie, Levallois-Perret accueille de nombreuses entreprises et attire des voyageurs d'affaires toute la semaine. Les studios et 2 pièces bien équipés y trouvent facilement preneur.",
    assets: [
      "Métro ligne 3 et Transilien, à deux pas du 17e arrondissement",
      "Demande professionnelle régulière du lundi au vendredi",
      "Ville propre et sûre, appréciée des voyageurs",
    ],
    neighborhoods: [
      "Centre",
      "Front de Seine",
      "Louise Michel",
      "Anatole France",
      "Île de la Jatte",
    ],
  },
  {
    slug: "issy-les-moulineaux",
    name: "Issy-les-Moulineaux",
    inName: "à Issy-les-Moulineaux",
    postalCode: "92130",
    nightlyBase: 90,
    intro:
      "Voisine directe de Paris Expo Porte de Versailles et siège de nombreuses entreprises du numérique et des médias, Issy-les-Moulineaux bénéficie d'une demande soutenue pendant les grands salons comme le Salon de l'Agriculture ou le Mondial de l'Auto.",
    assets: [
      "Pics de réservation lors des salons de la Porte de Versailles",
      "Métro ligne 12, tramway T2 et RER C",
      "Clientèle d'affaires fidèle toute l'année",
    ],
    neighborhoods: [
      "Centre-ville",
      "Corentin Celton",
      "Val de Seine",
      "Les Epinettes",
      "Fort d'Issy",
    ],
  },
  {
    slug: "montreuil",
    name: "Montreuil",
    inName: "à Montreuil",
    postalCode: "93100",
    nightlyBase: 75,
    intro:
      "Ville créative et familiale à l'est de Paris, Montreuil attire des voyageurs en quête d'espace à prix raisonnable, à quelques stations du 11e arrondissement. Les maisons et grands appartements y sont particulièrement demandés.",
    assets: [
      "Métro ligne 9 et prolongement de la ligne 11",
      "Logements plus spacieux qu'à Paris, idéaux pour les familles",
      "Proximité du Bois de Vincennes et de la Porte de Montreuil",
    ],
    neighborhoods: [
      "Croix-de-Chavaux",
      "Bas-Montreuil",
      "Mairie de Montreuil",
      "Villiers-Barbusse",
      "Montreau",
    ],
  },
  {
    slug: "vincennes",
    name: "Vincennes",
    inName: "à Vincennes",
    postalCode: "94300",
    nightlyBase: 90,
    intro:
      "Avec son château, son bois et son centre-ville animé, Vincennes offre une atmosphère de petite ville à dix minutes de la Bastille. Les familles et les séjours longs y sont nombreux, ce qui favorise une demande régulière.",
    assets: [
      "RER A et métro ligne 1 : Châtelet et la Gare de Lyon en direct",
      "Cadre calme apprécié des familles et des séjours prolongés",
      "Château et Bois de Vincennes, attraits touristiques majeurs",
    ],
    neighborhoods: ["Centre-ville", "Château", "Diderot", "Ouest-Vincennes", "Les Vignerons"],
  },
  {
    slug: "saint-ouen",
    name: "Saint-Ouen-sur-Seine",
    inName: "à Saint-Ouen",
    postalCode: "93400",
    nightlyBase: 80,
    intro:
      "Célèbre pour son marché aux puces, Saint-Ouen s'est profondément transformée et profite désormais du prolongement de la ligne 14. Les logements récents y attirent voyageurs de loisirs, chineurs et professionnels.",
    assets: [
      "Métro lignes 13 et 14, Saint-Lazare et Châtelet en quelques minutes",
      "Marché aux puces, l'un des sites les plus visités d'Île-de-France",
      "Parc immobilier récent, apprécié des voyageurs",
    ],
    neighborhoods: ["Puces", "Docks", "Garibaldi", "Mairie de Saint-Ouen", "Michelet"],
  },
  {
    slug: "clichy",
    name: "Clichy",
    inName: "à Clichy",
    postalCode: "92110",
    nightlyBase: 82,
    intro:
      "À la lisière des Batignolles et du nouveau Tribunal de Paris, Clichy combine prix d'achat modérés et forte demande locative. Les studios et 2 pièces bien présentés s'y louent rapidement.",
    assets: [
      "Métro lignes 13 et 14, gare Saint-Lazare à proximité",
      "Proximité du quartier Clichy-Batignolles et du parc Martin Luther King",
      "Bon équilibre entre prix d'acquisition et revenus locatifs",
    ],
    neighborhoods: [
      "Centre",
      "Victor Hugo",
      "Berges de Seine",
      "Entrée de ville",
      "Bac d'Asnières",
    ],
  },
  {
    slug: "saint-denis",
    name: "Saint-Denis",
    inName: "à Saint-Denis",
    postalCode: "93200",
    nightlyBase: 72,
    intro:
      "Avec le Stade de France, la Basilique et les nouvelles gares du Grand Paris Express, Saint-Denis connaît de très fortes pointes de demande lors des concerts et compétitions sportives, en plus d'une clientèle d'affaires croissante.",
    assets: [
      "Stade de France : concerts et matchs remplissent la ville",
      "RER B et D, métro ligne 13, nouvelles lignes du Grand Paris Express",
      "Tarification dynamique pour capter les soirs d'événement",
    ],
    neighborhoods: [
      "Centre-ville",
      "Plaine Saint-Denis",
      "Pleyel",
      "Porte de Paris",
      "Stade de France",
    ],
  },
];

// Le baromètre mensuel, généré à partir des données de marché, apparaît toujours en tête du blog.
export const POSTS: BlogPost[] = [buildBarometre(), ...ARTICLES];
