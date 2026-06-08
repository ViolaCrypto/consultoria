-- CreateTable
CREATE TABLE "Exportacao" (
    "id" TEXT NOT NULL,
    "docProjetoId" TEXT NOT NULL,
    "formato" TEXT NOT NULL,
    "versao" INTEGER NOT NULL,
    "urlArquivo" TEXT NOT NULL,
    "hashArquivo" TEXT,
    "exportadoPor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Exportacao_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Exportacao" ADD CONSTRAINT "Exportacao_docProjetoId_fkey" FOREIGN KEY ("docProjetoId") REFERENCES "DocProjeto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
