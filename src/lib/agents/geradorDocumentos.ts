import { executarComRaciocinio } from '@/lib/agents/base/agenteCOT'
import { gerarComAutoRevisao } from '@/lib/agents/base/agenteAutoRevisor'
import { gerarInventarioRiscos } from '@/lib/agents/documentos/inventarioRiscos'
import { gerarMatrizAspectosImpactos } from '@/lib/agents/documentos/matrizAspectosImpactos'
import { gerarPGRS } from '@/lib/agents/documentos/pgrs'
import { gerarPlanoEmergencia } from '@/lib/agents/documentos/planoEmergencia'
import { montarContextoCompleto } from '@/lib/contextoDocumental'
import { buscarPadroesSetor, normalizarSetor } from '@/lib/memoria'

type DocProjetoInput = {
  id?: string
  projetoId?: string
  nome: string
  tipo: string
  gaps?: {
    requisito: string
    status: string
    justificativa: string | null
    documentoEsperado: string | null
  }[]
}

export type DocumentoGerado = {
  conteudo: string
  metadados: {
    raciocinioIA?: string
    autoRevisao?: unknown
    agente?: string
    geradoEm: string
  }
}

function formatarContextoDocumental(contexto: Awaited<ReturnType<typeof montarContextoCompleto>>) {
  if (!contexto) {
    return 'Contexto documental disponível: não localizado.'
  }

  return [
    `Qualidade do contexto: ${contexto.qualidadeContexto}%`,
    'Anamnese estruturada:',
    JSON.stringify(contexto.anamnese?.dadosSetor || {}, null, 2),
    '',
    'Arquivos processados e contexto extraído:',
    contexto.arquivosProcessados.length
      ? JSON.stringify(
          contexto.arquivosProcessados.map((arquivo) => ({
            nome: arquivo.nome,
            tipo: arquivo.tipo,
            metadados: arquivo.metadados,
          })),
          null,
          2,
        )
      : 'Nenhum arquivo processado por IA.',
    '',
    'Ontologia do setor:',
    JSON.stringify(contexto.ontologia, null, 2),
  ].join('\n')
}

type EmpresaInput = {
  nome: string
  setor: string | null
  setorCodigo?: string | null
  cnae: string | null
  cidade?: string | null
  estado?: string | null
}

type AnamneseInput = {
  numFuncionarios: number | null
  turnos: string | null
  processosPrincipais: string | null
  dadosSetor: unknown
}

function baseContext(
  docProjeto: DocProjetoInput,
  empresa: EmpresaInput,
  anamnese: AnamneseInput | null,
  perfilOperacional: unknown,
) {
  return [
    `Documento solicitado: ${docProjeto.nome}`,
    `Tipo interno: ${docProjeto.tipo}`,
    `Empresa: ${empresa.nome}`,
    `Setor: ${empresa.setor || 'não informado'}`,
    `Setor na ontologia: ${empresa.setorCodigo || 'não informado'}`,
    `CNAE: ${empresa.cnae || 'não informado'}`,
    `Localização: ${[empresa.cidade, empresa.estado].filter(Boolean).join(', ') || 'não informada'}`,
    `Número de funcionários: ${anamnese?.numFuncionarios ?? 'não informado'}`,
    `Turnos: ${anamnese?.turnos || 'não informado'}`,
    `Processos principais: ${anamnese?.processosPrincipais || 'não informado'}`,
    `Dados adicionais da anamnese: ${JSON.stringify(anamnese?.dadosSetor || {})}`,
    `Perfil operacional: ${JSON.stringify(perfilOperacional || {})}`,
  ].join('\n')
}

