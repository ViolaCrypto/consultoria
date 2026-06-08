-- CreateTable
CREATE TABLE "ConfiguracaoConsultoria" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL DEFAULT 'Consultoria SGI',
    "nomeCompleto" TEXT,
    "slogan" TEXT,
    "corPrimaria" TEXT NOT NULL DEFAULT '#1a56db',
    "corSecundaria" TEXT NOT NULL DEFAULT '#057a55',
    "logoUrl" TEXT,
    "responsavelNome" TEXT,
    "responsavelRegistro" TEXT,
    "responsavelCargo" TEXT,
    "endereco" TEXT,
    "telefone" TEXT,
    "email" TEXT,
    "site" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConfiguracaoConsultoria_pkey" PRIMARY KEY ("id")
);
