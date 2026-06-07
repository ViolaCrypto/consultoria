import { z } from 'zod'
import { openai } from '@/lib/openai'

const documentoPlanejadoSchema = z.object({
  nome: z.string(),
  tipo: z.string(),
  prioridade: z.number().int().min(1).max(5),
  motivo: z.string(),
  dependencias: z.array(z.string()),
})

const planoSchema = z.object({
  documentos_gerar_agora: z.array(documentoPlanejadoSchema),
  documentos_gerar_depois: z.array(documentoPlanejadoSchema),
  documentos_solicitar_cliente: z.array(documentoPlanejadoSchema),
  documentos_urgentes: z.array(documentoPlanejadoSchema),
})

export type PlanoDocumentos = z.infer<typeof planoSchema>

export async function planejarDocumentos(
  projeto: unknown,
  gapAnalysis: unknown,
  ontologia: unknown,
): Promise<PlanoDocumentos> {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content:
          'Você é consultor sênior em ISO 14001, ISO 45001, SST e requisitos legais brasileiros. Planeje documentos a partir de gaps reais, documentos obrigatórios do setor e evidências disponíveis. Retorne apenas JSON válido, sem texto fora do JSON.',
      },
      {
        role: 'user',
        content: [
          'Classifique os documentos em:',
          'documentos_gerar_agora: geráveis por IA com dados suficientes.',
          'documentos_gerar_depois: geráveis por IA, mas dependem de dados ausentes.',
          'documentos_solicitar_cliente: exigíveis do cliente, não geráveis pela IA.',
          'documentos_urgentes: legais vencidos, ausentes ou críticos.',
          '',
          'Cada item deve ter: nome, tipo, prioridade (1-5), motivo, dependencias.',
          '',
          'Dados:',
          JSON.stringify({ projeto, gapAnalysis, ontologia }, null, 2),
        ].join('\n'),
      },
    ],
  })

  const content = completion.choices[0]?.message.content

  if (!content) {
    throw new Error('A OpenAI não retornou plano de documentos.')
  }

  return planoSchema.parse(JSON.parse(content))
}
