import { useState } from 'react';

const SERVICE_OPTIONS = [
  { slug: 'stromata-gia-mena', name: 'Στρώμα για μένα' },
  { slug: 'stromata-gia-paidia', name: 'Στρώματα για παιδιά' },
  { slug: 'orthopedika-stromata', name: 'Ορθοπεδικά στρώματα' },
  { slug: 'xenodocheiaka-stromata', name: 'Ξενοδοχειακά στρώματα' },
  { slug: 'stromata-gia-skafi', name: 'Στρώματα για σκάφη' },
  { slug: 'krevatia', name: 'Κρεβάτια' },
  { slug: 'epipla-ypnodomatiou', name: 'Έπιπλα Υπνοδωματίου' },
  { slug: 'synergasia-me-sleepys', name: 'Συνεργασία με τη Sleepys' },
];

export default function HeroQuoteSelector() {
  const [selected, setSelected] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selected) {
      window.location.href = `/${selected}/`;
    } else {
      window.location.href = '/contact-us/';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="hero-quote-form">
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        className="hero-quote-select"
      >
        <option value="">Ψάχνω για....</option>
        {SERVICE_OPTIONS.map((service) => (
          <option key={service.slug} value={service.slug}>
            {service.name}
          </option>
        ))}
      </select>
      <button type="submit" className="hero-quote-button">
        Get a Quote
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      </button>
    </form>
  );
}
