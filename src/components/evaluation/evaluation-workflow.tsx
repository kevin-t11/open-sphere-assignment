'use client';

import type React from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import type { EvaluationResponse } from '@/app/types/evaluation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { visaCatalog } from '@/data/visa-config';

import { FileIcon } from '@/icons';
import { EvaluationForm } from './form';
import { EvaluationResult } from './result';

export const formSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters long' })
    .nonempty({ message: 'Name is required' }),
  email: z.email({ message: 'Enter a valid email address' }),
  country: z.string().nonempty({ message: 'Country is required' }),
  visaId: z.string().nonempty({ message: 'Visa is required' }),
  salaryAnnual: z.string().nonempty({ message: 'Annual salary is required' }),
  salaryCurrency: z.string().nonempty({ message: 'Salary currency is required' }),
  experienceYears: z.string().nonempty({ message: 'Experience years is required' }),
  contractDurationMonths: z
    .string()
    .nonempty({ message: 'Contract duration (months) is required' }),
  degreeLevel: z.string().nonempty({ message: 'Degree level is required' }),
  partnerKey: z.string().optional()
});

export type FormValues = z.infer<typeof formSchema>;

function parseNumber(value?: string) {
  if (!value) return undefined;
  const parsed = Number(value.toString().replace(/,/g, ''));
  return Number.isNaN(parsed) ? undefined : parsed;
}

interface SubmitPayload {
  name: string;
  email: string;
  visaId: string;
  partnerKey?: string;
  salaryAnnual?: number;
  salaryCurrency?: string;
  experienceYears?: number;
  contractDurationMonths?: number;
  degreeLevel?: string;
}

export function EvaluationWorkflow() {
  const defaultCountry = useMemo(() => visaCatalog[0]?.isoCode ?? '', []);
  const defaultVisa = useMemo(() => visaCatalog[0]?.visas[0]?.id ?? '', []);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      country: defaultCountry,
      visaId: defaultVisa,
      salaryCurrency: '',
      salaryAnnual: '',
      experienceYears: '',
      contractDurationMonths: '',
      degreeLevel: '',
      partnerKey: ''
    }
  });

  const [documents, setDocuments] = useState<File[]>([]);
  const [result, setResult] = useState<EvaluationResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const watchCountry = form.watch('country');
  const watchVisaId = form.watch('visaId');

  const selectedCountry = useMemo(
    () => visaCatalog.find((country) => country.isoCode === watchCountry),
    [watchCountry]
  );

  const visaOptions = useMemo(() => selectedCountry?.visas ?? [], [selectedCountry]);

  const selectedVisa = useMemo(
    () => visaOptions.find((visa) => visa.id === watchVisaId) ?? visaOptions[0],
    [visaOptions, watchVisaId]
  );

  useEffect(() => {
    if (!watchCountry && defaultCountry) {
      form.setValue('country', defaultCountry);
      return;
    }

    const firstVisa = visaOptions[0];
    if (firstVisa && !visaOptions.some((visa) => visa.id === watchVisaId)) {
      form.setValue('visaId', firstVisa.id);
    }
  }, [defaultCountry, form, watchCountry, visaOptions, watchVisaId]);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files ? Array.from(event.target.files) : [];
    setDocuments(files);
  }

  async function submitEvaluation(values: FormValues) {
    const payload: SubmitPayload = {
      name: values.name,
      email: values.email,
      visaId: values.visaId,
      partnerKey: values.partnerKey || undefined,
      salaryAnnual: parseNumber(values.salaryAnnual),
      salaryCurrency: values.salaryCurrency || undefined,
      experienceYears: parseNumber(values.experienceYears),
      contractDurationMonths: parseNumber(values.contractDurationMonths),
      degreeLevel: values.degreeLevel || undefined
    };

    const signals = {
      salaryAnnual: payload.salaryAnnual,
      salaryCurrency: payload.salaryCurrency,
      experienceYears: payload.experienceYears,
      contractDurationMonths: payload.contractDurationMonths,
      degreeLevel: payload.degreeLevel
    };

    const formData = new FormData();
    formData.append(
      'payload',
      JSON.stringify({
        visaId: payload.visaId,
        applicant: {
          name: payload.name,
          email: payload.email,
          partnerKey: payload.partnerKey
        },
        notifyApplicant: true,
        signals
      })
    );

    documents.forEach((file) => {
      formData.append('documents', file);
    });

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/evaluations', {
        method: 'POST',
        body: formData
      });

      const data = (await response.json()) as EvaluationResponse & {
        error?: string;
      };
      // console.log(data);

      if (!response.ok) {
        throw new Error(data.error || 'Unable to process evaluation');
      }

      setResult(data);
      toast.success('Evaluation complete', {
        description: `${selectedVisa?.name ?? 'Visa'} score calculated successfully.`
      });
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Unexpected error');
    } finally {
      setIsSubmitting(false);
    }
  }

  const onSubmit = form.handleSubmit(submitEvaluation);
  const handleRemoveDocument = (index: number) => {
    setDocuments((current) => current.filter((_, i) => i !== index));
  };

  return (
    <div className="mx-auto max-w-4xl space-y-12">
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="bg-muted/20 space-y-1 border-b pb-6">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 flex-col items-center justify-center text-center">
              <FileIcon />
            </div>
            <div>
              <CardTitle className="text-foreground text-xl font-semibold">
                Start Evaluation
              </CardTitle>
              <CardDescription className="text-sm">
                Complete the form to assess visa eligibility
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <EvaluationForm
            documents={documents}
            form={form}
            isSubmitting={isSubmitting}
            onFileChange={handleFileChange}
            onRemoveDocument={handleRemoveDocument}
            onSubmit={onSubmit}
            selectedCountry={selectedCountry}
            selectedVisa={selectedVisa}
            visaOptions={visaOptions}
          />
        </CardContent>
      </Card>

      {result && <EvaluationResult result={result} />}
    </div>
  );
}
