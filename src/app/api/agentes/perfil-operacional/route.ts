import { NextResponse } from 'next/server'
import { z } from 'zod'
import { gerarPerfilOperacional } from '@/lib/agents/perfilOperacional'
import { prisma } from '@/lib/prisma'

const requestSchema = z.object({
  projetoId: z.string().trim().min(1, 'Projeto é obrigatório'),
})

function normalizeDadosSetor(value: unknown) {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as {
      produtosQuimicos?: string | null
      residuosPerigosos?: string | null
      observacoesGerais?: string | null
    }
  }

  return null
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { projetoId } = requestSchema.parse(body)

    const projeto = await prisma.projeto.findUnique({
      where: { id: projetoId },
      include: {
        empresa: true,
        anamnese: true,
      },
    })

    if (!projeto) {
      return NextResponse.json(
        { error: 'Projeto não encontrado.' },
        { status: 404 },
      )
    }

    if (!projeto.anamnese) {
      return NextResponse.json(
        { error: 'Cadastre a anamnese antes de gerar o perfil operacional.' },
        { status: 400 },
      )
    }

    const perfil = await gerarPerfilOperacional(
      {
        numFuncionarios: projeto.anamnese.numFuncionarios,
        turnos: projeto.anamnese.turnos,
        processosPrincipais: projeto.anamnese.processosPrincipais,
        dadosSetor: normalizeDadosSetor(projeto.anamnese.dadosSetor),
      },
      {
        nome: projeto.empresa.nome,
        setor: projeto.empresa.setor,
        setorCodigo: projeto.empresa.setorCodigo,
        cnae: projeto.empresa.cnae,
      },
    )

    await prisma.anamnese.update({
      where: { projetoId },
      data: {
        perfilOperacional: perfil,
      },
    })

    return NextResponse.json(perfil)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos.', issues: error.issues },
        { status: 400 },
      )
    }

    console.error('Erro ao gerar perfil operacional:', error)
    return NextResponse.json(
      { error: 'Não foi possível gerar o perfil operacional.' },
      { status: 500 },
    )
  }
}
