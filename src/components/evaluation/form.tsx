import type { BaseSyntheticEvent, ChangeEvent } from 'react';
import type { UseFormReturn } from 'react-hook-form';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import type { CountryVisaCatalog, VisaDefinition } from '@/data/visa-config';
import { visaCatalog } from '@/data/visa-config';
import { FileText, Loader2 as LoaderIcon, TrendingUp as TrendingUpIcon, X } from 'lucide-react';

import { CheckCircleIcon, InfoIcon, UploadIcon } from '@/icons';
import type { FormValues } from './evaluation-workflow';

const degreeLevels = [
  { label: 'Doctorate', value: 'doctorate' },
  { label: 'Master', value: 'master' },
  { label: 'Bachelor', value: 'bachelor' },
  { label: 'Diploma', value: 'diploma' }
];

interface EvaluationFormProps {
  form: UseFormReturn<FormValues>;
  onSubmit: (event?: BaseSyntheticEvent) => void | Promise<void>;
  selectedCountry?: CountryVisaCatalog;
  selectedVisa?: VisaDefinition;
  visaOptions: VisaDefinition[];
  documents: File[];
  isSubmitting: boolean;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemoveDocument: (index: number) => void;
}

export function EvaluationForm({
  form,
  onSubmit,
  selectedCountry,
  selectedVisa,
  visaOptions,
  documents,
  isSubmitting,
  onFileChange,
  onRemoveDocument
}: EvaluationFormProps) {
  return (
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
                    <Input placeholder="you@example.com" type="email" className="h-10" {...field} />
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
            <div className="rounded-lg border border-neutral-200 bg-neutral-50/50 p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex size-8 shrink-0 flex-col items-center justify-center text-center">
                  <CheckCircleIcon />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-semibold text-neutral-900">{selectedVisa.name}</h4>
                    <Badge
                      variant="outline"
                      className="shrink-0 border-neutral-400 bg-neutral-200/90 text-xs text-neutral-900">
                      {selectedCountry?.name}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-neutral-800">
                    {selectedVisa.summary}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedVisa.criteria.slice(0, 5).map((criterion) => (
                      <Badge
                        key={criterion.id}
                        variant="secondary"
                        className="border-0 bg-neutral-200/90 text-xs font-normal text-neutral-900">
                        {criterion.label}
                      </Badge>
                    ))}
                    {selectedVisa.criteria.length > 5 && (
                      <Badge
                        variant="secondary"
                        className="border-0 bg-neutral-200/90 text-xs text-neutral-900">
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
                    <Input placeholder="64000" inputMode="numeric" className="h-10" {...field} />
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
                  <FormLabel className="text-sm font-medium">Contract Duration (Months)</FormLabel>
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
            <div className="group rounded-xl border-2 border-dashed border-neutral-200 bg-neutral-50/40 p-6 text-center transition-colors hover:border-neutral-400 hover:bg-neutral-50">
              <div className="mx-auto flex max-w-sm flex-col items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-full bg-neutral-500/10 text-neutral-600">
                  <UploadIcon className="size-6 transition-transform duration-300 group-hover:scale-110" />
                </div>
                <div className="space-y-1">
                  <p className="text-foreground text-base font-semibold">
                    Upload supporting documents
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Click to choose files or drag and drop resumes and contract PDFs.
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
            onChange={onFileChange}
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
                      onRemoveDocument(index);
                    }}>
                    <X className="size-4" />
                    <span className="sr-only">Remove file</span>
                  </Button>
                </li>
              ))}
            </ul>
          )}

          <div className="bg-muted/50 flex items-start gap-2 rounded-lg p-4">
            <InfoIcon className="size-7" />
            <div className="text-muted-foreground text-[13px] leading-relaxed">
              Upload your resume, employment contract, or other relevant documents. We extract key
              information like salary, duration, and role details to improve your evaluation
              accuracy.
            </div>
          </div>
        </div>

        <div className="pt-2">
          <div className="flex w-full flex-col items-center justify-center gap-6">
            <button
              aria-busy={isSubmitting}
              className="group relative w-full cursor-pointer overflow-hidden rounded-xl border-2 border-neutral-600 bg-linear-to-b from-neutral-700 to-neutral-800 px-6 py-3 shadow-lg transition-all duration-300 hover:shadow-xl hover:brightness-110 active:scale-[0.95] disabled:cursor-not-allowed disabled:opacity-80"
              disabled={isSubmitting}
              type="submit">
              <span className="absolute inset-0 rounded-xl bg-linear-to-b from-neutral-50/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <span className="relative z-10 flex items-center justify-center gap-2 text-base font-semibold text-white">
                {isSubmitting ? (
                  <>
                    <LoaderIcon className="size-5 animate-spin" />
                    Evaluating Application...
                  </>
                ) : (
                  <>
                    <TrendingUpIcon className="size-5 transition-transform duration-300 group-hover:scale-110" />
                    Calculate Eligibility Score
                  </>
                )}
              </span>
            </button>
          </div>
          <p className="text-muted-foreground mt-3 text-center text-xs">
            Results based on official visa criteria and current immigration policies
          </p>
        </div>
      </form>
    </Form>
  );
}
