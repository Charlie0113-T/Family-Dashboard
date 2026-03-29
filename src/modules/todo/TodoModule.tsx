import { useState, useEffect } from 'react';
import { v4 as uuid } from 'uuid';
import { DataService } from '../../core/data/DataService';
import { ModuleRegistry } from '../../module-system/ModuleRegistry';

// --- Types ---

interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

const MODULE_ID = 'todo';

// --- Component ---

const TodoModule: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState('');

  // Load todos from storage on mount
  useEffect(() => {
    const stored = DataService.get<Todo[]>(MODULE_ID);
    if (stored) setTodos(stored);
  }, []);

  // Persist todos whenever they change
  useEffect(() => {
    DataService.set(MODULE_ID, todos);
  }, [todos]);

  const addTodo = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    const newTodo: Todo = {
      id: uuid(),
      title: trimmed,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setTodos((prev) => [newTodo, ...prev]);
    setInput('');
  };

  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const deleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') addTodo();
  };

  const pending = todos.filter((t) => !t.completed);
  const completed = todos.filter((t) => t.completed);

  return (
    <div className="module-container">
      <div className="module-header">
        <h2>Tasks</h2>
        <span className="muted">{pending.length} remaining</span>
      </div>

      <div className="input-row">
        <input
          className="input"
          type="text"
          placeholder="What needs to be done?"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className="btn" onClick={addTodo}>
          Add
        </button>
      </div>

      <div className="todo-list">
        {pending.map((todo) => (
          <div key={todo.id} className="todo-item">
            <button
              className="todo-check"
              onClick={() => toggleTodo(todo.id)}
              aria-label="Mark complete"
            >
              \u25CB
            </button>
            <span className="todo-title">{todo.title}</span>
            <button
              className="todo-delete"
              onClick={() => deleteTodo(todo.id)}
              aria-label="Delete"
            >
              \u00D7
            </button>
          </div>
        ))}

        {completed.length > 0 && (
          <>
            <div className="section-divider">
              <span className="muted">Completed ({completed.length})</span>
            </div>
            {completed.map((todo) => (
              <div key={todo.id} className="todo-item completed">
                <button
                  className="todo-check checked"
                  onClick={() => toggleTodo(todo.id)}
                  aria-label="Mark incomplete"
                >
                  \u25CF
                </button>
                <span className="todo-title">{todo.title}</span>
                <button
                  className="todo-delete"
                  onClick={() => deleteTodo(todo.id)}
                  aria-label="Delete"
                >
                  \u00D7
                </button>
              </div>
            ))}
          </>
        )}

        {todos.length === 0 && (
          <p className="empty-state">No tasks yet. Add one above.</p>
        )}
      </div>
    </div>
  );
};

// --- Register Module ---

ModuleRegistry.register({
  id: MODULE_ID,
  name: 'Tasks',
  icon: '\u2713',
  description: 'Simple family to-do list',
  encrypted: false,
  Component: TodoModule,
});

export default TodoModule;
