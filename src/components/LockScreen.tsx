// LockScreen - Master password gate
// Handles both first-time setup and subsequent unlocks

import { useState } from 'react';
import { AuthService } from '../core/auth/AuthService';
import { useAppStore } from '../store/useAppStore';

interface LockScreenProps {
  isSetup: boolean;
}

const LockScreen: React.FC<LockScreenProps> = ({ isSetup }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const { setUnlocked, setIsSetup } = useAppStore();

  const handleUnlock = async () => {
    setError('');
    if (!password.trim()) {
      setError('Please enter a password.');
      return;
    }

    const success = await AuthService.unlock(password);
    if (success) {
      setUnlocked(true);
    } else {
      setError('Incorrect password.');
    }
  };

  const handleSetup = async () => {
    setError('');
    if (password.length < 4) {
      setError('Password must be at least 4 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    await AuthService.setMasterPassword(password);
    setIsSetup(true);
    setUnlocked(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (isSetup) handleUnlock();
      else handleSetup();
    }
  };

  return (
    <div className="lock-screen">
      <div className="lock-card">
        <h1>{isSetup ? 'Welcome Back' : 'Setup'}</h1>
        <p className="muted">
          {isSetup
            ? 'Enter your master password to unlock.'
            : 'Create a master password for your family dashboard.'}
        </p>

        <input
          className="input"
          type="password"
          placeholder="Master password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
        />

        {!isSetup && (
          <input
            className="input"
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        )}

        {error && <p className="lock-error">{error}</p>}

        <button className="btn" onClick={isSetup ? handleUnlock : handleSetup}>
          {isSetup ? 'Unlock' : 'Create Password'}
        </button>
      </div>
    </div>
  );
};

export default LockScreen;