function promptForDocument(name: string) {
  const normalized = name.toLowerCase()

  if (normalized.includes('política ambiental') || normalized.includes('politica ambiental')) {
    return {
      system:
        'Você é consultor especialista em ISO 14001. Gere uma Política Ambiental em markdown estruturado. Mencione obrigatoriamente o setor da empresa, aspectos ambientais reais do perfil, compromissos específicos com legislação aplicável e o nome real da empresa. Use a estrutura: Objetivo, Escopo, Compromissos, Comunicação, Revisão, Assinatura da direção.',
      userInstruction:
        'Gere uma Política Ambiental objetiva, pronta para revisão e assinatura pela direção. Não invente certificações, licenças ou dados ausentes.',
    }
  }

  if (
    normalized.includes('política de sst') ||
    normalized.includes('politica de sst') ||
    normalized.includes('saúde e segurança') ||
    normalized.includes('saude e seguranca')
  ) {
    return {
      system:
        'Você é consultor especialista em ISO 45001 e SST. Gere uma Política de SST em markdown estruturado. Mencione obrigatoriamente o setor da empresa, riscos SST reais do perfil, NRs aplicáveis ao setor, compromissos com saúde e segurança e o nome real da empresa. Use linguagem formal e auditável.',
      userInstruction:
        'Gere uma Política de SST objetiva, pronta para revisão e assinatura pela direção. Não invente dados ausentes.',
    }
  }

  if (normalized.includes('plano de ação') || normalized.includes('plano de acao')) {
    return {
      system:
        'Você é consultor especialista em ISO 14001, ISO 45001 e SST. Gere um Plano de Ação em markdown com tabela. Use os gaps reais fornecidos. A tabela deve conter exatamente as colunas: O quê, Por quê, Como, Quem, Quando, Recursos, Indicador de conclusão.',
      userInstruction:
        'Gere um Plano de Ação prático e rastreável. Não crie gaps que não estejam na lista fornecida.',
    }
  }

  return {
    system:
      'Você é consultor especialista em sistemas de gestão ISO 14001/45001 e SST. Gere um procedimento genérico em markdown estruturado. Use a estrutura: Objetivo, Escopo, Responsabilidades, Descrição do procedimento, Registros, Anexos. Adapte ao setor, processos e riscos/aspectos reais fornecidos.',
    userInstruction:
      'Gere um procedimento claro, operacional e pronto para revisão. Não invente dados ausentes.',
  }
}

function detectarDocumentoEspecializado(nome: string) {
  const normalized = nome.toLowerCase()

  if (
    normalized.includes('matriz de aspectos') ||
    normalized.includes('aspectos e impactos') ||
    normalized.includes('impactos ambientais')
  ) {
    return 'matrizAspectosImpactos'
  }

  if (
    normalized.includes('inventário de riscos') ||
    normalized.includes('inventario de riscos') ||
    normalized.includes('inventário de risco') ||
    normalized.includes('inventario de risco')
  ) {
    return 'inventarioRiscos'
  }

  if (
    normalized.includes('plano de emergência') ||
    normalized.includes('plano de emergencia') ||
    normalized.includes('pae')
  ) {
    return 'planoEmergencia'
  }

  if (
    normalized.includes('pgrs') ||
    normalized.includes('gerenciamento de resíduos') ||
    normalized.includes('gerenciamento de residuos')
  ) {
    return 'pgrs'
  }

  return null
}

function criteriosPorDocumento(nome: string) {
  const normalized = nome.toLowerCase()

  if (normalized.includes('política ambiental') || normalized.includes('politica ambiental')) {
    return [
      'Menciona setor real?',
      'Menciona aspectos ambientais específicos?',
      'Tem compromisso com legislação?',
      'Tem data e assinatura prevista?',
    ]
  }

  if (
    normalized.includes('matriz de aspectos') ||
    normalized.includes('aspectos e impactos')
  ) {
    return ['Tem processo → aspecto → impacto → significância → controle?']
  }

  if (
    normalized.includes('plano de emergência') ||
    normalized.includes('plano de emergencia')
  ) {
    return [
      'Tem cenários específicos?',
      'Tem responsáveis nominais ou papéis definidos?',
      'Tem recursos listados?',
      'Tem fluxo de acionamento?',
    ]
  }

  return [
    'Usa dados reais da empresa?',
    'Evita afirmações sem evidência?',
    'Indica lacunas como precisa validação?',
    'Está estruturado em markdown profissional?',
  ]
}

