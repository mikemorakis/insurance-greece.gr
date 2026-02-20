import { useState, useRef, useEffect } from 'react';

export default function HouseInsuranceForm() {
  const [form, setForm] = useState({
    fullName: '',
    fatherName: '',
    dateOfBirth: '',
    afm: '',
    passportNumber: '',
    nationality: '',
    placeOfBirth: '',
    profession: '',
    contactNumber: '',
    // Property address
    propertyStreet: '',
    propertyPostcode: '',
    propertyArea: '',
    propertyCity: '',
    // Property details
    ownerOrRenting: '',
    yearBuilt: '',
    squareMeters: '',
    buildingType: '',
    apartmentFloor: '',
    blockFloors: '',
    detachedFloors: '',
    legalPermit: '',
    permanentOrHoliday: '',
    hasOutdoor: '',
    poolSqm: '',
    storageSqm: '',
    // Insurance
    houseMaterial: '',
    previousDamages: '',
    damagesDescription: '',
    coverStartDate: '',
    additionalNotes: '',
    paymentMethod: '',
    // Meta
    privacyConsent: false,
    website: '', // honeypot
  });

  const [photos, setPhotos] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formLoadedAt] = useState(Date.now());

  // Signature canvas
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setForm(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPhotos(prev => [...prev, ...Array.from(e.target.files!)].slice(0, 4));
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate required fields
    const required = ['fullName', 'fatherName', 'dateOfBirth', 'afm', 'passportNumber', 'placeOfBirth', 'profession', 'contactNumber', 'propertyStreet', 'propertyPostcode', 'propertyArea', 'propertyCity', 'houseMaterial'] as const;
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

    // Bot detection
    if (form.website || Date.now() - formLoadedAt < 2000) {
      window.location.href = '/thank-you/quote/';
      return;
    }

    setIsSubmitting(true);
    try {
      const data = new FormData();

      // Append all text fields
      Object.entries(form).forEach(([key, val]) => {
        if (key !== 'website' && key !== 'privacyConsent') {
          data.append(key, String(val));
        }
      });

      // Append photos
      photos.forEach((file, i) => {
        data.append(`photo${i + 1}`, file);
      });

      // Append signature
      if (hasSigned && canvasRef.current) {
        const blob = await new Promise<Blob | null>(resolve => canvasRef.current!.toBlob(resolve, 'image/png'));
        if (blob) data.append('signature', blob, 'signature.png');
      }

      const response = await fetch('/api/forms/house-insurance', {
        method: 'POST',
        body: data,
      });
      if (!response.ok) throw new Error('Failed to submit');
      window.location.href = '/thank-you/quote/';
    } catch {
      setError('Something went wrong. Please try again or contact us via WhatsApp.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const radioStyle = { display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' } as const;
  const radioGroupStyle = { display: 'flex', gap: '1.5rem', flexWrap: 'wrap' } as const;
  const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' } as const;

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
          <label className="form-label">Passport Number *</label>
          <input type="text" name="passportNumber" value={form.passportNumber} onChange={handleChange} className="form-input" required />
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
        <div className="form-group">
          <label className="form-label">Contact Number *</label>
          <input type="tel" name="contactNumber" value={form.contactNumber} onChange={handleChange} className="form-input" required />
        </div>
      </div>

      {/* ── Property Address ── */}
      <h3 style={{ marginTop: '2rem', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid #e5e7eb' }}>Address of the Property to Cover</h3>
      <div style={gridStyle}>
        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label className="form-label">Street Name and Number *</label>
          <input type="text" name="propertyStreet" value={form.propertyStreet} onChange={handleChange} className="form-input" required />
        </div>
        <div className="form-group">
          <label className="form-label">Postcode *</label>
          <input type="text" name="propertyPostcode" value={form.propertyPostcode} onChange={handleChange} className="form-input" required />
        </div>
        <div className="form-group">
          <label className="form-label">Area *</label>
          <input type="text" name="propertyArea" value={form.propertyArea} onChange={handleChange} className="form-input" required />
        </div>
        <div className="form-group">
          <label className="form-label">City *</label>
          <input type="text" name="propertyCity" value={form.propertyCity} onChange={handleChange} className="form-input" required />
        </div>
      </div>

      {/* ── Property Details ── */}
      <h3 style={{ marginTop: '2rem', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid #e5e7eb' }}>Property Details</h3>

      <div className="form-group">
        <label className="form-label">Are you the owner of the property or renting?</label>
        <div style={radioGroupStyle}>
          {['Owner', 'Renting'].map(opt => (
            <label key={opt} style={radioStyle}>
              <input type="radio" name="ownerOrRenting" value={opt} checked={form.ownerOrRenting === opt} onChange={handleChange} />
              {opt}
            </label>
          ))}
        </div>
      </div>

      <div style={gridStyle}>
        <div className="form-group">
          <label className="form-label">When was the house built?</label>
          <input type="text" name="yearBuilt" value={form.yearBuilt} onChange={handleChange} className="form-input" placeholder="e.g. 1995" />
        </div>
        <div className="form-group">
          <label className="form-label">Square meters of the main building</label>
          <input type="number" name="squareMeters" value={form.squareMeters} onChange={handleChange} className="form-input" />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Is it an apartment in a block or a detached house?</label>
        <div style={radioGroupStyle}>
          {['Block', 'Detached House'].map(opt => (
            <label key={opt} style={radioStyle}>
              <input type="radio" name="buildingType" value={opt} checked={form.buildingType === opt} onChange={handleChange} />
              {opt}
            </label>
          ))}
        </div>
      </div>

      {form.buildingType === 'Block' && (
        <>
          <div className="form-group">
            <label className="form-label">If it's an apartment, please state the floor</label>
            <input type="text" name="apartmentFloor" value={form.apartmentFloor} onChange={handleChange} className="form-input" placeholder="e.g. 3rd floor" />
          </div>
          <div className="form-group">
            <label className="form-label">Block Apartment - how many floors?</label>
            <input type="text" name="blockFloors" value={form.blockFloors} onChange={handleChange} className="form-input" placeholder="e.g. 5" />
          </div>
        </>
      )}

      {form.buildingType === 'Detached House' && (
        <div className="form-group">
          <label className="form-label">Detached house - how many floors?</label>
          <input type="text" name="detachedFloors" value={form.detachedFloors} onChange={handleChange} className="form-input" placeholder="e.g. 2" />
        </div>
      )}

      <div className="form-group">
        <label className="form-label">Was the property built with a legal permit?</label>
        <div style={radioGroupStyle}>
          {['Yes', 'No'].map(opt => (
            <label key={opt} style={radioStyle}>
              <input type="radio" name="legalPermit" value={opt} checked={form.legalPermit === opt} onChange={handleChange} />
              {opt}
            </label>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Do you live there permanently or is it a holiday house?</label>
        <div style={radioGroupStyle}>
          {['Permanently', 'Holiday House'].map(opt => (
            <label key={opt} style={radioStyle}>
              <input type="radio" name="permanentOrHoliday" value={opt} checked={form.permanentOrHoliday === opt} onChange={handleChange} />
              {opt}
            </label>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Do you have a pool or storage shed outside?</label>
        <div style={radioGroupStyle}>
          {['Yes', 'No'].map(opt => (
            <label key={opt} style={radioStyle}>
              <input type="radio" name="hasOutdoor" value={opt} checked={form.hasOutdoor === opt} onChange={handleChange} />
              {opt}
            </label>
          ))}
        </div>
      </div>

      {form.hasOutdoor === 'Yes' && (
        <div style={gridStyle}>
          <div className="form-group">
            <label className="form-label">Pool (square meters)</label>
            <input type="number" name="poolSqm" value={form.poolSqm} onChange={handleChange} className="form-input" />
          </div>
          <div className="form-group">
            <label className="form-label">Storage shed (square meters)</label>
            <input type="number" name="storageSqm" value={form.storageSqm} onChange={handleChange} className="form-input" />
          </div>
        </div>
      )}

      {/* ── Insurance Details ── */}
      <h3 style={{ marginTop: '2rem', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid #e5e7eb' }}>Insurance Details</h3>

      <div className="form-group">
        <label className="form-label">The house is made of... *</label>
        <select name="houseMaterial" value={form.houseMaterial} onChange={handleChange} className="form-select" required>
          <option value="">-- Select --</option>
          <option value="Concrete">Concrete</option>
          <option value="Stone">Stone</option>
          <option value="Concrete with stone fitting">Concrete with stone fitting</option>
          <option value="Metal">Metal</option>
          <option value="Wood">Wood</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Were there any damages in the property in the last 5 years?</label>
        <div style={radioGroupStyle}>
          {['Yes', 'No'].map(opt => (
            <label key={opt} style={radioStyle}>
              <input type="radio" name="previousDamages" value={opt} checked={form.previousDamages === opt} onChange={handleChange} />
              {opt}
            </label>
          ))}
        </div>
      </div>

      {form.previousDamages === 'Yes' && (
        <div className="form-group">
          <label className="form-label">Please specify dates and description of the damage</label>
          <textarea name="damagesDescription" value={form.damagesDescription} onChange={handleChange} className="form-textarea" rows={3} />
        </div>
      )}

      <div style={gridStyle}>
        <div className="form-group">
          <label className="form-label">When would you like the cover to start?</label>
          <input type="date" name="coverStartDate" value={form.coverStartDate} onChange={handleChange} className="form-input" />
        </div>
        <div className="form-group">
          <label className="form-label">Payment Method</label>
          <select name="paymentMethod" value={form.paymentMethod} onChange={handleChange} className="form-select">
            <option value="">-- Select --</option>
            <option value="Bank deposit - Cash">Bank deposit - Cash</option>
            <option value="e-Banking Greek">e-Banking payment from a Greek bank account</option>
            <option value="e-Banking International (+4€)">e-Banking payment from an international account (+4 Euros fee)</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Please mention anything that you would like us to know</label>
        <textarea name="additionalNotes" value={form.additionalNotes} onChange={handleChange} className="form-textarea" rows={3} placeholder="Any information that cannot be included in the fields above..." />
      </div>

      {/* ── Photo Upload ── */}
      <h3 style={{ marginTop: '2rem', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid #e5e7eb' }}>Upload Your Photos</h3>
      <div className="form-group">
        <label className="form-label">Property photos (up to 4 images)</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="form-input"
          style={{ padding: '0.5rem' }}
          disabled={photos.length >= 4}
        />
        {photos.length > 0 && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
            {photos.map((file, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: '#f3f4f6', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.8rem' }}>
                {file.name.slice(0, 20)}{file.name.length > 20 ? '...' : ''}
                <button type="button" onClick={() => removePhoto(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontWeight: 'bold', fontSize: '1rem', lineHeight: 1 }}>&times;</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Signature ── */}
      <h3 style={{ marginTop: '2rem', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid #e5e7eb' }}>Signature</h3>
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
