import { useState, useEffect } from 'react';
import { DataService } from '../../core/data/DataService';
import { ModuleRegistry } from '../../module-system/ModuleRegistry';

// --- Types ---

interface DiaryEntry {
  date: string;
  content: string;
}

interface DiaryStore {
  entries: Record<string, DiaryEntry>;
}

const MODULE_ID = 'diary';

// --- Helpers ---

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function displayDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// --- Component ---

const DiaryModule: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(formatDate(new Date()));
  const [content, setContent] = useState('');
  const [store, setStore] = useState<DiaryStore>({ entries: {} });
  const [saved, setSaved] = useState(false);

  // Load all entries on mount
  useEffect(() => {
    const stored = DataService.get<DiaryStore>(MODULE_ID);
    if (stored) {
      setStore(stored);
    }
  }, []);

  // Load content when date changes
  useEffect(() => {
    const entry = store.entries[currentDate];
    setContent(entry?.content || '');
    setSaved(false);
  }, [currentDate, store]);

  const saveEntry = () => {
    const updated: DiaryStore = {
      entries: {
        ...store.entries,
        [currentDate]: { date: currentDate, content },
      },
    };
    setStore(updated);
    DataService.set(MODULE_ID, updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const goToPrevDay = () => {
    const date = new Date(currentDate + 'T00:00:00');
    date.setDate(date.getDate() - 1);
    setCurrentDate(formatDate(date));
  };

  const goToNextDay = () => {
    const date = new Date(currentDate + 'T00:00:00');
    date.setDate(date.getDate() + 1);
    const today = formatDate(new Date());
    const next = formatDate(date);
    if (next <= today) {
      setCurrentDate(next);
    }
  };

  const isToday = currentDate === formatDate(new Date());
  const entryCount = Object.keys(store.entries).filter(
    (k) => store.entries[k].content.trim().length > 0
  ).length;

  return (
    <div className="module-container">
      <div className="module-header">
        <h2>Diary</h2>
        <span className="muted">{entryCount} entries</span>
      </div>

      <div className="date-nav">
        <button className="btn-icon" onClick={goToPrevDay} aria-label="Previous day">
          ←
        </button>
        <span className="date-display">{displayDate(currentDate)}</span>
        <button
          className="btn-icon"
          onClick={goToNextDay}
          disabled={isToday}
          aria-label="Next day"
        >
          →
        </button>
      </div>

      <textarea
        className="input diary-textarea"
        placeholder="How was your day?"
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          setSaved(false);
        }}
        rows={10}
      />

      <div className="diary-actions">
        <button className="btn" onClick={saveEntry}>
          Save
        </button>
        {saved && <span className="save-indicator">✓ Saved</span>}
      </div>
    </div>
  );
};

// --- Register Module ---

ModuleRegistry.register({
  id: MODULE_ID,
  name: 'Diary',
  icon: '✎',
  description: 'Daily journal for your thoughts',
  encrypted: true,
  Component: DiaryModule,
});

export default DiaryModule;
