import { NextResponse } from 'next/server'
import { getProjetoDashboard } from '@/lib/projeto-dashboard'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  try {
    const dashboard = await getProjetoDashboard(id)

    if (!dashboard) {
      return NextResponse.json({ error: 'Projeto não encontrado.' }, { status: 404 })
    }

    return NextResponse.json(dashboard)
  } catch (error) {
    console.error('Erro ao consolidar dashboard do projeto:', error)
    return NextResponse.json(
      { error: 'Não foi possível consolidar o dashboard do projeto.' },
      { status: 500 },
    )
  }
}
