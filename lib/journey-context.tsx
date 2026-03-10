"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  clearJourney,
  JourneyState,
  loadJourney,
  saveJourney,
  StationSubmission,
} from "./journey-store";

interface JourneyContextValue {
  state: JourneyState | null;
  isLoaded: boolean;
  setNickname: (name: string) => Promise<void>;
  saveStationDraft: (
    stationId: string,
    data: Partial<StationSubmission>
  ) => Promise<void>;
  markSubmitted: (stationId: string, ts: number) => Promise<void>;
  clearJourneyData: () => Promise<void>;
  setIntroSeen: () => Promise<void>;
}

const JourneyContext = createContext<JourneyContextValue | null>(null);

export function JourneyProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<JourneyState | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadJourney()
      .then((loaded) => {
        if (loaded) setState(loaded);
      })
      .catch(console.error)
      .finally(() => setIsLoaded(true));
  }, []);

  const persist = useCallback((next: JourneyState) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      saveJourney(next).catch(console.error);
    }, 300);
  }, []);

  const setNickname = useCallback(
    async (name: string) => {
      const next: JourneyState = state ?? {
        nickname: name,
        submissions: {},
        startedAt: Date.now(),
      };
      const updated = { ...next, nickname: name };
      setState(updated);
      await saveJourney(updated);
    },
    [state]
  );

  const saveStationDraft = useCallback(
    async (stationId: string, data: Partial<StationSubmission>) => {
      const base = state ?? {
        nickname: "",
        submissions: {},
        startedAt: Date.now(),
      };
      const key = stationId as "1" | "2" | "3" | "4";
      const existing = base.submissions[key] ?? {
        photoDataUrl: null,
        message: "",
        submittedAt: null,
      };
      const updated: JourneyState = {
        ...base,
        submissions: {
          ...base.submissions,
          [key]: { ...existing, ...data },
        },
      };
      setState(updated);
      persist(updated);
    },
    [state, persist]
  );

  const markSubmitted = useCallback(
    async (stationId: string, ts: number) => {
      if (!state) return;
      const key = stationId as "1" | "2" | "3" | "4";
      const existing = state.submissions[key] ?? {
        photoDataUrl: null,
        message: "",
        submittedAt: null,
      };
      const updated: JourneyState = {
        ...state,
        submissions: {
          ...state.submissions,
          [key]: { ...existing, submittedAt: ts },
        },
      };
      setState(updated);
      await saveJourney(updated);
    },
    [state]
  );

  const clearJourneyData = useCallback(async () => {
    setState(null);
    await clearJourney();
  }, []);

  const setIntroSeen = useCallback(async () => {
    const base = state ?? { nickname: "", submissions: {}, startedAt: Date.now() };
    const updated = { ...base, introSeen: true };
    setState(updated);
    await saveJourney(updated);
  }, [state]);

  return (
    <JourneyContext.Provider
      value={{
        state,
        isLoaded,
        setNickname,
        saveStationDraft,
        markSubmitted,
        clearJourneyData,
        setIntroSeen,
      }}
    >
      {children}
    </JourneyContext.Provider>
  );
}

export function useJourney(): JourneyContextValue {
  const ctx = useContext(JourneyContext);
  if (!ctx) throw new Error("useJourney must be used within JourneyProvider");
  return ctx;
}
