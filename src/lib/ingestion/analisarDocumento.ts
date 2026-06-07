import { z } from 'zod'
import { openai } from '@/lib/openai'

type EmpresaDocumentoInput = {
  nome: string
  setor?: string | null
  cnae?: string | null
}

const analiseSchema = z.object({
  tipo_confirmado: z.string(),
  validade: z.string().nullable(),
  orgao_emissor: z.string().nullable(),
  numero_documento: z.string().nullable(),
  resumo: z.string(),
  informacoes_relevantes: z.array(z.string()),
  requisitos_atendidos: z.array(z.string()),
})

export type AnaliseDocumento = z.infer<typeof analiseSchema>

export async function analisarDocumentoComIA(
  texto: string,
  tipoDetectado: string,
  empresa: EmpresaDocumentoInput,
): Promise<AnaliseDocumento> {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content:
          'Você é especialista em documentação técnica ambiental e SST. Analise o documento e extraia as informações estruturadas. Seja preciso — só afirme o que está explicitamente no documento.',
      },
      {
        role: 'user',
        content: [
          'Retorne APENAS JSON válido com as chaves:',
          'tipo_confirmado, validade, orgao_emissor, numero_documento, resumo, informacoes_relevantes, requisitos_atendidos.',
          'Use validade em ISO YYYY-MM-DD se conseguir identificar uma data. Se não houver, use null.',
          'Em requisitos_atendidos, use códigos como NR-1, NR-7, NR-9, NR-12, CONAMA 430, ISO 14001 6.1.2 quando o documento comprovar explicitamente o requisito.',
          '',
          `Tipo detectado previamente: ${tipoDetectado}`,
          `Empresa: ${empresa.nome}`,
          `Setor: ${empresa.setor || 'não informado'}`,
          `CNAE: ${empresa.cnae || 'não informado'}`,
          '',
          'Texto extraído do documento:',
          texto.slice(0, 24000),
        ].join('\n'),
      },
    ],
  })

  const content = completion.choices[0]?.message.content

  if (!content) {
    throw new Error('A OpenAI não retornou análise para o documento.')
  }

  return analiseSchema.parse(JSON.parse(content))
}
