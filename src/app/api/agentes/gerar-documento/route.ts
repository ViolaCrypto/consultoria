import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { validarComoAuditor } from '@/lib/agents/validadorAuditoria'
import { prisma } from '@/lib/prisma'

const projetoCompletoInclude = {
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
} satisfies Prisma.ProjetoInclude

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('=== GERAR DOCUMENTO ===')
    console.log('Body recebido:', JSON.stringify(body, null, 2))

    const {
      docProjetoId,
      projetoId,
      tipoDocumento,
      nomeDocumento,
      requisitosOrigem,
    } = body || {}

    if (!docProjetoId && (!projetoId || !nomeDocumento)) {
      return NextResponse.json(
        {
          error: 'Informe docProjetoId OU (projetoId + nomeDocumento)',
          recebido: body,
        },
        { status: 400 },
      )
    }

    let docProjeto

    if (docProjetoId) {
      docProjeto = await prisma.docProjeto.findUnique({
        where: { id: String(docProjetoId) },
        include: {
          projeto: {
            include: projetoCompletoInclude,
          },
        },
      })

      if (!docProjeto) {
        return NextResponse.json(
          { error: 'DocProjeto nao encontrado' },
          { status: 404 },
        )
      }
    } else {
      const projeto = await prisma.projeto.findUnique({
        where: { id: String(projetoId) },
        include: {
          empresa: true,
          anamnese: true,
        },
      })

      if (!projeto) {
        return NextResponse.json(
          { error: 'Projeto nao encontrado' },
          { status: 404 },
        )
      }

      docProjeto = await prisma.docProjeto.create({
        data: {
          projetoId: String(projetoId),
          nome: String(nomeDocumento),
          tipo: tipoDocumento ? String(tipoDocumento) : 'geravel_ia',
          status: 'em_revisao',
          requisitosOrigem: Array.isArray(requisitosOrigem) ? requisitosOrigem.map(String) : [],
          geradoPorIA: true,
        },
        include: {
          projeto: {
            include: projetoCompletoInclude,
          },
        },
      })
    }

    console.log('DocProjeto resolvido:', docProjeto.id, docProjeto.nome)

    const gaps = docProjeto.projeto.avaliacoes.flatMap((avaliacao) =>
      avaliacao.itens.map((item) => ({
        requisito: item.requisito.titulo,
        status: item.status,
        justificativa: item.observacao,
        documentoEsperado: item.requisito.documentoEsperado,
      })),
    )

    const { gerarDocumento } = await import('@/lib/agents/geradorDocumentos')
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
      docProjeto.projeto.anamnese?.perfilOperacional || {},
    )

    const conteudo =
      typeof documentoGerado === 'string' ? documentoGerado : documentoGerado.conteudo
    const metadados =
      typeof documentoGerado === 'string' ? null : documentoGerado.metadados
    const validacaoAuditoria = validarComoAuditor(
      conteudo,
      docProjeto.tipo || docProjeto.nome,
      { nome: docProjeto.projeto.empresa.nome },
    )
    const autoRevisao = metadados?.autoRevisao
    const rawScore =
      autoRevisao && typeof autoRevisao === 'object' && 'score' in autoRevisao
        ? (autoRevisao as { score?: unknown }).score
        : undefined
    const scoreQualidade =
      rawScore !== null && rawScore !== undefined
        ? Number(rawScore)
        : undefined

    const docAtualizado = await prisma.docProjeto.update({
      where: { id: docProjeto.id },
      data: {
        conteudo,
        status: 'em_revisao',
        geradoPorIA: true,
        metadados: JSON.parse(
          JSON.stringify({
            ...(metadados || {}),
            validacaoAuditoria,
          }),
        ) as Prisma.InputJsonValue,
        scoreQualidade: Number.isFinite(scoreQualidade)
          ? scoreQualidade
          : validacaoAuditoria.scoreAuditoria,
      },
    })

    return NextResponse.json({
      success: true,
      documento: docAtualizado,
    })
  } catch (error: unknown) {
    console.error('=== ERRO GERAR DOCUMENTO ===')
    console.error('Message:', error instanceof Error ? error.message : error)
    console.error('Stack:', error instanceof Error ? error.stack : undefined)

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        details: String(error),
      },
      { status: 500 },
    )
  }
}
