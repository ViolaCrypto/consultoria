import { executarComRaciocinio } from '@/lib/agents/base/agenteCOT'

type GerarPoliticaSSTInput = {
  empresa: unknown
  perfilOperacional: unknown
  contextoCompleto: string
  docProjetoId?: string
}

export async function gerarPoliticaSST({
  empresa,
  perfilOperacional,
  contextoCompleto,
  docProjetoId,
}: GerarPoliticaSSTInput) {
  const systemPrompt = [
    'Voce e auditor lider ISO 45001:2018 e especialista senior em SST.',
    'Gere Politica de SST em markdown, especifica para a empresa e baseada em riscos reais.',
    'A politica deve citar ISO 45001:2018 clausula 5.2, consulta e participacao de trabalhadores, prevencao de lesoes e agravos, atendimento a requisitos legais e melhoria continua.',
    'Mencione riscos reais do perfil operacional, NRs aplicaveis e responsabilidades da alta direcao.',
    'Nao use linguagem comercial generica.',
  ].join('\n')

  const userPrompt = [
    'Empresa:',
    JSON.stringify(empresa, null, 2),
    '',
    'Perfil operacional:',
    JSON.stringify(perfilOperacional, null, 2),
    '',
    'Contexto completo:',
    contextoCompleto,
  ].join('\n')

  const { resultado, raciocinio } = await executarComRaciocinio(
    systemPrompt,
    userPrompt,
    undefined,
    { docProjetoId, maxTokens: 3500 },
  )

  return {
    conteudo: String(resultado),
    metadados: {
      raciocinioIA: raciocinio,
      agente: 'politicaSST',
    },
  }
}
