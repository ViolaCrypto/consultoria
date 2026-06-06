import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const projetoSchema = z.object({
  nome: z.string().trim().min(1, 'Nome é obrigatório'),
  tipo: z.enum([
    'diagnostico_inicial',
    'adequacao_iso14001',
    'adequacao_iso45001',
    'homologacao_fornecedor',
    'auditoria_interna',
    'outro',
  ]),
  status: z.enum(['em_andamento', 'concluido', 'pausado']),
  empresaId: z.string().trim().min(1, 'Empresa é obrigatória'),
})

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const empresaId = searchParams.get('empresaId')

  if (!empresaId) {
    return NextResponse.json(
      { error: 'empresaId é obrigatório.' },
      { status: 400 },
    )
  }

  try {
    const projetos = await prisma.projeto.findMany({
      where: { empresaId },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(projetos)
  } catch (error) {
    console.error('Erro ao listar projetos:', error)
    return NextResponse.json(
      { error: 'Não foi possível listar os projetos.' },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = projetoSchema.parse(body)

    const projeto = await prisma.projeto.create({
      data,
    })

    return NextResponse.json(projeto, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos.', issues: error.issues },
        { status: 400 },
      )
    }

    console.error('Erro ao criar projeto:', error)
    return NextResponse.json(
      { error: 'Não foi possível criar o projeto.' },
      { status: 500 },
    )
  }
}
