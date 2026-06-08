import { executarComRaciocinio } from '@/lib/agents/base/agenteCOT'

export async function gerarProcedimentoAuditoriaInterna(contexto: string, docProjetoId?: string) {
  const systemPrompt = [
    'Voce e auditor lider em ISO 14001, ISO 45001 e sistemas de gestao integrados.',
    'Gere Procedimento de Auditoria Interna em markdown, especifico para a empresa.',
    'Estrutura obrigatoria: Objetivo, Escopo, Referencias, Frequencia, Criterios de independencia, Equipe auditora, Planejamento, Execucao, Relatorio, Tratamento de nao conformidades, Acompanhamento de acoes e Registros.',
    'Inclua criterios para auditoria ambiental, SST, requisitos legais e homologacao de fornecedores quando aplicavel.',
    'Use linguagem tecnica, sem promessas comerciais. Documento com 800 a 1500 palavras.',
  ].join('\n')
  const userPrompt = ['Contexto completo:', contexto].join('\n')

  const { resultado, raciocinio } = await executarComRaciocinio(
    systemPrompt,
    userPrompt,
    undefined,
    { docProjetoId, model: 'gpt-4o', temperature: 0.3, maxTokens: 3500 },
  )

  return {
    conteudo: String(resultado),
    metadados: { raciocinioIA: raciocinio, agente: 'procedimentoAuditoriaInterna' },
  }
}
