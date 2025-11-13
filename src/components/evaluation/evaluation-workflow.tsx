'use client';

import type React from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, CheckCircle2, FileText, Loader2, TrendingUp, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import type { EvaluationResponse } from '@/app/types/evaluation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { visaCatalog } from '@/data/visa-config';
import { cn } from '@/lib/utils';

const degreeLevels = [
  { label: 'Doctorate', value: 'doctorate' },
  { label: 'Master', value: 'master' },
  { label: 'Bachelor', value: 'bachelor' },
  { label: 'Diploma', value: 'diploma' }
];

const formSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('A valid email is required'),
  country: z.string().min(1, 'Pick a country'),
  visaId: z.string().min(1, 'Pick a visa'),
  salaryAnnual: z.string().optional(),
  salaryCurrency: z.string().optional(),
  experienceYears: z.string().optional(),
  contractDurationMonths: z.string().optional(),
  degreeLevel: z.string().optional(),
  partnerKey: z.string().optional()
});

type FormValues = z.infer<typeof formSchema>;

type StatusVariant = 'weak' | 'moderate' | 'strong';

const statusCopy: Record<StatusVariant, { label: string; badge: string; accent: string }> = {
  weak: {
    label: 'Needs Improvement',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    accent: 'text-amber-600'
  },
  moderate: {
    label: 'Good Match',
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
    accent: 'text-blue-600'
  },
  strong: {
    label: 'Excellent Match',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    accent: 'text-emerald-600'
  }
};

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
      console.log(data);

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

  return (
    <div className="mx-auto max-w-4xl space-y-12">
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="bg-muted/20 space-y-1 border-b pb-6">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-blue-500 text-white">
              <FileText className="size-5" />
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
          <Form {...form}>
            <form className="space-y-8" onSubmit={onSubmit}>
              <div className="space-y-4">
                <h3 className="text-muted-foreground text-sm font-semibold tracking-wider uppercase">
                  Personal Information
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your full name" className="h-10" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Email Address</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="you@example.com"
                            type="email"
                            className="h-10"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-muted-foreground text-sm font-semibold tracking-wider uppercase">
                  Visa Selection
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Destination Country</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-10">
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {visaCatalog.map((country) => (
                              <SelectItem key={country.isoCode} value={country.isoCode}>
                                {country.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="visaId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Visa Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-10">
                              <SelectValue placeholder="Select visa type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {visaOptions.map((visa) => (
                              <SelectItem key={visa.id} value={visa.id}>
                                {visa.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {selectedVisa && (
                  <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-500 text-white">
                        <CheckCircle2 className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-semibold text-blue-900">{selectedVisa.name}</h4>
                          <Badge
                            variant="outline"
                            className="shrink-0 border-blue-300 bg-white text-xs text-blue-700">
                            {selectedCountry?.name}
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm leading-relaxed text-blue-800">
                          {selectedVisa.summary}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {selectedVisa.criteria.slice(0, 5).map((criterion) => (
                            <Badge
                              key={criterion.id}
                              variant="secondary"
                              className="border-0 bg-white text-xs font-normal text-blue-700">
                              {criterion.label}
                            </Badge>
                          ))}
                          {selectedVisa.criteria.length > 5 && (
                            <Badge
                              variant="secondary"
                              className="border-0 bg-white text-xs text-blue-700">
                              +{selectedVisa.criteria.length - 5} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-muted-foreground text-sm font-semibold tracking-wider uppercase">
                  Professional Details
                </h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="salaryAnnual"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Annual Salary</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="64000"
                            inputMode="numeric"
                            className="h-10"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="salaryCurrency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Currency</FormLabel>
                        <FormControl>
                          <Input placeholder="EUR" className="h-10 uppercase" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="experienceYears"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Years of Experience</FormLabel>
                        <FormControl>
                          <Input placeholder="5" inputMode="numeric" className="h-10" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contractDurationMonths"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Contract Duration (Months)
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="24" inputMode="numeric" className="h-10" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="degreeLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Education Level</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ''}>
                          <FormControl>
                            <SelectTrigger className="h-10">
                              <SelectValue placeholder="Select level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {degreeLevels.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="partnerKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Partner Key <span className="text-muted-foreground">(Optional)</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Enter key" className="h-10" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-muted-foreground text-sm font-semibold tracking-wider uppercase">
                  Supporting Documents
                </h3>

                <label htmlFor="file-upload" className="block cursor-pointer">
                  <div className="rounded-xl border-2 border-dashed border-blue-200 bg-blue-50/40 p-6 text-center transition-colors hover:border-blue-300 hover:bg-blue-50">
                    <div className="mx-auto flex max-w-sm flex-col items-center gap-3">
                      <div className="flex size-12 items-center justify-center rounded-full bg-blue-500/10 text-blue-600">
                        <FileText className="size-6" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-foreground text-base font-semibold">
                          Upload supporting documents
                        </p>
                        <p className="text-muted-foreground text-sm">
                          Click to choose files or drag and drop résumé and contract PDFs.
                        </p>
                      </div>
                    </div>
                  </div>
                </label>

                <input
                  id="file-upload"
                  accept=".pdf,.doc,.docx,.txt"
                  className="sr-only"
                  multiple
                  onChange={handleFileChange}
                  type="file"
                />

                {documents.length > 0 && (
                  <ul className="space-y-2">
                    {documents.map((file, index) => (
                      <li
                        key={`${file.name}-${index}`}
                        className="border-border bg-card flex items-center justify-between rounded-lg border px-4 py-3 text-sm">
                        <div className="flex items-center gap-3 truncate">
                          <div className="bg-muted flex size-9 shrink-0 items-center justify-center rounded-md">
                            <FileText className="text-muted-foreground size-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-foreground truncate font-medium">{file.name}</p>
                            <p className="text-muted-foreground text-xs">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive size-8"
                          onClick={(event) => {
                            event.preventDefault();
                            setDocuments((current) => current.filter((_, i) => i !== index));
                          }}>
                          <X className="size-4" />
                          <span className="sr-only">Remove file</span>
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    Upload your resume, employment contract, or other relevant documents. We extract
                    key information like salary, duration, and role details to improve your
                    evaluation accuracy.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  disabled={isSubmitting}
                  size="lg"
                  type="submit"
                  className="h-12 w-full bg-blue-600 text-base font-semibold text-white shadow-sm hover:bg-blue-700">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 size-5 animate-spin" />
                      Evaluating Application...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="mr-2 size-5" />
                      Calculate Eligibility Score
                    </>
                  )}
                </Button>
                <p className="text-muted-foreground mt-3 text-center text-xs">
                  Results based on official visa criteria and current immigration policies
                </p>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="space-y-4 border-b pb-6">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <CardTitle className="text-foreground text-xl font-semibold">
                  Evaluation Results
                </CardTitle>
                <CardDescription className="mt-1 text-sm">
                  {statusCopy[result.status as StatusVariant]?.label ?? 'Assessment Complete'}
                </CardDescription>
              </div>
              <Badge
                className={cn(
                  'shrink-0 text-xs font-medium',
                  statusCopy[result.status as StatusVariant]?.badge ??
                    'border-blue-200 bg-blue-50 text-blue-700'
                )}>
                {result.status.toUpperCase()}
              </Badge>
            </div>

            <div className="space-y-3 rounded-lg bg-linear-to-br from-blue-50 to-blue-100/50 p-5">
              <div className="flex items-end justify-between">
                <span className="text-sm font-medium text-blue-900">Overall Score</span>
                <div className="text-right">
                  <div className="text-4xl font-bold text-blue-600">{result.score.toFixed(0)}</div>
                  <div className="text-xs text-blue-700">out of 100</div>
                </div>
              </div>
              <Progress className="h-3 bg-blue-200" value={result.score} />
              <p className="text-xs text-blue-800">
                Raw score: {Math.round(result.normalizedScore)} • Capped: {Math.round(result.score)}
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-8 pt-6">
            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-5 text-emerald-600" />
                  <h4 className="text-foreground text-sm font-semibold">Key Strengths</h4>
                </div>
                {result.highlights.length > 0 ? (
                  <ul className="space-y-2">
                    {result.highlights.map((item, index) => (
                      <li
                        key={index}
                        className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-3 text-sm leading-relaxed text-emerald-900">
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    No significant strengths identified
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="size-5 text-amber-600" />
                  <h4 className="text-foreground text-sm font-semibold">Areas to Address</h4>
                </div>
                {result.gaps.length > 0 ? (
                  <ul className="space-y-2">
                    {result.gaps.map((item, index) => (
                      <li
                        key={index}
                        className="rounded-lg border border-amber-200 bg-amber-50/50 p-3 text-sm leading-relaxed text-amber-900">
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground text-sm">No critical gaps found</p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="size-5 text-blue-600" />
                <h4 className="text-foreground text-sm font-semibold">Recommended Actions</h4>
              </div>
              {result.advice.length > 0 ? (
                <ul className="grid gap-2 sm:grid-cols-2">
                  {result.advice.map((item, index) => (
                    <li
                      key={index}
                      className="rounded-lg border border-blue-200 bg-blue-50/50 p-4 text-sm leading-relaxed text-blue-900">
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground text-sm">Ready to proceed with application</p>
              )}
            </div>

            {result.documents.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="text-muted-foreground size-5" />
                  <h4 className="text-foreground text-sm font-semibold">Document Analysis</h4>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {result.documents.map((doc, index) => (
                    <div key={index} className="bg-card rounded-lg border p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                          {doc.type.replace('_', ' ')}
                        </span>
                        {doc.salaryAnnual && (
                          <span className="text-foreground text-sm font-semibold">
                            {doc.salaryAnnual.toLocaleString()} {doc.salaryCurrency}
                          </span>
                        )}
                      </div>
                      {doc.roleKeywords.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {doc.roleKeywords.map((keyword, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      )}
                      {doc.contractDurationMonths && (
                        <p className="text-muted-foreground mt-2 text-xs">
                          Duration: {doc.contractDurationMonths} months
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
