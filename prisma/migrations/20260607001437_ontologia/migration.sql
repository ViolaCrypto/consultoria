-- AlterTable
ALTER TABLE "Empresa" ADD COLUMN     "setorId" TEXT;

-- CreateTable
CREATE TABLE "SetorIndustrial" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "descricao" TEXT,
    "cnaes" TEXT[],

    CONSTRAINT "SetorIndustrial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcessoTipico" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "setorId" TEXT NOT NULL,

    CONSTRAINT "ProcessoTipico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RiscoSST" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "nrsAplicaveis" TEXT[],
    "processoId" TEXT NOT NULL,

    CONSTRAINT "RiscoSST_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AspectoAmbiental" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "impacto" TEXT,
    "processoId" TEXT NOT NULL,

    CONSTRAINT "AspectoAmbiental_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequisitoLegal" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "tipo" TEXT NOT NULL,
    "orgao" TEXT NOT NULL,
    "setores" TEXT[],
    "obrigatorio" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "RequisitoLegal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentoObrigatorio" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "setores" TEXT[],
    "nrBase" TEXT,
    "periodicidade" TEXT,
    "observacoes" TEXT,

    CONSTRAINT "DocumentoObrigatorio_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SetorIndustrial_codigo_key" ON "SetorIndustrial"("codigo");

-- AddForeignKey
ALTER TABLE "Empresa" ADD CONSTRAINT "Empresa_setorId_fkey" FOREIGN KEY ("setorId") REFERENCES "SetorIndustrial"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessoTipico" ADD CONSTRAINT "ProcessoTipico_setorId_fkey" FOREIGN KEY ("setorId") REFERENCES "SetorIndustrial"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiscoSST" ADD CONSTRAINT "RiscoSST_processoId_fkey" FOREIGN KEY ("processoId") REFERENCES "ProcessoTipico"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AspectoAmbiental" ADD CONSTRAINT "AspectoAmbiental_processoId_fkey" FOREIGN KEY ("processoId") REFERENCES "ProcessoTipico"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
