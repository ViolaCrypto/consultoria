import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const documentoSchema = z.object({
  id: z.string().trim().min(1, 'Documento é obrigatório'),
  status: z.enum(['pendente', 'em_revisao', 'aprovado', 'exportado', 'entregue']),
})

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
