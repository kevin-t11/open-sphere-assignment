import type { EvaluationSignals } from '@/app/types/evaluation';
import { clamp } from './evaluation-helpers';

interface RatioContext {
  criterionId: string;
  visaId: string;
  signals: EvaluationSignals;
  metadata?: Record<string, unknown>;
}

type RatioCalculator = (context: RatioContext) => number;

const asNumber = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
};

const salaryCalculator: RatioCalculator = ({ signals, metadata }) => {
  const salary = signals.salaryAnnual ?? 0;
  if (!salary || !metadata) return 0;

  const standardThreshold =
    asNumber(metadata.standardMinimum) ??
    asNumber(metadata.generalMinimum) ??
    asNumber(metadata.minimum);
  const shortageThreshold =
    asNumber(metadata.shortageMinimum) ??
    asNumber(metadata.minimum) ??
    asNumber(metadata.standardMinimum);

  const isShortage = signals.isShortageOccupation ?? signals.occupationMatch ?? false;
  const threshold = isShortage
    ? (shortageThreshold ?? standardThreshold)
    : (standardThreshold ?? shortageThreshold);

  if (!threshold) return 0;
  return salary / threshold;
};

const occupationCalculator: RatioCalculator = ({ signals }) =>
  signals.occupationMatch || signals.isShortageOccupation ? 1 : 0;

const experienceCalculator: RatioCalculator = ({ signals }) => {
  const experienceYears = signals.experienceYears ?? 0;
  const experienceScore = clamp(experienceYears / 5, 0, 1);

  const degreeScore =
    signals.degreeLevel === 'master' || signals.degreeLevel === 'doctorate'
      ? 1
      : signals.degreeLevel === 'bachelor'
        ? 0.8
        : 0;

  return Math.max(experienceScore, degreeScore);
};

const contractDurationCalculator: RatioCalculator = ({ signals, metadata }) => {
  const minimumMonths = asNumber(metadata?.minimumMonths) ?? asNumber(metadata?.minimum) ?? 6;
  const contractMonths = signals.contractDurationMonths ?? 0;
  return contractMonths / minimumMonths;
};

const employerMixCalculator: RatioCalculator = ({ signals }) => {
  if (signals.employerEeShare && signals.employerEeShare >= 0.5) {
    return 1;
  }
  if (signals.employerStartUpSupport) {
    return 0.7;
  }
  return 0;
};

const booleanFlagCalculator =
  (field: keyof EvaluationSignals, fallback = 0): RatioCalculator =>
  ({ signals }) =>
    signals[field] ? 1 : fallback;

const seniorityCalculator: RatioCalculator = ({ criterionId, signals }) => {
  const months = signals.seniorityMonthsInGroup ?? 0;
  const minMonths = criterionId === 'seniority' ? 3 : 6;
  return months / minMonths;
};

const qualificationCalculator: RatioCalculator = ({ signals }) => {
  if (!signals.missionObjectivesDocumented) return 0;
  const experienceYears = signals.experienceYears ?? 0;
  return clamp(experienceYears / 5, 0, 1);
};

const degreeCalculator: RatioCalculator = ({ signals }) => {
  if (signals.hasRecognisedDegree) return 1;
  return signals.degreeLevel === 'bachelor' ? 0.7 : 0;
};

const assignmentDurationCalculator: RatioCalculator = ({ signals, metadata }) => {
  const duration = signals.assignmentDurationMonths ?? 0;
  const managerMax =
    asNumber(metadata?.managerSpecialistMaxMonths) ?? asNumber(metadata?.maximumMonths) ?? 36;
  const traineeMax =
    asNumber(metadata?.traineeMaxMonths) ?? asNumber(metadata?.maximumMonths) ?? 12;

  if (signals.assignmentRoleType === 'trainee') {
    if (duration <= traineeMax) return 1;
    return traineeMax / duration;
  }

  if (duration <= managerMax) return 1;
  return managerMax / duration;
};

const remunerationCalculator: RatioCalculator = ({ signals }) =>
  signals.remunerationComparable ? 1 : 0.3;

const documentationCalculator: RatioCalculator = ({ signals }) =>
  signals.transferDocumentationComplete && signals.hasCorporateLinkProof ? 1 : 0;

const ratioCalculators: Record<string, RatioCalculator> = {
  salary_high_demand: salaryCalculator,
  salary_threshold: salaryCalculator,
  salary_multiplier: salaryCalculator,
  occupation_match: occupationCalculator,
  occupation_shortage: occupationCalculator,
  experience_alignment: experienceCalculator,
  experience_level: experienceCalculator,
  experience_qualification: experienceCalculator,
  contract_duration: contractDurationCalculator,
  contract_details: contractDurationCalculator,
  employer_ratio: employerMixCalculator,
  delegation_proof: booleanFlagCalculator('delegationDocsComplete'),
  contract_alignment: booleanFlagCalculator('compensationClarity'),
  employer_clean_record: booleanFlagCalculator('employerStatementValid'),
  financial_terms: booleanFlagCalculator('compensationClarity'),
  seniority: seniorityCalculator,
  seniority_abroad: seniorityCalculator,
  qualification_match: qualificationCalculator,
  group_relationship: booleanFlagCalculator('hasCorporateLinkProof'),
  degree_equivalence: degreeCalculator,
  role_type: booleanFlagCalculator('assignmentRoleType'),
  assignment_duration: assignmentDurationCalculator,
  remuneration_local: remunerationCalculator,
  documentation: documentationCalculator
};

export function computeCriterionRatio(context: RatioContext): number {
  const calculator = ratioCalculators[context.criterionId];
  if (!calculator) {
    return 0;
  }

  const value = calculator(context);
  return clamp(value, 0, 1);
}
