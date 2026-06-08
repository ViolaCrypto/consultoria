export type ProjetoOnboardingData = {
  anamnese: { numFuncionarios: number | null } | null
  arquivos: unknown[]
  avaliacoes: {
    itens: { status: string }[]
  }[]
  documentos: { status: string }[]
}

export type OnboardingStepId =
  | 'anamnese'
  | 'arquivos'
  | 'modelos'
  | 'gap'
  | 'diagnostico'

export type OnboardingStep = {
  id: OnboardingStepId
  title: string
  description: string
  actionLabel: string
  status: 'pendente' | 'em_andamento' | 'concluido'
}

export function getOnboardingSteps(projeto: ProjetoOnboardingData): OnboardingStep[] {
  const allItems = projeto.avaliacoes.flatMap((avaliacao) => avaliacao.itens)
  const evaluatedItems = allItems.filter((item) => item.status !== 'precisa_validacao')
  const gapProgress = allItems.length ? evaluatedItems.length / allItems.length : 0
  const completed = {
    anamnese: Boolean(projeto.anamnese?.numFuncionarios),
    arquivos: projeto.arquivos.length > 0,
    modelos: projeto.avaliacoes.length > 0,
    gap: gapProgress >= 0.5,
    diagnostico: projeto.documentos.some((documento) => documento.status === 'aprovado'),
  }
  const order: Array<Omit<OnboardingStep, 'status'>> = [
    {
      id: 'anamnese',
      title: 'Preencher Anamnese',
      description: 'Registre o contexto operacional da empresa',
      actionLabel: 'Abrir Anamnese',
    },
    {
      id: 'arquivos',
      title: 'Importar Documentos',
      description: 'Suba os documentos existentes para análise automática',
      actionLabel: 'Importar documentos',
    },
    {
      id: 'modelos',
      title: 'Vincular Modelos',
      description: 'Escolha os modelos de avaliação aplicáveis',
      actionLabel: 'Vincular modelos',
    },
    {
      id: 'gap',
      title: 'Gap Analysis',
      description: 'Avalie os requisitos com apoio da IA',
      actionLabel: 'Abrir Gap Analysis',
    },
    {
      id: 'diagnostico',
      title: 'Gerar Diagnóstico',
      description: 'Produza o relatório técnico e os documentos',
      actionLabel: 'Gerar diagnóstico',
    },
  ]
  const firstPendingIndex = order.findIndex((step) => !completed[step.id])

  return order.map((step, index) => ({
    ...step,
    status: completed[step.id]
      ? 'concluido'
      : index === firstPendingIndex
        ? 'em_andamento'
        : 'pendente',
  }))
}

export function isProjectAtStart(projeto: ProjetoOnboardingData) {
  return (
    !projeto.anamnese?.numFuncionarios &&
    projeto.arquivos.length === 0 &&
    projeto.avaliacoes.length === 0
  )
}

export function isOnboardingComplete(projeto: ProjetoOnboardingData) {
  return getOnboardingSteps(projeto).every((step) => step.status === 'concluido')
}
