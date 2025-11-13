import { z } from 'zod';

/**
 * Enumerates the document categories we accept for evaluation.
 */
export const DocumentTypeSchema = z.enum(['resume', 'employment_contract']);
export type DocumentType = z.infer<typeof DocumentTypeSchema>;

/**
 * Represents a single weighted criterion used to evaluate a visa application.
 */
export interface VisaCriterion {
  id: string;
  label: string;
  description: string;
  weight: number;
  /**
   * The minimum satisfaction ratio (0-1) required to count the weight at 100%.
   * When the derived metric falls short, we proportionally scale the achieved weight.
   */
  threshold?: number;
  /**
   * Optional hook-specific metadata; used by the scoring engine to determine
   * how to compute raw values (e.g., salary thresholds, min experience).
   */
  metadata?: Record<string, unknown>;
}

/**
 * Defines the business rules for a specific visa.
 */
export interface VisaDefinition {
  id: string;
  name: string;
  summary: string;
  country: string;
  requiredDocuments: DocumentType[];
  maxDurationMonths?: number;
  maxScore?: number;
  criteria: VisaCriterion[];
  rationaleTemplates: {
    success: string[];
    gaps: string[];
    advice: string[];
  };
}

/**
 * A country with one or more visa definitions.
 */
export interface CountryVisaCatalog {
  isoCode: string;
  name: string;
  visas: VisaDefinition[];
}

