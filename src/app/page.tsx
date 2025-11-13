import { Container } from '@/components/container';
import { EvaluationWorkflow } from '@/components/evaluation/evaluation-workflow';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  CheckTickIcon,
  FileSearchIcon,
  GlobeIcon,
  PlaneTakeoffIcon,
  ResultIcon,
  SearchIcon,
  ZapIcon
} from '@/icons';
import { cn } from '@/lib/utils';

export default function Page() {
  return (
    <Container>
      <div className="relative z-10 min-h-screen">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-linear-to-b from-neutral-50/30 pt-20 pb-16">
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute top-0 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-neutral-500/10 blur-3xl" />
          </div>

          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <Badge
              variant="outline"
              className={cn(
                'group mb-6 border-neutral-200 bg-neutral-300 p-2 text-sm font-medium text-neutral-700',
                'motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-top-4 motion-safe:duration-500'
              )}>
              <span>
                <PlaneTakeoffIcon className="size-4 transition-transform duration-300 group-hover:scale-110" />{' '}
              </span>
              <span>Policy-grounded visa intelligence</span>
            </Badge>

            <h1
              className={cn(
                'mt-4 bg-linear-to-b from-neutral-700 via-neutral-900 to-neutral-900 bg-clip-text text-4xl font-semibold tracking-tight text-balance text-transparent sm:text-5xl lg:text-6xl',
                'motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-4 motion-safe:delay-150 motion-safe:duration-700'
              )}>
              Visa eligibility in minutes,
              <br />
              not months
            </h1>

            <p
              className={cn(
                'text-muted-foreground mx-auto mt-6 max-w-2xl text-lg text-pretty',
                'motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-3 motion-safe:delay-200 motion-safe:duration-700'
              )}>
              AI-powered evaluation of migration readiness with instant scoring, gap analysis, and
              actionable guidance
            </p>

            {/* Quick Features */}
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <Card
                className={cn(
                  'border-border/50 border py-4',
                  'hover:-translate-y-1 hover:shadow-[inset_-12px_-8px_40px_#46464620]',
                  'transition-transform duration-300',
                  'motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-8 motion-safe:delay-200 motion-safe:duration-700'
                )}>
                <CardContent className={cn('flex items-start gap-3 p-4')}>
                  <div className="flex size-8 shrink-0 flex-col items-center justify-center text-center">
                    <ZapIcon />
                  </div>
                  <div className="space-y-1 text-left">
                    <p className="text-foreground text-sm font-semibold">Instant Scoring</p>
                    <p className="text-muted-foreground text-xs">
                      Rule-based evaluation in seconds
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card
                className={cn(
                  'border-border/50 border py-4',
                  'hover:-translate-y-1 hover:shadow-[inset_-12px_-8px_40px_#46464620]',
                  'transition-transform duration-300',
                  'motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-8 motion-safe:delay-250 motion-safe:duration-700'
                )}>
                <CardContent className="flex items-start gap-3 p-4">
                  <div className="flex size-8 shrink-0 flex-col items-center justify-center text-center">
                    <FileSearchIcon />
                  </div>
                  <div className="space-y-1 text-left">
                    <p className="text-foreground text-sm font-semibold">Document Intelligence</p>
                    <p className="text-muted-foreground text-xs">Extract salary, role, duration</p>
                  </div>
                </CardContent>
              </Card>

              <Card
                className={cn(
                  'border-border/50 border py-4',
                  'hover:-translate-y-1 hover:shadow-[inset_-12px_-8px_40px_#46464620]',
                  'transition-transform duration-300',
                  'motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-8 motion-safe:delay-300 motion-safe:duration-700'
                )}>
                <CardContent className="flex items-start gap-3 p-4">
                  <div className="flex size-8 shrink-0 flex-col items-center justify-center text-center">
                    <GlobeIcon />
                  </div>
                  <div className="space-y-1 text-left">
                    <p className="text-foreground text-sm font-semibold">Multi-Country</p>
                    <p className="text-muted-foreground text-xs">EU Blue Card, Critical Skills +</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Form Section */}
        <section className="py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <EvaluationWorkflow />
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <h2
                className={cn(
                  'text-foreground text-3xl font-semibold',
                  'motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-700'
                )}>
                How it works
              </h2>
              <p
                className={cn(
                  'text-muted-foreground mt-3',
                  'motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-2 motion-safe:delay-100 motion-safe:duration-700'
                )}>
                Policy-aligned evaluation with transparent scoring and actionable insights
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <Card
                className={cn(
                  'border-border/50 bg-background shadow-sm transition-transform duration-300 hover:translate-y-[-4px] hover:shadow-[inset_-12px_-8px_40px_#46464620]',
                  'motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-8 motion-safe:delay-150 motion-safe:duration-700'
                )}>
                <CardContent className="p-6">
                  <div className="mb-4 flex size-12 items-center justify-center">
                    <CheckTickIcon />
                  </div>
                  <h3 className="text-foreground mb-2 text-lg font-semibold">
                    Select visa pathway
                  </h3>
                  <p className="text-sm leading-relaxed text-neutral-500">
                    Choose from EU Blue Card, Critical Skills Employment Permit, Talent Passport,
                    and more. Each pathway has official criteria baked in.
                  </p>
                </CardContent>
              </Card>

              <Card
                className={cn(
                  'border-border/50 transition-transform duration-300 hover:translate-y-[-4px] hover:shadow-[inset_-12px_-8px_40px_#46464620]',
                  'motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-8 motion-safe:delay-200 motion-safe:duration-700'
                )}>
                <CardContent className="p-6">
                  <div className="mb-4 flex size-12 items-center justify-center">
                    <SearchIcon />
                  </div>
                  <h3 className="text-foreground mb-2 text-lg font-semibold">
                    Add details & documents
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Upload resumes or offer letters. Our system extracts salary, experience, role,
                    and contract duration automatically.
                  </p>
                </CardContent>
              </Card>

              <Card
                className={cn(
                  'border-border/50 transition-transform duration-300 hover:translate-y-[-4px] hover:shadow-[inset_-12px_-8px_40px_#46464620]',
                  'motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-8 motion-safe:delay-250 motion-safe:duration-700'
                )}>
                <CardContent className="p-6">
                  <div className="mb-4 flex size-12 items-center justify-center">
                    <ResultIcon />
                  </div>
                  <h3 className="text-foreground mb-2 text-lg font-semibold">
                    Get instant results
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Weighted scores, strength highlights, gap analysis, and a practical guide—all in
                    one comprehensive evaluation.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t bg-neutral-50/50 py-4">
          <div className="text-muted-foreground mx-auto max-w-7xl px-4 text-center text-sm sm:px-6 lg:px-8">
            <p>© {new Date().getFullYear()} Open Sphere. Built for mobility teams.</p>
          </div>
        </footer>
      </div>
    </Container>
  );
}
