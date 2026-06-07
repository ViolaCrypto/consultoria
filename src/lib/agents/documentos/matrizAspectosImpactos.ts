import { executarComRaciocinio } from '@/lib/agents/base/agenteCOT'
import { gerarComAutoRevisao } from '@/lib/agents/base/agenteAutoRevisor'

export async function gerarMatrizAspectosImpactos(contexto: string, docProjetoId?: string) {
  const systemPrompt =
    'Você é especialista em ISO 14001 e avaliação de aspectos e impactos ambientais. Gere matriz técnica em markdown, específica para a empresa, sem inventar dados ausentes.'
  const userPrompt = [
    'Gere uma Matriz de Aspectos e Impactos Ambientais.',
    'Para cada processo real identificado, avalie: processo, aspecto ambiental, impacto potencial, situação (normal/anormal/emergência), probabilidade, severidade, significância, controle existente e controle proposto.',
    'Use tabela markdown com todas as colunas. Quando faltar evidência, marque como "precisa validação".',
    '',
    'Contexto completo:',
    contexto,
  ].join('\n')

  const { raciocinio } = await executarComRaciocinio(systemPrompt, userPrompt, undefined, {
    docProjetoId,
  })
  const revisao = await gerarComAutoRevisao(userPrompt, contexto, [
    'Tem processo → aspecto → impacto → significância → controle?',
    'Usa processos reais da empresa, ontologia e arquivos processados?',
    'Diferencia situação normal, anormal e emergência?',
    'Evita afirmar controles inexistentes sem evidência?',
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
