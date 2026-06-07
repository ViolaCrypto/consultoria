import { executarComRaciocinio } from '@/lib/agents/base/agenteCOT'

export async function gerarInventarioRiscos(contexto: string, docProjetoId?: string) {
  const systemPrompt =
    'Você é especialista em SST, PGR, higiene ocupacional e NRs brasileiras. Gere inventário de riscos ocupacionais em markdown, específico e auditável.'
  const userPrompt = [
    'Gere um Inventário de Riscos Ocupacionais.',
    'Considere funções/cargos quando disponíveis, atividades, processos, agentes da ontologia do setor e dados extraídos de PGR/PCMSO/arquivos.',
    'Para cada função ou GHE, identifique perigos, avalie riscos, classifique por GHE, indique medidas de controle pela hierarquia: eliminação, substituição, engenharia, administrativo e EPI.',
    'Referencie NRs específicas por tipo de risco.',
    'Use tabelas markdown e destaque lacunas que precisam validação.',
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
      agente: 'inventarioRiscos',
    },
  }
}
