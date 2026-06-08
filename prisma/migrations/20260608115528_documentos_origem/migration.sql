-- AlterTable
ALTER TABLE "DocProjeto" ADD COLUMN     "geradoPorIA" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "requisitosOrigem" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "scoreQualidade" INTEGER;
