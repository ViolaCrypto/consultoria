import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const documentoUpdateSchema = z.object({
  status: z
    .enum(['pendente', 'em_revisao', 'aprovado', 'exportado', 'entregue'])
    .optional(),
  conteudo: z.string().optional().nullable(),
})

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  try {
    const documento = await prisma.docProjeto.findUnique({
      where: { id },
    })

    if (!documento) {
      return NextResponse.json(
        { error: 'Documento não encontrado.' },
        { status: 404 },
      )
    }

    return NextResponse.json(documento)
  } catch (error) {
    console.error('Erro ao buscar documento:', error)
    return NextResponse.json(
      { error: 'Não foi possível buscar o documento.' },
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
    const data = documentoUpdateSchema.parse(body)

    const documento = await prisma.docProjeto.update({
      where: { id },
      data: {
        ...(data.status ? { status: data.status } : {}),
        ...(data.conteudo !== undefined ? { conteudo: data.conteudo } : {}),
        aprovadoPor: data.status === 'aprovado' ? 'humano' : undefined,
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
