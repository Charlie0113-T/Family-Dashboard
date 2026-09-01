import { useEffect, useState } from 'react';
import { DataService } from '../../core/data/DataService';
import { ModuleRegistry } from '../../module-system/ModuleRegistry';
import { toDateKey } from '../../utils/helpers';

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
  const [currentDate, setCurrentDate] = useState(toDateKey());
  const [content, setContent] = useState('');
  const [store, setStore] = useState<DiaryStore>({ entries: {} });
  const [saved, setSaved] = useState(false);

  // Load all entries on mount (decrypted; plaintext records from older
  // versions are readable too and get re-encrypted on the spot)
  useEffect(() => {
    let cancelled = false;
    DataService.getSecure<DiaryStore>(MODULE_ID).then((stored) => {
      if (cancelled || !stored) return;
      setStore(stored);
      setContent(stored.entries[toDateKey()]?.content || '');
      void DataService.setSecure(MODULE_ID, stored);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  /** Move the view to a date and show that day's entry */
  const showDate = (dateKey: string) => {
    setCurrentDate(dateKey);
    setContent(store.entries[dateKey]?.content || '');
    setSaved(false);
  };

  const saveEntry = () => {
    const updated: DiaryStore = {
      entries: {
        ...store.entries,
        [currentDate]: { date: currentDate, content },
      },
    };
    setStore(updated);
    void DataService.setSecure(MODULE_ID, updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const goToPrevDay = () => {
    const date = new Date(currentDate + 'T00:00:00');
    date.setDate(date.getDate() - 1);
    showDate(toDateKey(date));
  };

  const goToNextDay = () => {
    const date = new Date(currentDate + 'T00:00:00');
    date.setDate(date.getDate() + 1);
    const next = toDateKey(date);
    if (next <= toDateKey()) {
      showDate(next);
    }
  };

  const isToday = currentDate === toDateKey();
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
