import { sendEmail } from '../../lib/gmail';
import { addSubscriber } from '../../lib/mailchimp';

interface Env {
  MAILCHIMP_API_KEY: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    const data = await request.formData();

    // Honeypot check
    if (data.get('website')) {
      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const get = (key: string) => (data.get(key) as string || '').trim();

    const fullName = get('fullName');
    const contactNumber = get('contactNumber');

    if (!fullName) {
      return new Response(JSON.stringify({ error: 'Full name is required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Collect photo attachments as base64 for email
    const photoHtml: string[] = [];
    for (let i = 1; i <= 4; i++) {
      const file = data.get(`photo${i}`) as File | null;
      if (file && file.size > 0) {
        const buffer = await file.arrayBuffer();
        const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
        const mime = file.type || 'image/jpeg';
        photoHtml.push(`<p><strong>Photo ${i}:</strong> ${file.name} (${(file.size / 1024).toFixed(0)} KB)</p><img src="data:${mime};base64,${base64}" style="max-width:400px;border:1px solid #ddd;border-radius:4px;" />`);
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

    // Build field sections
    const section = (title: string, fields: [string, string][]) => {
      const rows = fields
        .filter(([, val]) => val)
        .map(([label, val]) => `<tr><td style="padding:4px 12px 4px 0;font-weight:600;vertical-align:top;white-space:nowrap;">${label}</td><td style="padding:4px 0;">${val}</td></tr>`)
        .join('');
      if (!rows) return '';
      return `<h3 style="margin-top:20px;border-bottom:1px solid #e5e7eb;padding-bottom:4px;">${title}</h3><table style="font-size:14px;">${rows}</table>`;
    };

    const html = `
      <h2>Home Insurance Application</h2>
      ${section('Personal Information', [
        ['Full Name', get('fullName')],
        ["Father's Name", get('fatherName')],
        ['Date of Birth', get('dateOfBirth')],
        ['AFM', get('afm')],
        ['Passport Number', get('passportNumber')],
        ['Nationality', get('nationality')],
        ['Place of Birth', get('placeOfBirth')],
        ['Profession', get('profession')],
        ['Contact Number', get('contactNumber')],
      ])}
      ${section('Property Address', [
        ['Street', get('propertyStreet')],
        ['Postcode', get('propertyPostcode')],
        ['Area', get('propertyArea')],
        ['City', get('propertyCity')],
      ])}
      ${section('Communication Address', [
        ['Street', get('commStreet')],
        ['Postcode', get('commPostcode')],
        ['City', get('commCity')],
      ])}
      ${section('Property Details', [
        ['Owner / Renting', get('ownerOrRenting')],
        ['Year Built', get('yearBuilt')],
        ['Square Meters (main)', get('squareMeters')],
        ['Building Type', get('buildingType')],
        ['Apartment Floor', get('apartmentFloor')],
        ['Detached Floors', get('detachedFloors')],
        ['Legal Permit', get('legalPermit')],
        ['Permanent / Holiday', get('permanentOrHoliday')],
        ['Caretaker Info', get('caretakerInfo')],
        ['Pool/Storage/Garage', get('hasOutdoor')],
        ['Pool (sqm)', get('poolSqm')],
        ['Storage Shed (sqm)', get('storageSqm')],
        ['Garage (sqm)', get('garageSqm')],
      ])}
      ${section('Insurance Details', [
        ['Building Capital (€)', get('buildingCapital')],
        ['Contents Capital (€)', get('contentsCapital')],
        ['House Material', get('houseMaterial')],
        ['Previous Damages', get('previousDamages')],
        ['Damages Description', get('damagesDescription')],
        ['Cover Start Date', get('coverStartDate')],
        ['Payment Method', get('paymentMethod')],
        ['Additional Notes', get('additionalNotes')],
      ])}
      ${section('Emergency Contacts', [
        ['Name 1', get('emergencyName1')],
        ['Email 1', get('emergencyEmail1')],
        ['Phone 1', get('emergencyPhone1')],
        ['Name 2', get('emergencyName2')],
        ['Email 2', get('emergencyEmail2')],
        ['Phone 2', get('emergencyPhone2')],
      ])}
      ${photoHtml.length > 0 ? `<h3 style="margin-top:20px;border-bottom:1px solid #e5e7eb;padding-bottom:4px;">Photos</h3>${photoHtml.join('')}` : ''}
      ${signatureHtml}
    `;

    // Find an email to use for replyTo and Mailchimp
    const email = get('emergencyEmail1') || get('emergencyEmail2') || '';

    await Promise.all([
      sendEmail({
        to: 'info@insurance-greece.com',
        replyTo: email || undefined,
        subject: `Home Insurance Application: ${fullName}`,
        html,
      }),
      email ? addSubscriber(env.MAILCHIMP_API_KEY, {
        email,
        firstName: fullName.split(' ')[0],
        tags: ['Website - House Insurance Application'],
      }) : Promise.resolve(),
    ]);

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
