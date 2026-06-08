import { executarComRaciocinio } from '@/lib/agents/base/agenteCOT'
import { PADRAO_PGR } from '@/lib/referencias/padroesTecnicos'

type GerarPGRInput = {
  empresa: unknown
  perfilOperacional: unknown
  setoresIdentificados: unknown
  arquivosAnalisados: unknown
  ontologiaSetor: unknown
  contextoCompleto: string
  docProjetoId?: string
}

export async function gerarPGR({
  empresa,
  perfilOperacional,
  setoresIdentificados,
  arquivosAnalisados,
  ontologiaSetor,
  contextoCompleto,
  docProjetoId,
}: GerarPGRInput) {
  const systemPrompt = [
    'Voce e engenheiro de seguranca do trabalho senior com 20 anos de experiencia elaborando PGR para auditorias de homologacao de fornecedores de grandes montadoras (Volkswagen, Audi, Renault, Toyota). Gere PGR seguindo rigorosamente NR-01:2022 e padrao de mercado consolidado.',
    '',
    'REGRAS ABSOLUTAS:',
    'Cada perigo identificado DEVE ter: Grupo, Perigo especifico, Fundamentacao legal com NR e ITEM, Fontes geradoras especificas, Meio de propagacao, Tempo de exposicao, Criterio qualitativo/quantitativo, Probabilidade x Gravidade x Nivel de Risco, Medicao (se quantitativo: tecnica, equipamento, valor, nivel de acao, LT), Prevencao e controle (hierarquia NR-01), Acoes necessarias especificas.',
    "EPIs devem ter CA (Certificado de Aprovacao) - use placeholder '[CA a verificar]' se nao souber.",
    "Citacoes de NR devem ser exatas: 'NR-01 item 1.5.4.4.6', nao apenas 'NR-01'.",
    'Para ruido: cite NR-15 Anexo 1 ou Anexo 2, e NHO-01.',
    'Para quimicos: cite NR-15 Anexos 11, 12, 13 conforme aplicavel.',
    'Para calor: cite NHO-06.',
    'Para ergonomia: cite NR-17 com itens especificos.',
    "NUNCA invente medicoes - se nao ha medicao, marque 'Avaliacao qualitativa' e justifique.",
    'Plano de Acao deve ter Atividade / Prioridade / Descricao tecnica / Responsavel / Cronograma trimestral.',
    "Use linguagem tecnica de mercado: agente fisico, agente quimico, GHE - Grupo Homogeneo de Exposicao, nivel de acao, limite de tolerancia, medidas de controle hierarquicas.",
    '',
    'Retorne PGR em markdown estruturado seguindo PADRAO_PGR.estruturaObrigatoria na ordem.',
  ].join('\n')

  const userPrompt = [
    'PADRAO_PGR:',
    JSON.stringify(PADRAO_PGR, null, 2),
    '',
    'Empresa:',
    JSON.stringify(empresa, null, 2),
    '',
    'Perfil operacional:',
    JSON.stringify(perfilOperacional, null, 2),
    '',
    'Setores identificados:',
    JSON.stringify(setoresIdentificados, null, 2),
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

  const { resultado, raciocinio } = await executarComRaciocinio(
    systemPrompt,
    userPrompt,
    undefined,
    { docProjetoId, maxTokens: 5000 },
  )

  return {
    conteudo: String(resultado),
    metadados: {
      raciocinioIA: raciocinio,
      agente: 'pgr',
    },
  }
}
