import { useState, useRef, useEffect } from 'react';

export default function CarInsuranceForm() {
  const [form, setForm] = useState({
    fullName: '',
    fatherName: '',
    dateOfBirth: '',
    afm: '',
    passportNumber: '',
    nationality: '',
    placeOfBirth: '',
    profession: '',
    // Address
    street: '',
    postcode: '',
    area: '',
    mobileNumber: '',
    // Insurance
    coverStartDate: '',
    paymentMethod: '',
    // Meta
    privacyConsent: false,
    website: '',
  });

  const [files, setFiles] = useState<{ passport: File | null; registration: File | null; license: File | null; extra: File | null }>({
    passport: null,
    registration: null,
    license: null,
    extra: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [formLoadedAt] = useState(Date.now());

  // Signature
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setIsDrawing(true);
    setHasSigned(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDraw = () => setIsDrawing(false);

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSigned(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setForm(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (key: keyof typeof files) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFiles(prev => ({ ...prev, [key]: e.target.files![0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const required = ['fullName', 'fatherName', 'dateOfBirth', 'afm', 'placeOfBirth', 'profession', 'street', 'postcode', 'area', 'mobileNumber', 'coverStartDate'] as const;
    for (const field of required) {
      if (!form[field].trim()) {
        setError('Please fill in all required fields (marked with *).');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }
    if (!form.privacyConsent) {
      setError('Please accept the privacy policy.');
      return;
    }

    if (form.website || Date.now() - formLoadedAt < 2000) {
      setSubmitted(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const data = new FormData();

      Object.entries(form).forEach(([key, val]) => {
        if (key !== 'website' && key !== 'privacyConsent') {
          data.append(key, String(val));
        }
      });

      if (files.passport) data.append('docPassport', files.passport);
      if (files.registration) data.append('docRegistration', files.registration);
      if (files.license) data.append('docLicense', files.license);
      if (files.extra) data.append('docExtra', files.extra);

      if (hasSigned && canvasRef.current) {
        const blob = await new Promise<Blob | null>(resolve => canvasRef.current!.toBlob(resolve, 'image/png'));
        if (blob) data.append('signature', blob, 'signature.png');
      }

      const response = await fetch('/api/forms/car-insurance', {
        method: 'POST',
        body: data,
      });
      if (!response.ok) throw new Error('Failed to submit');
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ 'event': 'form_submit', 'form_name': 'car_insurance' });
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setError('Something went wrong. Please try again or contact us via WhatsApp.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' } as const;
  const sectionTitle = { marginTop: '2rem', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid #e5e7eb' } as const;

  if (submitted) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
        <h3 style={{ color: '#16a34a', marginBottom: '1rem' }}>Thank you, the form is now sent!</h3>
        <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>We will review it and you will hear from us shortly.</p>
        <p style={{ fontSize: '1rem' }}>In the meantime have a look at <a href="/insurance-tips-in-greece/" style={{ color: '#2563eb', textDecoration: 'underline' }}>important insurance tips</a>.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

      {/* ── Personal Information ── */}
      <h3 style={{ marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid #e5e7eb' }}>Personal Information</h3>
      <div style={gridStyle}>
        <div className="form-group">
          <label className="form-label">Full Name *</label>
          <input type="text" name="fullName" value={form.fullName} onChange={handleChange} className="form-input" required />
        </div>
        <div className="form-group">
          <label className="form-label">Father's Name *</label>
          <input type="text" name="fatherName" value={form.fatherName} onChange={handleChange} className="form-input" required />
        </div>
        <div className="form-group">
          <label className="form-label">Date of Birth *</label>
          <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} className="form-input" required />
        </div>
        <div className="form-group">
          <label className="form-label">AFM (Greek Tax Number) *</label>
          <input type="text" name="afm" value={form.afm} onChange={handleChange} className="form-input" required />
        </div>
        <div className="form-group">
          <label className="form-label">Passport Number</label>
          <input type="text" name="passportNumber" value={form.passportNumber} onChange={handleChange} className="form-input" />
        </div>
        <div className="form-group">
          <label className="form-label">Nationality</label>
          <input type="text" name="nationality" value={form.nationality} onChange={handleChange} className="form-input" />
        </div>
        <div className="form-group">
          <label className="form-label">Place of Birth *</label>
          <input type="text" name="placeOfBirth" value={form.placeOfBirth} onChange={handleChange} className="form-input" required />
        </div>
        <div className="form-group">
          <label className="form-label">Profession *</label>
          <input type="text" name="profession" value={form.profession} onChange={handleChange} className="form-input" required />
        </div>
      </div>

      {/* ── Address in Greece ── */}
      <h3 style={sectionTitle}>Address in Greece</h3>
      <div style={gridStyle}>
        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label className="form-label">Street *</label>
          <input type="text" name="street" value={form.street} onChange={handleChange} className="form-input" required />
        </div>
        <div className="form-group">
          <label className="form-label">Postcode *</label>
          <input type="text" name="postcode" value={form.postcode} onChange={handleChange} className="form-input" required />
        </div>
        <div className="form-group">
          <label className="form-label">Area *</label>
          <input type="text" name="area" value={form.area} onChange={handleChange} className="form-input" required />
        </div>
        <div className="form-group">
          <label className="form-label">Mobile Number *</label>
          <input type="tel" name="mobileNumber" value={form.mobileNumber} onChange={handleChange} className="form-input" required />
        </div>
      </div>

      {/* ── Insurance Details ── */}
      <h3 style={sectionTitle}>Insurance Details</h3>
      <div style={gridStyle}>
        <div className="form-group">
          <label className="form-label">When would you like the cover to start? *</label>
          <input type="date" name="coverStartDate" value={form.coverStartDate} onChange={handleChange} className="form-input" required />
        </div>
        <div className="form-group">
          <label className="form-label">Payment Method</label>
          <select name="paymentMethod" value={form.paymentMethod} onChange={handleChange} className="form-select">
            <option value="">-- Select --</option>
            <option value="Card payment">Card payment</option>
            <option value="e-Banking Greek">e-Banking payment from a Greek bank account</option>
            <option value="e-Banking International (+4€)">e-Banking payment from an international account (+4 Euros fee)</option>
          </select>
        </div>
      </div>

      {/* ── Document Upload ── */}
      <h3 style={sectionTitle}>Upload Your Documents</h3>
      <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>Passport / ID, registration document, driving license</p>
      <div style={gridStyle}>
        <div className="form-group">
          <label className="form-label">Passport or ID</label>
          <input type="file" accept="image/*,.pdf" onChange={handleFileChange('passport')} className="form-input" style={{ padding: '0.5rem' }} />
          {files.passport && <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{files.passport.name}</span>}
        </div>
        <div className="form-group">
          <label className="form-label">Registration Document</label>
          <input type="file" accept="image/*,.pdf" onChange={handleFileChange('registration')} className="form-input" style={{ padding: '0.5rem' }} />
          {files.registration && <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{files.registration.name}</span>}
        </div>
        <div className="form-group">
          <label className="form-label">Driving License</label>
          <input type="file" accept="image/*,.pdf" onChange={handleFileChange('license')} className="form-input" style={{ padding: '0.5rem' }} />
          {files.license && <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{files.license.name}</span>}
        </div>
        <div className="form-group">
          <label className="form-label">Extra File (if needed)</label>
          <input type="file" accept="image/*,.pdf" onChange={handleFileChange('extra')} className="form-input" style={{ padding: '0.5rem' }} />
          {files.extra && <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{files.extra.name}</span>}
        </div>
      </div>

      {/* ── Signature ── */}
      <h3 style={sectionTitle}>Signature</h3>
      <div className="form-group">
        <div style={{ border: '1px solid #d1d5db', borderRadius: '0.5rem', overflow: 'hidden', background: '#fff', touchAction: 'none' }}>
          <canvas
            ref={canvasRef}
            width={700}
            height={150}
            style={{ width: '100%', height: '150px', cursor: 'crosshair', display: 'block' }}
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={stopDraw}
            onMouseLeave={stopDraw}
            onTouchStart={startDraw}
            onTouchMove={draw}
            onTouchEnd={stopDraw}
          />
        </div>
        <button type="button" onClick={clearSignature} style={{ marginTop: '0.5rem', background: 'none', border: '1px solid #d1d5db', padding: '0.25rem 1rem', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.8rem', color: '#6b7280' }}>
          Clear Signature
        </button>
      </div>

      {/* ── Privacy + Submit ── */}
      <div className="form-group" style={{ marginTop: '1.5rem' }}>
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer' }}>
          <input type="checkbox" name="privacyConsent" checked={form.privacyConsent} onChange={handleChange} style={{ marginTop: '4px' }} />
          <span style={{ fontSize: '0.875rem' }}>
            I agree to the <a href="/privacy-policy/" target="_blank" rel="noopener noreferrer">Privacy Policy</a> and <a href="/terms-and-conditions/" target="_blank" rel="noopener noreferrer">Terms and Conditions</a> *
          </span>
        </label>
      </div>

      {/* Honeypot */}
      <div style={{ position: 'absolute', left: '-9999px' }} aria-hidden="true">
        <input type="text" name="website" value={form.website} onChange={handleChange} tabIndex={-1} autoComplete="off" />
      </div>

      <p style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '1rem' }}>* Required</p>

      <button type="submit" className="btn btn-primary btn-lg" disabled={isSubmitting} style={{ width: '100%' }}>
        {isSubmitting ? 'Submitting...' : 'Submit Application'}
      </button>

      <p style={{ fontSize: '0.8rem', color: '#6b7280', textAlign: 'center', marginTop: '1rem', lineHeight: 1.5 }}>
        Tailor-made insurance plans from your personal Insurance Advisor. Insurance Greece is a registered trademark in the Greek Chambers of Commerce with license number 7841-294 and registration number 022359150000.
      </p>
    </form>
  );
}
