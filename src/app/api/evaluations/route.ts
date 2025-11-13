import { EvaluationSignals } from '@/app/types/evaluation';
import { DocumentTypeSchema, getVisaById } from '@/data/visa-config';
import { evaluateByVisaId } from '@/lib/evaluation';
import { sendEvaluationEmail } from '@/lib/mailer';
import { analyzeDocuments } from '@/lib/parsers';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';

type JsonValue = string | number | boolean | null | JsonObject | JsonValue[];
type JsonObject = { [key: string]: JsonValue };

/**
 * A Zod preprocessor for converting a string to a number
 * @param value - The value to convert
 * @returns The converted number
 */
const numberFromString = z.preprocess((value) => {
  if (value === null || value === undefined || value === '') return undefined;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? value : parsed;
  }
  return value;
}, z.number());

/**
 * A Zod preprocessor for converting a string to a boolean
 * @param value - The value to convert
 * @returns The converted boolean
 */
const booleanFromString = z.preprocess((value) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return value === 'true' || value === '1';
  }
  return value;
}, z.boolean());

/**
 * A Zod schema for the evaluation signals
 * @returns The evaluation signals schema
 */
const signalsSchema = z
  .object({
    salaryAnnual: numberFromString.optional(),
    salaryCurrency: z.string().optional(),
    isShortageOccupation: booleanFromString.optional(),
    occupationMatch: booleanFromString.optional(),
    hasRecognisedDegree: booleanFromString.optional(),
    degreeLevel: z.enum(['none', 'bachelor', 'master', 'doctorate']).optional(),
    experienceYears: numberFromString.optional(),
    contractDurationMonths: numberFromString.optional(),
    employerEeShare: numberFromString.optional(),
    employerStartUpSupport: booleanFromString.optional(),
    seniorityMonthsInGroup: numberFromString.optional(),
    hasCorporateLinkProof: booleanFromString.optional(),
    delegationDocsComplete: booleanFromString.optional(),
    employerStatementValid: booleanFromString.optional(),
    compensationClarity: booleanFromString.optional(),
    missionObjectivesDocumented: booleanFromString.optional(),
    remunerationComparable: booleanFromString.optional(),
    assignmentDurationMonths: numberFromString.optional(),
    assignmentRoleType: z.enum(['manager', 'specialist', 'trainee']).optional(),
    transferDocumentationComplete: booleanFromString.optional()
  })
  .partial()
  .default({});

/**
 * A Zod schema for the evaluation payload
 * @returns The evaluation payload schema
 */
const payloadSchema = z.object({
  visaId: z.string().min(1),
  applicant: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    partnerKey: z.string().optional()
  }),
  notifyApplicant: booleanFromString.default(false),
  signals: signalsSchema
});

type Payload = z.infer<typeof payloadSchema>;

/**
 * Buffer a file
 * @param file - The file to buffer
 * @returns The buffered file
 */
