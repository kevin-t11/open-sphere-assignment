import type { DocumentType } from '@/data/visa-config';

export interface UploadedDocument {
  type: DocumentType;
  filename: string;
  mimeType: string;
  buffer: Buffer;
}

export interface DocumentAnalysis {
  type: DocumentType;
  salaryAnnual?: number;
  salaryCurrency?: string;
  contractDurationMonths?: number;
  roleKeywords: string[];
  textSnippet: string;
}

const salaryRegex =
  /(?:(€|EUR|USD|\$|£)\s?|\b)(\d{2,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)(?:\s?(?:€|EUR|USD|USD|GBP|k|K)?)/gi;
const durationRegex = /(\d{1,2})\s?(?:months?|mos?)/i;
const keywordRegex =
  /\b(executive|director|manager|specialist|engineer|developer|scientist|nurse|doctor|architect|analyst)\b/gi;

function normaliseText(buffer: Buffer) {
  return buffer.toString('utf-8').replace(/\r\n/g, '\n');
}

function extractSalary(text: string) {
  let salary: number | undefined;
  let currency: string | undefined;

  for (const match of text.matchAll(salaryRegex)) {
    const symbol = match[1]?.toUpperCase();
    const value = match[2].replace(/[^\d.,]/g, '');
    const numeric = Number(value.replace(/[.,](?=\d{3})/g, '').replace(',', '.'));
    if (!Number.isFinite(numeric)) continue;

    if (!salary || numeric > salary) {
      salary = numeric;
      currency =
        symbol === '€' || symbol === 'EUR'
          ? 'EUR'
          : symbol === 'USD' || symbol === '$'
            ? 'USD'
            : symbol === '£'
              ? 'GBP'
              : undefined;
    }
  }

  return { salary, currency };
}

function extractDuration(text: string) {
  const match = text.match(durationRegex);
  if (!match) return undefined;
  const months = Number.parseInt(match[1] ?? '0', 10);
  return Number.isFinite(months) ? months : undefined;
}

function extractKeywords(text: string) {
  const found = new Set<string>();
  for (const match of text.matchAll(keywordRegex)) {
    if (match[1]) {
      found.add(match[1].toLowerCase());
    }
  }
  return Array.from(found);
}

export function analyzeDocuments(docs: UploadedDocument[]): DocumentAnalysis[] {
  return docs.map((doc) => {
    const text = normaliseText(doc.buffer);
    const { salary, currency } = extractSalary(text);
    const duration = extractDuration(text);
    const keywords = extractKeywords(text);
    return {
      type: doc.type,
      salaryAnnual: salary,
      salaryCurrency: currency,
      contractDurationMonths: duration,
      roleKeywords: keywords,
      textSnippet: text.slice(0, 500)
    };
  });
}
