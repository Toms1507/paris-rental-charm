import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Session, SupabaseClient } from "@supabase/supabase-js";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_TEMPLATES } from "@/lib/pms/defaults";
import {
  getSettings,
  runAutomations,
  type RunContext,
  type RunSummary,
  type Sender,
} from "@/lib/pms/engine";
import { pmsConfig, pmsFetchIcal, pmsSendEmail } from "@/lib/pms/functions";
import { demoSeed } from "@/lib/pms/seed";
import {
  createLocalPublicApi,
  createLocalStore,
  createSupabasePublicApi,
  createSupabaseStore,
  emptyData,
  loadAll,
  type AllData,
  type Mode,
  type PublicApi,
  type Store,
} from "@/lib/pms/store";
import type { Settings, TableName, Tables } from "@/lib/pms/types";

const db = supabase as unknown as SupabaseClient;

let modePromise: Promise<Mode> | null = null;

/** Mode « cloud » si les tables du logiciel existent dans Supabase, sinon mode démo (navigateur). */
export function detectMode(): Promise<Mode> {
  if (!modePromise) {
    modePromise = (async () => {
      try {
        const { error } = await db.rpc("pms_get_export", { p_token: "verification" });
        if (
          error &&
          (error.code === "PGRST202" || /could not find the function/i.test(error.message))
        )
          return "demo";
        return error ? "demo" : "cloud";
      } catch {
        return "demo";
      }
    })();
  }
  return modePromise;
}

let localStore: Store | null = null;
export function getStore(mode: Mode): Store {
  if (mode === "cloud") return createSupabaseStore(db);
  localStore ??= createLocalStore(demoSeed);
  return localStore;
}

export function getPublicApi(mode: Mode): PublicApi {
  return mode === "cloud" ? createSupabasePublicApi(db) : createLocalPublicApi(getStore("demo"));
}

export type ServerConfig = Awaited<ReturnType<typeof pmsConfig>>;

type Ctx = {
  mode: Mode;
  store: Store;
  data: AllData;
  settings: Settings;
  loading: boolean;
  reload: () => Promise<void>;
  run: (opts?: { sync?: boolean; silent?: boolean }) => Promise<RunSummary | null>;
  running: boolean;
  lastSummary: RunSummary | null;
  config: ServerConfig | null;
  session: Session | null;
  runContext: () => RunContext;
  save: <T extends TableName>(
    table: T,
    id: string | null,
    row: Partial<Tables[T]>,
  ) => Promise<Tables[T] | null>;
  remove: (table: TableName, id: string, label?: string) => Promise<void>;
};

const PmsContext = createContext<Ctx | null>(null);

export function usePms() {
  const ctx = useContext(PmsContext);
  if (!ctx) throw new Error("usePms hors du logiciel de gestion");
  return ctx;
}

export const origin = () =>
  typeof window !== "undefined" ? window.location.origin : "https://spinelleconciergerie.fr";

