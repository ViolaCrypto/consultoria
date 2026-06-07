import { NextResponse } from 'next/server'
import { z } from 'zod'
import { gerarDiagnosticoInicial } from '@/lib/agents/diagnosticoInicial'
import { getProjetoDashboard } from '@/lib/projeto-dashboard'
import { prisma } from '@/lib/prisma'

const requestSchema = z.object({
  projetoId: z.string().trim().min(1, 'Projeto é obrigatório.'),
})

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null)
    const { projetoId } = requestSchema.parse(body)
    const dashboard = await getProjetoDashboard(projetoId)

    if (!dashboard) {
      return NextResponse.json({ error: 'Projeto não encontrado.' }, { status: 404 })
    }

    const conteudo = await gerarDiagnosticoInicial(
      dashboard.projeto,
      dashboard.empresa,
      dashboard.anamnese,
      dashboard.perfilOperacional,
      dashboard.gapAnalysis,
    )

    const documentoExistente = await prisma.docProjeto.findFirst({
      where: {
        projetoId,
        nome: 'Relatório de Diagnóstico Inicial',
      },
    })

    const documento = documentoExistente
      ? await prisma.docProjeto.update({
          where: { id: documentoExistente.id },
          data: {
            conteudo,
            tipo: 'geravel_ia',
            status: 'em_revisao',
          },
        })
      : await prisma.docProjeto.create({
          data: {
            projetoId,
            nome: 'Relatório de Diagnóstico Inicial',
            tipo: 'geravel_ia',
            status: 'em_revisao',
            conteudo,
          },
        })

    return NextResponse.json(documento)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos.', issues: error.issues },
        { status: 400 },
      )
    }

    console.error('Erro ao gerar diagnóstico inicial:', error)
    return NextResponse.json(
      { error: 'Não foi possível gerar o diagnóstico inicial.' },
      { status: 500 },
    )
  }
}
