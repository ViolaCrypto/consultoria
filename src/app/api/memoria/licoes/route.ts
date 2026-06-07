import { NextResponse } from 'next/server'
import { z } from 'zod'
import { salvarLicaoAprendida } from '@/lib/memoria'

const requestSchema = z.object({
  conteudo: z.string().trim().min(10, 'A lição precisa ter pelo menos 10 caracteres.'),
  setor: z.string().trim().min(1, 'Setor é obrigatório.'),
  projetoId: z.string().trim().optional().nullable(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null)
    const data = requestSchema.parse(body)
    const memoria = await salvarLicaoAprendida(data.conteudo, data.setor, data.projetoId)

    return NextResponse.json(memoria, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos.', issues: error.issues },
        { status: 400 },
      )
    }

    console.error('Erro ao salvar lição aprendida:', error)
    return NextResponse.json(
      { error: 'Não foi possível salvar a lição aprendida.' },
      { status: 500 },
    )
  }
}
