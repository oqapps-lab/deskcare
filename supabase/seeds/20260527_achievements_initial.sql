-- 16 initial achievements covering streak / sessions / minutes / pain / eye-break milestones.
-- icon_url omitted for now — UI renders an inline SVG glyph keyed by slug.

INSERT INTO achievements (slug, title, description, criteria_type, criteria_value, sort_order)
VALUES
  -- First contact
  ('first_session',       'First step',          'Complete your first routine.',                     'first_session',  1,    1),

  -- Streak milestones
  ('streak_3',            'Three in a row',      '3-day streak.',                                    'streak_days',    3,    10),
  ('streak_7',            'One week strong',     '7-day streak.',                                    'streak_days',    7,    11),
  ('streak_14',           'Two-week habit',      '14-day streak — the habit is real.',               'streak_days',    14,   12),
  ('streak_30',           'Month of motion',     '30-day streak.',                                   'streak_days',    30,   13),
  ('streak_60',           'Sixty straight',      '60-day streak.',                                   'streak_days',    60,   14),

  -- Total sessions
  ('sessions_5',          'Getting going',       '5 routines completed.',                            'total_sessions', 5,    20),
  ('sessions_25',         'Quarter century',     '25 routines completed.',                           'total_sessions', 25,   21),
  ('sessions_100',        'Centurion',           '100 routines completed.',                          'total_sessions', 100,  22),
  ('sessions_500',        'Veteran',             '500 routines completed.',                          'total_sessions', 500,  23),

  -- Total minutes
  ('minutes_30',          'Half-hour healed',    '30 total minutes of movement.',                    'total_minutes',  30,   30),
  ('minutes_120',         'Two-hour resident',   '120 total minutes.',                               'total_minutes',  120,  31),
  ('minutes_600',         'Ten-hour devotee',    '10 total hours of practice.',                      'total_minutes',  600,  32),

  -- Pain tracking
  ('pain_logs_7',         'Body listener',       'Logged your pain for 7 days.',                     'pain_logs',      7,    40),
  ('pain_logs_30',        'Self-aware',          'Logged your pain 30 times.',                       'pain_logs',      30,   41),

  -- Eye break consistency
  ('eye_breaks_50',       'Easy on the eyes',    '50 eye breaks taken.',                             'eye_breaks',     50,   50)
ON CONFLICT (slug) DO UPDATE SET
  title          = EXCLUDED.title,
  description    = EXCLUDED.description,
  criteria_type  = EXCLUDED.criteria_type,
  criteria_value = EXCLUDED.criteria_value,
  sort_order     = EXCLUDED.sort_order;
