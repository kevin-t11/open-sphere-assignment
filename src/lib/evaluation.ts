import { getVisaById, type VisaDefinition } from '@/data/visa-config';

import type {
  CriterionScore,
  EvaluationSignals,
  ScoreOptions,
  VisaScoreResult
} from '@/app/types/evaluation';
import { buildNarrative, determineStatus, resolveScoreCap } from './evaluation-helpers';
import { computeCriterionRatio } from './evaluation-ratios';

function scoreCriteria(visa: VisaDefinition, signals: EvaluationSignals): CriterionScore[] {
  return visa.criteria.map((criterion) => ({
    criterionId: criterion.id,
    weight: criterion.weight,
    ratio: computeCriterionRatio({
      visaId: visa.id,
      criterionId: criterion.id,
      signals,
      metadata: criterion.metadata
    })
  }));
}

function calculateNormalizedScore(scores: CriterionScore[]): number {
  const totalWeight = scores.reduce((sum, item) => sum + item.weight, 0);
  if (!totalWeight) return 0;

  const weightedSum = scores.reduce((sum, item) => sum + item.weight * item.ratio, 0);

  return Number(((weightedSum / totalWeight) * 100).toFixed(2));
}

interface EvaluateVisaParams extends ScoreOptions {
  visa: VisaDefinition;
  signals: EvaluationSignals;
}

export function evaluateVisa({ visa, signals, scoreCap }: EvaluateVisaParams): VisaScoreResult {
  const criteriaScores = scoreCriteria(visa, signals);
  const normalizedScore = calculateNormalizedScore(criteriaScores);
  const effectiveCap = resolveScoreCap(visa, scoreCap);
  const cappedScore = Math.min(normalizedScore, effectiveCap);
  const status = determineStatus(cappedScore);
  const narrative = buildNarrative(visa, criteriaScores);

  return {
    visa,
    normalizedScore,
    cappedScore,
    status,
    criteria: criteriaScores,
    ...narrative
  };
}

interface EvaluateByVisaIdParams extends ScoreOptions {
  visaId: string;
  signals: EvaluationSignals;
}

export function evaluateByVisaId({
  visaId,
  signals,
  scoreCap
}: EvaluateByVisaIdParams): VisaScoreResult {
  const visa = getVisaById(visaId);
  if (!visa) {
    throw new Error(`Visa definition not found for id ${visaId}`);
  }

  return evaluateVisa({ visa, signals, scoreCap });
}