export function PmsProvider({
  mode,
  session,
  children,
}: {
  mode: Mode;
  session: Session | null;
  children: ReactNode;
}) {
  const store = useMemo(() => getStore(mode), [mode]);
  const qc = useQueryClient();
  const key = useMemo(() => ["pms", mode, session?.user.id ?? "demo"], [mode, session]);
  const query = useQuery({ queryKey: key, queryFn: () => loadAll(store), staleTime: 30_000 });
  const data = query.data ?? emptyData();
  const [config, setConfig] = useState<ServerConfig | null>(null);
  const [running, setRunning] = useState(false);
  const [lastSummary, setLastSummary] = useState<RunSummary | null>(null);
  const runningRef = useRef(false);

  useEffect(() => {
    pmsConfig()
      .then(setConfig)
      .catch(() => setConfig(null));
  }, []);

  const reload = useCallback(async () => {
    await qc.invalidateQueries({ queryKey: key });
  }, [qc, key]);

  const sender: Sender = useMemo(
    () =>
      mode === "cloud"
        ? {
            email: async (to, subject, text, html) => {
              try {
                return await pmsSendEmail({ data: { to, subject, text, html } });
              } catch (e) {
                return { ok: false, error: e instanceof Error ? e.message : String(e) };
              }
            },
          }
        : { email: async () => ({ ok: true, simulated: true }) },
    [mode],
  );

  const runContext = useCallback(
    (): RunContext => ({
      store,
      origin: origin(),
      sender,
      fetchIcal: async (url) => (await pmsFetchIcal({ data: { url } })).text,
    }),
    [store, sender],
  );

  const run = useCallback(
    async (opts: { sync?: boolean; silent?: boolean } = {}) => {
      if (runningRef.current) return null;
      runningRef.current = true;
      setRunning(true);
      try {
        const summary = await runAutomations(
          runContext(),
          opts.sync === false ? { sync: false } : {},
        );
        setLastSummary(summary);
        await reload();
        if (!opts.silent) {
          const parts = [
            `${summary.synced} calendrier(s) synchronisé(s)`,
            summary.newReservations && `${summary.newReservations} nouvelle(s) réservation(s)`,
            summary.cancelled && `${summary.cancelled} annulation(s)`,
            summary.tasksCreated && `${summary.tasksCreated} ménage(s) planifié(s)`,
            summary.messagesSent && `${summary.messagesSent} message(s) envoyé(s)`,
            summary.messagesToCopy && `${summary.messagesToCopy} message(s) à copier`,
          ].filter(Boolean);
          toast.success("Automatisations à jour", { description: parts.join(" · ") });
          if (summary.feedErrors.length)
            toast.error("Calendriers en erreur", { description: summary.feedErrors.join("\n") });
        }
        return summary;
      } catch (e) {
        if (!opts.silent)
          toast.error("Échec des automatisations", {
            description: e instanceof Error ? e.message : String(e),
          });
        return null;
      } finally {
        runningRef.current = false;
        setRunning(false);
      }
    },
    [runContext, reload],
  );

  // Premier lancement en mode cloud : installe les modèles de messages par défaut.
  useEffect(() => {
    if (mode !== "cloud" || !query.data) return;
    if (query.data.pms_message_templates.length === 0 && query.data.pms_settings.length === 0) {
      (async () => {
        await store.insert("pms_message_templates", DEFAULT_TEMPLATES);
        await store.insert("pms_settings", [{ data: {} }]);
        await reload();
      })().catch(() => undefined);
    }
  }, [mode, query.data, store, reload]);

  // Automatisations à l'ouverture puis toutes les 10 minutes tant que le logiciel est ouvert.
  useEffect(() => {
    if (!query.data) return;
    const t0 = setTimeout(() => void run({ silent: true }), 1500);
    const t = setInterval(() => void run({ silent: true }), 10 * 60_000);
    return () => {
      clearTimeout(t0);
      clearInterval(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Boolean(query.data)]);

  const save = useCallback(
    async <T extends TableName>(table: T, id: string | null, row: Partial<Tables[T]>) => {
      try {
        let result: Tables[T] | null = null;
        if (id) await store.update(table, id, row);
        else result = (await store.insert(table, [row]))[0] ?? null;
        await reload();
        return result ?? ({ ...row, id } as Tables[T]);
      } catch (e) {
        toast.error("Enregistrement impossible", {
          description: e instanceof Error ? e.message : String(e),
        });
        return null;
      }
    },
    [store, reload],
  );

  const remove = useCallback(
    async (table: TableName, id: string, label?: string) => {
      try {
        await store.remove(table, id);
        await reload();
        if (label) toast.success(`${label} supprimé(e)`);
      } catch (e) {
        toast.error("Suppression impossible", {
          description: e instanceof Error ? e.message : String(e),
        });
      }
    },
    [store, reload],
  );

  const value: Ctx = {
    mode,
    store,
    data,
    settings: getSettings(data),
    loading: query.isLoading,
    reload,
    run,
    running,
    lastSummary,
    config,
    session,
    runContext,
    save,
    remove,
  };
  return <PmsContext.Provider value={value}>{children}</PmsContext.Provider>;
}

// Petits sélecteurs réutilisés partout.
export function usePropertyName() {
  const { data } = usePms();
  return useCallback(
    (id: string | null | undefined) => data.pms_properties.find((p) => p.id === id)?.name ?? "—",
    [data],
  );
}
