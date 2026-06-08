-- DropForeignKey
ALTER TABLE "Exportacao" DROP CONSTRAINT "Exportacao_docProjetoId_fkey";

-- CreateTable
CREATE TABLE "VersaoDocumento" (
    "id" TEXT NOT NULL,
    "docProjetoId" TEXT NOT NULL,
    "versao" INTEGER NOT NULL,
    "conteudo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VersaoDocumento_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Exportacao" ADD CONSTRAINT "Exportacao_docProjetoId_fkey" FOREIGN KEY ("docProjetoId") REFERENCES "DocProjeto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VersaoDocumento" ADD CONSTRAINT "VersaoDocumento_docProjetoId_fkey" FOREIGN KEY ("docProjetoId") REFERENCES "DocProjeto"("id") ON DELETE CASCADE ON UPDATE CASCADE;
