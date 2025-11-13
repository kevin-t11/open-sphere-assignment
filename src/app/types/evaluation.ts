import type { VisaDefinition } from '@/data/visa-config';

export type EvaluationStatus = 'weak' | 'moderate' | 'strong';

export interface EvaluationSignals {
  salaryAnnual?: number;
  salaryCurrency?: string;
  /** Occupation fit indicators. */
  isShortageOccupation?: boolean;
  occupationMatch?: boolean;
  /** Education and qualification */
  hasRecognisedDegree?: boolean;
  degreeLevel?: 'none' | 'bachelor' | 'master' | 'doctorate';
  /** Experience and contract */
  experienceYears?: number;
  contractDurationMonths?: number;
  /** Employer compliance metrics. */
  employerEeShare?: number;
  employerStartUpSupport?: boolean;
  seniorityMonthsInGroup?: number;
  /** Documentary evidence flags. */
  hasCorporateLinkProof?: boolean;
  delegationDocsComplete?: boolean;
  employerStatementValid?: boolean;
  compensationClarity?: boolean;
  missionObjectivesDocumented?: boolean;
  remunerationComparable?: boolean;
  assignmentDurationMonths?: number;
  assignmentRoleType?: 'manager' | 'specialist' | 'trainee';
  transferDocumentationComplete?: boolean;
}

export interface CriterionScore {
  criterionId: string;
  weight: number;
  ratio: number;
}

export interface VisaScoreResult {
  visa: VisaDefinition;
  normalizedScore: number;
  cappedScore: number;
  status: EvaluationStatus;
  criteria: CriterionScore[];
  highlights: string[];
  gaps: string[];
  advice: string[];
}

export interface RationaleBundle {
  highlights: string[];
  gaps: string[];
  advice: string[];
}

export interface ScoreOptions {
  scoreCap?: number;
}

export interface EvaluationDocumentInsight {
  type: string;
  roleKeywords: string[];
  salaryAnnual?: number;
  salaryCurrency?: string;
  contractDurationMonths?: number;
}

export interface EvaluationResponse {
  visaId: string;
  score: number;
  normalizedScore: number;
  status: EvaluationStatus;
  highlights: string[];
  gaps: string[];
  advice: string[];
  documents: EvaluationDocumentInsight[];
}
