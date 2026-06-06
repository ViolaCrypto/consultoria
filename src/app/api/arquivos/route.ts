import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const arquivoSchema = z.object({
  nome: z.string().trim().min(1, 'Nome é obrigatório'),
  url: z.string().trim().min(1, 'URL é obrigatória'),
  tipo: z.string().trim().min(1, 'Tipo é obrigatório'),
  tamanho: z.coerce.number().int().positive().optional().nullable(),
  projetoId: z.string().trim().min(1, 'Projeto é obrigatório'),
})

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
    const arquivos = await prisma.arquivo.findMany({
      where: { projetoId },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(arquivos)
  } catch (error) {
    console.error('Erro ao listar arquivos:', error)
    return NextResponse.json(
      { error: 'Não foi possível listar os arquivos.' },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = arquivoSchema.parse(body)

    const arquivo = await prisma.arquivo.create({
      data: {
        nome: data.nome,
        url: data.url,
        tipo: data.tipo,
        tamanho: data.tamanho || null,
        projetoId: data.projetoId,
      },
    })

    return NextResponse.json(arquivo, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos.', issues: error.issues },
        { status: 400 },
      )
    }

    console.error('Erro ao salvar arquivo:', error)
    return NextResponse.json(
      { error: 'Não foi possível salvar o arquivo.' },
      { status: 500 },
    )
  }
}
