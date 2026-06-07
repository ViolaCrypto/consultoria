CREATE EXTENSION IF NOT EXISTS vector;

-- CreateTable
CREATE TABLE "MemoriaConsultoria" (
    "id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "setor" TEXT NOT NULL,
    "conteudo" TEXT NOT NULL,
    "metadados" JSONB,
    "embedding" vector(1536),
    "aprovadoEm" TIMESTAMP(3),
    "projetoId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MemoriaConsultoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PadraoDocumento" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "setor" TEXT NOT NULL,
    "conteudo" TEXT NOT NULL,
    "aprovadoEmAuditoria" BOOLEAN NOT NULL DEFAULT false,
    "vezes_usado" INTEGER NOT NULL DEFAULT 0,
    "score_medio" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PadraoDocumento_pkey" PRIMARY KEY ("id")
);
