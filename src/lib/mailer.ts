import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;

let client: Resend | undefined;

function getResendClient() {
  if (!resendApiKey) {
    throw new Error('RESEND_API_KEY environment variable is not set.');
  }

  if (!client) {
    client = new Resend(resendApiKey);
  }

  return client;
}

export interface EvaluationEmailPayload {
  name: string;
  to: string;
  subject: string;
  score: number;
  status: string;
  highlights: string[];
  advice: string[];
}

const baseStyles = {
  body: 'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;background-color:#f4f4f5;margin:0;padding:32px;',
  container:
    'max-width:600px;margin:0 auto;background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.05);',
  header: 'background-color:#18181b;color:#ffffff;padding:24px 32px;text-align:center;',
  greeting: 'font-size:16px;margin:0 0 16px 0;color:#18181b;',
  content: 'padding:32px;color:#27272a;line-height:1.6;font-size:15px;',
  footer:
    'background-color:#fafafa;padding:20px 32px;border-top:1px solid #e4e4e7;text-align:center;font-size:13px;color:#71717a;',
  paragraph: 'margin:0 0 16px;',
  label: 'font-weight:600;color:#18181b;',
  list: 'margin:0;padding-left:18px;'
};

function sectionList(items: string[], heading: string) {
  if (!items.length) return '';

  const listItems = items.map((item) => `<li>${item}</li>`).join('');

  return `
    <div style="${baseStyles.paragraph}">
      <p style="${baseStyles.paragraph}"><span style="${baseStyles.label}">${heading}</span></p>
      <ul style="${baseStyles.list}">${listItems}</ul>
    </div>
  `;
}

function buildEvaluationEmailHtml({
  name,
  subject,
  score,
  status,
  highlights,
  advice
}: EvaluationEmailPayload) {
  const currentYear = new Date().getFullYear();

  return `<!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${subject}</title>
    </head>
    <body style="${baseStyles.body}">
      <div style="${baseStyles.container}">
        <div style="${baseStyles.header}">
          <h1 style="margin:0;font-size:20px;font-weight:600;">${subject}</h1>
        </div>
        <div style="${baseStyles.content}">
          <p style="${baseStyles.greeting}">Hello ${name},</p>
          <p style="${baseStyles.paragraph}">
            We've completed your ICT Residence Permit evaluation. Here's a quick overview:
          </p>
          <p style="${baseStyles.paragraph}">
            <span style="${baseStyles.label}">Score:</span> ${score}
          </p>
          <p style="${baseStyles.paragraph}">
            <span style="${baseStyles.label}">Status:</span> ${status}
          </p>
          ${sectionList(highlights, 'Highlights')}
          ${sectionList(advice, 'Next steps')}
          <p style="${baseStyles.paragraph}">
            This summary is automated—please consult a qualified immigration professional before taking action.
          </p>
        </div>
        <div style="${baseStyles.footer}">
          <p style="margin:0;">© ${currentYear} Open Sphere. All rights reserved.</p>
          <p style="margin:8px 0 0;">You're receiving this because you're part of the Open Sphere community.</p>
        </div>
      </div>
    </body>
  </html>`;
}

export async function sendEvaluationEmail(payload: EvaluationEmailPayload) {
  const resend = getResendClient();
  const from = process.env.EMAIL_FROM;

  if (!from) {
    throw new Error('EMAIL_FROM environment variable is not set.');
  }

  const html = buildEvaluationEmailHtml(payload);

  await resend.emails.send({
    from,
    to: payload.to,
    subject: payload.subject,
    html
  });
}
