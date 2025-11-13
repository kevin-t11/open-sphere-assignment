import type { CriterionScore, EvaluationStatus, RationaleBundle } from '@/app/types/evaluation';
import type { VisaDefinition } from '@/data/visa-config';

export const STATUS_THRESHOLDS: Record<EvaluationStatus, number> = {
  weak: 0,
  moderate: 0.55,
  strong: 0.7
};

export const DEFAULT_SCORE_CAP = Number.parseInt(process.env.MAX_SCORE_CAP ?? '', 10) || 85;

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function resolveScoreCap(visa: VisaDefinition, override?: number): number {
  const base = DEFAULT_SCORE_CAP;
  const effectiveCap = override ?? base;
  const visaCap = visa.maxScore ?? base;
  return Math.min(effectiveCap, visaCap);
}

export function determineStatus(score: number): EvaluationStatus {
  if (score >= STATUS_THRESHOLDS.strong * 100) {
    return 'strong';
  }

  if (score >= STATUS_THRESHOLDS.moderate * 100) {
    return 'moderate';
  }

  return 'weak';
}

export function buildNarrative(visa: VisaDefinition, scores: CriterionScore[]): RationaleBundle {
  const successThreshold = 0.75;
  const { success, gaps, advice } = visa.rationaleTemplates;
  const passed = scores.filter((item) => item.ratio >= successThreshold);
  const failed = scores.filter((item) => item.ratio < successThreshold);

  return {
    highlights: passed.length > 0 ? success.slice(0, Math.min(success.length, 3)) : [],
    gaps: failed.length > 0 ? gaps.slice(0, Math.min(gaps.length, 3)) : [],
    advice: failed.length > 0 ? advice.slice(0, Math.min(advice.length, 3)) : []
  };
}
