import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const avaliacaoSchema = z.object({
  projetoId: z.string().trim().min(1, 'Projeto é obrigatório'),
  modeloIds: z.array(z.string().trim().min(1)).min(1, 'Selecione ao menos um modelo'),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = avaliacaoSchema.parse(body)
    const avaliacoes = []

    for (const modeloId of data.modeloIds) {
      const existente = await prisma.avaliacao.findFirst({
        where: {
          projetoId: data.projetoId,
          modeloId,
        },
        include: {
          modelo: true,
          itens: true,
        },
      })

      if (existente) {
        avaliacoes.push(existente)
        continue
      }

      const modelo = await prisma.modeloAvaliacao.findUnique({
        where: { id: modeloId },
        include: { requisitos: true },
      })

      if (!modelo) {
        continue
      }

      const avaliacao = await prisma.avaliacao.create({
        data: {
          projetoId: data.projetoId,
          modeloId,
          itens: {
            create: modelo.requisitos.map((requisito) => ({
              requisitoId: requisito.id,
              status: 'precisa_validacao',
              confiancaIA: 'humano',
              evidencias: [],
            })),
          },
        },
        include: {
          modelo: true,
          itens: true,
        },
      })

      avaliacoes.push(avaliacao)
    }

    return NextResponse.json(avaliacoes, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos.', issues: error.issues },
        { status: 400 },
      )
    }

    console.error('Erro ao vincular modelo:', error)
    return NextResponse.json(
      { error: 'Não foi possível vincular os modelos.' },
      { status: 500 },
    )
  }
}
