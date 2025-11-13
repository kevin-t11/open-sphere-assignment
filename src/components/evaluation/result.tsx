import { AlertCircle, CheckCircle2, FileText, TrendingUp } from 'lucide-react';

import type { EvaluationResponse } from '@/app/types/evaluation';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

type StatusVariant = 'weak' | 'moderate' | 'strong';

const statusCopy: Record<StatusVariant, { label: string; badge: string }> = {
  weak: {
    label: 'Needs Improvement',
    badge: 'bg-amber-50 text-amber-700 border-amber-200'
  },
  moderate: {
    label: 'Good Match',
    badge: 'bg-neutral-50 text-neutral-700 border-neutral-200'
  },
  strong: {
    label: 'Excellent Match',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  }
};

interface EvaluationResultProps {
  result: EvaluationResponse;
}

export function EvaluationResult({ result }: EvaluationResultProps) {
  const status = statusCopy[result.status as StatusVariant];

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="space-y-4 border-b pb-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <CardTitle className="text-foreground text-xl font-semibold">
              Evaluation Results
            </CardTitle>
            <CardDescription className="mt-1 text-sm">
              {status?.label ?? 'Assessment Complete'}
            </CardDescription>
          </div>
          <Badge
            className={cn(
              'shrink-0 text-xs font-medium',
              status?.badge ?? 'border-neutral-200 bg-neutral-50 text-neutral-700'
            )}>
            {result.status.toUpperCase()}
          </Badge>
        </div>

        <div className="space-y-3 rounded-lg bg-linear-to-br from-neutral-50 to-neutral-100/50 p-5">
          <div className="flex items-end justify-between">
            <span className="text-sm font-medium text-neutral-900">Overall Score</span>
            <div className="text-right">
              <div className="text-4xl font-bold text-neutral-600">{result.score.toFixed(0)}</div>
              <div className="text-xs text-neutral-700">out of 100</div>
            </div>
          </div>
          <Progress className="h-3 bg-neutral-200" value={result.score} />
          <p className="text-xs text-neutral-800">
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
              <p className="text-muted-foreground text-sm">No significant strengths identified</p>
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
            <TrendingUp className="size-5 text-neutral-600" />
            <h4 className="text-foreground text-sm font-semibold">Recommended Actions</h4>
          </div>
          {result.advice.length > 0 ? (
            <ul className="grid gap-2 sm:grid-cols-2">
              {result.advice.map((item, index) => (
                <li
                  key={index}
                  className="rounded-lg border border-neutral-200 bg-neutral-50/50 p-4 text-sm leading-relaxed text-neutral-900">
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
  );
}
