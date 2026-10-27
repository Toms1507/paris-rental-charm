import { buildBarometre } from "@/content/barometre";
import { FACTS } from "@/content/market-facts";
import feliPhoto from "@/assets/reviews/feli.jpg";
import mathildeChanteloupPhoto from "@/assets/reviews/mathilde-chanteloup.jpg";
import mathildeRouenPhoto from "@/assets/reviews/mathilde-rouen.jpg";
import oliviaPhoto from "@/assets/reviews/olivia.jpg";

export const SITE = {
  name: "Spinelle Conciergerie",
  tagline: "Conciergerie Airbnb à Paris et alentours",
  email: "contact@spinelleconciergerie.fr",
  phone: "+33 6 31 93 51 66",
  // Lien WhatsApp direct (numéro au format international, sans + ni espaces).
  whatsapp: "https://wa.me/33631935166",
  zone: "Paris et alentours",
  // Profils officiels de l'entreprise (fiche Google, réseaux sociaux, annuaires) : reliés au
  // site dans les données structurées, ils aident Google et les IA à identifier l'entreprise.
  profiles: [] as string[],
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

// Avis publics laissés par nos voyageurs sur Airbnb, reproduits à l'identique (traduction
// automatique d'Airbnb pour les avis en langue étrangère). Photos publiées avec leur accord.
export type Review = {
  name: string;
  from: string;
  date: string;
  rating: number;
  /** Photo de profil Airbnb (sinon, initiale du prénom). */
  photo?: string;
  text: string;
  /** Langue d'origine quand l'avis a été traduit par Airbnb. */
  language?: string;
};

export const REVIEWS: Review[] = [
  {
    name: "Feli",
    from: "Augsbourg, Allemagne",
    photo: feliPhoto,
    date: "décembre 2025",
    rating: 5,
    text: "La communication était merveilleuse. On m'a toujours répondu très rapidement et j'ai également été accueilli personnellement. De plus, l'emplacement était 1A, on ne peut pas faire mieux. Je ne peux que le recommander à tout le monde.",
    language: "Allemand",
  },
  {
    name: "Mathilde",
    from: "Rouen, France",
    photo: mathildeRouenPhoto,
    date: "avril 2026",
    rating: 5,
    text: "Emplacement idéal en plein cœur de la ville! Tom nous a fourni de nombreux conseils pour découvrir la ville. Parfait pour un we!",
  },
  {
    name: "Olivia",
    from: "Bristol, Royaume-Uni",
    photo: oliviaPhoto,
    date: "juin 2026",
    rating: 5,
    text: "Hôte incroyable !\nLe logement est un peu chaud en été, mais sinon génial.",
    language: "Anglais",
  },
  {
    name: "Mathilde",
    from: "Chanteloup-les-Vignes, France",
    photo: mathildeChanteloupPhoto,
    date: "juin 2025",
    rating: 5,
    text: "Tom est un hôte hyper accueillant, gentil et sympa.\nIl est à l’écoute réactif pour répondre et disponible pour toute demande\nNous avons passé un agréable séjour dans son logement.\nJe vous le recommande vivement et fortement.\nÇa serait avec un grand plaisir de pouvoir échanger de nouveaux avec cet hôte.",
  },
  {
    name: "Lovisa",
    from: "Stockholm, Suède",
    date: "juillet 2025",
    rating: 5,
    text: "Très joli petit appartement, juste à côté d'une place avec des sièges extérieurs confortables et situé au centre !",
    language: "Suédois",
  },
];

export const FAQ = [
  {
    q: "Combien coûte une conciergerie Airbnb à Paris ?",
    a: "Chez Spinelle Conciergerie, la commission est de 20 % des revenus locatifs, sans abonnement ni frais de mise en place. Vous ne payez que lorsque votre logement est loué.",
  },
  {
    q: "Combien puis-je gagner avec mon logement en location courte durée ?",
    a: `Cela dépend du quartier, de la taille du logement, de sa capacité d'accueil et du nombre de nuits louées. D'après les données Inside Airbnb (${FACTS.period}), ramenées aux prix réellement payés par les voyageurs (AirROI), le prix médian d'une nuit dans un logement entier actif à Paris est de ${FACTS.price.studio} pour un studio, ${FACTS.price.oneBedroom} pour un logement d'une chambre et ${FACTS.price.twoBedrooms} pour deux chambres. Utilisez notre simulateur de revenus pour une première estimation, puis demandez un audit gratuit\u00a0: nous vous répondons sous 24\u00a0h avec une projection personnalisée.`,
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
    slug: "check-in-autonome-paris",
    title: "Check-in autonome à Paris : comment bien l'organiser",
    description:
      "Boîte à clés, code électronique ou serrure connectée : organiser un check-in autonome fiable, sans mauvaise surprise, pour une location à Paris.",
    date: "2026-10-27",
    readingTime: "6 min",
    sections: [
      {
        heading: "Pourquoi le check-in autonome s'est imposé à Paris",
        paragraphs: [
          "À Paris, les voyageurs arrivent à toute heure : vol retardé, train de nuit, correspondance tardive à l'aéroport. Un accueil en personne imposé à heure fixe devient vite une contrainte, aussi bien pour le voyageur que pour le propriétaire ou l'équipe qui gère le logement.",
          "Le check-in autonome répond à cette réalité : le voyageur accède au logement par ses propres moyens, à l'heure qui lui convient, sans dépendre de la disponibilité d'une personne. C'est aujourd'hui la norme sur la plupart des annonces performantes à Paris.",
        ],
      },
      {
        heading: "Boîte à clés, code ou serrure connectée : quelle solution choisir",
        paragraphs: [
          "Trois solutions coexistent, avec des niveaux de coût et de fiabilité différents.",
        ],
        bullets: [
          "Boîte à clés mécanique fixée à l'entrée : solution la moins chère, mais le code doit être changé manuellement entre deux voyageurs et la boîte peut s'user ou se bloquer",
          "Serrure ou clavier à code électronique : le code se change à distance depuis une application, sans intervention physique, pour un coût d'achat plus élevé",
          "Serrure connectée pilotable à distance : ouverture par application ou badge et historique des accès, mais dépend d'une connexion internet et d'une alimentation électrique fiables",
        ],
      },
      {
        heading: "Les règles à vérifier avant d'installer un accès autonome",
        paragraphs: [
          "Un dispositif d'accès autonome touche souvent les parties communes de l'immeuble : porte d'entrée, hall, interphone. Avant toute installation, mieux vaut vérifier le règlement de copropriété et, si le dispositif doit être fixé sur une partie commune, demander l'accord du syndic ou du conseil syndical.",
          "Pensez aussi à la sécurité du dispositif lui-même : un code jamais changé entre deux voyageurs, ou une boîte à clés visible depuis la rue, expose le logement à un risque facilement évitable.",
        ],
      },
      {
        heading: "Le guide d'arrivée, l'outil qui évite la moitié des messages",
        paragraphs: [
          "Un guide d'arrivée clair, envoyé automatiquement avant le séjour, répond par avance aux questions les plus fréquentes et réduit nettement le nombre de messages pendant le check-in.",
        ],
        bullets: [
          "L'adresse exacte et les instructions d'accès, étape par étape, avec photos si besoin",
          "Le code ou la procédure d'ouverture, et un numéro à contacter en cas de souci",
          "Le code wifi, le fonctionnement du chauffage ou de la climatisation",
          "Les règles de la maison : horaires de calme, tri des déchets, nombre de voyageurs autorisé",
          "Les transports à proximité et quelques adresses utiles dans le quartier",
        ],
      },
      {
        heading: "Les erreurs qui coûtent une mauvaise note",
        paragraphs: [
          "Le check-in autonome supprime le contact humain au moment le plus stressant du séjour pour un voyageur : l'arrivée dans un logement inconnu. Quelques négligences suffisent à transformer ce moment en premier motif d'avis négatif.",
        ],
        bullets: [
          "Un code resté identique après plusieurs séjours, ou partagé par erreur",
          "Aucune solution de repli si la technologie tombe en panne (batterie, réseau)",
          "Un numéro de contact qui ne répond pas en cas de blocage",
          "Des instructions d'accès trop vagues pour un voyageur arrivant de nuit",
        ],
      },
      {
        heading: "Comment nous organisons le check-in chez Spinelle",
        paragraphs: [
          "Nous équipons chaque logement d'une solution d'accès autonome adaptée à sa configuration, rédigeons le guide d'arrivée et restons disponibles pour les voyageurs en cas de besoin, 7 jours sur 7.",
          "Lors de l'audit gratuit de votre logement, nous vous proposons la solution de check-in la plus adaptée, avec une estimation de revenus sous 24 h, sans engagement.",
        ],
      },
    ],
  },
  {
    slug: "assurance-location-courte-duree-paris",
    title: "Assurance location courte durée à Paris : ce qu'il faut vérifier",
    description:
      "Assurance habitation, PNO, garanties des plateformes comme AirCover : ce que couvre réellement chaque contrat avant de louer en courte durée à Paris.",
    date: "2026-10-23",
    readingTime: "6 min",
    sections: [
      {
        heading: "Un risque locatif différent de la location classique",
        paragraphs: [
          "Louer un logement à la nuitée change la donne pour l'assurance : les voyageurs se succèdent, l'occupation est discontinue et un sinistre (dégât des eaux, bris, vol) peut survenir à tout moment du séjour. Beaucoup de propriétaires découvrent seulement après un incident que leur contrat d'assurance habitation classique ne couvre pas cette activité.",
          "Avant de mettre un logement en location courte durée, mieux vaut vérifier précisément ce que couvre votre assurance actuelle, ce qu'elle exclut, et ce que les garanties proposées par les plateformes prennent réellement en charge.",
        ],
      },
      {
        heading: "Déclarez l'activité à votre assureur",
        paragraphs: [
          "Un contrat d'assurance habitation est souscrit pour un usage précis : résidence principale, résidence secondaire ou location nue à un locataire unique. La location meublée de courte durée à des voyageurs successifs constitue un changement d'usage que la plupart des assureurs demandent à connaître.",
          "Ne pas signaler cette activité peut être considéré comme une aggravation du risque non déclarée, avec un effet direct en cas de sinistre : réduction de l'indemnisation, voire refus de garantie. Un simple appel à votre assureur pour faire adapter le contrat, ou souscrire une extension dédiée, évite ce risque.",
        ],
      },
      {
        heading: "L'assurance propriétaire non occupant (PNO)",
        paragraphs: [
          "En copropriété, la loi Alur impose à chaque propriétaire de souscrire une assurance responsabilité civile propriétaire non occupant (PNO), que le logement soit habité par vous-même, loué ou vacant. Hors copropriété, aucune loi n'impose cette assurance, mais elle reste vivement recommandée.",
          "La PNO couvre notamment votre responsabilité civile de propriétaire et les sinistres qui surviennent pendant les périodes de vacance entre deux séjours, souvent plus fréquentes en courte durée qu'avec un locataire à l'année.",
        ],
      },
      {
        heading: "AirCover et les garanties des plateformes ne remplacent pas une assurance",
        paragraphs: [
          "Airbnb (AirCover), Booking et les autres plateformes proposent des garanties en cas de dommages causés par un voyageur, mais ce ne sont pas des assurances au sens juridique du terme : elles ne s'appliquent qu'aux réservations passées par leur intermédiaire, jamais à vos réservations directes.",
          "Ces garanties excluent généralement plusieurs cas fréquents : elles complètent une couverture personnelle adaptée, elles ne la remplacent pas.",
        ],
        bullets: [
          "L'usure normale du mobilier et des équipements",
          "Les catastrophes naturelles",
          "Les objets de grande valeur (bijoux, œuvres d'art, espèces)",
          "Les sinistres survenant en dehors des périodes de séjour réservé",
        ],
      },
      {
        heading: "La responsabilité civile face aux dommages causés par un voyageur",
        paragraphs: [
          "Une PNO classique ne couvre pas toujours les dommages causés par l'occupant temporaire du logement, ni ceux qu'il pourrait causer à un voisin ou à un tiers. Signalez explicitement à votre assureur que le logement est destiné à la location meublée de tourisme ou saisonnière : certains contrats proposent une extension spécifique, parfois appelée « pour le compte de qui il appartiendra », qui comble ce manque.",
        ],
      },
      {
        heading: "Avant de mettre votre logement en location",
        paragraphs: [
          "Un point assurance mal vérifié se découvre souvent au pire moment : pendant un sinistre, avec un voyageur sur place. Quelques vérifications suffisent pour partir sereinement.",
          "Lors de l'audit gratuit de votre logement, nous passons ce point en revue avec vous, aux côtés du cadre légal et de l'estimation de revenus. Réponse sous 24 h, sans engagement.",
        ],
        bullets: [
          "Informez votre assureur de la location courte durée et faites adapter le contrat",
          "Vérifiez si une PNO est obligatoire pour votre copropriété",
          "Demandez une extension « meublé de tourisme » ou « location saisonnière »",
          "Ne comptez pas uniquement sur les garanties de la plateforme",
        ],
      },
    ],
  },
  {
    slug: "choisir-conciergerie-airbnb-paris",
    title: "Comment choisir sa conciergerie Airbnb à Paris : les 8 critères qui comptent",
    description:
      "Commission, frais cachés, promesses d'occupation, ménage, conformité légale : la méthode pour comparer les conciergeries Airbnb à Paris et éviter les mauvaises surprises.",
    date: "2026-10-16",
    readingTime: "8 min",
    sections: [
      {
        heading: "1. Une tarification lisible, sans frais cachés",
        paragraphs: [
          "La plupart des conciergeries se rémunèrent par une commission sur les revenus locatifs. Le pourcentage seul ne suffit pas à comparer : vérifiez ce qu'il couvre réellement (ménage, linge, consommables, photos, gestion des voyageurs) et ce qui est facturé en plus.",
          "Méfiez-vous des frais de mise en place, des abonnements mensuels et des forfaits facturés même quand le logement n'est pas loué. Chez Spinelle Conciergerie, la commission est de 20\u00a0% des revenus encaissés, tout compris\u00a0: aucun frais si votre logement n'est pas loué.",
        ],
        bullets: [
          "Sur quelle base la commission est-elle calculée (revenus encaissés, frais de ménage inclus ou non) ?",
          "Le ménage et le linge sont-ils inclus ou refacturés au voyageur, voire au propriétaire ?",
          "Existe-t-il des frais d'entrée, de sortie ou un abonnement ?",
        ],
      },
      {
        heading: "2. Aucune promesse d'occupation garantie",
        paragraphs: [
          "Le taux d'occupation dépend de la saison, du quartier, de la concurrence et de la réglementation. Une conciergerie qui garantit un chiffre précis soit le compensera par des prix trop bas, soit ne pourra pas tenir sa promesse. Demandez plutôt comment elle compte maximiser l'occupation : réactivité, qualité de l'annonce, tarification quotidienne.",
          "Pour vous faire une idée objective du potentiel de votre logement, notre simulateur s'appuie sur les données réelles du marché, quartier par quartier, et sur les prix réellement payés par les voyageurs.",
        ],
      },
      {
        heading: "3. Une équipe réellement présente sur place",
        paragraphs: [
          "Arrivée tardive, clé perdue, fuite d'eau un dimanche : la location courte durée exige de pouvoir intervenir vite. Vérifiez qui se déplace, dans quel délai, et si l'équipe connaît votre quartier. Une conciergerie locale, à taille humaine, est souvent plus réactive qu'un réseau national.",
        ],
      },
      {
        heading: "4. Le ménage et le linge, clés des bons avis",
        paragraphs: [
          "La propreté est l'un des critères les plus commentés par les voyageurs, et les avis pèsent sur le classement de votre annonce. Demandez qui fait le ménage (équipe interne ou sous-traitance), selon quel protocole, avec quel contrôle après chaque départ, et qui fournit et blanchit le linge.",
        ],
      },
      {
        heading: "5. Une tarification ajustée chaque jour",
        paragraphs: [
          "Salons, concerts, vacances scolaires, ponts : la demande parisienne varie en permanence. Un prix fixe laisse de l'argent sur la table en haute saison et fait perdre des réservations en période creuse. Demandez à quelle fréquence les prix sont revus et sur quelles données.",
        ],
      },
      {
        heading: "6. La transparence sur vos revenus",
        paragraphs: [
          "Vous devez savoir à tout moment combien votre logement a rapporté : nuits louées, prix moyen, commission, montant versé. Exigez un récapitulatif mensuel clair et un accès à votre calendrier.",
        ],
      },
      {
        heading: "7. La maîtrise du cadre légal parisien",
        paragraphs: [
          "À Paris, la location d'une résidence principale en meublé de tourisme est plafonnée à 90 nuits par an depuis le 1er janvier 2025, le numéro d'enregistrement est obligatoire et une résidence secondaire nécessite un changement d'usage. Une conciergerie sérieuse vérifie votre situation avant toute mise en ligne et gère la taxe de séjour avec vous.",
        ],
      },
      {
        heading: "8. Un contrat sans engagement de durée",
        paragraphs: [
          "Un mandat de gestion doit pouvoir être résilié simplement. Regardez la durée minimale, le préavis et les conditions de sortie : une conciergerie confiante dans la qualité de son travail n'a pas besoin de vous retenir par contrat.",
        ],
      },
      {
        heading: "Les questions à poser avant de signer",
        paragraphs: [
          "Comparez au moins deux ou trois conciergeries avec la même grille. Spinelle Conciergerie répond à toutes ces questions par écrit lors de l'audit gratuit de votre logement, sous 24\u00a0h et sans engagement.",
        ],
        bullets: [
          "Que comprend exactement la commission, et que paierai-je en plus ?",
          "Qui intervient en cas d'urgence, et en combien de temps ?",
          "Qui fait le ménage, et comment est-il contrôlé ?",
          "À quelle fréquence les prix sont-ils ajustés ?",
          "Comment suivrai-je mes revenus chaque mois ?",
          "Mon logement est-il en règle pour la location courte durée à Paris ?",
          "Comment résilier le contrat, et avec quel préavis ?",
        ],
      },
    ],
  },
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
          `Le revenu d'une location courte durée dépend de deux chiffres\u00a0: le prix moyen par nuit et le nombre de nuits louées. D'après les données publiées par Inside Airbnb (${FACTS.period}, ${FACTS.listings} logements entiers actifs à Paris), ramenées aux prix réellement payés par les voyageurs (AirROI), voici les prix médians par nuit\u00a0:`,
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
