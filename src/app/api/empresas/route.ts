import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const empresaSchema = z.object({
  nome: z.string().trim().min(1, 'Nome é obrigatório'),
  cnpj: z.string().trim().optional(),
  cnae: z.string().trim().optional(),
  setor: z
    .enum([
      'metalurgia',
      'quimico',
      'plastico',
      'logistica',
      'construcao',
      'alimentos',
      'servicos',
      'outro',
    ])
    .optional(),
  cidade: z.string().trim().optional(),
  estado: z.string().trim().optional(),
})

export async function GET() {
  try {
    const empresas = await prisma.empresa.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { projetos: true },
        },
      },
    })

    return NextResponse.json(empresas)
  } catch (error) {
    console.error('Erro ao listar empresas:', error)
    return NextResponse.json(
      { error: 'Não foi possível listar as empresas.' },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = empresaSchema.parse(body)

    const empresa = await prisma.empresa.create({
      data: {
        nome: data.nome,
        cnpj: data.cnpj || null,
        cnae: data.cnae || null,
        setor: data.setor || null,
        cidade: data.cidade || null,
        estado: data.estado || null,
      },
    })

    return NextResponse.json(empresa, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos.', issues: error.issues },
        { status: 400 },
      )
    }

    console.error('Erro ao criar empresa:', error)
    return NextResponse.json(
      { error: 'Não foi possível criar a empresa.' },
      { status: 500 },
    )
  }
}
