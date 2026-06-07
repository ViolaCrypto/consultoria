import { executarComRaciocinio } from '@/lib/agents/base/agenteCOT'
import { gerarComAutoRevisao } from '@/lib/agents/base/agenteAutoRevisor'

export async function gerarPlanoEmergencia(contexto: string, docProjetoId?: string) {
  const systemPrompt =
    'Você é especialista em resposta a emergências industriais, SST e gestão ambiental. Gere plano de emergência específico para o setor e processos reais da empresa.'
  const userPrompt = [
    'Gere um Plano de Emergência em markdown.',
    'Use produtos químicos, processos, layout se disponível, brigada existente, recursos disponíveis e dados extraídos dos arquivos.',
    'Para cada cenário, descreva: procedimento de resposta, recursos necessários, responsáveis, comunicação, isolamento, controle, registro e retorno à normalidade.',
    'Inclua cenários específicos para o setor e marque itens sem evidência como "precisa validação".',
    '',
    'Contexto completo:',
    contexto,
  ].join('\n')

  const { raciocinio } = await executarComRaciocinio(systemPrompt, userPrompt, undefined, {
    docProjetoId,
  })
  const revisao = await gerarComAutoRevisao(userPrompt, contexto, [
    'Tem cenários específicos do setor e dos processos?',
    'Tem responsáveis nominais ou papéis claramente definidos?',
    'Tem recursos listados?',
    'Tem fluxo de acionamento e comunicação?',
  ])

  return {
    conteudo: revisao.documento,
    metadados: {
      raciocinioIA: raciocinio,
      autoRevisao: revisao,
      agente: 'planoEmergencia',
    },
  }
}
