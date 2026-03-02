const SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbz7XvrdmhmSv_d678O7ywd1AT8_Z7OTWz841E6Z725K1amiMvmTqAGBMPI0hgxhcT6L8g/exec';

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}): Promise<void> {
  const res = await fetch(SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify(opts),
    redirect: 'follow',
  });

  if (res.status >= 500) {
    throw new Error('Email service error');
  }
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // strip the data:...;base64, prefix
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function fileToImgHtml(file: File, label: string): Promise<string> {
  const base64 = await fileToBase64(file);
  const mime = file.type || 'application/octet-stream';
  if (mime.startsWith('image/')) {
    return `<p><strong>${label}:</strong> ${file.name} (${(file.size / 1024).toFixed(0)} KB)</p><img src="data:${mime};base64,${base64}" style="max-width:400px;border:1px solid #ddd;border-radius:4px;" />`;
  }
  return `<p><strong>${label}:</strong> ${file.name} (${(file.size / 1024).toFixed(0)} KB) — PDF file</p>`;
}

export function canvasToBase64(canvas: HTMLCanvasElement): Promise<string> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) { resolve(''); return; }
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]);
      };
      reader.readAsDataURL(blob);
    }, 'image/png');
  });
}

export function sectionHtml(title: string, fields: [string, string][]): string {
  const rows = fields
    .filter(([, val]) => val)
    .map(([label, val]) => `<tr><td style="padding:4px 12px 4px 0;font-weight:600;vertical-align:top;white-space:nowrap;">${label}</td><td style="padding:4px 0;">${val}</td></tr>`)
    .join('');
  if (!rows) return '';
  return `<h3 style="margin-top:20px;border-bottom:1px solid #e5e7eb;padding-bottom:4px;">${title}</h3><table style="font-size:14px;">${rows}</table>`;
}
