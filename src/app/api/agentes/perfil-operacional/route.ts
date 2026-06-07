import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { prisma } from '@/lib/prisma'

type DadosSetor = {
  produtosQuimicos?: string | null
  residuosPerigosos?: string | null
  observacoesGerais?: string | null
}

type OpenAIError = {
  message?: string
  status?: number
  type?: string
}

function normalizeDadosSetor(value: unknown): DadosSetor {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as DadosSetor
  }

  return {}
}

export async function POST(request: NextRequest) {
  try {
    const { projetoId } = await request.json()

    console.log('=== PERFIL OPERACIONAL ===')
    console.log('projetoId:', projetoId)
    console.log('OPENAI_API_KEY exists:', !!process.env.OPENAI_API_KEY)
    console.log('OPENAI_API_KEY prefix:', process.env.OPENAI_API_KEY?.substring(0, 20))

    if (!projetoId) {
      return NextResponse.json({ error: 'projetoId obrigatório' }, { status: 400 })
    }

    const projeto = await prisma.projeto.findUnique({
      where: { id: projetoId },
      include: { empresa: true, anamnese: true },
    })

    if (!projeto) {
      return NextResponse.json({ error: 'Projeto não encontrado' }, { status: 404 })
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    const dadosSetor = normalizeDadosSetor(projeto.anamnese?.dadosSetor)

    const prompt = `Você é especialista em SST e ISO 14001/45001. Analise e retorne APENAS JSON válido:

Empresa: ${projeto.empresa.nome}
Setor: ${projeto.empresa.setor}
CNAE: ${projeto.empresa.cnae}
Funcionários: ${projeto.anamnese?.numFuncionarios}
Processos: ${projeto.anamnese?.processosPrincipais}
Produtos químicos: ${dadosSetor.produtosQuimicos}
Resíduos perigosos: ${dadosSetor.residuosPerigosos}
Observações: ${dadosSetor.observacoesGerais}

Retorne JSON com: processos_provaveis, riscos_sst, aspectos_ambientais, documentos_esperados, legislacao_aplicavel, observacoes`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Retorne APENAS JSON válido, sem markdown, sem explicações.' },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 2000,
    })

    const perfil = JSON.parse(response.choices[0].message.content || '{}')

    await prisma.anamnese.update({
      where: { projetoId },
      data: { perfilOperacional: perfil },
    })

    return NextResponse.json({ perfil })
  } catch (error: unknown) {
    const openAIError = error as OpenAIError

    console.error('=== ERRO PERFIL OPERACIONAL ===')
    console.error('Message:', openAIError?.message)
    console.error('Status:', openAIError?.status)
    console.error('Full error:', JSON.stringify(error, null, 2))
    return NextResponse.json(
      {
        error: openAIError?.message || 'Erro desconhecido',
        status: openAIError?.status,
        type: openAIError?.type,
      },
      { status: 500 },
    )
  }
}
