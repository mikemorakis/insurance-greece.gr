import { useState, type FormEvent } from 'react';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email) {
      setError('Please enter your email');
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/forms/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) throw new Error('Failed to subscribe');
      setIsSuccess(true);
      setEmail('');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return <p className="success-text">Thank you for subscribing!</p>;
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="newsletter-form">
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="newsletter-input"
          required
        />
        <button type="submit" className="newsletter-button" disabled={isSubmitting}>
          {isSubmitting ? 'Subscribing...' : 'Subscribe'}
        </button>
      </form>
      {error && <p className="newsletter-error">{error}</p>}
    </>
  );
}
