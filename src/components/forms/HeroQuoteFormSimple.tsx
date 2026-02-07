import { useState } from 'react';

interface Props {
  serviceSlug: string;
  serviceName: string;
}

export default function HeroQuoteFormSimple({ serviceSlug, serviceName }: Props) {
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (firstName || email) {
      sessionStorage.setItem('quoteFormData', JSON.stringify({ firstName, email }));
    }
    const formSection = document.getElementById('quote-form');
    if (formSection) {
      formSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="hero-simple-form">
      <form onSubmit={handleSubmit}>
        <div className="hero-simple-fields">
          <input
            type="text"
            placeholder="Your first name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="hero-simple-input"
          />
          <input
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="hero-simple-input"
          />
          <button type="submit" className="btn btn-primary">
            Get Your Free Quote
          </button>
        </div>
      </form>
      <div className="hero-trust-signals">
        <span>English-speaking support</span>
        <span>Free quote in 24h</span>
        <span>No obligation</span>
      </div>
    </div>
  );
}
