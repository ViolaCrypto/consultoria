import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const modeloSchema = z.object({
  nome: z.string().trim().min(1, 'Nome é obrigatório'),
  descricao: z.string().trim().optional(),
  categoria: z
    .enum(['iso14001', 'iso45001', 'sst', 'ambiental', 'homologacao', 'auditoria', 'esg', 'outro'])
    .optional(),
  versao: z.string().trim().min(1, 'Versão é obrigatória'),
})

export async function GET() {
  try {
    const modelos = await prisma.modeloAvaliacao.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { requisitos: true },
        },
      },
    })

    return NextResponse.json(modelos)
  } catch (error) {
    console.error('Erro ao listar modelos:', error)
    return NextResponse.json(
      { error: 'Não foi possível listar os modelos.' },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = modeloSchema.parse(body)

    const modelo = await prisma.modeloAvaliacao.create({
      data: {
        nome: data.nome,
        descricao: data.descricao || null,
        categoria: data.categoria || null,
        versao: data.versao,
      },
    })

    return NextResponse.json(modelo, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos.', issues: error.issues },
        { status: 400 },
      )
    }

    console.error('Erro ao criar modelo:', error)
    return NextResponse.json(
      { error: 'Não foi possível criar o modelo.' },
      { status: 500 },
    )
  }
}
