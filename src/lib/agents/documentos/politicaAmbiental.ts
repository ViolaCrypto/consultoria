import { executarComRaciocinio } from '@/lib/agents/base/agenteCOT'
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
  docProjetoId,
}: GerarPoliticaAmbientalInput) {
  const systemPrompt = [
    'Voce e auditor lider ISO 14001:2015 com experiencia em certificacao de fornecedores automotivos. Gere Politica Ambiental tecnicamente robusta.',
    '',
    'REGRAS ABSOLUTAS:',
    'Sempre alinhar com ISO 14001:2015 clausula 5.2.',
    'Compromissos devem ser especificos ao setor da empresa - nao use preservar biodiversidade generico se a empresa e industrial urbana.',
    'Diretrizes Ambientais devem refletir aspectos ambientais REAIS identificados no perfil operacional.',
    'Para empresas com fluidos refrigerantes: incluir gestao de GWP, vazamentos, descarte conforme Protocolo de Montreal e Emenda de Kigali.',
    'Para empresas com quimicos: incluir gestao por FISPQ, NR-26, armazenamento seguro.',
    'Para empresas com residuos: incluir PNRS Lei 12.305/2010, MTR obrigatorio, destinacao licenciada.',
    'Comunicacao: explicitar canais internos e externos.',
    'Responsabilidades da Alta Direcao devem ser especificas, nao genericas.',
    '',
    'Retorne em markdown seguindo PADRAO_POLITICA_AMBIENTAL.estruturaObrigatoria na ordem.',
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

  const { resultado, raciocinio } = await executarComRaciocinio(
    systemPrompt,
    userPrompt,
    undefined,
    { docProjetoId, maxTokens: 4000 },
  )

  return {
    conteudo: String(resultado),
    metadados: {
      raciocinioIA: raciocinio,
      agente: 'politicaAmbiental',
    },
  }
}
