import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const anamneseSchema = z.object({
  projetoId: z.string().trim().min(1, 'Projeto é obrigatório'),
  numFuncionarios: z.coerce.number().int().min(0).optional().nullable(),
  turnos: z
    .enum(['1 turno', '2 turnos', '3 turnos', 'turno administrativo'])
    .optional()
    .nullable(),
  processosPrincipais: z.string().trim().optional().nullable(),
  licencaAmbiental: z.enum(['sim', 'não', 'em processo']).optional().nullable(),
  pgrAtualizado: z.enum(['sim', 'não', 'desconhecido']).optional().nullable(),
  pcmsoAtualizado: z.enum(['sim', 'não', 'desconhecido']).optional().nullable(),
  produtosQuimicos: z.enum(['sim', 'não']).optional().nullable(),
  residuosPerigosos: z.enum(['sim', 'não', 'não sabe']).optional().nullable(),
  observacoesGerais: z.string().trim().optional().nullable(),
  documentosExistentes: z
    .record(
      z.string(),
      z.object({
        possui: z.boolean().optional(),
        dataUltimaRevisao: z.string().trim().optional().nullable(),
        responsavelTecnico: z.string().trim().optional().nullable(),
        observacoes: z.string().trim().optional().nullable(),
        arquivoUrl: z.string().trim().optional().nullable(),
      }),
    )
    .optional(),
})

function buildData(data: z.infer<typeof anamneseSchema>) {
  return {
    numFuncionarios: data.numFuncionarios || null,
    turnos: data.turnos || null,
    processosPrincipais: data.processosPrincipais || null,
    dadosSetor: {
      licencaAmbiental: data.licencaAmbiental || null,
      pgrAtualizado: data.pgrAtualizado || null,
      pcmsoAtualizado: data.pcmsoAtualizado || null,
      produtosQuimicos: data.produtosQuimicos || null,
      residuosPerigosos: data.residuosPerigosos || null,
      observacoesGerais: data.observacoesGerais || null,
      documentosExistentes: data.documentosExistentes || {},
    },
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const projetoId = searchParams.get('projetoId')

  if (!projetoId) {
    return NextResponse.json(
      { error: 'projetoId é obrigatório.' },
      { status: 400 },
    )
  }

  try {
    const anamnese = await prisma.anamnese.findUnique({
      where: { projetoId },
    })

    return NextResponse.json(anamnese)
  } catch (error) {
    console.error('Erro ao buscar anamnese:', error)
    return NextResponse.json(
      { error: 'Não foi possível buscar a anamnese.' },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = anamneseSchema.parse(body)

    const anamnese = await prisma.anamnese.create({
      data: {
        projetoId: data.projetoId,
        ...buildData(data),
      },
    })

    return NextResponse.json(anamnese, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos.', issues: error.issues },
        { status: 400 },
      )
    }

    console.error('Erro ao criar anamnese:', error)
    return NextResponse.json(
      { error: 'Não foi possível criar a anamnese.' },
      { status: 500 },
    )
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const data = anamneseSchema.parse(body)

    const anamnese = await prisma.anamnese.update({
      where: { projetoId: data.projetoId },
      data: buildData(data),
    })

    return NextResponse.json(anamnese)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos.', issues: error.issues },
        { status: 400 },
      )
    }

    console.error('Erro ao atualizar anamnese:', error)
    return NextResponse.json(
      { error: 'Não foi possível atualizar a anamnese.' },
      { status: 500 },
    )
  }
}
