import { z } from 'zod'
import { openai } from '@/lib/openai'

const classificacaoSchema = z.object({
  tipo: z.enum([
    'licenca_ambiental',
    'pgr',
    'pcmso',
    'avcb',
    'alvara',
    'certificado_treinamento',
    'treinamento_nr',
    'fispq',
    'aso',
    'plano_emergencia',
    'outro',
  ]),
  justificativa: z.string(),
})

export async function classificarDocumentoComIA(texto: string, nomeArquivo: string) {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content:
          'Você classifica documentos técnicos ambientais e de SST. Retorne apenas JSON válido com tipo e justificativa curta. Se não houver evidência suficiente, use outro.',
      },
      {
        role: 'user',
        content: [
          'Classifique o documento em um destes tipos:',
          'licenca_ambiental, pgr, pcmso, avcb, alvara, certificado_treinamento, treinamento_nr, fispq, aso, plano_emergencia, outro.',
          '',
          `Nome do arquivo: ${nomeArquivo}`,
          '',
          'Primeiros caracteres extraídos:',
          texto.slice(0, 500),
        ].join('\n'),
      },
    ],
  })

  const content = completion.choices[0]?.message.content

  if (!content) {
    return { tipo: 'outro' as const, justificativa: 'Sem resposta da IA.' }
  }

  return classificacaoSchema.parse(JSON.parse(content))
}
