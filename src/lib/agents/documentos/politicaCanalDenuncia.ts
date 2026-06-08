import { executarComRaciocinio } from '@/lib/agents/base/agenteCOT'

export async function gerarPoliticaCanalDenuncia(contexto: string, docProjetoId?: string) {
  const systemPrompt = [
    'Voce e especialista em compliance, governanca corporativa e ESG.',
    'Gere Politica de Canal de Denuncia em markdown, especifica para a empresa.',
    'Estrutura obrigatoria: Objetivo, Abrangencia, Tipos de denuncia aceitas, Procedimentos de recebimento e triagem, Garantias ao denunciante, Confidencialidade, Protecao contra retaliacao, Investigacao, Prazos, Responsabilidades, Registros e Indicadores.',
    'Inclua denuncias de assedio, discriminacao, corrupcao, fraude, seguranca do trabalho, meio ambiente e violacoes do codigo de conduta.',
    'Use linguagem formal, objetiva e auditavel. Nao invente canal existente; quando nao houver, proponha canal a implantar.',
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
    metadados: { raciocinioIA: raciocinio, agente: 'politicaCanalDenuncia' },
  }
}
