import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const projetoUpdateSchema = z.object({
  status: z.enum(['em_andamento', 'concluido', 'pausado']).optional(),
})

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  try {
    const projeto = await prisma.projeto.findUnique({
      where: { id },
      include: {
        arquivos: { orderBy: { createdAt: 'desc' } },
        anamnese: true,
        avaliacoes: {
          include: {
            modelo: {
              include: {
                requisitos: true,
              },
            },
            itens: {
              include: {
                requisito: true,
              },
              orderBy: {
                createdAt: 'asc',
              },
            },
          },
        },
        documentos: {
          orderBy: {
            updatedAt: 'desc',
          },
        },
      },
    })

    if (!projeto) {
      return NextResponse.json(
        { error: 'Projeto não encontrado.' },
        { status: 404 },
      )
    }

    return NextResponse.json(projeto)
  } catch (error) {
    console.error('Erro ao buscar projeto:', error)
    return NextResponse.json(
      { error: 'Não foi possível buscar o projeto.' },
      { status: 500 },
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  try {
    const body = await request.json().catch(() => null)
    const data = projetoUpdateSchema.parse(body)

    const projeto = await prisma.projeto.update({
      where: { id },
      data,
    })

    return NextResponse.json(projeto)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos.', issues: error.issues },
        { status: 400 },
      )
    }

    console.error('Erro ao atualizar projeto:', error)
    return NextResponse.json(
      { error: 'Não foi possível atualizar o projeto.' },
      { status: 500 },
    )
  }
}
