import { useState } from 'react';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    setErrorMessage('');

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Something went wrong');
      }

      setStatus('success');
      setEmail('');
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

  if (status === 'success') {
    return <p className="success-text">Thank you for subscribing!</p>;
  }

  return (
    <div>
      <form className="newsletter-form" onSubmit={handleSubmit}>
        <input
          type="email"
          className="newsletter-input"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          aria-label="Email address"
        />
        <button
          type="submit"
          className="newsletter-button"
          disabled={status === 'loading'}
        >
          {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
        </button>
      </form>
      {status === 'error' && errorMessage && (
        <p className="newsletter-error">{errorMessage}</p>
      )}
    </div>
  );
}
