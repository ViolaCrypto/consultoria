import { NextResponse } from 'next/server'
import { z } from 'zod'
import { planejarDocumentos } from '@/lib/agents/planejadorDocumentos'
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

    const setor = dashboard.empresa.setorCodigo || dashboard.empresa.setor || 'outro'
    const ontologia = await prisma.setorIndustrial.findFirst({
      where: { codigo: setor },
      include: {
        processos: {
          include: {
            riscosSST: true,
            aspectosAmbientais: true,
          },
        },
      },
    })
    const documentosObrigatorios = await prisma.documentoObrigatorio.findMany({
      where: { setores: { has: setor } },
      orderBy: { nome: 'asc' },
    })

    const plano = await planejarDocumentos(dashboard.projeto, dashboard.gapAnalysis, {
      setor: ontologia,
      documentosObrigatorios,
      documentosExistentes: dashboard.documentos.map((documento) => ({
        nome: documento.nome,
        tipo: documento.tipo,
        status: documento.status,
      })),
    })

    const recomendados = [
      ...plano.documentos_gerar_agora,
      ...plano.documentos_gerar_depois,
      ...plano.documentos_solicitar_cliente,
      ...plano.documentos_urgentes,
    ]
    const criados = []

    for (const documento of recomendados) {
      const exists = await prisma.docProjeto.findFirst({
        where: {
          projetoId,
          nome: documento.nome,
        },
      })

      if (exists) {
        continue
      }

      criados.push(
        await prisma.docProjeto.create({
          data: {
            projetoId,
            nome: documento.nome,
            tipo: documento.tipo,
            status: 'pendente',
            conteudo: null,
          },
        }),
      )
    }

    return NextResponse.json({ plano, documentosCriados: criados })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos.', issues: error.issues },
        { status: 400 },
      )
    }

    console.error('Erro ao planejar documentos:', error)
    return NextResponse.json(
      { error: 'Não foi possível planejar documentos.' },
      { status: 500 },
    )
  }
}
