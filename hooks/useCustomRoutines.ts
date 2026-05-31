import { useCallback, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useExercises } from './useContent';
import type { RoutineItem } from '../lib/types/db';

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

/**
 * Resolve a custom routine's exercise slugs into ordered RoutineItem[] with
 * full Exercise objects joined — so the preview + player can run a custom
 * routine the same way they run a DB routine. Previously the custom flow
 * passed only the first slug and the screens fell back to the DEFAULT DB
 * routine, so every custom routine showed the same exercises (tester S7).
 */
export const useCustomRoutineItems = (routineId?: string) => {
  const { routines, loading: routinesLoading } = useCustomRoutines();
  const { exercises, loading: exLoading } = useExercises('all');

  const routine = useMemo(
    () => routines.find((r) => r.id === routineId),
    [routines, routineId],
  );

  const items: RoutineItem[] = useMemo(() => {
    if (!routine || !exercises) return [];
    const bySlug = new Map(exercises.map((e) => [e.slug, e]));
    return routine.exerciseSlugs
      .map((slug, i) => {
        const ex = bySlug.get(slug);
        if (!ex) return null;
        return {
          id: `custom_${routine.id}_${i}`,
          routine_id: routine.id,
          exercise_id: ex.id,
          sort_order: i,
          reps: 1,
          overlay_text: null,
          rest_seconds: 0,
          exercise: ex,
        } as RoutineItem;
      })
      .filter((x): x is RoutineItem => x !== null);
  }, [routine, exercises]);

  return { routine, items, loading: routinesLoading || exLoading };
};
