import { EvaluationWorkflow } from '@/components/evaluation/evaluation-workflow';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, FileSearch, Globe, Zap } from 'lucide-react';

export default function Page() {
  return (
    <div className="bg-background min-h-screen">
      {/* Hero Section */}
      <section className="to-background relative overflow-hidden border-b bg-linear-to-b from-blue-50/30 pt-20 pb-16">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl" />
        </div>

        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <Badge variant="outline" className="mb-6 border-blue-200 bg-blue-50 text-blue-700">
            Policy-grounded visa intelligence
          </Badge>

          <h1 className="text-foreground text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            Visa eligibility in minutes,
            <br />
            not months
          </h1>

          <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-lg text-pretty">
            AI-powered evaluation of migration readiness with instant scoring, gap analysis, and
            actionable guidance
          </p>

          {/* Quick Features */}
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <Card className="border-border/50">
              <CardContent className="flex items-start gap-3 p-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-100">
                  <Zap className="size-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="text-foreground text-sm font-semibold">Instant Scoring</p>
                  <p className="text-muted-foreground text-xs">Rule-based evaluation in seconds</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="flex items-start gap-3 p-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-100">
                  <FileSearch className="size-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="text-foreground text-sm font-semibold">Document Intelligence</p>
                  <p className="text-muted-foreground text-xs">Extract salary, role, duration</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="flex items-start gap-3 p-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-100">
                  <Globe className="size-5 text-blue-600" />
                </div>
                <div className="text-left">
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
      <section className="bg-muted/30 border-t py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-foreground text-3xl font-semibold">How it works</h2>
            <p className="text-muted-foreground mt-3">
              Policy-aligned evaluation with transparent scoring and actionable insights
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="border-border/50 bg-background">
              <CardContent className="p-6">
                <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-blue-100">
                  <CheckCircle2 className="size-6 text-blue-600" />
                </div>
                <h3 className="text-foreground mb-2 text-lg font-semibold">Select visa pathway</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Choose from EU Blue Card, Critical Skills Employment Permit, Talent Passport, and
                  more. Each pathway has official criteria baked in.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-background">
              <CardContent className="p-6">
                <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-blue-100">
                  <FileSearch className="size-6 text-blue-600" />
                </div>
                <h3 className="text-foreground mb-2 text-lg font-semibold">
                  Add details & documents
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Upload résumés or offer letters. Our system extracts salary, experience, role, and
                  contract duration automatically.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-background">
              <CardContent className="p-6">
                <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-blue-100">
                  <Zap className="size-6 text-blue-600" />
                </div>
                <h3 className="text-foreground mb-2 text-lg font-semibold">Get instant results</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Weighted scores, strength highlights, gap analysis, and a practical playbook—all
                  in one comprehensive evaluation.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="text-muted-foreground mx-auto max-w-7xl px-4 text-center text-sm sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} Open Sphere. Built for mobility teams.</p>
        </div>
      </footer>
    </div>
  );
}