export const visaCatalog: CountryVisaCatalog[] = [
  {
    isoCode: 'IE',
    name: 'Ireland',
    visas: [
      {
        id: 'ie-csep',
        name: 'Critical Skills Employment Permit',
        summary:
          'Supports high-demand occupations in Ireland with fast-track residency when salary and experience thresholds are met.',
        country: 'Ireland',
        requiredDocuments: ['resume', 'employment_contract'],
        maxDurationMonths: 24,
        criteria: [
          {
            id: 'salary_high_demand',
            label: 'Salary Alignment',
            description:
              'Base salary meets or exceeds €64,000 (or €38,000 for shortage occupation list) as required by DETE.',
            weight: 30,
            metadata: {
              generalMinimum: 64000,
              shortageMinimum: 38000
            }
          },
          {
            id: 'occupation_match',
            label: 'Eligible Occupation',
            description:
              'Role matches a critical skills occupation or otherwise qualifies under DETE policy.',
            weight: 20
          },
          {
            id: 'experience_alignment',
            label: 'Experience & Qualifications',
            description:
              "Candidate's résumé demonstrates degree-level qualification and senior/strategic experience relevant to the role.",
            weight: 20
          },
          {
            id: 'contract_duration',
            label: 'Two-Year Job Offer',
            description:
              'Employment contract extends at least 24 months with the sponsoring Irish employer.',
            weight: 15,
            metadata: { minimumMonths: 24 }
          },
          {
            id: 'employer_ratio',
            label: 'Employer Eligibility',
            description:
              'Employer maintains ≥50% EEA workforce (or qualifies for the start-up waiver) and is registered with the Irish authorities.',
            weight: 15
          }
        ],
        rationaleTemplates: {
          success: [
            'Salary meets DETE thresholds for the Critical Skills Employment Permit.',
            'Role aligns with the Critical Skills Occupations List and the candidate demonstrates high-impact achievements.',
            'Employer satisfies Irish registration and workforce composition requirements.'
          ],
          gaps: [
            'Salary appears to fall short of the €64k / €38k benchmark.',
            'Résumé does not yet reflect degree-level credentials or strategic impact expected by DETE.',
            'Contract length is below the two-year minimum for this permit.',
            'Employer compliance (50% EEA workforce or start-up waiver) is unclear.'
          ],
          advice: [
            'Increase base salary or provide evidence of inclusion on the shortage occupation list.',
            'Highlight degree-level qualifications and notable achievements in the résumé.',
            'Secure a contract addendum confirming at least 24 months of employment.',
            'Confirm employer registration with the Revenue Commissioners / CRO and workforce mix.'
          ]
        }
      }
    ]
  },
  {
    isoCode: 'PL',
    name: 'Poland',
    visas: [
      {
        id: 'pl-work-permit-c',
        name: 'Work Permit Type C',
        summary:
          'Authorises delegated employees to work in a Polish branch or related entity for more than 30 days.',
        country: 'Poland',
        requiredDocuments: ['resume', 'employment_contract'],
        maxDurationMonths: 36,
        criteria: [
          {
            id: 'delegation_proof',
            label: 'Delegation Documentation',
            description:
              'Evidence of intra-group delegation, including ties between the foreign and Polish entities.',
            weight: 25
          },
          {
            id: 'contract_alignment',
            label: 'Employment Contract',
            description:
              'Contract or assignment letter specifies duties in the Polish entity and complies with Polish labour standards.',
            weight: 20
          },
          {
            id: 'experience_qualification',
            label: 'Role Qualifications',
            description:
              'Résumé substantiates skills and credentials relevant to the delegated position, including regulated profession requirements if applicable.',
            weight: 20
          },
          {
            id: 'employer_clean_record',
            label: 'Employer Statement',
            description:
              'Up-to-date employer declaration on clean legal standing (signed within 30 days) is provided.',
            weight: 15
          },
          {
            id: 'financial_terms',
            label: 'Compensation Clarity',
            description:
              'Contract references remuneration and allowances meeting Polish wage norms for the occupation.',
            weight: 20
          }
        ],
        rationaleTemplates: {
          success: [
            'Delegation paperwork demonstrates the intra-company relationship and purpose of the Polish assignment.',
            'Contract details satisfy Polish labour expectations for Work Permit Type C.',
            'Candidate résumé evidences qualifications aligned with delegated duties.'
          ],
          gaps: [
            'Delegation letter or evidence of group linkage is missing or incomplete.',
            'Employment contract lacks clarity on duties, remuneration, or contract period in Poland.',
            'Résumé does not yet reflect credentials required for the Polish assignment.',
            'Employer statement of legal standing is either missing or signed outside the 30-day window.'
          ],
          advice: [
            'Provide corporate registry extracts linking the sending and receiving entities.',
            'Amend the contract to specify Polish activities, remuneration, and delegation period.',
            'Enhance the résumé to emphasise relevant experience and regulated credentials if needed.',
            'Supply a fresh employer declaration signed within the last 30 days.'
          ]
        }
      }
    ]
  },
  {
    isoCode: 'FR',
    name: 'France',
    visas: [
      {
        id: 'fr-talent-salarie-mission',
        name: 'Talent Passport – Salarié en mission',
        summary:
          'For intra-group transferees executing strategic missions in France with elevated remuneration and seniority.',
        country: 'France',
        requiredDocuments: ['resume', 'employment_contract'],
        maxDurationMonths: 48,
        criteria: [
          {
            id: 'salary_multiplier',
            label: 'Salary Multiple',
            description:
              'Gross annual salary is ≥1.8× SMIC (≈€39,582 as of 2025) matching Talent Passport requirements.',
            weight: 30,
            metadata: { minimum: 39582 }
          },
          {
            id: 'seniority',
            label: 'Group Seniority',
            description:
              'Candidate evidences ≥3 months of seniority within the corporate group prior to transfer.',
            weight: 15
          },
          {
            id: 'contract_duration',
            label: 'Mission Contract',
            description:
              'French assignment contract exceeds 3 months and outlines mission objectives.',
            weight: 15,
            metadata: { minimumMonths: 3 }
          },
          {
            id: 'qualification_match',
            label: 'Qualifications & Mission Fit',
            description:
              'Résumé highlights advanced qualifications/experience aligned with mission scope.',
            weight: 20
          },
          {
            id: 'group_relationship',
            label: 'Corporate Linkage',
            description:
              'Documentation confirms the relationship between foreign employer and French host entity.',
            weight: 20
          }
        ],
        rationaleTemplates: {
          success: [
            'Compensation meets the 1.8× SMIC benchmark for the Salarié en mission permit.',
            'Mission contract and résumé substantiate senior-level expertise and intra-group seniority.',
            'Corporate linkage between the home and host entities is clearly documented.'
          ],
          gaps: [
            'Salary is below the required multiplier of the French minimum wage.',
            'Group seniority or mission-specific achievements are not well documented.',
            'Contract does not extend beyond three months or lacks mission detail.',
            'Corporate relationship evidence is insufficient for OFII review.'
          ],
          advice: [
            'Negotiate salary adjustments or provide proof of supplemental allowances that meet the threshold.',
            'Highlight achievements and tenure within the corporate group on the résumé and contract.',
            'Expand the mission contract to cover objectives, French host responsibilities, and duration.',
            'Attach organisational charts or corporate registry extracts demonstrating group linkage.'
          ]
        }
      }
    ]
  },
  {
    isoCode: 'DE',
    name: 'Germany',
    visas: [
      {
        id: 'de-eu-neutral-card',
        name: 'EU Blue Card',
        summary:
          'Residence permit for highly qualified professionals with recognised degrees and competitive salaries in Germany.',
        country: 'Germany',
        requiredDocuments: ['resume', 'employment_contract'],
        maxDurationMonths: 48,
        criteria: [
          {
            id: 'salary_threshold',
            label: 'Salary Threshold',
            description:
              'Annual salary meets €48,300 (standard) or €43,759.80 for shortage occupations / recent graduates (2025 values).',
            weight: 30,
            metadata: {
              standardMinimum: 48300,
              shortageMinimum: 43759.8
            }
          },
          {
            id: 'degree_equivalence',
            label: 'Degree Recognition',
            description:
              'Candidate holds a recognised university degree (or comparable experience per the new Skilled Immigration Act).',
            weight: 20
          },
          {
            id: 'occupation_shortage',
            label: 'Occupation Eligibility',
            description:
              'Role qualifies as a highly skilled position; shortage occupations include STEM, medical, and ICT leadership roles.',
            weight: 20
          },
          {
            id: 'experience_level',
            label: 'Professional Experience',
            description:
              'Résumé demonstrates at least three years of relevant professional experience or recent degree completion.',
            weight: 15
          },
          {
            id: 'contract_details',
            label: 'Contract Compliance',
            description:
              'Employment contract specifies German work location, duration ≥6 months, and statutory benefits.',
            weight: 15,
            metadata: { minimumMonths: 6 }
          }
        ],
        rationaleTemplates: {
          success: [
            "Salary meets Germany's published EU Blue Card thresholds for 2025.",
            'Degree or professional experience is compatible with German recognition rules.',
            'Role aligns with highly qualified / shortage occupation requirements.'
          ],
          gaps: [
            'Salary currently falls short of the €48,300 / €43,759.80 requirement.',
            'Degree equivalence or professional experience record is insufficiently documented.',
            'Contract duration or statutory provisions are unclear.'
          ],
          advice: [
            'Adjust base salary or demonstrate inclusion in a shortage occupation to meet lowered thresholds.',
            'Prepare degree evaluation (ANABIN) or emphasise qualifying work experience.',
            "Amend the contract to include German location, benefits, and at least six months' term."
          ]
        }
      },
      {
        id: 'de-ict-card',
        name: 'ICT Residence Permit',
        summary:
          'Temporary intra-corporate transfer permit for managers, specialists, and trainees assigned to Germany.',
        country: 'Germany',
        requiredDocuments: ['resume', 'employment_contract'],
        maxDurationMonths: 36,
        criteria: [
          {
            id: 'seniority_abroad',
            label: 'Foreign Seniority',
            description:
              'Employee has been employed by the sending company for at least six months prior to transfer.',
            weight: 20
          },
          {
            id: 'role_type',
            label: 'Eligible Role Type',
            description:
              'Position qualifies as manager, specialist, or trainee under the ICT Directive.',
            weight: 20
          },
          {
            id: 'assignment_duration',
            label: 'Assignment Duration',
            description:
              'German assignment duration respects ICT card limits (≤3 years managers/specialists, ≤1 year trainees).',
            weight: 15,
            metadata: {
              managerSpecialistMaxMonths: 36,
              traineeMaxMonths: 12
            }
          },
          {
            id: 'remuneration_local',
            label: 'Comparable Remuneration',
            description:
              'Compensation package is comparable to local German employees in equivalent roles.',
            weight: 25
          },
          {
            id: 'documentation',
            label: 'Transfer Documentation',
            description:
              'Comprehensive transfer plan, corporate linkage proof, and host entity consent are documented.',
            weight: 20
          }
        ],
        rationaleTemplates: {
          success: [
            'Employee tenure and role classification align with the ICT Directive.',
            'Assignment timeline and remuneration comply with German ICT regulations.',
            'Transfer documentation evidences the corporate relationship and purpose.'
          ],
          gaps: [
            'Employment history at the sending entity is under six months.',
            'Role does not clearly fit the manager/specialist/trainee categories.',
            'Assignment duration exceeds ICT card limits or lacks clarity.',
            'Salary package does not match local German standards for the role.',
            'Transfer documentation (plan, corporate linkage, approvals) is incomplete.'
          ],
          advice: [
            'Delay the transfer until six months of employment history is accumulated.',
            'Clarify duties and leadership scope to evidence manager/specialist status.',
            'Adjust assignment timeline or classify as trainee with ≤12 months stay.',
            'Benchmark compensation against German salary data and adjust accordingly.',
            'Compile organisational charts, delegation letters, and host entity approvals.'
          ]
        }
      }
    ]
  }
];

/**
 * Convenience map for quick lookup by visa id.
 */
export const visaIndex = visaCatalog.reduce<Record<string, VisaDefinition>>((acc, country) => {
  country.visas.forEach((visa) => {
    acc[visa.id] = visa;
  });
  return acc;
}, {});

/**
 * Lookup helper to fetch visa definitions grouped by country.
 */
export function getVisaCatalog() {
  return visaCatalog;
}

export function getVisaById(id: string) {
  return visaIndex[id];
}
