import { useState, useEffect } from 'react';
import { DataService } from '../../core/data/DataService';
import { ModuleRegistry } from '../../module-system/ModuleRegistry';

interface HealthEntry {
  date: string;
  water: number;
  sleep: number;
  steps: number;
}

const MODULE_ID = 'health';

function todayKey(): string {
  return new Date().toISOString().split('T')[0];
}

const HealthModule: React.FC = () => {
  const [entries, setEntries] = useState<Record<string, HealthEntry>>({});
  const [today, setToday] = useState<HealthEntry>({
    date: todayKey(),
    water: 0,
    sleep: 0,
    steps: 0,
  });

  useEffect(() => {
    const stored = DataService.get<Record<string, HealthEntry>>(MODULE_ID);
    if (stored) {
      setEntries(stored);
      if (stored[todayKey()]) {
        setToday(stored[todayKey()]);
      }
    }
  }, []);

  const updateToday = (field: keyof Omit<HealthEntry, 'date'>, value: number) => {
    const updated = { ...today, [field]: value };
    setToday(updated);
    const allEntries = { ...entries, [todayKey()]: updated };
    setEntries(allEntries);
    DataService.set(MODULE_ID, allEntries);
  };

  return (
    <div className="module-container">
      <div className="module-header">
        <h2>Health</h2>
        <span className="muted">{todayKey()}</span>
      </div>

      <div className="health-grid">
        <div className="health-card">
          <div className="health-icon">☕</div>
          <div className="health-label">Water (glasses)</div>
          <div className="health-controls">
            <button
              className="btn-icon"
              onClick={() => updateToday('water', Math.max(0, today.water - 1))}
            >
              −
            </button>
            <span className="health-value">{today.water}</span>
            <button
              className="btn-icon"
              onClick={() => updateToday('water', today.water + 1)}
            >
              +
            </button>
          </div>
        </div>

        <div className="health-card">
          <div className="health-icon">☽</div>
          <div className="health-label">Sleep (hours)</div>
          <div className="health-controls">
            <button
              className="btn-icon"
              onClick={() => updateToday('sleep', Math.max(0, Math.round((today.sleep - 0.5) * 10) / 10))}
            >
              −
            </button>
            <span className="health-value">{today.sleep}</span>
            <button
              className="btn-icon"
              onClick={() => updateToday('sleep', Math.round((today.sleep + 0.5) * 10) / 10)}
            >
              +
            </button>
          </div>
        </div>

        <div className="health-card">
          <div className="health-icon">⭐</div>
          <div className="health-label">Steps</div>
          <div className="health-controls">
            <button
              className="btn-icon"
              onClick={() => updateToday('steps', Math.max(0, today.steps - 500))}
            >
              −
            </button>
            <span className="health-value">{today.steps.toLocaleString()}</span>
            <button
              className="btn-icon"
              onClick={() => updateToday('steps', today.steps + 500)}
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

ModuleRegistry.register({
  id: MODULE_ID,
  name: 'Health',
  icon: '♡',
  description: 'Track water, sleep, and activity',
  encrypted: false,
  Component: HealthModule,
});

export default HealthModule;
