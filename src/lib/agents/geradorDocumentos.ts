import { openai } from '@/lib/openai'

type DocProjetoInput = {
  nome: string
  tipo: string
  gaps?: {
    requisito: string
    status: string
    justificativa: string | null
    documentoEsperado: string | null
  }[]
}

type EmpresaInput = {
  nome: string
  setor: string | null
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

export async function gerarDocumento(
  docProjeto: DocProjetoInput,
  empresa: EmpresaInput,
  anamnese: AnamneseInput | null,
  perfilOperacional: unknown,
) {
  const prompt = promptForDocument(docProjeto.nome)
  const gaps = docProjeto.gaps?.length
    ? `\nGaps do projeto:\n${JSON.stringify(docProjeto.gaps)}`
    : '\nGaps do projeto: nenhum gap informado.'

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    max_tokens: 3000,
    messages: [
      {
        role: 'system',
        content: prompt.system,
      },
      {
        role: 'user',
        content: [
          prompt.userInstruction,
          'Retorne somente o conteúdo do documento em Markdown estruturado.',
          '',
          baseContext(docProjeto, empresa, anamnese, perfilOperacional),
          gaps,
        ].join('\n'),
      },
    ],
  })

  const content = completion.choices[0]?.message.content

  if (!content) {
    throw new Error('A OpenAI não retornou conteúdo para o documento.')
  }

  return content
}
