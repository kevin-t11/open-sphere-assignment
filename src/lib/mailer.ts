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
  to: string;
  subject: string;
  score: number;
  status: string;
  highlights: string[];
  advice: string[];
}

export async function sendEvaluationEmail({
  to,
  subject,
  score,
  status,
  highlights,
  advice
}: EvaluationEmailPayload) {
  const resend = getResendClient();
  await resend.emails.send({
    from: 'Open Sphere Evaluator <no-reply@opensphere.ai>',
    to,
    subject,
    html: `
      <h2>Visa Evaluation Result</h2>
      <p><strong>Score:</strong> ${score}</p>
      <p><strong>Status:</strong> ${status}</p>
      ${
        highlights.length
          ? `<p><strong>Strengths:</strong></p><ul>${highlights
              .map((item) => `<li>${item}</li>`)
              .join('')}</ul>`
          : ''
      }
      ${
        advice.length
          ? `<p><strong>Suggested improvements:</strong></p><ul>${advice
              .map((item) => `<li>${item}</li>`)
              .join('')}</ul>`
          : ''
      }
      <p>This is an automated summary. Please consult with a licensed immigration professional before taking action.</p>
    `
  });
}
