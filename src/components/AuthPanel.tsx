import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { CloseIcon } from './ui';

interface AuthPanelProps {
  onAuthenticate: (mode: 'signup' | 'signin', username: string, password: string) => Promise<void>;
  onClose: () => void;
}

export function AuthPanel({ onAuthenticate, onClose }: AuthPanelProps) {
  const [mode, setMode] = useState<'signup' | 'signin'>('signup');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await onAuthenticate(mode, username.trim(), password);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not complete that request');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="backdrop" role="presentation" onClick={onClose}>
      <div
        className="sheet sheet--narrow"
        role="dialog"
        aria-modal="true"
        aria-label={mode === 'signup' ? 'Create an account' : 'Sign in'}
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className="sheet-close" onClick={onClose} aria-label="Close account panel">
          <CloseIcon />
        </button>

        <header className="sheet-head auth-head">
          <span className="micro">{mode === 'signup' ? 'New account' : 'Welcome back'}</span>
          <h2 className="auth-title">{mode === 'signup' ? 'Open a card file' : 'Sign in'}</h2>
          <p className="auth-copy">
            {mode === 'signup'
              ? 'Your draws, balance and rarity counts stay with the account. Every card pays out: $5 common, $10 rare, $30 epic, $100 legendary.'
              : 'Sign back in to keep drawing and to see the collection you have already built.'}
          </p>
        </header>

        <form className="auth-form" onSubmit={submit}>
          <label className="field">
            <span className="micro">Username</span>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              required
              minLength={3}
              maxLength={20}
              pattern="[A-Za-z0-9_]{3,20}"
              title="3–20 letters, numbers or underscores"
              autoFocus
            />
          </label>

          <label className="field">
            <span className="micro">Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              required
              minLength={mode === 'signup' ? 8 : undefined}
              maxLength={200}
            />
          </label>

          {error ? (
            <p className="form-error" role="alert">
              {error}
            </p>
          ) : null}

          <button type="submit" className="draw-btn auth-submit" disabled={busy}>
            {busy ? 'Working…' : mode === 'signup' ? 'Create account' : 'Sign in'}
          </button>

          <button
            type="button"
            className="text-btn auth-switch"
            onClick={() => {
              setMode(mode === 'signup' ? 'signin' : 'signup');
              setError(null);
            }}
          >
            {mode === 'signup' ? 'I already have an account' : 'Create an account instead'}
          </button>
        </form>
      </div>
    </div>
  );
}
