import type { EvaluationSignals, EvaluationStatus, VisaScoreResult } from '@/app/types/evaluation';
import { getVisaById } from '@/data/visa-config';

const DEFAULT_SCORE_CAP = 85;

/**
 * Determine evaluation status based on score
 */
function determineStatus(score: number): EvaluationStatus {
  if (score >= 70) return 'strong';
  if (score >= 55) return 'moderate';
  return 'weak';
}

/**
 * Calculate visa eligibility score based on signals
 */
function calculateScore(signals: EvaluationSignals): number {
  let score = 0;
  const weights = {
    salary: 30,
    experience: 25,
    contract: 20,
    degree: 15,
    occupation: 10
  };

  // Salary scoring (30 points)
  const salary = signals.salaryAnnual || 0;
  if (salary > 0) {
    if (salary >= 80000) score += weights.salary;
    else if (salary >= 60000) score += weights.salary * 0.8;
    else if (salary >= 40000) score += weights.salary * 0.6;
    else if (salary >= 25000) score += weights.salary * 0.4;
    else score += weights.salary * 0.2;
  }

  // Experience scoring (25 points)
  const experience = signals.experienceYears || 0;
  if (experience >= 5) score += weights.experience;
  else if (experience >= 3) score += weights.experience * 0.7;
  else if (experience >= 1) score += weights.experience * 0.4;

  // Contract duration scoring (20 points)
  const contractMonths = signals.contractDurationMonths || 0;
  if (contractMonths >= 12) score += weights.contract;
  else if (contractMonths >= 6) score += weights.contract * 0.6;
  else if (contractMonths >= 3) score += weights.contract * 0.3;

  // Degree scoring (15 points)
  if (signals.degreeLevel === 'doctorate') score += weights.degree;
  else if (signals.degreeLevel === 'master') score += weights.degree * 0.8;
  else if (signals.degreeLevel === 'bachelor') score += weights.degree * 0.6;
  else if (signals.hasRecognisedDegree) score += weights.degree * 0.4;

  // Occupation match scoring (10 points)
  if (signals.isShortageOccupation) score += weights.occupation;
  else if (signals.occupationMatch) score += weights.occupation * 0.6;

  return Math.min(Math.round(score), 100);
}

/**
 * Generate evaluation highlights based on signals
 */
function generateHighlights(signals: EvaluationSignals): string[] {
  const highlights: string[] = [];

  if ((signals.salaryAnnual || 0) >= 60000) {
    highlights.push('Competitive salary meets visa requirements');
  }
  if ((signals.experienceYears || 0) >= 3) {
    highlights.push('Strong professional experience');
  }
  if (signals.degreeLevel === 'master' || signals.degreeLevel === 'doctorate') {
    highlights.push('Advanced degree qualification');
  }
  if (signals.isShortageOccupation) {
    highlights.push('Occupation is in high demand');
  }
  if ((signals.contractDurationMonths || 0) >= 12) {
    highlights.push('Long-term employment contract');
  }

  return highlights.slice(0, 3);
}

/**
 * Generate evaluation gaps based on signals
 */
function generateGaps(signals: EvaluationSignals): string[] {
  const gaps: string[] = [];

  if ((signals.salaryAnnual || 0) < 40000) {
    gaps.push('Salary may not meet minimum threshold');
  }
  if ((signals.experienceYears || 0) < 2) {
    gaps.push('Limited professional experience');
  }
  if (!signals.degreeLevel || signals.degreeLevel === 'none') {
    gaps.push('No degree qualification provided');
  }
  if (!signals.occupationMatch && !signals.isShortageOccupation) {
    gaps.push('Occupation may not match visa requirements');
  }
  if ((signals.contractDurationMonths || 0) < 6) {
    gaps.push('Short contract duration');
  }

  return gaps.slice(0, 3);
}

/**
 * Generate advice based on score and gaps
 */
function generateAdvice(score: number, gaps: string[]): string[] {
  const advice: string[] = [];

  if (score >= 70) {
    advice.push('Strong application - proceed with visa application');
    advice.push('Ensure all supporting documents are properly certified');
    advice.push('Consider consulting with immigration lawyer for final review');
  } else if (score >= 55) {
    advice.push('Moderate application - consider strengthening weak areas');
    if (gaps.length > 0) {
      advice.push('Focus on addressing: ' + gaps[0]);
    }
    advice.push('Gather additional supporting documentation');
  } else {
    advice.push('Weak application - significant improvements needed');
    advice.push('Consider alternative visa options or routes');
    if (gaps.length > 0) {
      advice.push('Priority: address ' + gaps.slice(0, 2).join(' and '));
    }
  }

  return advice.slice(0, 3);
}

/**
 * Evaluate visa application
 */
export function evaluateByVisaId({
  visaId,
  signals,
  scoreCap
}: {
  visaId: string;
  signals: EvaluationSignals;
  scoreCap?: number;
}): VisaScoreResult {
  const visa = getVisaById(visaId);
  if (!visa) {
    throw new Error(`Visa definition not found for id ${visaId}`);
  }

  const normalizedScore = calculateScore(signals);
  const effectiveCap = scoreCap || visa.maxScore || DEFAULT_SCORE_CAP;
  const cappedScore = Math.min(normalizedScore, effectiveCap);
  const status = determineStatus(cappedScore);

  const highlights = generateHighlights(signals);
  const gaps = generateGaps(signals);
  const advice = generateAdvice(cappedScore, gaps);

  return {
    visa,
    normalizedScore,
    cappedScore,
    status,
    criteria: [], // Simplified - no detailed criteria breakdown
    highlights,
    gaps,
    advice
  };
}
