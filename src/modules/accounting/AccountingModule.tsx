import { useEffect, useRef, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { animate } from 'animejs';
import { DataService } from '../../core/data/DataService';
import { ModuleRegistry } from '../../module-system/ModuleRegistry';
import {
  formatMonthLabel,
  prefersReducedMotion,
  shiftMonthKey,
  toDateKey,
  toMonthKey,
} from '../../utils/helpers';

// --- Types ---

type EntryType = 'expense' | 'income';

interface AccountingEntry {
  id: string;
  date: string; // YYYY-MM-DD
  type: EntryType;
  amount: number;
  category: string;
  note: string;
  createdAt: string;
}

const MODULE_ID = 'accounting';

const CATEGORIES: Record<EntryType, string[]> = {
  expense: ['Food', 'Transport', 'Shopping', 'Home', 'Fun', 'Health', 'Education', 'Other'],
  income: ['Salary', 'Gift', 'Other'],
};

/** Default form date for a month: today inside the current month, else the 1st */
function defaultDateForMonth(month: string): string {
  const today = toDateKey();
  return today.startsWith(month) ? today : month + '-01';
}

// --- Component ---

const AccountingModule: React.FC = () => {
  const [entries, setEntries] = useState<AccountingEntry[]>(
    () => DataService.get<AccountingEntry[]>(MODULE_ID) ?? []
  );
  const [month, setMonth] = useState(toMonthKey());

  // Entry form
  const [type, setType] = useState<EntryType>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES.expense[0]);
  const [note, setNote] = useState('');
  const [date, setDate] = useState(toDateKey());

  const listAreaRef = useRef<HTMLDivElement>(null);
  const amountRef = useRef<HTMLInputElement>(null);
  const slideDirRef = useRef(0);
  const lastAddedRef = useRef<string | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const persist = (next: AccountingEntry[]) => {
    setEntries(next);
    DataService.set(MODULE_ID, next);
  };

  // Navigating months always moves the entry form's date along with the view,
  // so the month you are looking at and the month you are logging into can
  // never drift apart.
  const goToMonth = (target: string, dir: number) => {
    if (target === month) return;
    slideDirRef.current = dir;
    setMonth(target);
    setDate(defaultDateForMonth(target));
  };

  const goToCurrentMonth = () => {
    const current = toMonthKey();
    goToMonth(current, current > month ? 1 : -1);
  };

  // Slide the month content in from the direction of navigation
  useEffect(() => {
    const dir = slideDirRef.current;
    slideDirRef.current = 0;
    if (!dir || prefersReducedMotion() || !listAreaRef.current) return;
    animate(listAreaRef.current, {
      x: [dir * 28, 0],
      opacity: [0, 1],
      duration: 320,
      ease: 'outCubic',
    });
  }, [month]);

  // Pop in a freshly added row
  useEffect(() => {
    const id = lastAddedRef.current;
    lastAddedRef.current = null;
    if (!id || prefersReducedMotion()) return;
    const el = document.querySelector(`[data-entry-id="${id}"]`);
    if (el) {
      animate(el, { opacity: [0, 1], scale: [0.97, 1], duration: 280, ease: 'outCubic' });
    }
  }, [entries]);

  const changeType = (next: EntryType) => {
    setType(next);
    setCategory(CATEGORIES[next][0]);
  };

  const addEntry = () => {
    const value = Number.parseFloat(amount);
    if (!Number.isFinite(value) || value <= 0 || !date) {
      if (!prefersReducedMotion() && amountRef.current) {
        animate(amountRef.current, {
          x: [
            { to: -8, duration: 55 },
            { to: 6, duration: 55 },
            { to: -4, duration: 50 },
            { to: 0, duration: 45 },
          ],
        });
      }
      amountRef.current?.focus();
      return;
    }

    const entry: AccountingEntry = {
      id: uuid(),
      date,
      type,
      amount: Math.round(value * 100) / 100,
      category,
      note: note.trim(),
      createdAt: new Date().toISOString(),
    };
    persist([entry, ...entries]);
    lastAddedRef.current = entry.id;

    // If the entry was hand-dated outside the viewed month, follow it there
    // so it never lands somewhere you are not looking.
    const entryMonth = entry.date.slice(0, 7);
    if (entryMonth !== month) {
      slideDirRef.current = entryMonth > month ? 1 : -1;
      setMonth(entryMonth);
    }

    setAmount('');
    setNote('');
  };

  const deleteEntry = (id: string) => {
    persist(entries.filter((e) => e.id !== id));
  };

  // --- Swipe navigation (swipe left = next month, right = previous) ---

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const start = touchStartRef.current;
    touchStartRef.current = null;
    if (!start) return;
    const dx = e.changedTouches[0].clientX - start.x;
    const dy = e.changedTouches[0].clientY - start.y;
    if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    if (dx < 0) goToMonth(shiftMonthKey(month, 1), 1);
    else goToMonth(shiftMonthKey(month, -1), -1);
  };

  // --- Derived month data ---

  const monthEntries = entries
    .filter((e) => e.date.startsWith(month))
    .sort((a, b) =>
      a.date === b.date
        ? b.createdAt.localeCompare(a.createdAt)
        : b.date.localeCompare(a.date)
    );

  const income = monthEntries
    .filter((e) => e.type === 'income')
    .reduce((sum, e) => sum + e.amount, 0);
  const expense = monthEntries
    .filter((e) => e.type === 'expense')
    .reduce((sum, e) => sum + e.amount, 0);

  // Animated count-up for the month totals
  const displayRef = useRef({ income: 0, expense: 0 });
  const [display, setDisplay] = useState({ income: 0, expense: 0 });
  useEffect(() => {
    const counter = { ...displayRef.current };
    const applyCounter = () => {
      displayRef.current = { income: counter.income, expense: counter.expense };
      setDisplay({ income: counter.income, expense: counter.expense });
    };
    const anim = animate(counter, {
      income,
      expense,
      duration: prefersReducedMotion() ? 0 : 450,
      ease: 'outCubic',
      onUpdate: applyCounter,
      onComplete: applyCounter,
    });
    return () => {
      anim.cancel();
    };
  }, [income, expense]);

  const balance = display.income - display.expense;
  const isCurrentMonth = month === toMonthKey();

  return (
    <div
      className="module-container"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="module-header">
        <h2>Accounting</h2>
        <span className="muted">{monthEntries.length} entries</span>
      </div>

      <div className="date-nav">
        <button
          className="btn-icon"
          onClick={() => goToMonth(shiftMonthKey(month, -1), -1)}
          aria-label="Previous month"
        >
          ←
        </button>
        <button
          className="acct-month"
          onClick={goToCurrentMonth}
          disabled={isCurrentMonth}
          title={isCurrentMonth ? undefined : 'Back to current month'}
        >
          {formatMonthLabel(month)}
        </button>
        <button
          className="btn-icon"
          onClick={() => goToMonth(shiftMonthKey(month, 1), 1)}
          aria-label="Next month"
        >
          →
        </button>
      </div>

      <div className="acct-form frosted">
        <div className="acct-form-row">
          <div className="type-toggle" role="group" aria-label="Entry type">
            <button
              className={type === 'expense' ? 'active' : ''}
              onClick={() => changeType('expense')}
            >
              Expense
            </button>
            <button
              className={type === 'income' ? 'active' : ''}
              onClick={() => changeType('income')}
            >
              Income
            </button>
          </div>
          <input
            ref={amountRef}
            className="input acct-amount"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addEntry()}
          />
        </div>
        <div className="acct-form-row">
          <select
            className="input"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Category"
          >
            {CATEGORIES[type].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input
            className="input"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            aria-label="Date"
          />
        </div>
        <div className="acct-form-row">
          <input
            className="input"
            type="text"
            placeholder="Note (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addEntry()}
          />
          <button className="btn" onClick={addEntry}>
            Add
          </button>
        </div>
      </div>

      <div ref={listAreaRef} className="acct-month-view">
        <div className="acct-summary">
          <div className="acct-sum-card">
            <span className="acct-sum-label">Income</span>
            <span className="acct-sum-value pos">+{display.income.toFixed(2)}</span>
          </div>
          <div className="acct-sum-card">
            <span className="acct-sum-label">Expense</span>
            <span className="acct-sum-value">−{display.expense.toFixed(2)}</span>
          </div>
          <div className="acct-sum-card">
            <span className="acct-sum-label">Balance</span>
            <span className={'acct-sum-value' + (balance < 0 ? ' neg' : '')}>
              {balance < 0 ? '−' : ''}
              {Math.abs(balance).toFixed(2)}
            </span>
          </div>
        </div>

        <div className="acct-list">
          {monthEntries.map((entry) => (
            <div key={entry.id} className="acct-item" data-entry-id={entry.id}>
              <span className="acct-item-date muted">{Number(entry.date.slice(8))}</span>
              <span className="acct-item-cat">{entry.category}</span>
              <span className="acct-item-note">{entry.note}</span>
              <span
                className={'acct-item-amount' + (entry.type === 'income' ? ' pos' : '')}
              >
                {entry.type === 'income' ? '+' : '−'}
                {entry.amount.toFixed(2)}
              </span>
              <button
                className="acct-delete"
                onClick={() => deleteEntry(entry.id)}
                aria-label="Delete entry"
              >
                ×
              </button>
            </div>
          ))}
          {monthEntries.length === 0 && (
            <p className="empty-state">No entries in {formatMonthLabel(month)} yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Register Module ---

ModuleRegistry.register({
  id: MODULE_ID,
  name: 'Accounting',
  icon: '$',
  description: 'Monthly income & expense tracker',
  encrypted: false,
  Component: AccountingModule,
});

export default AccountingModule;
