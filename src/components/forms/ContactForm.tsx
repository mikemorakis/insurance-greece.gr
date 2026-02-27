import { useState, type FormEvent } from 'react';

export default function ContactForm({ defaultService }: { defaultService?: string }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: defaultService || '',
    message: '',
    website: '', // honeypot
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [formLoadedAt] = useState(Date.now());

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address.');
      return;
    }

    // Bot detection: honeypot filled or submitted too fast (<2s)
    if (formData.website || Date.now() - formLoadedAt < 2000) {
      setIsSuccess(true);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/forms/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to send message');
      }

      window.location.href = '/thank-you/contact/';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="alert alert-success">
        <h3 style={{ marginBottom: '0.5rem' }}>Thank You!</h3>
        <p style={{ marginBottom: '0.5rem' }}>Your message has been sent successfully. We'll get back to you same day.</p>
        <button onClick={() => { setIsSuccess(false); setFormData({ name: '', email: '', phone: '', subject: '', message: '', website: '' }); }} className="btn btn-outline btn-sm">
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="alert alert-error">{error}</div>}

      <div className="form-group">
        <label htmlFor="name" className="form-label">Name *</label>
        <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className="form-input" required />
      </div>

      <div className="form-group">
        <label htmlFor="email" className="form-label">Email *</label>
        <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className="form-input" required />
      </div>

      <div className="form-group">
        <label htmlFor="phone" className="form-label">Phone</label>
        <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} className="form-input" placeholder="+30 123 456 7890" />
      </div>

      <div className="form-group">
        <label htmlFor="subject" className="form-label">Subject</label>
        <select id="subject" name="subject" value={formData.subject} onChange={handleChange} className="form-select">
          <option value="">Select a subject</option>
          <option value="Health Insurance">Health Insurance</option>
          <option value="Car Insurance">Car Insurance</option>
          <option value="Home Insurance">Home Insurance</option>
          <option value="Travel Insurance">Travel Insurance</option>
          <option value="Boat Insurance">Boat Insurance</option>
          <option value="Residence Permit Insurance">Residence Permit Insurance</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="message" className="form-label">Message *</label>
        <textarea id="message" name="message" value={formData.message} onChange={handleChange} className="form-textarea" rows={5} required />
      </div>

      {/* Honeypot */}
      <div style={{ position: 'absolute', left: '-9999px' }} aria-hidden="true">
        <input type="text" name="website" value={formData.website} onChange={handleChange} tabIndex={-1} autoComplete="off" />
      </div>

      <button type="submit" className="btn btn-primary btn-lg" disabled={isSubmitting} style={{ width: '100%' }}>
        {isSubmitting ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
}
