-- CreateTable
CREATE TABLE "TeamSnapshot" (
    "id" SERIAL NOT NULL,
    "teamExternalApiId" INTEGER NOT NULL,
    "payload" JSONB NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TeamSnapshot_teamExternalApiId_key" ON "TeamSnapshot"("teamExternalApiId");

-- CreateIndex
CREATE INDEX "TeamSnapshot_expiresAt_idx" ON "TeamSnapshot"("expiresAt");
