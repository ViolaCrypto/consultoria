import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  try {
    const modelo = await prisma.modeloAvaliacao.findUnique({
      where: { id },
      include: {
        requisitos: {
          orderBy: [{ ordem: 'asc' }, { titulo: 'asc' }],
        },
      },
    })

    if (!modelo) {
      return NextResponse.json(
        { error: 'Modelo não encontrado.' },
        { status: 404 },
      )
    }

    return NextResponse.json(modelo)
  } catch (error) {
    console.error('Erro ao buscar modelo:', error)
    return NextResponse.json(
      { error: 'Não foi possível buscar o modelo.' },
      { status: 500 },
    )
  }
}
