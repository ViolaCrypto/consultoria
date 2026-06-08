import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const documentoSchema = z.object({
  id: z.string().trim().min(1, 'Documento é obrigatório'),
  status: z.enum(['pendente', 'em_revisao', 'aprovado', 'exportado', 'entregue', 'aguardando_cliente']),
})

const documentoCreateSchema = z.object({
  projetoId: z.string().trim().min(1),
  nome: z.string().trim().min(1),
  tipo: z.string().trim().min(1).default('geravel_ia'),
  status: z
    .enum(['pendente', 'em_revisao', 'aprovado', 'exportado', 'entregue', 'aguardando_cliente'])
    .default('pendente'),
  requisitosOrigem: z.array(z.string()).optional(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = documentoCreateSchema.parse(body)
    const documento = await prisma.docProjeto.create({
      data: {
        projetoId: data.projetoId,
        nome: data.nome,
        tipo: data.tipo,
        status: data.status,
        requisitosOrigem: data.requisitosOrigem || [],
      },
    })

    return NextResponse.json(documento, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos.', issues: error.issues },
        { status: 400 },
      )
    }

    console.error('Erro ao criar documento:', error)
    return NextResponse.json(
      { error: 'Não foi possível criar o documento.' },
      { status: 500 },
    )
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const data = documentoSchema.parse(body)

    const documento = await prisma.docProjeto.update({
      where: { id: data.id },
      data: {
        status: data.status,
        aprovadoPor: data.status === 'aprovado' ? 'humano' : null,
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

    console.error('Erro ao atualizar documento:', error)
    return NextResponse.json(
      { error: 'Não foi possível atualizar o documento.' },
      { status: 500 },
    )
  }
}
