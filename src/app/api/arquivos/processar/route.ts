import { NextResponse } from 'next/server'
import { z } from 'zod'
import { processarArquivoPorId } from '@/lib/ingestion/processarArquivo'

const requestSchema = z.object({
  arquivoId: z.string().trim().min(1, 'Arquivo é obrigatório.'),
})

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null)
    const { arquivoId } = requestSchema.parse(body)
    const result = await processarArquivoPorId(arquivoId)

    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos.', issues: error.issues },
        { status: 400 },
      )
    }

    console.error('Erro ao processar arquivo:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Não foi possível processar o arquivo.' },
      { status: 500 },
    )
  }
}
