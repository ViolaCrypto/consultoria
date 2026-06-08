import { openai } from '@/lib/openai'
import { PADRAO_POLITICA_AMBIENTAL } from '@/lib/referencias/padroesTecnicos'

type GerarPoliticaAmbientalInput = {
  empresa: unknown
  perfilOperacional: unknown
  arquivosAnalisados: unknown
  ontologiaSetor: unknown
  contextoCompleto: string
  docProjetoId?: string
}

export async function gerarPoliticaAmbiental({
  empresa,
  perfilOperacional,
  arquivosAnalisados,
  ontologiaSetor,
  contextoCompleto,
}: GerarPoliticaAmbientalInput) {
  const systemPrompt = [
    'Voce e auditor lider ISO 14001:2015 com 25 anos de experiencia em certificacao ambiental para fornecedores automotivos (Volkswagen, Audi, Renault).',
    '',
    'ESTRUTURA OBRIGATORIA - 8 SECOES NUMERADAS:',
    '',
    '1. PROPOSITO',
    '- Mencionar explicitamente: ISO 14001:2015',
    '- Compromissos com: protecao do meio ambiente, prevencao da poluicao, melhoria continua do SGA',
    '',
    '2. ESCOPO',
    '- Detalhar atividades, produtos e servicos reais da empresa',
    '- Citar processos identificados no perfil operacional',
    '',
    '3. COMPROMISSOS DA ORGANIZACAO',
    '3.1 Protecao do Meio Ambiente',
    '3.2 Atendimento a Requisitos Legais e Outros Requisitos',
    '3.3 Melhoria Continua do SGA',
    '',
    '4. DIRETRIZES AMBIENTAIS ESTRATEGICAS',
    'Subsecoes obrigatorias conforme aspectos ambientais reais do setor:',
    '4.1 Emissoes de Gases de Efeito Estufa (GEE)',
    '4.2 Eficiencia Energetica',
    '4.3 Agua - Consumo, Qualidade e Gestao',
    '4.4 Qualidade do Ar (se aplicavel)',
    '4.5 Gestao de Produtos Quimicos (se usa quimicos)',
    '4.6 Residuos - Reutilizacao e Reciclagem',
    '4.7 Qualidade do Solo (se ha risco de contaminacao)',
    '4.8 Ruido Ambiental (se aplicavel)',
    '4.9 Outros aspectos especificos do setor',
    'Cada subsecao deve ter 3-5 bullets com ACOES ESPECIFICAS, nao genericas.',
    '',
    '5. INTEGRACAO COM O SGA',
    'Listar 6 pontos: aspectos e impactos, objetivos e metas, planejamento de acoes, controles operacionais, monitoramento, auditorias.',
    '',
    '6. COMUNICACAO',
    'Como sera comunicada interna e externamente. Manutencao como informacao documentada.',
    '',
    '7. RESPONSABILIDADES',
    'Alta Direcao: integracao ao negocio, recursos, melhoria continua, lideranca.',
    '',
    '8. REVISAO E APROVACAO',
    'Periodicidade e gatilhos de revisao.',
    '',
    'REGRAS ABSOLUTAS:',
    '- NUNCA escrever texto generico tipo "buscamos melhoria continua" sem acao especifica.',
    '- SEMPRE mencionar o nome real da empresa pelo menos 5 vezes.',
    '- SEMPRE citar pelo menos 3 aspectos ambientais REAIS do setor vindos do perfil operacional.',
    '- SEMPRE citar legislacao especifica aplicavel: ISO 14001:2015, Lei 12.305/2010 (PNRS), CONAMA 430/2011 (efluentes), CONAMA 307/2002 (RCC), conforme aplicabilidade.',
    '- Use linguagem tecnica de auditoria, nao linguagem comercial.',
    '- Documento deve ter entre 800 e 1500 palavras.',
    '- Retorne somente Markdown renderizavel, sem cercas de codigo.',
  ].join('\n')

  const userPrompt = [
    'PADRAO_POLITICA_AMBIENTAL:',
    JSON.stringify(PADRAO_POLITICA_AMBIENTAL, null, 2),
    '',
    'Empresa:',
    JSON.stringify(empresa, null, 2),
    '',
    'Perfil operacional:',
    JSON.stringify(perfilOperacional, null, 2),
    '',
    'Arquivos analisados:',
    JSON.stringify(arquivosAnalisados, null, 2),
    '',
    'Ontologia do setor:',
    JSON.stringify(ontologiaSetor, null, 2),
    '',
    'Contexto completo consolidado:',
    contextoCompleto,
  ].join('\n')

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    temperature: 0.3,
    max_tokens: 3500,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
  })

  const conteudo = completion.choices[0]?.message.content

  if (!conteudo) {
    throw new Error('A OpenAI nao retornou Politica Ambiental.')
  }

  return {
    conteudo,
    metadados: {
      agente: 'politicaAmbiental',
      modelo: 'gpt-4o',
      promptTecnico: 'politicaAmbientalISO14001Automotivo',
    },
  }
}
