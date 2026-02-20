import { sendEmail } from '../../lib/gmail';

interface Env {
  MAILCHIMP_API_KEY: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request } = context;

  try {
    const data = await request.formData();

    if (data.get('website')) {
      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const get = (key: string) => (data.get(key) as string || '').trim();
    const fullName = get('fullName');

    if (!fullName) {
      return new Response(JSON.stringify({ error: 'Full name is required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Collect document uploads as base64
    const docHtml: string[] = [];
    const docKeys = [
      ['docPassport', 'Passport / ID'],
      ['docAfmPaper', 'Paper Showing AFM'],
      ['docExtra1', 'Extra File 1'],
      ['docExtra2', 'Extra File 2'],
    ];
    for (const [key, label] of docKeys) {
      const file = data.get(key) as File | null;
      if (file && file.size > 0) {
        const buffer = await file.arrayBuffer();
        const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
        const mime = file.type || 'application/octet-stream';
        if (mime.startsWith('image/')) {
          docHtml.push(`<p><strong>${label}:</strong> ${file.name} (${(file.size / 1024).toFixed(0)} KB)</p><img src="data:${mime};base64,${base64}" style="max-width:400px;border:1px solid #ddd;border-radius:4px;" />`);
        } else {
          docHtml.push(`<p><strong>${label}:</strong> ${file.name} (${(file.size / 1024).toFixed(0)} KB) — PDF file</p>`);
        }
      }
    }

    // Signature
    let signatureHtml = '';
    const sig = data.get('signature') as File | null;
    if (sig && sig.size > 0) {
      const buffer = await sig.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
      signatureHtml = `<h3>Signature</h3><img src="data:image/png;base64,${base64}" style="max-width:400px;border:1px solid #ddd;border-radius:4px;" />`;
    }

    const section = (title: string, fields: [string, string][]) => {
      const rows = fields
        .filter(([, val]) => val)
        .map(([label, val]) => `<tr><td style="padding:4px 12px 4px 0;font-weight:600;vertical-align:top;white-space:nowrap;">${label}</td><td style="padding:4px 0;">${val}</td></tr>`)
        .join('');
      if (!rows) return '';
      return `<h3 style="margin-top:20px;border-bottom:1px solid #e5e7eb;padding-bottom:4px;">${title}</h3><table style="font-size:14px;">${rows}</table>`;
    };

    const html = `
      <h2>Health Insurance Application</h2>
      ${section('Personal Information', [
        ['Full Name', get('fullName')],
        ["Father's Name", get('fatherName')],
        ['Date of Birth', get('dateOfBirth')],
        ['AFM', get('afm')],
        ['Passport Number', get('passportNumber')],
        ['Nationality', get('nationality')],
        ['Place of Birth', get('placeOfBirth')],
        ['Profession', get('profession')],
      ])}
      ${section('Address in Greece', [
        ['Street', get('street')],
        ['Postcode', get('postcode')],
        ['Area', get('area')],
        ['Mobile Number', get('mobileNumber')],
      ])}
      ${section('Health Details', [
        ['Height (cm)', get('height')],
        ['Weight (kg)', get('weight')],
        ['Spends Time Abroad', get('spendsTimeAbroad')],
        ['Months Abroad / Year', get('monthsAbroad')],
        ['Smokes', get('smokes')],
        ['Cigarettes / Day', get('cigarettesPerDay')],
      ])}
      ${section('Payment', [
        ['Payment Method', get('paymentMethod')],
        ['Payment Frequency', get('paymentFrequency')],
      ])}
      ${docHtml.length > 0 ? `<h3 style="margin-top:20px;border-bottom:1px solid #e5e7eb;padding-bottom:4px;">Documents</h3>${docHtml.join('')}` : ''}
      ${signatureHtml}
    `;

    await sendEmail({
      to: 'info@insurance-greece.com',
      subject: `Health Insurance Application: ${fullName}`,
      html,
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: 'Unable to process your request.', debug: msg }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
