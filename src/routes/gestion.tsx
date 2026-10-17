import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import type { Session, SupabaseClient } from "@supabase/supabase-js";
import {
  AlertTriangle,
  BedDouble,
  CalendarDays,
  FileText,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Plug,
  Megaphone,
  RefreshCw,
  Sparkles,
  Star,
  Users,
  X,
} from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { detectMode, PmsProvider, usePms } from "@/components/gestion/PmsProvider";
import { TextInput } from "@/components/gestion/ui";
import { formatDateTime } from "@/lib/pms/dates";
import type { Mode } from "@/lib/pms/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/gestion")({
  head: () => ({
    meta: [
      { title: "Gestion | Spinelle Conciergerie" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  ssr: false,
  component: GestionShell,
});

const db = supabase as unknown as SupabaseClient;

function GestionShell() {
  const [mode, setMode] = useState<Mode | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [staff, setStaff] = useState<boolean | null>(null);

  useEffect(() => {
    detectMode().then(setMode);
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (mode !== "cloud" || !session) return setStaff(null);
    db.from("pms_staff")
      .select("user_id")
      .eq("user_id", session.user.id)
      .maybeSingle()
      .then(({ data }) => setStaff(Boolean(data)));
  }, [mode, session]);

  if (!mode) return <Splash />;
  if (mode === "cloud" && !session) return <Login />;
  if (mode === "cloud" && staff === null) return <Splash />;
  if (mode === "cloud" && !staff)
    return (
      <Centered>
        <h1 className="text-xl font-semibold">Compte non autorisé</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Ce compte ({session?.user.email}) n'a pas accès au logiciel. Demandez à l'administrateur
          de vous ajouter dans « Connexions et réglages ».
        </p>
        <button className="btn-outline mt-4" onClick={() => supabase.auth.signOut()}>
          Se déconnecter
        </button>
      </Centered>
    );

  return (
    <PmsProvider mode={mode} session={session}>
      <Layout />
      <Toaster position="top-right" richColors />
    </PmsProvider>
  );
}

function Splash() {
  return (
    <Centered>
      <RefreshCw className="mx-auto size-6 animate-spin text-primary" />
      <p className="mt-3 text-sm text-muted-foreground">Chargement du logiciel…</p>
    </Centered>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-sand px-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 text-center shadow-soft">
        {children}
      </div>
    </div>
  );
}

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signup, setSignup] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setInfo(null);
    const res = signup
      ? await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/gestion` },
        })
      : await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (res.error) setError(res.error.message);
    else if (signup && !res.data.session)
      setInfo("Compte créé : confirmez votre adresse via l'email reçu, puis connectez-vous.");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-sand px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm space-y-4 rounded-xl border border-border bg-card p-6 shadow-soft"
      >
        <div>
          <img src="/brand/icon-96.png?v=2" alt="" className="size-10 rounded-md" />
          <h1 className="mt-3 font-display text-2xl font-semibold text-ink">Spinelle Gestion</h1>
          <p className="text-sm text-muted-foreground">
            {signup
              ? "Créez votre compte. Le tout premier compte devient administrateur."
              : "Connectez-vous à votre espace."}
          </p>
        </div>
        <TextInput
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
        <TextInput
          type="password"
          required
          minLength={8}
          placeholder="Mot de passe (8 caractères minimum)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={signup ? "new-password" : "current-password"}
        />
        {error && <p className="text-sm text-red-700">{error}</p>}
        {info && <p className="text-sm text-emerald-700">{info}</p>}
        <button className="btn-primary w-full" disabled={busy}>
          {busy ? "…" : signup ? "Créer le compte" : "Se connecter"}
        </button>
        <button
          type="button"
          className="w-full text-center text-xs text-muted-foreground underline"
          onClick={() => setSignup(!signup)}
        >
          {signup ? "J'ai déjà un compte" : "Première connexion ? Créer le compte"}
        </button>
      </form>
    </div>
  );
}

const NAV = [
  { to: "/gestion", label: "Tableau de bord", icon: LayoutDashboard, exact: true },
  { to: "/gestion/calendrier", label: "Calendrier", icon: CalendarDays },
  { to: "/gestion/reservations", label: "Réservations", icon: BedDouble },
  { to: "/gestion/menage", label: "Ménages", icon: Sparkles },
  { to: "/gestion/incidents", label: "Incidents", icon: AlertTriangle },
  { to: "/gestion/messages", label: "Voyageurs et messages", icon: MessageSquare },
  { to: "/gestion/logements", label: "Logements", icon: Home },
  { to: "/gestion/proprietaires", label: "Propriétaires et rapports", icon: FileText },
  { to: "/gestion/avis", label: "Avis", icon: Star },
  { to: "/gestion/prestataires", label: "Prestataires ménage", icon: Users },
  { to: "/gestion/prospection", label: "Prospection agences", icon: Megaphone },
  { to: "/gestion/integrations", label: "Connexions et réglages", icon: Plug },
] as const;

function Layout() {
  const { mode, data, run, running, settings, session } = usePms();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);

  const badges: Record<string, number> = {
    "/gestion/incidents": data.pms_incidents.filter((i) => i.status !== "resolu").length,
    "/gestion/messages":
      data.pms_guest_requests.filter((r) => r.status === "en_attente").length +
      data.pms_messages.filter((m) => m.status === "a_copier" || m.status === "echec").length +
      data.pms_escalations.filter((e) => e.status === "en_attente").length,
  };

  const nav = (
    <nav className="space-y-0.5">
      {NAV.map((item) => {
        const active =
          "exact" in item ? path === item.to || path === `${item.to}/` : path.startsWith(item.to);
        const Icon = item.icon;
        return (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition",
              active ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-white",
            )}
          >
            <Icon className="size-4 shrink-0" />
            <span className="flex-1">{item.label}</span>
            {badges[item.to] ? (
              <span
                className={cn(
                  "rounded-full px-1.5 text-xs font-semibold",
                  active ? "bg-white/20" : "bg-red-600 text-white",
                )}
              >
                {badges[item.to]}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );

  const footer = (
    <div className="space-y-2 border-t border-border pt-3 text-xs text-muted-foreground">
      <button
        onClick={() => run({ silent: false })}
        disabled={running}
        className="flex w-full items-center justify-center gap-2 rounded-md border border-border bg-white px-3 py-2 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-60"
      >
        <RefreshCw className={cn("size-4", running && "animate-spin")} />
        {running ? "Synchronisation…" : "Synchroniser maintenant"}
      </button>
      <p>Dernière synchro : {settings.last_run ? formatDateTime(settings.last_run) : "jamais"}</p>
      {mode === "cloud" ? (
        <button
          onClick={() => supabase.auth.signOut()}
          className="flex items-center gap-1.5 hover:text-foreground"
        >
          <LogOut className="size-3.5" /> {session?.user.email}
        </button>
      ) : (
        <p className="rounded-md bg-amber-100 p-2 text-amber-900">
          Mode démo : données fictives enregistrées dans ce navigateur. Voir « Connexions et
          réglages » pour activer la base.
        </p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-sand">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col gap-4 border-r border-border bg-sand p-4 lg:flex">
        <Brand />
        <div className="flex-1 overflow-y-auto">{nav}</div>
        {footer}
      </aside>
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-sand/95 px-4 py-3 backdrop-blur lg:hidden">
        <Brand />
        <button
          onClick={() => setOpen(true)}
          aria-label="Menu"
          className="rounded-md p-2 hover:bg-white"
        >
          <Menu className="size-5" />
        </button>
      </header>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-72 flex-col gap-4 bg-sand p-4">
            <div className="flex items-center justify-between">
              <Brand />
              <button onClick={() => setOpen(false)} aria-label="Fermer">
                <X className="size-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">{nav}</div>
            {footer}
          </div>
        </div>
      )}
      <main className="px-4 py-6 sm:px-6 lg:ml-64 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function Brand() {
  return (
    <Link to="/gestion" className="flex items-center gap-2">
      <img src="/brand/icon-96.png?v=2" alt="" className="size-8 rounded-md" />
      <div className="leading-tight">
        <div className="font-display text-base font-semibold text-ink">Spinelle</div>
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Gestion</div>
      </div>
    </Link>
  );
}
