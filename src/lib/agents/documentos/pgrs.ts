import { executarComRaciocinio } from '@/lib/agents/base/agenteCOT'

export async function gerarPGRS(contexto: string, docProjetoId?: string) {
  const systemPrompt = [
    'Voce e especialista senior em gestao de residuos solidos, ISO 14001, PNRS, ABNT NBR 10004 e MTR.',
    'Gere Plano de Gestao de Residuos Solidos (PGRS) em markdown, especifico para o setor real da empresa.',
    'Estrutura obrigatoria: Objetivo, Escopo, Caracterizacao da empresa, Diagnostico de residuos, Classificacao legal, Segregacao, Acondicionamento, Coleta interna, Armazenamento temporario, Destinacao final licenciada, Logistica reversa, Indicadores, Registros e Plano de acao.',
    'Para cada residuo, trazer: identificacao, classe I/IIA/IIB conforme ABNT NBR 10004, quantificacao estimada, acondicionamento, coleta interna, armazenamento temporario, destinacao final licenciada, MTR obrigatorio e indicador.',
    'Cite Lei 12.305/2010, Decreto 10.936/2022, ABNT NBR 10004, CONAMA e regras de MTR quando aplicavel.',
    'Nao invente dados; quando faltar volume ou destinador, marcar precisa validacao. Documento com 800 a 1500 palavras.',
  ].join('\n')
  const userPrompt = [
    'Gere um PGRS - Plano de Gerenciamento de Residuos Solidos.',
    'Use residuos gerados da ontologia, anamnese e arquivos processados.',
    '',
    'Contexto completo:',
    contexto,
  ].join('\n')

  const { resultado, raciocinio } = await executarComRaciocinio(
    systemPrompt,
    userPrompt,
    undefined,
    { docProjetoId, maxTokens: 4000, model: 'gpt-4o', temperature: 0.3 },
  )

  return {
    conteudo: String(resultado),
    metadados: {
      raciocinioIA: raciocinio,
      agente: 'pgrs',
    },
  }
}