async function bufferFromFile(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Aggregate the evaluation signals
 * @param payloadSignals - The payload signals
 * @param documents - The documents to analyze
 * @returns The aggregated evaluation signals
 */
function aggregateSignals(
  payloadSignals: Payload['signals'],
  documents: ReturnType<typeof analyzeDocuments>
): EvaluationSignals {
  const aggregated: EvaluationSignals = {
    ...payloadSignals
  };

  const documentSalary = documents
    .map((doc) => doc.salaryAnnual ?? 0)
    .filter(Boolean)
    .sort((a, b) => b - a)[0];

  if (!aggregated.salaryAnnual && documentSalary) {
    aggregated.salaryAnnual = documentSalary;
  }

  if (!aggregated.salaryCurrency) {
    const currency = documents.find((doc) => doc.salaryCurrency)?.salaryCurrency;
    if (currency) aggregated.salaryCurrency = currency;
  }

  if (!aggregated.contractDurationMonths) {
    const contractMonths = documents
      .map((doc) => doc.contractDurationMonths ?? 0)
      .filter(Boolean)
      .sort((a, b) => b - a)[0];
    if (contractMonths) aggregated.contractDurationMonths = contractMonths;
  }

  if (aggregated.occupationMatch === undefined || aggregated.isShortageOccupation === undefined) {
    const keywordHits = new Set<string>();
    documents.forEach((doc) => doc.roleKeywords.forEach((k) => keywordHits.add(k)));
    if (keywordHits.size > 0) {
      aggregated.occupationMatch ??= true;
      const shortageKeywords = [
        'engineer',
        'developer',
        'scientist',
        'doctor',
        'nurse',
        'specialist',
        'architect'
      ];
      aggregated.isShortageOccupation ??= shortageKeywords.some((keyword) =>
        keywordHits.has(keyword)
      );
    }
  }

  return aggregated;
}

/**
 * Evaluate a visa application
 * @param request - The request object
 * @returns The evaluation result
 */
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const rawPayload = formData.get('payload');
    if (typeof rawPayload !== 'string') {
      return NextResponse.json({ error: 'Missing JSON payload.' }, { status: 400 });
    }

    const parsedPayload = payloadSchema.parse(JSON.parse(rawPayload));
    const visa = getVisaById(parsedPayload.visaId);
    if (!visa) {
      return NextResponse.json({ error: 'Unknown visa identifier.' }, { status: 400 });
    }

    const files = formData
      .getAll('documents')
      .filter((value): value is File => value instanceof File);

    const uploadedDocs = await Promise.all(
      files.map(async (file) => {
        const buffer = await bufferFromFile(file);
        const typeResult = DocumentTypeSchema.safeParse(
          file.name.toLowerCase().includes('contract') ? 'employment_contract' : 'resume'
        );
        return {
          type: typeResult.success ? typeResult.data : 'resume',
          filename: file.name,
          mimeType: file.type,
          buffer
        };
      })
    );

    const documentAnalyses = analyzeDocuments(uploadedDocs);
    const signals = aggregateSignals(parsedPayload.signals, documentAnalyses);
    const evaluation = evaluateByVisaId({
      visaId: parsedPayload.visaId,
      signals
    });

    const submissionPayload = {
      name: parsedPayload.applicant.name,
      email: parsedPayload.applicant.email,
      country: visa.country,
      visaType: visa.name,
      salaryAnnual: signals.salaryAnnual,
      salaryCurrency: signals.salaryCurrency
    };

    const sanitizedSubmission = JSON.parse(JSON.stringify(submissionPayload)) as JsonObject;

    const sanitizedSignals = JSON.parse(JSON.stringify(signals)) as JsonObject;

    await prisma.evaluation.create({
      data: {
        partnerKey: parsedPayload.applicant.partnerKey ?? null,
        visaId: parsedPayload.visaId,
        country: visa.country,
        normalizedScore: evaluation.normalizedScore,
        cappedScore: evaluation.cappedScore,
        status: evaluation.status,
        highlights: evaluation.highlights,
        gaps: evaluation.gaps,
        advice: evaluation.advice,
        submission: sanitizedSubmission,
        signals: sanitizedSignals
      }
    });

    if (parsedPayload.notifyApplicant) {
      await sendEvaluationEmail({
        name: parsedPayload.applicant.name,
        to: parsedPayload.applicant.email,
        subject: `Your ${visa.name} evaluation`,
        score: evaluation.cappedScore,
        status: evaluation.status,
        highlights: evaluation.highlights,
        advice: evaluation.advice
      });
    }

    return NextResponse.json({
      visaId: parsedPayload.visaId,
      score: evaluation.cappedScore,
      normalizedScore: evaluation.normalizedScore,
      status: evaluation.status,
      highlights: evaluation.highlights,
      gaps: evaluation.gaps,
      advice: evaluation.advice,
      documents: documentAnalyses.map((doc) => ({
        type: doc.type,
        roleKeywords: doc.roleKeywords,
        salaryAnnual: doc.salaryAnnual,
        salaryCurrency: doc.salaryCurrency,
        contractDurationMonths: doc.contractDurationMonths
      }))
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid payload.', details: error.flatten() },
        { status: 422 }
      );
    }

    console.error('Evaluation API error:', error);
    return NextResponse.json({ error: 'Unexpected server error.' }, { status: 500 });
  }
}
