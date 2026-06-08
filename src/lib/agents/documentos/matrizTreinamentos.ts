import { executarComRaciocinio } from '@/lib/agents/base/agenteCOT'

export async function gerarMatrizTreinamentos(contexto: string, docProjetoId?: string) {
  const systemPrompt = [
    'Voce e consultor senior em SST, ISO 14001, ISO 45001 e gestao de competencias.',
    'Gere Matriz de Treinamentos Obrigatorios em markdown para a empresa, usando setor, processos, riscos e documentos analisados.',
    'Estrutura obrigatoria: Objetivo, Escopo, Criterios de obrigatoriedade, Matriz de treinamentos, Controle de registros, Reciclagens e Responsabilidades.',
    'A tabela deve conter: Treinamento, Norma referencia, Publico-alvo, Carga horaria, Periodicidade, Tipo (admissional, periodico, reciclagem), Responsavel, Evidencia esperada.',
    'Cite NRs aplicaveis com nome completo quando houver relacao com os riscos do setor.',
    'Nao invente cargos; se nao existirem, use funcoes/processos provaveis e marque precisa validacao.',
    'Documento com 800 a 1500 palavras, linguagem tecnica e pratica.',
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
    metadados: { raciocinioIA: raciocinio, agente: 'matrizTreinamentos' },
  }
}