export async function gerarDocumento(
  docProjeto: DocProjetoInput,
  empresa: EmpresaInput,
  anamnese: AnamneseInput | null,
  perfilOperacional: unknown,
): Promise<DocumentoGerado> {
  const prompt = promptForDocument(docProjeto.nome)
  const contextoDocumental = docProjeto.projetoId
    ? await montarContextoCompleto(docProjeto.projetoId)
    : null
  const contextoCompleto = [
    'Contexto documental disponível:',
    formatarContextoDocumental(contextoDocumental),
    '',
    baseContext(docProjeto, empresa, anamnese, perfilOperacional),
    docProjeto.gaps?.length
      ? `\nGaps do projeto:\n${JSON.stringify(docProjeto.gaps)}`
      : '\nGaps do projeto: nenhum gap informado.',
  ].join('\n')
  const agenteEspecializado = detectarDocumentoEspecializado(docProjeto.nome)

  if (agenteEspecializado === 'matrizAspectosImpactos') {
    const gerado = await gerarMatrizAspectosImpactos(contextoCompleto, docProjeto.id)
    return { ...gerado, metadados: { ...gerado.metadados, geradoEm: new Date().toISOString() } }
  }

  if (agenteEspecializado === 'inventarioRiscos') {
    const gerado = await gerarInventarioRiscos(contextoCompleto, docProjeto.id)
    return { ...gerado, metadados: { ...gerado.metadados, geradoEm: new Date().toISOString() } }
  }

  if (agenteEspecializado === 'planoEmergencia') {
    const gerado = await gerarPlanoEmergencia(contextoCompleto, docProjeto.id)
    return { ...gerado, metadados: { ...gerado.metadados, geradoEm: new Date().toISOString() } }
  }

  if (agenteEspecializado === 'pgrs') {
    const gerado = await gerarPGRS(contextoCompleto, docProjeto.id)
    return { ...gerado, metadados: { ...gerado.metadados, geradoEm: new Date().toISOString() } }
  }

  const setorReferencia = normalizarSetor(empresa.setorCodigo || empresa.setor)
  const padroesSetor = await buscarPadroesSetor(
    setorReferencia,
    docProjeto.tipo || docProjeto.nome,
  )
  const gaps = docProjeto.gaps?.length
    ? `\nGaps do projeto:\n${JSON.stringify(docProjeto.gaps)}`
    : '\nGaps do projeto: nenhum gap informado.'
  const referencias = padroesSetor.length
    ? [
        'Exemplos de referência aprovados pela consultoria:',
        ...padroesSetor.map((padrao, index) =>
          [
            `Exemplo ${index + 1}: ${padrao.nome}`,
            `Setor: ${padrao.setor}`,
            `Tipo: ${padrao.tipo}`,
            'Conteúdo aprovado:',
            padrao.conteudo.slice(0, 4000),
          ].join('\n'),
        ),
      ].join('\n\n')
    : 'Nenhum documento aprovado anterior encontrado para este setor/tipo.'

  const userPrompt = [
    prompt.userInstruction,
    'Use esses documentos aprovados como referência de qualidade e especificidade quando existirem.',
    'Retorne somente o conteúdo do documento em Markdown estruturado.',
    '',
    referencias,
    '',
    contextoCompleto,
    gaps,
  ].join('\n')
  const { raciocinio } = await executarComRaciocinio(
    prompt.system,
    userPrompt,
    undefined,
    { docProjetoId: docProjeto.id, maxTokens: 3500 },
  )
  const autoRevisao = await gerarComAutoRevisao(
    userPrompt,
    contextoCompleto,
    criteriosPorDocumento(docProjeto.nome),
  )

  return {
    conteudo: autoRevisao.documento,
    metadados: {
      raciocinioIA: raciocinio,
      autoRevisao,
      agente: 'genericoComCOT',
      geradoEm: new Date().toISOString(),
    },
  }
}
