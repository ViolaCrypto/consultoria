import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const requisitoSchema = z.object({
  modeloId: z.string().trim().min(1, 'Modelo é obrigatório'),
  codigo: z.string().trim().optional(),
  titulo: z.string().trim().min(1, 'Título é obrigatório'),
  descricao: z.string().trim().optional(),
  categoria: z.string().trim().optional(),
  peso: z.coerce.number().min(0).default(1),
  ordem: z.coerce.number().int().min(0).default(0),
  evidenciaEsperada: z.string().trim().optional(),
  documentoEsperado: z.string().trim().optional(),
  acaoRecomendada: z.string().trim().optional(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = requisitoSchema.parse(body)

    const requisito = await prisma.requisito.create({
      data: {
        modeloId: data.modeloId,
        codigo: data.codigo || null,
        titulo: data.titulo,
        descricao: data.descricao || null,
        categoria: data.categoria || null,
        peso: data.peso,
        ordem: data.ordem,
        evidenciaEsperada: data.evidenciaEsperada || null,
        documentoEsperado: data.documentoEsperado || null,
        acaoRecomendada: data.acaoRecomendada || null,
      },
    })

    return NextResponse.json(requisito, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos.', issues: error.issues },
        { status: 400 },
      )
    }

    console.error('Erro ao criar requisito:', error)
    return NextResponse.json(
      { error: 'Não foi possível criar o requisito.' },
      { status: 500 },
    )
  }
}
