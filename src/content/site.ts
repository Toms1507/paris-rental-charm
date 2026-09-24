export const SITE = {
  name: "Spinelle Conciergerie",
  tagline: "Conciergerie Airbnb à Paris et alentours",
  email: "simontom33@sfr.fr",
  zone: "Paris et alentours",
};

export const NAV = [
  { to: "/", label: "Accueil" },
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
    text: "Numéro d'enregistrement en mairie, plafond des 120 jours, taxe de séjour, assurance : on s'occupe des démarches avec vous.",
  },
];

export const STEPS = [
  {
    title: "1. Estimation gratuite",
    text: "Vous remplissez le formulaire avec les caractéristiques de votre bien. Nous revenons vers vous sous 24 h avec une estimation de revenus.",
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

export const REVIEWS = [
  {
    name: "Claire M.",
    place: "Studio, Paris 11e",
    text: "Je louais moi-même mon studio et je passais mes soirées à répondre aux messages. Depuis que Spinelle gère tout, je n'ai plus rien à faire et mes revenus ont augmenté d'environ 25 %.",
    rating: 5,
  },
  {
    name: "Julien & Sophie",
    place: "2 pièces, Boulogne-Billancourt",
    text: "Très bonne communication, appartement toujours impeccable entre deux séjours. Les voyageurs laissent des commentaires excellents sur la propreté.",
    rating: 5,
  },
  {
    name: "Hakim B.",
    place: "3 pièces, Paris 18e",
    text: "Mise en location en dix jours, photos superbes et annonce très bien positionnée. L'équipe est réactive même le week-end.",
    rating: 5,
  },
  {
    name: "Martine L.",
    place: "Maison, Vincennes",
    text: "J'habite en province et je n'aurais jamais pu gérer la location à distance. Tout est transparent, je reçois un récapitulatif chaque mois.",
    rating: 5,
  },
  {
    name: "Antoine R.",
    place: "Studio, Neuilly-sur-Seine",
    text: "Ils m'ont accompagné pour la déclaration en mairie et la taxe de séjour, un vrai soulagement. Rentabilité nettement meilleure qu'en location classique.",
    rating: 5,
  },
  {
    name: "Élodie V.",
    place: "Loft, Saint-Ouen",
    text: "Service sérieux et très humain. On sent qu'ils connaissent le marché parisien quartier par quartier.",
    rating: 5,
  },
];

export const FAQ = [
  {
    q: "Combien coûte une conciergerie Airbnb à Paris ?",
    a: "Chez Spinelle Conciergerie, la commission est de 20 % des revenus locatifs, sans abonnement ni frais de mise en place. Vous ne payez que lorsque votre logement est loué.",
  },
  {
    q: "Combien puis-je gagner avec mon logement en location courte durée ?",
    a: "À Paris, un studio bien situé et bien géré génère souvent entre 1 800 € et 3 000 € par mois en haute saison. Le revenu dépend du quartier, de la capacité d'accueil et de la qualité de l'annonce. Remplissez le formulaire d'estimation pour recevoir une projection personnalisée sous 24 h.",
  },
  {
    q: "La limite des 120 jours s'applique-t-elle à mon bien ?",
    a: "Elle concerne les résidences principales à Paris et dans plusieurs communes de la métropole. Pour une résidence secondaire, un changement d'usage est nécessaire. Nous étudions votre situation et vous indiquons le cadre légal applicable avant toute mise en ligne.",
  },
  {
    q: "Sur quelles plateformes mon logement sera-t-il publié ?",
    a: "Airbnb, Booking.com, Abritel/Vrbo et notre réseau direct, avec calendriers synchronisés pour éviter toute double réservation.",
  },
  {
    q: "Puis-je bloquer des dates pour utiliser mon logement ?",
    a: "Oui, vous gardez la main sur votre calendrier. Il suffit de nous prévenir et nous bloquons les dates souhaitées.",
  },
  {
    q: "Quelles zones couvrez-vous ?",
    a: "Paris intra-muros (les 20 arrondissements) ainsi que la proche banlieue : Boulogne-Billancourt, Neuilly-sur-Seine, Levallois-Perret, Issy-les-Moulineaux, Montreuil, Saint-Ouen, Vincennes, Clichy, Saint-Denis et alentours.",
  },
  {
    q: "Qui s'occupe du ménage et du linge ?",
    a: "Notre équipe de ménage intervient après chaque départ, avec un protocole hôtelier et du linge professionnel fourni et blanchi par nos soins.",
  },
  {
    q: "Que se passe-t-il en cas de dégradation ?",
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
    detail: "Boulogne-Billancourt, Neuilly-sur-Seine, Levallois-Perret, Issy-les-Moulineaux, Puteaux, Courbevoie.",
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

export const POSTS: BlogPost[] = [
  {
    slug: "rentabilite-location-courte-duree-paris",
    title: "Location courte durée à Paris : quelle rentabilité en 2026 ?",
    description:
      "Revenus moyens par arrondissement, taux d'occupation, charges à prévoir : le point complet sur la rentabilité de la location courte durée à Paris et en proche banlieue.",
    date: "2026-09-10",
    readingTime: "7 min",
    sections: [
      {
        heading: "Combien rapporte un logement en courte durée à Paris ?",
        paragraphs: [
          "À Paris, la location courte durée génère en moyenne deux à trois fois plus qu'un bail classique sur une même surface. Un studio de 25 m² loué 950 € en location nue peut dépasser 2 200 € de revenus mensuels en haute saison, à condition d'être bien équipé, bien photographié et correctement tarifé.",
          "Trois facteurs expliquent la majeure partie de l'écart entre deux biens comparables : la qualité de l'annonce, la réactivité aux demandes de réservation et la finesse de la tarification jour par jour.",
        ],
        bullets: [
          "Studio bien situé : 1 800 € à 2 600 € par mois",
          "2 pièces : 2 400 € à 3 400 € par mois",
          "3 pièces familial : 3 200 € à 4 800 € par mois",
        ],
      },
      {
        heading: "Le taux d'occupation, nerf de la guerre",
        paragraphs: [
          "Un logement parisien géré professionnellement tourne autour de 80 à 90 % d'occupation hors périodes creuses. Les annonces gérées par les propriétaires eux-mêmes plafonnent souvent à 55-65 %, principalement à cause d'un temps de réponse trop lent et de prix figés toute l'année.",
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
          "La seule manière d'obtenir un chiffre fiable est de regarder votre quartier, votre étage, votre capacité d'accueil et la saisonnalité locale. Remplissez le formulaire d'estimation : vous recevez une projection de revenus personnalisée sous 24 h, sans engagement.",
        ],
      },
    ],
  },
  {
    slug: "regles-airbnb-paris-120-jours",
    title: "Règles Airbnb à Paris : 120 jours, enregistrement, taxe de séjour",
    description:
      "Tout ce qu'un propriétaire doit savoir avant de louer en courte durée à Paris : numéro d'enregistrement, limite des 120 jours, changement d'usage et taxe de séjour.",
    date: "2026-08-22",
    readingTime: "6 min",
    sections: [
      {
        heading: "Le numéro d'enregistrement est obligatoire",
        paragraphs: [
          "À Paris et dans de nombreuses communes de la métropole, toute mise en location d'un meublé de tourisme doit être déclarée en mairie. Le numéro obtenu doit figurer sur chaque annonce, sous peine d'amende et de retrait de l'annonce par la plateforme.",
        ],
      },
      {
        heading: "La limite des 120 nuits pour une résidence principale",
        paragraphs: [
          "Si vous louez votre résidence principale, vous ne pouvez pas dépasser 120 nuits de location par année civile. Les plateformes bloquent automatiquement le calendrier au-delà de ce seuil.",
          "Pour une résidence secondaire, la location courte durée suppose un changement d'usage, avec compensation dans certains arrondissements. C'est un point à valider avant tout investissement.",
        ],
      },
      {
        heading: "Taxe de séjour et fiscalité",
        paragraphs: [
          "La taxe de séjour est collectée par la plateforme et reversée à la commune dans la plupart des cas. Côté impôts, les revenus relèvent des BIC : régime micro-BIC ou réel selon votre situation, ce dernier étant souvent plus avantageux dès qu'il y a des travaux ou un crédit.",
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
      "Titre, photos, équipements, avis, tarification : les leviers concrets qui font grimper la visibilité et le taux de réservation d'une annonce Airbnb à Paris.",
    date: "2026-07-30",
    readingTime: "5 min",
    sections: [
      {
        heading: "Travailler le titre et les premières photos",
        paragraphs: [
          "L'algorithme d'Airbnb met en avant les annonces qui convertissent. Or la décision du voyageur se joue sur la première photo et sur les six premiers mots du titre. Un titre qui associe le quartier, un atout fort et la capacité d'accueil performe presque toujours mieux qu'un titre générique.",
        ],
        bullets: [
          "Une photo d'ouverture lumineuse, prise à hauteur de poitrine",
          "Un titre du type « Montmartre — studio lumineux, 2 voyageurs »",
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
          "Les premières semaines déterminent la trajectoire d'une annonce. Une tarification volontairement basse au lancement permet d'obtenir vite des avis 5 étoiles, puis de remonter les prix avec une bien meilleure visibilité.",
        ],
      },
      {
        heading: "Ajuster les prix tous les jours",
        paragraphs: [
          "Salon professionnel, match au Stade de France, vacances scolaires, pont de mai : la demande parisienne bouge en permanence. Une tarification revue quotidiennement rapporte couramment 15 à 30 % de plus qu'un prix fixe.",
        ],
      },
    ],
  },
  {
    slug: "conciergerie-ou-gestion-seule",
    title: "Conciergerie ou gestion en solo : que choisir à Paris ?",
    description:
      "Temps passé, revenus nets, tranquillité : comparaison honnête entre gérer soi-même sa location courte durée et confier son bien à une conciergerie parisienne.",
    date: "2026-07-05",
    readingTime: "5 min",
    sections: [
      {
        heading: "Le vrai coût du temps",
        paragraphs: [
          "Gérer une location courte durée demande en moyenne 8 à 12 heures par mois et par logement : messages, check-in, ménage à coordonner, imprévus, réassorts. Ce temps a une valeur, et il tombe souvent au mauvais moment — le dimanche soir ou pendant vos vacances.",
        ],
      },
      {
        heading: "Ce que change une gestion professionnelle",
        paragraphs: [
          "Une conciergerie apporte trois choses difficiles à reproduire seul : un temps de réponse très court, une tarification dynamique quotidienne et une équipe de ménage fiable disponible en urgence. Ces trois éléments compensent généralement la commission.",
        ],
        bullets: [
          "Occupation en hausse grâce à la réactivité",
          "Prix moyen par nuit optimisé toute l'année",
          "Notes de propreté plus élevées, donc meilleur classement",
        ],
      },
      {
        heading: "Quand la gestion en solo reste pertinente",
        paragraphs: [
          "Si vous habitez à proximité, que vous avez du temps et un seul logement loué quelques semaines par an, gérer vous-même est tout à fait tenable. Dès que vous êtes loin, occupé ou multi-biens, la délégation devient nettement plus rentable.",
        ],
      },
    ],
  },
  {
    slug: "meilleurs-quartiers-airbnb-paris",
    title: "Les meilleurs quartiers de Paris pour louer en courte durée",
    description:
      "Marais, Montmartre, Batignolles, Bastille ou proche banlieue : où votre logement se loue le mieux et à quel prix moyen par nuit.",
    date: "2026-06-18",
    readingTime: "6 min",
    sections: [
      {
        heading: "Les valeurs sûres du centre",
        paragraphs: [
          "Le Marais (3e et 4e), Saint-Germain-des-Prés (6e) et Le Louvre (1er) affichent les prix par nuit les plus élevés et une occupation solide toute l'année, portée par la clientèle internationale. Les surfaces y sont petites, ce qui convient bien aux couples.",
        ],
      },
      {
        heading: "Les quartiers en forte demande",
        paragraphs: [
          "Montmartre (18e), Bastille (11e), Batignolles (17e) et Canal Saint-Martin (10e) combinent une demande très forte et un prix d'achat plus accessible. C'est souvent le meilleur rapport entre investissement et revenus.",
        ],
      },
      {
        heading: "La proche banlieue, sous-estimée",
        paragraphs: [
          "Boulogne-Billancourt, Neuilly-sur-Seine, Levallois-Perret, Montreuil, Vincennes et Saint-Ouen profitent des voyageurs d'affaires, des salons de la Porte de Versailles et des grands événements. À dix minutes de métro du centre, les taux d'occupation sont excellents et la concurrence plus faible.",
        ],
      },
      {
        heading: "Et votre quartier ?",
        paragraphs: [
          "Chaque rue a sa propre saisonnalité. Indiquez votre adresse approximative dans le formulaire d'estimation et nous vous envoyons les chiffres réellement observés autour de votre bien.",
        ],
      },
    ],
  },
];
