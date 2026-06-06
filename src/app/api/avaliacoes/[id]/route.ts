import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  try {
    const avaliacao = await prisma.avaliacao.findUnique({
      where: { id },
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
    })

    if (!avaliacao) {
      return NextResponse.json(
        { error: 'Avaliação não encontrada.' },
        { status: 404 },
      )
    }

    return NextResponse.json(avaliacao)
  } catch (error) {
    console.error('Erro ao buscar avaliação:', error)
    return NextResponse.json(
      { error: 'Não foi possível buscar a avaliação.' },
      { status: 500 },
    )
  }
}
