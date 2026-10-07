// Données de démonstration (mode démo uniquement) : deux logements fictifs pour essayer le
// logiciel avant de brancher les vrais comptes. Rien de tout cela n'est envoyé nulle part.

import { addDays, todayParis } from "./dates";
import { DEFAULT_CHECKLIST, DEFAULT_TEMPLATES, token, uid, withDefaults } from "./defaults";
import { emptyData, type AllData } from "./store";

export function demoSeed(): AllData {
  const d = emptyData();
  const today = todayParis();
  const at = (n: number) => addDays(today, n);

  const owner1 = withDefaults("pms_owners", {
    name: "Propriétaire démo A",
    email: "proprietaire-a@exemple.fr",
  });
  const owner2 = withDefaults("pms_owners", {
    name: "Propriétaire démo B",
    email: "proprietaire-b@exemple.fr",
  });
  d.pms_owners.push(owner1, owner2);

  const cleaner = withDefaults("pms_cleaners", {
    name: "Prestataire ménage démo",
    company: "Société de nettoyage (exemple)",
    phone: "+33600000000",
    rate: 45,
  });
  d.pms_cleaners.push(cleaner);

  const p1 = withDefaults("pms_properties", {
    name: "Studio démo Marais",
    address: "Adresse d'exemple, 75003 Paris",
    arrondissement: "3e arrondissement",
    owner_id: owner1.id,
    cleaner_id: cleaner.id,
    capacity: 2,
    bedrooms: 1,
    cleaning_fee: 45,
    commission_rate: 0.2,
    checklist: DEFAULT_CHECKLIST,
    guide: {
      welcome: "Bienvenue ! Ce studio est un exemple pour découvrir le livret d'accueil.",
      access_details:
        "Digicode en bas de l'immeuble, 3e étage gauche. Les clés sont dans la boîte à clés à droite de la porte.",
      door_code: "1234A",
      keybox_code: "0000",
      wifi_name: "Studio-Demo",
      wifi_password: "exemple123",
      house_rules: "Non-fumeur, pas de fête, silence après 22 h.",
      trash: "Local poubelles dans la cour : bac jaune pour le recyclage, vert pour le verre.",
      heating: "Radiateurs électriques : molette sur 3 pour une température confortable.",
      appliances:
        "Machine à café Nespresso, lave-linge (programme 40° rapide), fer à repasser sous l'évier.",
      transport: "Métro ligne 11 à 3 minutes.",
      checkout_instructions:
        "Laissez les clés dans la boîte à clés, lancez le lave-vaisselle et sortez les poubelles.",
      emergency: "Disjoncteur dans le placard de l'entrée. Urgences : 112.",
    },
  });
  const p2 = withDefaults("pms_properties", {
    name: "Appartement démo Montmartre",
    address: "Adresse d'exemple, 75018 Paris",
    arrondissement: "18e arrondissement",
    owner_id: owner2.id,
    cleaner_id: cleaner.id,
    capacity: 4,
    bedrooms: 2,
    cleaning_fee: 60,
    commission_rate: 0.2,
    checklist: DEFAULT_CHECKLIST,
    guide: {
      access_details: "Boîte à clés sur la grille du rez-de-chaussée.",
      keybox_code: "4321",
      wifi_name: "Montmartre-Demo",
      wifi_password: "exemple456",
      house_rules: "Non-fumeur. Animaux non admis.",
    },
  });
  d.pms_properties.push(p1, p2);

  const resa = (o: Partial<AllData["pms_reservations"][number]>) => {
    const r = withDefaults("pms_reservations", { guest_token: token(), ...o });
    d.pms_reservations.push(r);
    return r;
  };
  const r1 = resa({
    property_id: p1.id,
    platform: "airbnb",
    guest_name: "Voyageur démo 1",
    guests: 2,
    check_in: at(-2),
    check_out: at(1),
    amount_gross: 420,
    platform_fee: 64,
    cleaning_fee: 45,
    guest_language: "fr",
  });
  const r2 = resa({
    property_id: p1.id,
    platform: "booking",
    guest_name: "Demo guest 2",
    guests: 2,
    check_in: at(1),
    check_out: at(5),
    amount_gross: 610,
    platform_fee: 92,
    cleaning_fee: 45,
    guest_language: "en",
  });
  resa({
    property_id: p1.id,
    platform: "abritel",
    guest_name: "Voyageur démo 3",
    guests: 1,
    check_in: at(8),
    check_out: at(11),
    amount_gross: 390,
    platform_fee: 31,
    cleaning_fee: 45,
  });
  const r4 = resa({
    property_id: p2.id,
    platform: "airbnb",
    guest_name: "Voyageur démo 4",
    guests: 4,
    check_in: at(-6),
    check_out: at(-1),
    amount_gross: 980,
    platform_fee: 150,
    cleaning_fee: 60,
  });
  resa({
    property_id: p2.id,
    platform: "direct",
    guest_name: "Voyageur démo 5",
    guests: 3,
    check_in: at(3),
    check_out: at(7),
    amount_gross: 760,
    platform_fee: 0,
    cleaning_fee: 60,
    guest_email: "voyageur5@exemple.fr",
  });
  resa({
    property_id: p2.id,
    platform: "airbnb",
    guest_name: "Voyageur démo 6",
    guests: 2,
    check_in: at(-25),
    check_out: at(-20),
    amount_gross: 850,
    platform_fee: 130,
    cleaning_fee: 60,
  });

  const t1 = withDefaults("pms_cleaning_tasks", {
    property_id: p2.id,
    reservation_id: r4.id,
    cleaner_id: cleaner.id,
    date: at(-1),
    window_start: "11:00",
    status: "termine",
    condition: "orange",
    report_notes: "Ampoule grillée dans la chambre 2, une serviette tachée remplacée.",
    price: 45,
    completed_at: new Date(Date.now() - 86_400_000).toISOString(),
    checklist: DEFAULT_CHECKLIST.map((c) => ({ ...c, done: true })),
  });
  d.pms_cleaning_tasks.push(t1);
  d.pms_incidents.push(
    withDefaults("pms_incidents", {
      property_id: p2.id,
      task_id: t1.id,
      reservation_id: r4.id,
      severity: "orange",
      title: "Point à vérifier signalé au ménage",
      description: t1.report_notes,
      reported_by: cleaner.name,
    }),
  );

  d.pms_message_templates.push(
    ...DEFAULT_TEMPLATES.map((t) => withDefaults("pms_message_templates", { ...t, id: uid() })),
  );

  d.pms_guest_requests.push(
    withDefaults("pms_guest_requests", {
      reservation_id: r1.id,
      type: "late_checkout",
      requested_time: "13:00",
      price: p1.late_checkout_price,
      details: "Notre train part à 15 h, pourrions-nous rester jusqu'à 13 h ?",
    }),
  );

  d.pms_reviews.push(
    withDefaults("pms_reviews", {
      property_id: p2.id,
      platform: "airbnb",
      rating: 5,
      comment: "Appartement superbe et très propre, arrivée autonome très simple.",
      date: at(-18),
    }),
    withDefaults("pms_reviews", {
      property_id: p1.id,
      platform: "booking",
      rating: 4,
      comment: "Très bien situé, un peu de bruit le soir.",
      date: at(-30),
    }),
  );

  d.pms_expenses.push(
    withDefaults("pms_expenses", {
      property_id: p2.id,
      date: at(-1),
      category: "consommables",
      label: "Réassort café, papier toilette, savon",
      amount: 18.5,
    }),
  );

  d.pms_recommendations.push(
    withDefaults("pms_recommendations", {
      arrondissement: "3e arrondissement",
      category: "visite",
      name: "Musée Carnavalet",
      description: "Le musée de l'histoire de Paris, gratuit pour les collections permanentes.",
      address: "23 rue de Sévigné, 75003 Paris",
      trending: false,
      source: "exemple",
    }),
    withDefaults("pms_recommendations", {
      arrondissement: "3e arrondissement",
      category: "pratique",
      name: "Marché des Enfants Rouges",
      description: "Le plus vieux marché couvert de Paris, idéal pour un déjeuner sur le pouce.",
      address: "39 rue de Bretagne, 75003 Paris",
      trending: true,
      source: "exemple",
    }),
    withDefaults("pms_recommendations", {
      arrondissement: "18e arrondissement",
      category: "balade",
      name: "Butte Montmartre et Sacré-Cœur",
      description: "Montée par les escaliers de la rue Foyatier, vue sur tout Paris.",
      trending: false,
      source: "exemple",
    }),
  );

  // Le mois en cours sert de point de départ : pas de rapport rétroactif en démo.
  d.pms_settings.push(withDefaults("pms_settings", { data: { last_reports_month: null } }));
  void r2;
  return d;
}
