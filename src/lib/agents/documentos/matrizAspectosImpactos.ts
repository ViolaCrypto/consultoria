import { executarComRaciocinio } from '@/lib/agents/base/agenteCOT'
import { gerarComAutoRevisao } from '@/lib/agents/base/agenteAutoRevisor'

export async function gerarMatrizAspectosImpactos(contexto: string, docProjetoId?: string) {
  const systemPrompt = [
    'Voce e especialista senior em ISO 14001, avaliacao de aspectos e impactos ambientais e auditoria ambiental industrial.',
    'Gere Matriz de Aspectos e Impactos Ambientais em markdown, especifica para o setor real da empresa.',
    'Estrutura obrigatoria: Objetivo, Escopo, Metodologia, Criterios de significancia, Matriz, Controles operacionais, Indicadores e Revisao.',
    'A matriz deve conter exatamente estas colunas: Processo / Atividade / Aspecto Ambiental / Impacto Ambiental / Classificacao (Real/Potencial) / Condicao (Normal/Anormal/Emergencia) / Significancia (matriz frequencia x severidade) / Controle Operacional / Indicador.',
    'Cite ISO 14001, Lei 12.305/2010, CONAMA e ABNT NBR 10004 quando aplicavel.',
    'Nao invente dados ausentes; marque como precisa validacao. Documento com 800 a 1500 palavras.',
  ].join('\n')
  const userPrompt = [
    'Gere uma Matriz de Aspectos e Impactos Ambientais.',
    'Use processos reais da empresa, anamnese, ontologia setorial e arquivos processados.',
    '',
    'Contexto completo:',
    contexto,
  ].join('\n')

  const { raciocinio } = await executarComRaciocinio(systemPrompt, userPrompt, undefined, {
    docProjetoId,
    model: 'gpt-4o',
    temperature: 0.3,
    maxTokens: 3500,
  })
  const revisao = await gerarComAutoRevisao(userPrompt, contexto, [
    'Tem processo -> aspecto -> impacto -> significancia -> controle?',
    'Usa processos reais da empresa, ontologia e arquivos processados?',
    'Diferencia situacao normal, anormal e emergencia?',
    'Evita afirmar controles inexistentes sem evidencia?',
  ])

  return {
    conteudo: revisao.documento,
    metadados: {
      raciocinioIA: raciocinio,
      autoRevisao: revisao,
      agente: 'matrizAspectosImpactos',
    },
  }
}
