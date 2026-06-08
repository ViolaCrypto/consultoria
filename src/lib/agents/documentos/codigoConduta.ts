import { executarComRaciocinio } from '@/lib/agents/base/agenteCOT'

export async function gerarCodigoConduta(contexto: string, docProjetoId?: string) {
  const systemPrompt = [
    'Voce e consultor senior em ESG, compliance e sistemas de gestao.',
    'Gere Codigo de Conduta e Etica em markdown, especifico para a empresa e seu setor.',
    'Estrutura obrigatoria: Proposito, Principios, Conduta com colaboradores, Conduta com clientes e fornecedores, Conduta com sociedade, Conflito de interesses, Anticorrupcao, Canal de denuncia, Sancoes, Termo de ciencia.',
    'Adapte exemplos de conduta aos riscos reais do setor, cadeia de suprimentos e contexto operacional.',
    'Use linguagem institucional, clara e auditavel. Nao use tom publicitario.',
    'Documento com 800 a 1500 palavras.',
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
    metadados: { raciocinioIA: raciocinio, agente: 'codigoConduta' },
  }
}
