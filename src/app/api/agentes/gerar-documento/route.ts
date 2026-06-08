import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { z } from 'zod'
import { gerarDocumento } from '@/lib/agents/geradorDocumentos'
import { prisma } from '@/lib/prisma'

const requestSchema = z.object({
  docProjetoId: z.string().trim().min(1, 'Documento é obrigatório'),
})

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null)
    const { docProjetoId } = requestSchema.parse(body)

    const docProjeto = await prisma.docProjeto.findUnique({
      where: { id: docProjetoId },
      include: {
        projeto: {
          include: {
            empresa: true,
            anamnese: true,
            avaliacoes: {
              include: {
                itens: {
                  where: {
                    status: {
                      in: ['nao_atende', 'atende_parcialmente'],
                    },
                  },
                  include: {
                    requisito: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!docProjeto) {
      return NextResponse.json(
        { error: 'Documento não encontrado.' },
        { status: 404 },
      )
    }

    const gaps = docProjeto.projeto.avaliacoes.flatMap((avaliacao) =>
      avaliacao.itens.map((item) => ({
        requisito: item.requisito.titulo,
        status: item.status,
        justificativa: item.observacao,
        documentoEsperado: item.requisito.documentoEsperado,
      })),
    )

    const documentoGerado = await gerarDocumento(
      {
        id: docProjeto.id,
        projetoId: docProjeto.projetoId,
        nome: docProjeto.nome,
        tipo: docProjeto.tipo,
        gaps,
      },
      {
        nome: docProjeto.projeto.empresa.nome,
        setor: docProjeto.projeto.empresa.setor,
        setorCodigo: docProjeto.projeto.empresa.setorCodigo,
        cnae: docProjeto.projeto.empresa.cnae,
        cidade: docProjeto.projeto.empresa.cidade,
        estado: docProjeto.projeto.empresa.estado,
      },
      docProjeto.projeto.anamnese
        ? {
            numFuncionarios: docProjeto.projeto.anamnese.numFuncionarios,
            turnos: docProjeto.projeto.anamnese.turnos,
            processosPrincipais: docProjeto.projeto.anamnese.processosPrincipais,
            dadosSetor: docProjeto.projeto.anamnese.dadosSetor,
          }
        : null,
      docProjeto.projeto.anamnese?.perfilOperacional || null,
    )

    const autoRevisao = documentoGerado.metadados.autoRevisao
    const scoreQualidade =
      autoRevisao && typeof autoRevisao === 'object' && 'score' in autoRevisao
        ? Number((autoRevisao as { score?: unknown }).score)
        : undefined

    const updated = await prisma.docProjeto.update({
      where: { id: docProjetoId },
      data: {
        conteudo: documentoGerado.conteudo,
        metadados: JSON.parse(
          JSON.stringify(documentoGerado.metadados),
        ) as Prisma.InputJsonValue,
        geradoPorIA: true,
        scoreQualidade: Number.isFinite(scoreQualidade) ? scoreQualidade : undefined,
        status: 'em_revisao',
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos.', issues: error.issues },
        { status: 400 },
      )
    }

    console.error('Erro ao gerar documento:', error)
    return NextResponse.json(
      { error: 'Não foi possível gerar o documento.' },
      { status: 500 },
    )
  }
}
