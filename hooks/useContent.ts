import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { BodyZone, Exercise, Routine, RoutineItem, BodyZoneSlug } from '../lib/types/db';

/**
 * Fetch all body zones (6 rows) — sorted by sort_order.
 * Cached per app lifecycle once it lands.
 */
let _zonesCache: BodyZone[] | null = null;

export const useBodyZones = () => {
  const [zones, setZones] = useState<BodyZone[] | null>(_zonesCache);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (_zonesCache) return;
    let cancelled = false;
    supabase
      .from('body_zones')
      .select('id, slug, name, icon_url, sort_order')
      .order('sort_order')
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) setError(error.message);
        else if (data) {
          _zonesCache = data as BodyZone[];
          setZones(_zonesCache);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { zones, error };
};

/**
 * Fetch all exercises, optionally filtered by zone slug.
 * Joins exercise_body_zones to filter; returns the exercises themselves.
 */
export const useExercises = (zoneSlug?: BodyZoneSlug | 'all') => {
  const [exercises, setExercises] = useState<Exercise[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const baseSelect =
      'id, code, slug, title, title_en, description, video_url, thumbnail_url, duration_seconds, reps_inside_atom, difficulty, exercise_type, is_premium, cautions, modifications';

    const run = async () => {
      let query = supabase.from('exercises').select(baseSelect).order('code');

      if (zoneSlug && zoneSlug !== 'all') {
        // First resolve zone id, then filter via M:N table.
        const zone = await supabase.from('body_zones').select('id').eq('slug', zoneSlug).single();
        if (zone.error) {
          if (!cancelled) setError(zone.error.message);
          return;
        }
        const links = await supabase
          .from('exercise_body_zones')
          .select('exercise_id')
          .eq('body_zone_id', zone.data.id);
        if (links.error) {
          if (!cancelled) setError(links.error.message);
          return;
        }
        const ids = (links.data ?? []).map((l: { exercise_id: string }) => l.exercise_id);
        if (ids.length === 0) {
          if (!cancelled) setExercises([]);
          return;
        }
        query = supabase.from('exercises').select(baseSelect).in('id', ids).order('code');
      }

      const { data, error: e } = await query;
      if (cancelled) return;
      if (e) setError(e.message);
      else setExercises((data ?? []) as Exercise[]);
    };

    run().finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [zoneSlug]);

  return { exercises, error, loading };
};

/**
 * Fetch all routines, optionally filtered by zone slug or routine_type.
 */
export const useRoutines = (zoneSlug?: BodyZoneSlug | 'all') => {
  const [routines, setRoutines] = useState<Routine[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const run = async () => {
      let query = supabase
        .from('routines')
        .select('id, slug, title, description, body_zone_id, duration_seconds, is_premium, routine_type, sort_order')
        .order('sort_order');
      if (zoneSlug && zoneSlug !== 'all') {
        const zone = await supabase.from('body_zones').select('id').eq('slug', zoneSlug).single();
        if (zone.error) {
          if (!cancelled) setError(zone.error.message);
          return;
        }
        query = query.eq('body_zone_id', zone.data.id);
      }
      const { data, error: e } = await query;
      if (cancelled) return;
      if (e) setError(e.message);
      else setRoutines((data ?? []) as Routine[]);
    };

    run().finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [zoneSlug]);

  return { routines, error, loading };
};

/**
 * Fetch a single routine + its exercises (joined). Plays nicely with RoutinePlayer.
 */
export const useRoutineWithItems = (routineSlug?: string) => {
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [items, setItems] = useState<RoutineItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!routineSlug) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);

    const run = async () => {
      const r = await supabase
        .from('routines')
        .select('id, slug, title, description, body_zone_id, duration_seconds, is_premium, routine_type, sort_order')
        .eq('slug', routineSlug)
        .single();
      if (r.error) {
        if (!cancelled) setError(r.error.message);
        return;
      }
      if (cancelled) return;
      setRoutine(r.data as Routine);

      const it = await supabase
        .from('routine_exercises')
        .select(
          'id, routine_id, exercise_id, sort_order, reps, overlay_text, rest_seconds, ' +
            'exercise:exercises ( id, code, slug, title, title_en, description, video_url, thumbnail_url, duration_seconds, reps_inside_atom, difficulty, exercise_type, is_premium, cautions, modifications )',
        )
        .eq('routine_id', r.data.id)
        .order('sort_order');
      if (it.error) {
        if (!cancelled) setError(it.error.message);
        return;
      }
      if (!cancelled) setItems((it.data ?? []) as unknown as RoutineItem[]);
    };

    run().finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [routineSlug]);

  return { routine, items, error, loading };
};
