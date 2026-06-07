import { z } from 'zod'
import { openai } from '@/lib/openai'

type EmpresaDocumentoInput = {
  nome: string
  setor?: string | null
  cnae?: string | null
}

const jsonValueSchema: z.ZodType<
  string | number | boolean | null | Record<string, unknown> | unknown[]
> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(jsonValueSchema),
    z.record(z.string(), jsonValueSchema),
  ]),
)

const analiseSchema = z.object({
  tipo_confirmado: z.string(),
  validade: z.string().nullable(),
  orgao_emissor: z.string().nullable(),
  numero_documento: z.string().nullable(),
  resumo: z.string(),
  informacoes_relevantes: z.array(z.string()),
  requisitos_atendidos: z.array(z.string()),
  dados_especificos: z.record(z.string(), jsonValueSchema).optional().nullable(),
})

export type AnaliseDocumento = z.infer<typeof analiseSchema>

function promptEspecializado(tipoDetectado: string) {
  const tipo = tipoDetectado.toLowerCase()

  if (tipo.includes('pgr')) {
    return [
      'Para PGR, preencha dados_especificos com:',
      'riscos_ocupacionais_identificados, agentes_fisicos, agentes_quimicos, agentes_biologicos, medidas_controle_existentes, lacunas_identificadas, proxima_revisao_prevista.',
    ].join('\n')
  }

  if (tipo.includes('pcmso')) {
    return [
      'Para PCMSO, preencha dados_especificos com:',
      'agentes_monitorados, exames_periodicos_obrigatorios, periodicidade, medico_coordenador, funcionarios_monitorados.',
    ].join('\n')
  }

  if (tipo.includes('licenca') || tipo.includes('licença')) {
    return [
      'Para Licença Ambiental, preencha dados_especificos com:',
      'numero, orgao_emissor, validade, condicionantes_obrigatorias, limites_estabelecidos, atividades_autorizadas.',
    ].join('\n')
  }

  if (tipo.includes('emergencia') || tipo.includes('emergência')) {
    return [
      'Para Plano de Emergência, preencha dados_especificos com:',
      'cenarios_previstos, recursos_disponiveis, brigada_constituida, ultimos_simulados, contatos_emergencia.',
    ].join('\n')
  }

  if (
    tipo.includes('produto') ||
    tipo.includes('quimico') ||
    tipo.includes('químico') ||
    tipo.includes('fispq')
  ) {
    return [
      'Para Inventário de Produtos Químicos ou FISPQ, preencha dados_especificos com:',
      'produtos, classificacao_risco, quantidade_armazenada, fornecedores, fispqs_disponiveis.',
    ].join('\n')
  }

  return 'Para outros documentos, preencha dados_especificos com os campos técnicos claramente identificados no documento.'
}

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
          'tipo_confirmado, validade, orgao_emissor, numero_documento, resumo, informacoes_relevantes, requisitos_atendidos, dados_especificos.',
          'Use validade em ISO YYYY-MM-DD se conseguir identificar uma data. Se não houver, use null.',
          'Em requisitos_atendidos, use códigos como NR-1, NR-7, NR-9, NR-12, CONAMA 430, ISO 14001 6.1.2 quando o documento comprovar explicitamente o requisito.',
          'Em dados_especificos, use arrays para listas e null quando a informação não estiver explícita.',
          promptEspecializado(tipoDetectado),
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
