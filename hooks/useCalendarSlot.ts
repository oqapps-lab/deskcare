import { useEffect, useState } from 'react';
import * as Calendar from 'expo-calendar';
import { Platform } from 'react-native';

export type CalendarPermStatus = 'unknown' | 'granted' | 'denied' | 'unavailable';

export interface CalendarSlot {
  /** Local "HH:MM" label of slot start. */
  startLabel: string;
  /** Minutes from now until slot start. */
  minutesFromNow: number;
  /** Free-slot duration in minutes. */
  durationMinutes: number;
}

export interface CalendarSlotState {
  status: CalendarPermStatus;
  /** Next free gap of at least 5 minutes within the next 4 hours, or null. */
  next: CalendarSlot | null;
  loading: boolean;
  /** Programmatic request — call to prompt user. */
  request: () => Promise<void>;
  /** Refresh after permission change / route focus. */
  refresh: () => void;
}

/**
 * Surface the next ≥5-minute free slot between calendar events in the next
 * 4 hours. iOS-only (Calendar permission is iOS-flavored; Android handled
 * separately if/when we ship there).
 */
export const useCalendarSlot = (): CalendarSlotState => {
  const [status, setStatus] = useState<CalendarPermStatus>('unknown');
  const [next, setNext] = useState<CalendarSlot | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshTick, setRefreshTick] = useState(0);

  const refresh = () => setRefreshTick((n) => n + 1);

  const request = async () => {
    if (Platform.OS !== 'ios') {
      setStatus('unavailable');
      return;
    }
    const res = await Calendar.requestCalendarPermissionsAsync();
    setStatus(res.status === 'granted' ? 'granted' : 'denied');
    refresh();
  };

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (Platform.OS !== 'ios') {
        setStatus('unavailable');
        setLoading(false);
        return;
      }
      const perm = await Calendar.getCalendarPermissionsAsync();
      if (cancelled) return;
      if (perm.status !== 'granted') {
        setStatus(perm.status === 'denied' ? 'denied' : 'unknown');
        setNext(null);
        setLoading(false);
        return;
      }
      setStatus('granted');

      const now = new Date();
      const end = new Date(now.getTime() + 4 * 60 * 60 * 1000); // +4h
      const cals = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      const events = await Calendar.getEventsAsync(
        cals.map((c) => c.id),
        now,
        end,
      );
      if (cancelled) return;

      // Sort by start, then find first gap ≥5 min.
      const sorted = [...events]
        .map((e) => ({ start: new Date(e.startDate as string), end: new Date(e.endDate as string) }))
        .filter((e) => e.end > now)
        .sort((a, b) => a.start.getTime() - b.start.getTime());

      // The "gap" candidates: from-now-to-first-event, then between-events.
      let slotStart: Date = now;
      let slotEnd: Date | null = null;

      const consider = (gapStart: Date, gapEnd: Date) => {
        const mins = Math.floor((gapEnd.getTime() - gapStart.getTime()) / 60000);
        if (mins >= 5 && slotEnd === null) {
          slotStart = gapStart;
          slotEnd = gapEnd;
        }
      };

      if (sorted.length === 0) {
        // Calendar empty — synthesize a "now" slot of 30 min.
        slotStart = now;
        slotEnd = new Date(now.getTime() + 30 * 60 * 1000);
      } else {
        // Now → first event.
        consider(now, sorted[0].start);
        for (let i = 0; i < sorted.length - 1 && slotEnd === null; i++) {
          consider(sorted[i].end, sorted[i + 1].start);
        }
        if (slotEnd === null) {
          // After last event.
          consider(sorted[sorted.length - 1].end, end);
        }
      }

      if (slotEnd === null) {
        setNext(null);
      } else {
        const startD = slotStart as Date;
        const endD = slotEnd as Date;
        const minutesFromNow = Math.max(0, Math.round((startD.getTime() - now.getTime()) / 60000));
        const durationMinutes = Math.min(60, Math.round((endD.getTime() - startD.getTime()) / 60000));
        const startLabel = `${String(startD.getHours()).padStart(2, '0')}:${String(startD.getMinutes()).padStart(2, '0')}`;
        setNext({ startLabel, minutesFromNow, durationMinutes });
      }
      setLoading(false);
    };
    run().catch(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [refreshTick]);

  return { status, next, loading, request, refresh };
};
