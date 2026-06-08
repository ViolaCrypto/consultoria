import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { gerarDocumento } from '@/lib/agents/geradorDocumentos'
import { validarComoAuditor } from '@/lib/agents/validadorAuditoria'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const docProjetoId = String(body?.docProjetoId || '')
    const problemas: unknown[] = Array.isArray(body?.problemas) ? body.problemas : []

    if (!docProjetoId) {
      return NextResponse.json(
        { error: 'docProjetoId e obrigatorio.' },
        { status: 400 },
      )
    }

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
        { error: 'Documento nao encontrado.' },
        { status: 404 },
      )
    }

    if (docProjeto.conteudo) {
      await prisma.versaoDocumento.create({
        data: {
          docProjetoId: docProjeto.id,
          versao: docProjeto.versao,
          conteudo: docProjeto.conteudo,
        },
      })
    }

    const problemasTexto = problemas.map((problema) =>
      typeof problema === 'string' ? problema : JSON.stringify(problema),
    )
    const gaps = [
      {
        requisito: 'Regeneracao corretiva',
        status: 'nao_atende',
        justificativa: [
          'DOCUMENTO ANTERIOR TINHA OS SEGUINTES PROBLEMAS QUE VOCE DEVE CORRIGIR:',
          ...problemasTexto.map((problema) => `- ${problema}`),
          'Gere nova versao corrigindo cada um.',
          docProjeto.conteudo ? `Documento anterior:\n${docProjeto.conteudo.slice(0, 6000)}` : '',
        ].join('\n'),
        documentoEsperado: docProjeto.nome,
      },
      ...docProjeto.projeto.avaliacoes.flatMap((avaliacao) =>
        avaliacao.itens.map((item) => ({
          requisito: item.requisito.titulo,
          status: item.status,
          justificativa: item.observacao,
          documentoEsperado: item.requisito.documentoEsperado,
        })),
      ),
    ]

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

    const validacaoAuditoria = validarComoAuditor(
      documentoGerado.conteudo,
      docProjeto.tipo || docProjeto.nome,
      { nome: docProjeto.projeto.empresa.nome },
    )
    const metadados = {
      ...documentoGerado.metadados,
      regeneradoCorrigindo: {
        problemas,
        regeneradoEm: new Date().toISOString(),
      },
      validacaoAuditoria,
    }
    const autoRevisao = documentoGerado.metadados.autoRevisao
    const rawScore =
      autoRevisao && typeof autoRevisao === 'object' && 'score' in autoRevisao
        ? (autoRevisao as { score?: unknown }).score
        : undefined
    const scoreQualidade =
      rawScore !== null && rawScore !== undefined
        ? Number(rawScore)
        : validacaoAuditoria.scoreAuditoria

    const atualizado = await prisma.docProjeto.update({
      where: { id: docProjeto.id },
      data: {
        conteudo: documentoGerado.conteudo,
        metadados: JSON.parse(JSON.stringify(metadados)) as Prisma.InputJsonValue,
        scoreQualidade: Number.isFinite(scoreQualidade)
          ? scoreQualidade
          : validacaoAuditoria.scoreAuditoria,
        status: 'em_revisao',
        geradoPorIA: true,
        versao: { increment: 1 },
      },
    })

    return NextResponse.json({ success: true, documento: atualizado })
  } catch (error) {
    console.error('Erro ao regenerar corrigindo:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 },
    )
  }
}
