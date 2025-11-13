-- CreateTable
CREATE TABLE "Evaluation" (
    "id" TEXT NOT NULL,
    "partnerKey" TEXT,
    "visaId" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "normalizedScore" DOUBLE PRECISION NOT NULL,
    "cappedScore" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL,
    "highlights" TEXT[],
    "gaps" TEXT[],
    "advice" TEXT[],
    "submission" JSONB NOT NULL,
    "signals" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Evaluation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Evaluation_partnerKey_idx" ON "Evaluation"("partnerKey");
