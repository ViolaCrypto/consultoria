-- CreateTable
CREATE TABLE "Empresa" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cnpj" TEXT,
    "cnae" TEXT,
    "setor" TEXT,
    "cidade" TEXT,
    "estado" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Empresa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Projeto" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'em_andamento',
    "empresaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Projeto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Arquivo" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "tamanho" INTEGER,
    "projetoId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Arquivo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Anamnese" (
    "id" TEXT NOT NULL,
    "projetoId" TEXT NOT NULL,
    "numFuncionarios" INTEGER,
    "turnos" TEXT,
    "processosPrincipais" TEXT,
    "dadosSetor" JSONB,
    "perfilOperacional" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Anamnese_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModeloAvaliacao" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "categoria" TEXT,
    "versao" TEXT NOT NULL DEFAULT '1.0',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ModeloAvaliacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Requisito" (
    "id" TEXT NOT NULL,
    "codigo" TEXT,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "categoria" TEXT,
    "peso" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "evidenciaEsperada" TEXT,
    "documentoEsperado" TEXT,
    "acaoRecomendada" TEXT,
    "modeloId" TEXT NOT NULL,

    CONSTRAINT "Requisito_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Avaliacao" (
    "id" TEXT NOT NULL,
    "projetoId" TEXT NOT NULL,
    "modeloId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Avaliacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemAvaliacao" (
    "id" TEXT NOT NULL,
    "avaliacaoId" TEXT NOT NULL,
    "requisitoId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'precisa_validacao',
    "confiancaIA" TEXT,
    "observacao" TEXT,
    "evidencias" TEXT[],
    "revisadoPor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ItemAvaliacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocProjeto" (
    "id" TEXT NOT NULL,
    "projetoId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "conteudo" TEXT,
    "urlExportado" TEXT,
    "versao" INTEGER NOT NULL DEFAULT 1,
    "aprovadoPor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocProjeto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Anamnese_projetoId_key" ON "Anamnese"("projetoId");

-- AddForeignKey
ALTER TABLE "Projeto" ADD CONSTRAINT "Projeto_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Arquivo" ADD CONSTRAINT "Arquivo_projetoId_fkey" FOREIGN KEY ("projetoId") REFERENCES "Projeto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Anamnese" ADD CONSTRAINT "Anamnese_projetoId_fkey" FOREIGN KEY ("projetoId") REFERENCES "Projeto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Requisito" ADD CONSTRAINT "Requisito_modeloId_fkey" FOREIGN KEY ("modeloId") REFERENCES "ModeloAvaliacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Avaliacao" ADD CONSTRAINT "Avaliacao_projetoId_fkey" FOREIGN KEY ("projetoId") REFERENCES "Projeto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Avaliacao" ADD CONSTRAINT "Avaliacao_modeloId_fkey" FOREIGN KEY ("modeloId") REFERENCES "ModeloAvaliacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemAvaliacao" ADD CONSTRAINT "ItemAvaliacao_avaliacaoId_fkey" FOREIGN KEY ("avaliacaoId") REFERENCES "Avaliacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemAvaliacao" ADD CONSTRAINT "ItemAvaliacao_requisitoId_fkey" FOREIGN KEY ("requisitoId") REFERENCES "Requisito"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocProjeto" ADD CONSTRAINT "DocProjeto_projetoId_fkey" FOREIGN KEY ("projetoId") REFERENCES "Projeto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
