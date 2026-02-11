import { useState, useEffect } from 'react';

interface Props {
  serviceSlug: string;
  serviceName: string;
}

export default function QuoteForm({ serviceSlug, serviceName }: Props) {
  const [formData, setFormData] = useState({
    firstName: '',
    email: '',
    dateOfBirth: '',
    postcode: '',
    propertyType: '',
    plateType: '',
    applyingFrom: '',
    notes: '',
    alsoInterestedIn: [] as string[],
    privacyConsent: false,
    website: '', // honeypot
  });
  const [formLoadedAt] = useState(Date.now());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadStoredData = () => {
      try {
        const stored = sessionStorage.getItem('quoteFormData');
        if (stored) {
          const data = JSON.parse(stored);
          setFormData(prev => ({ ...prev, firstName: data.firstName || '', email: data.email || '' }));
          sessionStorage.removeItem('quoteFormData');
        }
      } catch {}
    };

    // Read on mount
    loadStoredData();

    // Also listen for custom event from hero form
    window.addEventListener('quoteFormDataReady', loadStoredData);
    return () => window.removeEventListener('quoteFormDataReady', loadStoredData);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      if (name === 'privacyConsent') {
        setFormData(prev => ({ ...prev, privacyConsent: checked }));
      } else {
        setFormData(prev => ({
          ...prev,
          alsoInterestedIn: checked
            ? [...prev.alsoInterestedIn, value]
            : prev.alsoInterestedIn.filter(v => v !== value),
        }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.firstName.trim() || !formData.email.trim()) {
      setError('Please fill in your name and email.');
      return;
    }
    if (!formData.privacyConsent) {
      setError('Please accept the privacy policy.');
      return;
    }

    // Bot detection: honeypot filled or submitted too fast (<2s)
    if (formData.website || Date.now() - formLoadedAt < 2000) {
      setIsSuccess(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/forms/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceSlug,
          serviceName,
          ...formData,
        }),
      });
      if (!response.ok) throw new Error('Failed to submit');
      setIsSuccess(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const showDOB = ['health-insurance', 'residence-permit-insurance'].includes(serviceSlug);
  const showPostcode = !['travel-insurance', 'boat-insurance'].includes(serviceSlug);
  const showPropertyType = serviceSlug === 'home-insurance';
  const showPlateType = serviceSlug === 'car-insurance';
  const showApplyingFrom = serviceSlug === 'residence-permit-insurance';

  const interestOptions = [
    { value: 'car', label: 'Car insurance', hide: serviceSlug === 'car-insurance' },
    { value: 'home', label: 'Home insurance', hide: serviceSlug === 'home-insurance' },
    { value: 'health', label: 'Health insurance', hide: ['health-insurance', 'residence-permit-insurance'].includes(serviceSlug) },
  ].filter(o => !o.hide);

  if (isSuccess) {
    return (
      <div className="alert alert-success">
        <h3 style={{ marginBottom: '0.5rem' }}>Thank You!</h3>
        <p style={{ marginBottom: 0 }}>We've received your quote request for {serviceName}. We'll get back to you within 48 hours.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
        <div className="form-group">
          <label className="form-label">First Name *</label>
          <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="form-input" required />
        </div>
        <div className="form-group">
          <label className="form-label">Email *</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} className="form-input" required />
        </div>

        {showDOB && (
          <div className="form-group">
            <label className="form-label">Date of Birth</label>
            <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className="form-input" />
          </div>
        )}

        {showPostcode && (
          <div className="form-group">
            <label className="form-label">Postcode / Area</label>
            <input type="text" name="postcode" value={formData.postcode} onChange={handleChange} className="form-input" placeholder="e.g. Athens, Crete, 74100" />
          </div>
        )}
      </div>

      {showPropertyType && (
        <div className="form-group">
          <label className="form-label">Type of Property</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {['My permanent residence', 'My holiday house', 'Long-term letting', 'Short-term letting (Airbnb, Booking.com etc)'].map(opt => (
              <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="radio" name="propertyType" value={opt} checked={formData.propertyType === opt} onChange={handleChange} />
                {opt}
              </label>
            ))}
          </div>
        </div>
      )}

      {showPlateType && (
        <div className="form-group">
          <label className="form-label">I have</label>
          <div style={{ display: 'flex', gap: '1rem' }}>
            {['Greek number plates', 'Foreign number plates'].map(opt => (
              <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="radio" name="plateType" value={opt} checked={formData.plateType === opt} onChange={handleChange} />
                {opt}
              </label>
            ))}
          </div>
        </div>
      )}

      {showApplyingFrom && (
        <div className="form-group">
          <label className="form-label">I am applying</label>
          <div style={{ display: 'flex', gap: '1rem' }}>
            {['In an office in Greece', 'In an Embassy Abroad'].map(opt => (
              <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="radio" name="applyingFrom" value={opt} checked={formData.applyingFrom === opt} onChange={handleChange} />
                {opt}
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="form-group">
        <label className="form-label">Additional Notes</label>
        <textarea name="notes" value={formData.notes} onChange={handleChange} className="form-textarea" rows={3} placeholder="Any specific requirements or questions..." />
      </div>

      {interestOptions.length > 0 && (
        <div className="form-group">
          <label className="form-label">Also interested in</label>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {interestOptions.map(opt => (
              <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" name="alsoInterestedIn" value={opt.value} checked={formData.alsoInterestedIn.includes(opt.value)} onChange={handleChange} />
                {opt.label}
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="form-group">
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer' }}>
          <input type="checkbox" name="privacyConsent" checked={formData.privacyConsent} onChange={handleChange} style={{ marginTop: '4px' }} />
          <span style={{ fontSize: '0.875rem' }}>
            I agree to the <a href="/privacy-policy/" target="_blank" rel="noopener noreferrer">Privacy Policy</a> *
          </span>
        </label>
      </div>

      {/* Honeypot */}
      <div style={{ position: 'absolute', left: '-9999px' }} aria-hidden="true">
        <input type="text" name="website" value={formData.website} onChange={handleChange} tabIndex={-1} autoComplete="off" />
      </div>

      <button type="submit" className="btn btn-primary btn-lg" disabled={isSubmitting} style={{ width: '100%' }}>
        {isSubmitting ? 'Submitting...' : 'Get Your Free Quote'}
      </button>

      <p style={{ fontSize: '0.8rem', color: '#6b7280', textAlign: 'center', marginTop: '1rem', lineHeight: 1.5 }}>
        Our team will contact you within 24-48 hours. Your details will only be used to respond to your request and will not be shared or sold to third parties. Thank you for your trust!
      </p>
    </form>
  );
}
