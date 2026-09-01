// LockScreen - Master password gate
// Handles both first-time setup and subsequent unlocks

import { useEffect, useRef, useState } from 'react';
import { animate } from 'animejs';
import { AuthService, TRUST_DURATION_DAYS } from '../core/auth/AuthService';
import { useAppStore } from '../store/useAppStore';
import { prefersReducedMotion } from '../utils/helpers';

interface LockScreenProps {
  isSetup: boolean;
}

const LockScreen: React.FC<LockScreenProps> = ({ isSetup }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const cardRef = useRef<HTMLDivElement>(null);
  const { setUnlocked, setIsSetup } = useAppStore();

  useEffect(() => {
    if (prefersReducedMotion() || !cardRef.current) return;
    animate(cardRef.current, {
      opacity: [0, 1],
      y: [14, 0],
      duration: 400,
      ease: 'outCubic',
    });
  }, []);

  const shakeCard = () => {
    if (prefersReducedMotion() || !cardRef.current) return;
    animate(cardRef.current, {
      x: [
        { to: -10, duration: 55 },
        { to: 8, duration: 55 },
        { to: -5, duration: 50 },
        { to: 3, duration: 50 },
        { to: 0, duration: 45 },
      ],
    });
  };

  const finishUnlock = async () => {
    if (remember) {
      await AuthService.trustDevice();
    }
    if (!prefersReducedMotion() && cardRef.current) {
      await animate(cardRef.current, {
        scale: [1, 1.02],
        opacity: [1, 0],
        duration: 240,
        ease: 'outQuad',
      });
    }
    setUnlocked(true);
  };

  const handleUnlock = async () => {
    setError('');
    if (!password.trim()) {
      setError('Please enter a password.');
      shakeCard();
      return;
    }

    const success = await AuthService.unlock(password);
    if (success) {
      await finishUnlock();
    } else {
      setError('Incorrect password.');
      shakeCard();
    }
  };

  const handleSetup = async () => {
    setError('');
    if (password.length < 4) {
      setError('Password must be at least 4 characters.');
      shakeCard();
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      shakeCard();
      return;
    }

    await AuthService.setMasterPassword(password);
    setIsSetup(true);
    await finishUnlock();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (isSetup) handleUnlock();
      else handleSetup();
    }
  };

  return (
    <div className="lock-screen">
      <div className="lock-card" ref={cardRef}>
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

        <label className="lock-remember">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
          />
          Stay unlocked on this device for {TRUST_DURATION_DAYS} days
        </label>

        {error && <p className="lock-error">{error}</p>}

        <button className="btn" onClick={isSetup ? handleUnlock : handleSetup}>
          {isSetup ? 'Unlock' : 'Create Password'}
        </button>
      </div>
    </div>
  );
};

export default LockScreen;
