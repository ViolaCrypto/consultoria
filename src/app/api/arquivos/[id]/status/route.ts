import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  try {
    const arquivo = await prisma.arquivo.findUnique({
      where: { id },
    })

    if (!arquivo) {
      return NextResponse.json({ error: 'Arquivo não encontrado.' }, { status: 404 })
    }

    const metadados =
      arquivo.metadados && typeof arquivo.metadados === 'object' && !Array.isArray(arquivo.metadados)
        ? (arquivo.metadados as {
            statusAnalise?: string
            tipoDetectado?: string
            analise?: unknown
            erro?: string
          })
        : null

    return NextResponse.json({
      id: arquivo.id,
      nome: arquivo.nome,
      tipo: arquivo.tipo,
      status: metadados?.statusAnalise || (metadados?.analise ? 'analisado' : 'pendente'),
      tipoDetectado: metadados?.tipoDetectado,
      analise: metadados?.analise,
      erro: metadados?.erro,
      metadados,
    })
  } catch (error) {
    console.error('Erro ao buscar status do arquivo:', error)
    return NextResponse.json(
      { error: 'Não foi possível buscar o status do arquivo.' },
      { status: 500 },
    )
  }
}
