import { useState } from 'react';

const SERVICE_OPTIONS = [
  { slug: 'health-insurance', name: 'Health Insurance' },
  { slug: 'residence-permit-insurance', name: 'Residence Permit Insurance' },
  { slug: 'home-insurance', name: 'Home Insurance' },
  { slug: 'car-insurance', name: 'Car Insurance' },
  { slug: 'travel-insurance', name: 'Travel Insurance' },
  { slug: 'boat-insurance', name: 'Boat Insurance' },
  { slug: 'other-type-insurance', name: 'Other Insurance' },
];

export default function HeroQuoteSelector() {
  const [selected, setSelected] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selected) {
      window.location.href = `/insurance-services/${selected}/`;
    } else {
      window.location.href = '/insurance-services/';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="hero-quote-form">
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        className="hero-quote-select"
      >
        <option value="">Select Insurance Type</option>
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
