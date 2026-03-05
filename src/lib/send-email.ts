const SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbz01GCAQwn0k-_7tVPKPHPh6VJy20Wau-ArWXrH-mSoyj3n3Zjc2O08Rh6314mxVmqqTg/exec';

interface Attachment {
  filename: string;
  mimeType: string;
  data: string;
}

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
  cc?: string;
  attachments?: Attachment[];
}): Promise<void> {
  await fetch(SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify(opts),
    mode: 'no-cors',
  });
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function fileToAttachment(file: File): Promise<Attachment> {
  const data = await fileToBase64(file);
  return {
    filename: file.name,
    mimeType: file.type || 'application/octet-stream',
    data,
  };
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
