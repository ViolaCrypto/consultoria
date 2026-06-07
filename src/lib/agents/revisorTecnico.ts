import { z } from 'zod'
import { openai } from '@/lib/openai'

type EmpresaInput = {
  nome: string
  setor: string | null
  cnae: string | null
}

const revisaoSchema = z.object({
  aprovado: z.boolean(),
  score: z.number().min(0).max(100),
  problemas: z.array(z.string()),
  sugestoes: z.array(z.string()),
  alertas_legais: z.array(z.string()),
})

export type ResultadoRevisao = z.infer<typeof revisaoSchema>

export async function revisarDocumento(
  conteudo: string,
  empresa: EmpresaInput,
  perfilOperacional: unknown,
  tipoDocumento: string,
): Promise<ResultadoRevisao> {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content:
          'Você é auditor técnico especialista em ISO 14001, ISO 45001 e SST. Revise o documento e identifique: texto genérico sem referência à empresa real, afirmações sem evidência, riscos jurídicos, contradições, linguagem fraca, dados ausentes. Seja criterioso.',
      },
      {
        role: 'user',
        content: [
          'Retorne APENAS JSON válido com as chaves: aprovado, score, problemas, sugestoes, alertas_legais.',
          `Empresa: ${empresa.nome}`,
          `Setor: ${empresa.setor || 'não informado'}`,
          `CNAE: ${empresa.cnae || 'não informado'}`,
          `Tipo de documento: ${tipoDocumento}`,
          `Perfil operacional: ${JSON.stringify(perfilOperacional || {})}`,
          '',
          'Documento para revisão:',
          conteudo,
        ].join('\n'),
      },
    ],
  })

  const content = completion.choices[0]?.message.content

  if (!content) {
    throw new Error('A OpenAI não retornou conteúdo para a revisão técnica.')
  }

  return revisaoSchema.parse(JSON.parse(content))
}
