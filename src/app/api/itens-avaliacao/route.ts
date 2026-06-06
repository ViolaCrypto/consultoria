import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const itemSchema = z.object({
  id: z.string().trim().min(1, 'Item é obrigatório'),
  status: z.enum([
    'atende',
    'atende_parcialmente',
    'nao_atende',
    'nao_se_aplica',
    'precisa_validacao',
  ]),
  observacao: z.string().trim().optional().nullable(),
})

const confirmAllSchema = z.object({
  avaliacaoIds: z.array(z.string().trim().min(1)).min(1),
  confirmarTodos: z.literal(true),
})

function inferDocumentType(documentoEsperado: string) {
  const texto = documentoEsperado.toLowerCase()

  if (
    texto.includes('cliente') ||
    texto.includes('fornecedor') ||
    texto.includes('licença') ||
    texto.includes('licenca') ||
    texto.includes('certificado') ||
    texto.includes('comprovante')
  ) {
    return 'exigivel_cliente'
  }

  return 'geravel_ia'
}

async function createActionDocuments(avaliacaoId: string) {
  const avaliacao = await prisma.avaliacao.findUnique({
    where: { id: avaliacaoId },
    include: {
      itens: {
        where: {
          status: {
            in: ['nao_atende', 'atende_parcialmente'],
          },
        },
        include: {
          requisito: true,
        },
      },
    },
  })

  if (!avaliacao) {
    return
  }

  for (const item of avaliacao.itens) {
    const nome = item.requisito.documentoEsperado?.trim()

    if (!nome) {
      continue
    }

    const existente = await prisma.docProjeto.findFirst({
      where: {
        projetoId: avaliacao.projetoId,
        nome,
      },
    })

    if (existente) {
      continue
    }

    await prisma.docProjeto.create({
      data: {
        projetoId: avaliacao.projetoId,
        nome,
        tipo: inferDocumentType(nome),
        status: 'pendente',
      },
    })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json().catch(() => null)
    const confirmAll = confirmAllSchema.safeParse(body)

    if (confirmAll.success) {
      const result = await prisma.itemAvaliacao.updateMany({
        where: {
          avaliacaoId: {
            in: confirmAll.data.avaliacaoIds,
          },
        },
        data: {
          confiancaIA: 'humano',
        },
      })

      return NextResponse.json(result)
    }

    const data = itemSchema.parse(body)

    const item = await prisma.itemAvaliacao.update({
      where: { id: data.id },
      data: {
        status: data.status,
        observacao: data.observacao || null,
        confiancaIA: 'humano',
      },
      include: {
        requisito: true,
      },
    })

    if (['nao_atende', 'atende_parcialmente'].includes(item.status)) {
      await createActionDocuments(item.avaliacaoId)
    }

    return NextResponse.json(item)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos.', issues: error.issues },
        { status: 400 },
      )
    }

    console.error('Erro ao atualizar item:', error)
    return NextResponse.json(
      { error: 'Não foi possível atualizar o item.' },
      { status: 500 },
    )
  }
}
