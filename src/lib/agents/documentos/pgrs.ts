import { executarComRaciocinio } from '@/lib/agents/base/agenteCOT'

export async function gerarPGRS(contexto: string, docProjetoId?: string) {
  const systemPrompt =
    'Você é especialista em gestão de resíduos, ISO 14001, PNRS, NBR 10004 e MTR. Gere PGRS técnico em markdown com rastreabilidade.'
  const userPrompt = [
    'Gere um PGRS - Plano de Gerenciamento de Resíduos Sólidos.',
    'Use resíduos gerados da ontologia, anamnese e arquivos processados.',
    'Para cada resíduo, classifique conforme NBR 10004, indique geração, armazenamento correto, destinação licenciada, MTR obrigatório, controles e registros.',
    'Use tabelas markdown e destaque informações que precisam validação documental.',
    '',
    'Contexto completo:',
    contexto,
  ].join('\n')

  const { resultado, raciocinio } = await executarComRaciocinio(
    systemPrompt,
    userPrompt,
    undefined,
    { docProjetoId, maxTokens: 4000 },
  )

  return {
    conteudo: String(resultado),
    metadados: {
      raciocinioIA: raciocinio,
      agente: 'pgrs',
    },
  }
}
