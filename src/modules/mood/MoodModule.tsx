import { useState, useEffect } from 'react';
import { DataService } from '../../core/data/DataService';
import { ModuleRegistry } from '../../module-system/ModuleRegistry';

interface MoodEntry {
  date: string;
  mood: string;
  label: string;
}

const MODULE_ID = 'mood';

const MOODS = [
  { emoji: '✨', label: 'Great' },
  { emoji: '☺', label: 'Good' },
  { emoji: '—', label: 'Okay' },
  { emoji: '☁', label: 'Low' },
  { emoji: '☹', label: 'Bad' },
];

function todayKey(): string {
  return new Date().toISOString().split('T')[0];
}

const MoodModule: React.FC = () => {
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [todayMood, setTodayMood] = useState<MoodEntry | null>(null);

  useEffect(() => {
    const stored = DataService.get<MoodEntry[]>(MODULE_ID);
    if (stored) {
      setEntries(stored);
      const today = stored.find((e) => e.date === todayKey());
      if (today) setTodayMood(today);
    }
  }, []);

  const selectMood = (mood: string, label: string) => {
    const entry: MoodEntry = { date: todayKey(), mood, label };
    setTodayMood(entry);
    const updated = [entry, ...entries.filter((e) => e.date !== todayKey())];
    setEntries(updated);
    DataService.set(MODULE_ID, updated);
  };

  const recentEntries = entries.slice(0, 7);

  return (
    <div className="module-container">
      <div className="module-header">
        <h2>Mood</h2>
        <span className="muted">How are you feeling?</span>
      </div>

      <div className="mood-picker">
        {MOODS.map((m) => (
          <button
            key={m.label}
            className={"mood-btn" + (todayMood?.label === m.label ? ' active' : '')}
            onClick={() => selectMood(m.emoji, m.label)}
            title={m.label}
          >
            <span className="mood-emoji">{m.emoji}</span>
            <span className="mood-label">{m.label}</span>
          </button>
        ))}
      </div>

      {todayMood && (
        <p className="today-mood">
          Today: {todayMood.mood} {todayMood.label}
        </p>
      )}

      {recentEntries.length > 0 && (
        <div className="mood-history">
          <h3>Recent</h3>
          <div className="mood-history-list">
            {recentEntries.map((e) => (
              <div key={e.date} className="mood-history-item">
                <span className="mood-history-emoji">{e.mood}</span>
                <span className="muted">{e.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

ModuleRegistry.register({
  id: MODULE_ID,
  name: 'Mood',
  icon: '☺',
  description: 'Track your daily mood',
  encrypted: false,
  Component: MoodModule,
});

export default MoodModule;
