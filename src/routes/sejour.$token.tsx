import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import {
  Bot,
  CalendarClock,
  Car,
  Copy,
  DoorOpen,
  Flame,
  KeyRound,
  LifeBuoy,
  LogOut,
  MapPin,
  MessageCircle,
  Send,
  Sparkles,
  Star,
  Train,
  Trash2,
  Wifi,
} from "lucide-react";
import { detectMode, getPublicApi } from "@/components/gestion/PmsProvider";
import { localAnswer } from "@/lib/pms/assistant";
import { euros, todayParis } from "@/lib/pms/dates";
import { pmsGuestChat, pmsGuestNotify } from "@/lib/pms/functions";
import { RECO_CATEGORIES, type GuestRequestType, type StayView } from "@/lib/pms/types";
import type { PublicApi } from "@/lib/pms/store";
import { SITE } from "@/content/site";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/sejour/$token")({
  head: () => ({
    meta: [
      { title: "Votre séjour | Spinelle Conciergerie" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  ssr: false,
  component: StayPage,
});

const T = {
  fr: {
    hello: "Bienvenue",
    stay: "Votre séjour",
    arrival: "Arrivée",
    departure: "Départ",
    from: "à partir de",
    before: "avant",
    access: "Accès au logement",
    codesLater: "Les codes d'accès apparaîtront ici la veille de votre arrivée.",
    door: "Code porte",
    keybox: "Boîte à clés",
    wifi: "Wifi",
    password: "Mot de passe",
    late: "Départ tardif",
    early: "Arrivée anticipée",
    problem: "Signaler un problème",
    contact: "Contacter l'équipe",
    lateText: (until: string, price: string) =>
      `Restez jusqu'à ${until} (${price}), selon disponibilité.`,
    earlyText: (price: string) => `Arrivez plus tôt (${price}), selon disponibilité.`,
    time: "Heure souhaitée",
    message: "Message (facultatif)",
    describe: "Décrivez le problème",
    send: "Envoyer la demande",
    sent: "Demande envoyée ! L'équipe vous répond rapidement ici.",
    requests: "Vos demandes",
    pending: "En attente",
    accepted: "Acceptée",
    refused: "Non disponible",
    done: "Traitée",
    practical: "Infos pratiques",
    tips: "Bons plans du quartier",
    trending: "Tendance",
    assistant: "Assistant 24 h/24",
    assistantHint:
      "Posez votre question (wifi, transports, restaurants, départ tardif…) : réponse immédiate dans votre langue.",
    placeholder: "Votre question…",
    howIsStay: "Comment se passe votre séjour ?",
    feedbackThanks: "Merci ! Bon séjour 🙂",
    feedbackLow: "Désolés ! Dites-nous ce qui ne va pas, nous intervenons au plus vite :",
    feedbackSend: "Envoyer",
    reviewAsk:
      "Merci pour votre séjour ! Si vous l'avez apprécié, un avis sur la plateforme de réservation nous aide énormément.",
    notFound: "Ce lien de séjour n'est plus valide. Contactez-nous si besoin.",
    rules: "Règles de la maison",
    appliances: "Équipements",
    heating: "Chauffage / clim",
    trash: "Poubelles et tri",
    transport: "Transports",
    parking: "Parking",
    checkout: "Consignes de départ",
    emergency: "Urgences",
    faq: "Questions fréquentes",
    map: "Itinéraire",
    offered: "offert",
  },
  en: {
    hello: "Welcome",
    stay: "Your stay",
    arrival: "Check-in",
    departure: "Check-out",
    from: "from",
    before: "by",
    access: "Getting in",
    codesLater: "Access codes will appear here the day before you arrive.",
    door: "Door code",
    keybox: "Key box",
    wifi: "Wifi",
    password: "Password",
    late: "Late check-out",
    early: "Early check-in",
    problem: "Report a problem",
    contact: "Contact us",
    lateText: (until: string, price: string) =>
      `Stay until ${until} (${price}), subject to availability.`,
    earlyText: (price: string) => `Arrive earlier (${price}), subject to availability.`,
    time: "Preferred time",
    message: "Message (optional)",
    describe: "Describe the problem",
    send: "Send request",
    sent: "Request sent! Our team will reply here shortly.",
    requests: "Your requests",
    pending: "Pending",
    accepted: "Accepted",
    refused: "Not available",
    done: "Handled",
    practical: "Practical info",
    tips: "Local tips",
    trending: "Trending",
    assistant: "24/7 assistant",
    assistantHint:
      "Ask anything (wifi, transport, restaurants, late check-out…): instant answer in your language.",
    placeholder: "Your question…",
    howIsStay: "How is your stay going?",
    feedbackThanks: "Thank you! Enjoy your stay 🙂",
    feedbackLow: "We're sorry! Tell us what's wrong and we'll fix it quickly:",
    feedbackSend: "Send",
    reviewAsk:
      "Thank you for staying with us! If you enjoyed it, a review on the booking platform helps us a lot.",
    notFound: "This stay link is no longer valid. Please contact us.",
    rules: "House rules",
    appliances: "Appliances",
    heating: "Heating / AC",
    trash: "Trash & recycling",
    transport: "Getting around",
    parking: "Parking",
    checkout: "Check-out instructions",
    emergency: "Emergencies",
    faq: "FAQ",
    map: "Directions",
    offered: "free",
  },
};

type Lang = keyof typeof T;

function StayPage() {
  const { token } = Route.useParams();
  const [api, setApi] = useState<PublicApi | null>(null);
  const [view, setView] = useState<StayView | null | undefined>(undefined);
  const [lang, setLang] = useState<Lang>("fr");

  async function load(a: PublicApi) {
    try {
      const v = await a.getStay(token);
      setView(v);
      if (v) setLang(v.reservation.language === "fr" ? "fr" : "en");
    } catch {
      setView(null);
    }
  }

  useEffect(() => {
    detectMode().then((m) => {
      const a = getPublicApi(m);
      setApi(a);
      void load(a);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const t = T[lang];
  if (view === undefined)
    return (
      <div className="flex min-h-screen items-center justify-center bg-sand text-sm text-muted-foreground">
        …
      </div>
    );
  if (!view || !api)
    return (
      <div className="flex min-h-screen items-center justify-center bg-sand px-6 text-center">
        <div>
          <p>{t.notFound}</p>
          <a className="btn-primary mt-4 inline-flex" href={SITE.whatsapp}>
            WhatsApp
          </a>
        </div>
      </div>
    );

  const p = view.property;
  const g = p.guide ?? {};
  const r = view.reservation;
  const today = todayParis();
  const during = today >= r.check_in && today < r.check_out;
  const after = today >= r.check_out;
  const first = (r.guest_name ?? "").split(" ")[0];
  const price = (n: number) => (n ? euros(n) : t.offered);
  const maps = p.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.address)}`
    : null;
  const fmt = (d: string) =>
    new Intl.DateTimeFormat(lang === "fr" ? "fr-FR" : "en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
    }).format(new Date(`${d}T12:00:00Z`));

  return (
    <div className="min-h-screen bg-sand pb-16">
      <div className="relative h-56 bg-ink sm:h-72">
        {p.photo_url && (
          <img
            src={p.photo_url}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-70"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/90 to-transparent" />
        <div className="absolute right-4 top-4 flex rounded-full bg-white/90 p-0.5 text-xs font-semibold">
          {(["fr", "en"] as Lang[]).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={cn("rounded-full px-2.5 py-1", lang === l && "bg-ink text-white")}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
        <div className="absolute bottom-0 left-0 right-0 mx-auto max-w-3xl px-5 pb-5 text-white">
          <p className="text-sm opacity-80">Spinelle Conciergerie</p>
          <h1 className="font-display text-3xl font-semibold">
            {t.hello}
            {first ? ` ${first}` : ""} !
          </h1>
          <p className="mt-1 text-sm opacity-90">{p.name}</p>
        </div>
      </div>

      <main className="mx-auto max-w-3xl space-y-4 px-4 pt-4">
        {g.welcome && <Card>{g.welcome}</Card>}

        <div className="grid gap-3 sm:grid-cols-2">
          <Card icon={<CalendarClock className="size-5" />} title={t.arrival}>
            <div className="capitalize">{fmt(r.check_in)}</div>
            <div className="text-sm text-muted-foreground">
              {t.from} {r.arrival_time || p.checkin_time}
            </div>
          </Card>
          <Card icon={<LogOut className="size-5" />} title={t.departure}>
            <div className="capitalize">{fmt(r.check_out)}</div>
            <div className="text-sm text-muted-foreground">
              {t.before} {r.departure_time || p.checkout_time}
            </div>
          </Card>
        </div>

        <Card icon={<KeyRound className="size-5" />} title={t.access}>
          {p.address && (
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <MapPin className="size-4 text-muted-foreground" /> {p.address}
              {maps && (
                <a
                  href={maps}
                  target="_blank"
                  rel="noopener"
                  className="text-sm font-medium text-primary underline"
                >
                  {t.map}
                </a>
              )}
            </div>
          )}
          {view.codes_visible ? (
            <div className="space-y-2">
              {g.access_details && <p className="whitespace-pre-line">{g.access_details}</p>}
              <div className="flex flex-wrap gap-2">
                {g.door_code && <Code label={t.door} value={g.door_code} />}
                {g.keybox_code && <Code label={t.keybox} value={g.keybox_code} />}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{t.codesLater}</p>
          )}
        </Card>

        {g.wifi_name && (
          <Card icon={<Wifi className="size-5" />} title={t.wifi}>
            <div className="flex flex-wrap gap-2">
              <Code label={t.wifi} value={g.wifi_name} />
              {g.wifi_password && <Code label={t.password} value={g.wifi_password} />}
            </div>
          </Card>
        )}

        {during && <Feedback api={api} token={token} t={t} cloud={api.mode === "cloud"} />}
        {after && <Card icon={<Star className="size-5" />}>{t.reviewAsk}</Card>}

        <Actions api={api} token={token} view={view} t={t} price={price} onDone={() => load(api)} />

        {view.requests.length > 0 && (
          <Card title={t.requests}>
            <ul className="space-y-2 text-sm">
              {view.requests.map((q) => (
                <li key={q.id} className="flex flex-wrap items-center justify-between gap-2">
                  <span>
                    {q.type === "late_checkout"
                      ? t.late
                      : q.type === "early_checkin"
                        ? t.early
                        : q.type === "probleme"
                          ? t.problem
                          : q.type === "avis_sejour"
                            ? t.howIsStay
                            : t.contact}
                    {q.requested_time ? ` · ${q.requested_time}` : ""}
                    {q.answer && <span className="block text-muted-foreground">{q.answer}</span>}
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-medium",
                      q.status === "accepte"
                        ? "bg-emerald-100 text-emerald-800"
                        : q.status === "refuse"
                          ? "bg-red-100 text-red-800"
                          : q.status === "traite"
                            ? "bg-muted"
                            : "bg-amber-100 text-amber-800",
                    )}
                  >
                    {q.status === "accepte"
                      ? t.accepted
                      : q.status === "refuse"
                        ? t.refused
                        : q.status === "traite"
                          ? t.done
                          : t.pending}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        <Chat token={token} view={view} t={t} cloud={api.mode === "cloud"} />

        <Card title={t.practical}>
          <div className="space-y-4">
            <Info icon={<DoorOpen className="size-4" />} title={t.rules} text={g.house_rules} />
            <Info icon={<Sparkles className="size-4" />} title={t.appliances} text={g.appliances} />
            <Info icon={<Flame className="size-4" />} title={t.heating} text={g.heating} />
            <Info icon={<Trash2 className="size-4" />} title={t.trash} text={g.trash} />
            <Info icon={<Train className="size-4" />} title={t.transport} text={g.transport} />
            <Info icon={<Car className="size-4" />} title={t.parking} text={g.parking} />
            <Info
              icon={<LogOut className="size-4" />}
              title={t.checkout}
              text={g.checkout_instructions}
            />
            <Info
              icon={<LifeBuoy className="size-4" />}
              title={t.emergency}
              text={
                g.emergency
                  ? `${g.emergency}\n112 · SAMU 15 · Pompiers 18 · Police 17`
                  : "112 · SAMU 15 · Pompiers 18 · Police 17"
              }
            />
            <Info icon={<MessageCircle className="size-4" />} title={t.faq} text={g.faq} />
          </div>
        </Card>

        {view.recommendations.length > 0 && (
          <Card title={t.tips}>
            {(Object.keys(RECO_CATEGORIES) as (keyof typeof RECO_CATEGORIES)[]).map((cat) => {
              const list = view.recommendations.filter((x) => x.category === cat);
              if (!list.length) return null;
              return (
                <div key={cat} className="mb-4 last:mb-0">
                  <h3 className="mb-2 text-sm font-semibold text-ink">{RECO_CATEGORIES[cat]}</h3>
                  <ul className="space-y-2">
                    {list.map((x) => (
                      <li key={x.id} className="rounded-lg border border-border p-3 text-sm">
                        <div className="flex flex-wrap items-center gap-2 font-medium">
                          {x.name}
                          {x.price_level && (
                            <span className="text-xs text-muted-foreground">{x.price_level}</span>
                          )}
                          {x.trending && (
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                              {t.trending}
                            </span>
                          )}
                        </div>
                        {x.description && <p className="text-muted-foreground">{x.description}</p>}
                        {x.tip && <p className="mt-1 text-xs">💡 {x.tip}</p>}
                        <div className="mt-1 flex gap-3 text-xs">
                          {x.address && (
                            <a
                              className="text-primary underline"
                              target="_blank"
                              rel="noopener"
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${x.name} ${x.address}`)}`}
                            >
                              {t.map}
                            </a>
                          )}
                          {x.url && (
                            <a
                              className="text-primary underline"
                              target="_blank"
                              rel="noopener"
                              href={x.url}
                            >
                              Site
                            </a>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </Card>
        )}
        <p className="pt-2 text-center text-xs text-muted-foreground">
          Spinelle Conciergerie ·{" "}
          <a href={SITE.whatsapp} className="underline">
            WhatsApp {SITE.phone}
          </a>
        </p>
      </main>
    </div>
  );
}

function Card({
  icon,
  title,
  children,
}: {
  icon?: ReactNode;
  title?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-white p-4 shadow-sm">
      {title && (
        <h2 className="mb-2 flex items-center gap-2 font-semibold text-ink">
          {icon && <span className="text-primary">{icon}</span>}
          {title}
        </h2>
      )}
      {!title && icon ? (
        <div className="flex gap-3">
          <span className="text-primary">{icon}</span>
          <div>{children}</div>
        </div>
      ) : (
        children
      )}
    </section>
  );
}

function Code({ label, value }: { label: string; value: string }) {
  return (
    <button
      onClick={() => navigator.clipboard?.writeText(value)}
      className="flex items-center gap-2 rounded-lg bg-sand px-3 py-2 text-left"
    >
      <span>
        <span className="block text-[11px] uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        <span className="font-mono text-lg font-semibold">{value}</span>
      </span>
      <Copy className="size-4 text-muted-foreground" />
    </button>
  );
}

function Info({
  icon,
  title,
  text,
}: {
  icon: ReactNode;
  title: string;
  text?: string | undefined;
}) {
  if (!text) return null;
  return (
    <div>
      <div className="flex items-center gap-2 text-sm font-semibold text-ink">
        {icon} {title}
      </div>
      <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

type Dict = (typeof T)["fr"];

function Actions({
  api,
  token,
  view,
  t,
  price,
  onDone,
}: {
  api: PublicApi;
  token: string;
  view: StayView;
  t: Dict;
  price: (n: number) => string;
  onDone: () => void;
}) {
  const [open, setOpen] = useState<GuestRequestType | null>(null);
  const [time, setTime] = useState("");
  const [msg, setMsg] = useState("");
  const [sent, setSent] = useState(false);
  const p = view.property;

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!open) return;
    await api.guestRequest(token, open, msg, time || undefined);
    if (api.mode === "cloud")
      void pmsGuestNotify({
        data: { token, type: open, details: `${time ? `Heure : ${time}\n` : ""}${msg}` },
      }).catch(() => undefined);
    setSent(true);
    setOpen(null);
    setMsg("");
    setTime("");
    onDone();
  }

  const btn = (type: GuestRequestType, label: string, icon: ReactNode) => (
    <button
      onClick={() => {
        setOpen(open === type ? null : type);
        setSent(false);
        setTime(type === "late_checkout" ? p.late_checkout_until : "");
      }}
      className={cn(
        "flex flex-col items-center gap-1 rounded-xl border p-3 text-sm font-medium",
        open === type ? "border-primary bg-primary/5" : "border-border bg-white",
      )}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <section className="space-y-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {btn("late_checkout", t.late, <LogOut className="size-5 text-primary" />)}
        {btn("early_checkin", t.early, <CalendarClock className="size-5 text-primary" />)}
        {btn("probleme", t.problem, <LifeBuoy className="size-5 text-red-600" />)}
        {btn("autre", t.contact, <MessageCircle className="size-5 text-primary" />)}
      </div>
      {sent && <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">{t.sent}</p>}
      {open && (
        <form onSubmit={submit} className="space-y-3 rounded-2xl border border-border bg-white p-4">
          {open === "late_checkout" && (
            <p className="text-sm">
              {t.lateText(p.late_checkout_until, price(p.late_checkout_price))}
            </p>
          )}
          {open === "early_checkin" && (
            <p className="text-sm">{t.earlyText(price(p.early_checkin_price))}</p>
          )}
          {(open === "late_checkout" || open === "early_checkin") && (
            <label className="block text-sm">
              {t.time}
              <input
                type="time"
                required
                value={time}
                max={open === "late_checkout" ? p.late_checkout_until : undefined}
                onChange={(e) => setTime(e.target.value)}
                className="mt-1 block rounded-md border border-input px-3 py-2"
              />
            </label>
          )}
          <textarea
            required={open === "probleme" || open === "autre"}
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            placeholder={open === "probleme" ? t.describe : t.message}
            rows={3}
            className="w-full rounded-md border border-input px-3 py-2 text-sm"
          />
          <button className="btn-primary w-full">{t.send}</button>
          {open === "autre" && (
            <a
              href={SITE.whatsapp}
              target="_blank"
              rel="noopener"
              className="block text-center text-xs text-primary underline"
            >
              WhatsApp {SITE.phone}
            </a>
          )}
        </form>
      )}
    </section>
  );
}

function Feedback({
  api,
  token,
  t,
  cloud,
}: {
  api: PublicApi;
  token: string;
  t: Dict;
  cloud: boolean;
}) {
  const key = `sejour-feedback-${token}`;
  const [rating, setRating] = useState<number | null>(() => {
    try {
      return Number(localStorage.getItem(key)) || null;
    } catch {
      return null;
    }
  });
  const [text, setText] = useState("");
  const [done, setDone] = useState(false);

  async function rate(n: number) {
    setRating(n);
    try {
      localStorage.setItem(key, String(n));
    } catch {
      /* rien */
    }
    if (n >= 4) {
      await api.guestRequest(token, "avis_sejour", "", undefined, n);
      setDone(true);
    }
  }

  async function sendLow() {
    if (!rating) return;
    await api.guestRequest(token, "avis_sejour", text, undefined, rating);
    if (cloud)
      void pmsGuestNotify({ data: { token, type: "avis_sejour", details: text, rating } }).catch(
        () => undefined,
      );
    setDone(true);
  }

  if (done || (rating && rating >= 4))
    return <Card icon={<Star className="size-5" />}>{t.feedbackThanks}</Card>;
  return (
    <Card title={t.howIsStay}>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} onClick={() => rate(n)} aria-label={`${n}/5`}>
            <Star
              className={cn(
                "size-8",
                rating && n <= rating ? "fill-amber-400 text-amber-400" : "text-border",
              )}
            />
          </button>
        ))}
      </div>
      {rating && rating <= 3 && (
        <div className="mt-3 space-y-2">
          <p className="text-sm">{t.feedbackLow}</p>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            className="w-full rounded-md border border-input px-3 py-2 text-sm"
          />
          <button className="btn-primary" onClick={sendLow}>
            {t.feedbackSend}
          </button>
        </div>
      )}
    </Card>
  );
}

type Turn = { role: "user" | "assistant"; content: string };

function Chat({
  token,
  view,
  t,
  cloud,
}: {
  token: string;
  view: StayView;
  t: Dict;
  cloud: boolean;
}) {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => end.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), [turns]);

  async function ask(e: FormEvent) {
    e.preventDefault();
    const question = q.trim();
    if (!question || busy) return;
    const history: Turn[] = [...turns, { role: "user", content: question }];
    setTurns(history);
    setQ("");
    setBusy(true);
    let answer: string | null = null;
    if (cloud) {
      try {
        answer = (await pmsGuestChat({ data: { token, history } })).answer;
      } catch {
        answer = null;
      }
    }
    setTurns([...history, { role: "assistant", content: answer ?? localAnswer(view, question) }]);
    setBusy(false);
  }

  return (
    <Card icon={<Bot className="size-5" />} title={t.assistant}>
      <p className="mb-3 text-sm text-muted-foreground">{t.assistantHint}</p>
      {turns.length > 0 && (
        <div className="mb-3 max-h-80 space-y-2 overflow-y-auto">
          {turns.map((m, i) => (
            <div
              key={i}
              className={cn(
                "max-w-[85%] whitespace-pre-line rounded-2xl px-3 py-2 text-sm",
                m.role === "user" ? "ml-auto bg-primary text-primary-foreground" : "bg-sand",
              )}
            >
              {m.content}
            </div>
          ))}
          {busy && <div className="w-16 rounded-2xl bg-sand px-3 py-2 text-sm">…</div>}
          <div ref={end} />
        </div>
      )}
      <form onSubmit={ask} className="flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t.placeholder}
          maxLength={1000}
          className="flex-1 rounded-full border border-input px-4 py-2 text-sm"
        />
        <button
          className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-50"
          disabled={busy || !q.trim()}
          aria-label="Envoyer"
        >
          <Send className="size-4" />
        </button>
      </form>
    </Card>
  );
}
