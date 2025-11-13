import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Get the latest 100 evaluations for a partner
 * @param request - The request object
 * @returns The latest 100 evaluations for a partner
 * @throws {NextResponse} - 401 if the partner API key is missing
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const apiKey = request.headers.get('x-api-key');
  if (!apiKey) {
    return NextResponse.json({ error: 'Missing partner API key.' }, { status: 401 });
  }

  const records = await prisma.evaluation.findMany({
    where: { partnerKey: apiKey },
    orderBy: { createdAt: 'desc' },
    take: 100
  });

  type EvaluationRecord = Awaited<ReturnType<typeof prisma.evaluation.findMany>>[number];

  const formatted = records.map((record: EvaluationRecord) => ({
    visaId: record.visaId,
    country: record.country,
    score: record.cappedScore,
    status: record.status as 'weak' | 'moderate' | 'strong',
    highlights: record.highlights,
    gaps: record.gaps,
    advice: record.advice,
    submission: record.submission,
    createdAt: record.createdAt
  }));

  return NextResponse.json(formatted);
}
