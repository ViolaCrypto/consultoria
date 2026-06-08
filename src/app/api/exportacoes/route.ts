import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const exportacaoSchema = z.object({
  docProjetoId: z.string().trim().min(1),
  formato: z.enum(['pdf', 'word']),
  versao: z.coerce.number().int().min(1),
  urlArquivo: z.string().trim().min(1),
  hashArquivo: z.string().trim().optional().nullable(),
  exportadoPor: z.string().trim().optional().nullable(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null)
    const data = exportacaoSchema.parse(body)
    const exportacao = await prisma.exportacao.create({ data })

    return NextResponse.json(exportacao, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos.', issues: error.issues },
        { status: 400 },
      )
    }

    console.error('Erro ao registrar exportação:', error)
    return NextResponse.json(
      { error: 'Não foi possível registrar a exportação.' },
      { status: 500 },
    )
  }
}
