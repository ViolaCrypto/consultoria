import { z } from 'zod'
import { openai } from '@/lib/openai'

type RequisitoInput = {
  id: string
  codigo: string | null
  titulo: string
  descricao: string | null
  categoria: string | null
  evidenciaEsperada: string | null
  documentoEsperado: string | null
}

type AvaliacaoInput = {
  modelo: {
    nome: string
    categoria: string | null
    versao: string
  }
  itens: {
    requisito: RequisitoInput
  }[]
}

type EmpresaInput = {
  nome: string
  setor: string | null
  cnae: string | null
}

const sugestaoSchema = z.object({
  requisitoId: z.string(),
  status: z.enum([
    'atende',
    'atende_parcialmente',
    'nao_atende',
    'nao_se_aplica',
    'precisa_validacao',
  ]),
  justificativa: z.string(),
  confianca: z.enum(['alta', 'media', 'baixa']),
})

const gapAnalysisSchema = z.object({
  sugestoes: z.array(sugestaoSchema),
})

export type SugestaoGapAnalysis = z.infer<typeof sugestaoSchema>

export async function gerarGapAnalysis(
  avaliacao: AvaliacaoInput,
  perfilOperacional: unknown,
  empresa: EmpresaInput,
): Promise<SugestaoGapAnalysis[]> {
  const requisitos = avaliacao.itens.map((item) => item.requisito)

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content:
          'Você é auditor especialista em ISO 14001, ISO 45001 e SST. Analise cada requisito e sugira o status baseado no perfil operacional real da empresa. Sempre justifique com base nos dados fornecidos. Nunca invente dados. Se não houver informação suficiente, use precisa_validacao.',
      },
      {
        role: 'user',
        content: [
          'Retorne APENAS JSON válido no formato:',
          '{"sugestoes":[{"requisitoId":"...","status":"atende|atende_parcialmente|nao_atende|nao_se_aplica|precisa_validacao","justificativa":"curta","confianca":"alta|media|baixa"}]}',
          '',
          `Empresa: ${empresa.nome}`,
          `Setor: ${empresa.setor || 'não informado'}`,
          `CNAE: ${empresa.cnae || 'não informado'}`,
          `Modelo: ${avaliacao.modelo.nome}`,
          `Categoria do modelo: ${avaliacao.modelo.categoria || 'não informada'}`,
          `Versão: ${avaliacao.modelo.versao}`,
          '',
          'Perfil operacional:',
          JSON.stringify(perfilOperacional),
          '',
          'Requisitos para avaliar:',
          JSON.stringify(requisitos),
        ].join('\n'),
      },
    ],
  })

  const content = completion.choices[0]?.message.content

  if (!content) {
    throw new Error('A OpenAI não retornou conteúdo para o gap analysis.')
  }

  return gapAnalysisSchema.parse(JSON.parse(content)).sugestoes
}
