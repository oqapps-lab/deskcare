import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@deskcare/customRoutines/v1';

export interface CustomRoutine {
  id: string;
  name: string;
  /** Exercise slugs in display order. */
  exerciseSlugs: string[];
  createdAt: string;
}

interface State {
  routines: CustomRoutine[];
  loading: boolean;
}

let cache: CustomRoutine[] | null = null;
const subscribers = new Set<() => void>();

const persist = async (routines: CustomRoutine[]) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(routines));
  } catch {
    /* AsyncStorage failures shouldn't break the UI; in-memory cache still holds the value. */
  }
};

const load = async (): Promise<CustomRoutine[]> => {
  if (cache) return cache;
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    cache = raw ? (JSON.parse(raw) as CustomRoutine[]) : [];
  } catch {
    cache = [];
  }
  return cache;
};

const notify = () => subscribers.forEach((s) => s());

export const useCustomRoutines = () => {
  const [state, setState] = useState<State>({ routines: [], loading: true });

  useEffect(() => {
    let cancelled = false;
    load().then((r) => {
      if (!cancelled) setState({ routines: r, loading: false });
    });
    const sub = () => {
      if (cache) setState({ routines: [...cache], loading: false });
    };
    subscribers.add(sub);
    return () => {
      cancelled = true;
      subscribers.delete(sub);
    };
  }, []);

  const add = useCallback(async (name: string, exerciseSlugs: string[]): Promise<CustomRoutine> => {
    const r: CustomRoutine = {
      id: `cr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
      name,
      exerciseSlugs,
      createdAt: new Date().toISOString(),
    };
    cache = [r, ...(cache || [])];
    await persist(cache);
    notify();
    return r;
  }, []);

  const remove = useCallback(async (id: string) => {
    cache = (cache || []).filter((r) => r.id !== id);
    await persist(cache);
    notify();
  }, []);

  const update = useCallback(async (id: string, patch: Partial<Omit<CustomRoutine, 'id' | 'createdAt'>>) => {
    cache = (cache || []).map((r) => (r.id === id ? { ...r, ...patch } : r));
    await persist(cache);
    notify();
  }, []);

  return { ...state, add, remove, update };
};
