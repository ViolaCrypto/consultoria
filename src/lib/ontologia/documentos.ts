export const CATEGORIAS_DOCUMENTO = {
  CONSULTORIA_AUTONOMA: 'consultoria_autonoma',
  REQUER_PARCERIA_TECNICA: 'requer_parceria_tecnica',
  EXIGIVEL_CLIENTE: 'exigivel_cliente',
} as const

export type CategoriaAutonomia =
  (typeof CATEGORIAS_DOCUMENTO)[keyof typeof CATEGORIAS_DOCUMENTO]

export type GrupoDocumento =
  | 'Ambiental'
  | 'SST Documental'
  | 'Sistema de Gestao / ESG'
  | 'Homologacao'
  | 'Parceria tecnica'
  | 'Exigivel cliente'

export type DocumentoOntologia = {
  nome: string
  categoriaAutonomia: CategoriaAutonomia
  grupo: GrupoDocumento
  motivoParceria?: string
  setores?: string[]
}

const AUTONOMOS: DocumentoOntologia[] = [
  { nome: 'Politica Ambiental', categoriaAutonomia: CATEGORIAS_DOCUMENTO.CONSULTORIA_AUTONOMA, grupo: 'Ambiental' },
  { nome: 'Matriz de Aspectos e Impactos Ambientais', categoriaAutonomia: CATEGORIAS_DOCUMENTO.CONSULTORIA_AUTONOMA, grupo: 'Ambiental' },
  { nome: 'Plano de Gestao de Residuos Solidos (PGRS)', categoriaAutonomia: CATEGORIAS_DOCUMENTO.CONSULTORIA_AUTONOMA, grupo: 'Ambiental' },
  { nome: 'Procedimento de Controle Operacional Ambiental', categoriaAutonomia: CATEGORIAS_DOCUMENTO.CONSULTORIA_AUTONOMA, grupo: 'Ambiental' },
  { nome: 'Plano de Monitoramento Ambiental', categoriaAutonomia: CATEGORIAS_DOCUMENTO.CONSULTORIA_AUTONOMA, grupo: 'Ambiental' },
  { nome: 'Procedimento de Atendimento a Emergencias Ambientais', categoriaAutonomia: CATEGORIAS_DOCUMENTO.CONSULTORIA_AUTONOMA, grupo: 'Ambiental' },
  { nome: 'Matriz de Requisitos Legais Ambientais', categoriaAutonomia: CATEGORIAS_DOCUMENTO.CONSULTORIA_AUTONOMA, grupo: 'Ambiental' },
  { nome: 'Programa de Educacao Ambiental', categoriaAutonomia: CATEGORIAS_DOCUMENTO.CONSULTORIA_AUTONOMA, grupo: 'Ambiental' },

  { nome: 'Politica de SST', categoriaAutonomia: CATEGORIAS_DOCUMENTO.CONSULTORIA_AUTONOMA, grupo: 'SST Documental' },
  { nome: 'Inventario de Riscos Ocupacionais (qualitativo)', categoriaAutonomia: CATEGORIAS_DOCUMENTO.CONSULTORIA_AUTONOMA, grupo: 'SST Documental' },
  { nome: 'Procedimento de Analise Preliminar de Risco (APR)', categoriaAutonomia: CATEGORIAS_DOCUMENTO.CONSULTORIA_AUTONOMA, grupo: 'SST Documental' },
  { nome: 'Modelo de Permissao de Trabalho (PT)', categoriaAutonomia: CATEGORIAS_DOCUMENTO.CONSULTORIA_AUTONOMA, grupo: 'SST Documental' },
  { nome: 'Procedimento de Investigacao de Acidentes', categoriaAutonomia: CATEGORIAS_DOCUMENTO.CONSULTORIA_AUTONOMA, grupo: 'SST Documental' },
  { nome: 'Plano de Atendimento a Emergencias (PAE)', categoriaAutonomia: CATEGORIAS_DOCUMENTO.CONSULTORIA_AUTONOMA, grupo: 'SST Documental' },
  { nome: 'Matriz de Treinamentos Obrigatorios', categoriaAutonomia: CATEGORIAS_DOCUMENTO.CONSULTORIA_AUTONOMA, grupo: 'SST Documental' },
  { nome: 'Procedimento de Gestao de EPI', categoriaAutonomia: CATEGORIAS_DOCUMENTO.CONSULTORIA_AUTONOMA, grupo: 'SST Documental' },
  { nome: 'Procedimento de Inspecao de Seguranca', categoriaAutonomia: CATEGORIAS_DOCUMENTO.CONSULTORIA_AUTONOMA, grupo: 'SST Documental' },
  { nome: 'Modelo de Ordem de Servico de Seguranca (OS)', categoriaAutonomia: CATEGORIAS_DOCUMENTO.CONSULTORIA_AUTONOMA, grupo: 'SST Documental' },

  { nome: 'Manual do Sistema de Gestao Integrado', categoriaAutonomia: CATEGORIAS_DOCUMENTO.CONSULTORIA_AUTONOMA, grupo: 'Sistema de Gestao / ESG' },
  { nome: 'Politica de Qualidade', categoriaAutonomia: CATEGORIAS_DOCUMENTO.CONSULTORIA_AUTONOMA, grupo: 'Sistema de Gestao / ESG' },
  { nome: 'Codigo de Conduta e Etica', categoriaAutonomia: CATEGORIAS_DOCUMENTO.CONSULTORIA_AUTONOMA, grupo: 'Sistema de Gestao / ESG' },
  { nome: 'Politica de Canal de Denuncia', categoriaAutonomia: CATEGORIAS_DOCUMENTO.CONSULTORIA_AUTONOMA, grupo: 'Sistema de Gestao / ESG' },
  { nome: 'Politica de Diversidade e Inclusao', categoriaAutonomia: CATEGORIAS_DOCUMENTO.CONSULTORIA_AUTONOMA, grupo: 'Sistema de Gestao / ESG' },
  { nome: 'Politica de Direitos Humanos', categoriaAutonomia: CATEGORIAS_DOCUMENTO.CONSULTORIA_AUTONOMA, grupo: 'Sistema de Gestao / ESG' },
  { nome: 'Politica de Gestao Responsavel da Cadeia de Suprimentos', categoriaAutonomia: CATEGORIAS_DOCUMENTO.CONSULTORIA_AUTONOMA, grupo: 'Sistema de Gestao / ESG' },
  { nome: 'Procedimento de Auditoria Interna', categoriaAutonomia: CATEGORIAS_DOCUMENTO.CONSULTORIA_AUTONOMA, grupo: 'Sistema de Gestao / ESG' },
  { nome: 'Procedimento de Analise Critica pela Direcao', categoriaAutonomia: CATEGORIAS_DOCUMENTO.CONSULTORIA_AUTONOMA, grupo: 'Sistema de Gestao / ESG' },
  { nome: 'Procedimento de Acao Corretiva', categoriaAutonomia: CATEGORIAS_DOCUMENTO.CONSULTORIA_AUTONOMA, grupo: 'Sistema de Gestao / ESG' },
  { nome: 'Procedimento de Nao Conformidade', categoriaAutonomia: CATEGORIAS_DOCUMENTO.CONSULTORIA_AUTONOMA, grupo: 'Sistema de Gestao / ESG' },
  { nome: 'Procedimento de Controle de Documentos', categoriaAutonomia: CATEGORIAS_DOCUMENTO.CONSULTORIA_AUTONOMA, grupo: 'Sistema de Gestao / ESG' },

  { nome: 'Analise de Lacunas para Homologacao', categoriaAutonomia: CATEGORIAS_DOCUMENTO.CONSULTORIA_AUTONOMA, grupo: 'Homologacao' },
  { nome: 'Plano de Acao para Conformidade', categoriaAutonomia: CATEGORIAS_DOCUMENTO.CONSULTORIA_AUTONOMA, grupo: 'Homologacao' },
  { nome: 'Relatorio de Diagnostico Inicial', categoriaAutonomia: CATEGORIAS_DOCUMENTO.CONSULTORIA_AUTONOMA, grupo: 'Homologacao' },
]

const PARCERIA: DocumentoOntologia[] = [
  {
    nome: 'PGR - Programa de Gerenciamento de Riscos',
    categoriaAutonomia: CATEGORIAS_DOCUMENTO.REQUER_PARCERIA_TECNICA,
    grupo: 'Parceria tecnica',
    motivoParceria: 'Requer medicoes quantitativas, validacao tecnica e responsabilidade de Engenheiro de Seguranca do Trabalho com CREA.',
  },
  {
    nome: 'LTCAT - Laudo Tecnico das Condicoes Ambientais do Trabalho',
    categoriaAutonomia: CATEGORIAS_DOCUMENTO.REQUER_PARCERIA_TECNICA,
    grupo: 'Parceria tecnica',
    motivoParceria: 'Requer medicoes quantitativas e laudo assinado por Engenheiro de Seguranca ou Medico do Trabalho.',
  },
  {
    nome: 'PCMSO - Programa de Controle Medico de Saude Ocupacional',
    categoriaAutonomia: CATEGORIAS_DOCUMENTO.REQUER_PARCERIA_TECNICA,
    grupo: 'Parceria tecnica',
    motivoParceria: 'Requer Medico do Trabalho responsavel tecnico com CRM.',
  },
  {
    nome: 'Laudo de Insalubridade',
    categoriaAutonomia: CATEGORIAS_DOCUMENTO.REQUER_PARCERIA_TECNICA,
    grupo: 'Parceria tecnica',
    motivoParceria: 'Requer avaliacao tecnica, medicoes quando aplicaveis e responsavel habilitado.',
  },
  {
    nome: 'Laudo de Periculosidade',
    categoriaAutonomia: CATEGORIAS_DOCUMENTO.REQUER_PARCERIA_TECNICA,
    grupo: 'Parceria tecnica',
    motivoParceria: 'Requer laudo tecnico com profissional legalmente habilitado.',
  },
  {
    nome: 'AET - Analise Ergonomica do Trabalho',
    categoriaAutonomia: CATEGORIAS_DOCUMENTO.REQUER_PARCERIA_TECNICA,
    grupo: 'Parceria tecnica',
    motivoParceria: 'Requer avaliacao ergonomica tecnica e responsavel qualificado.',
  },
  {
    nome: 'Laudo de Iluminancia',
    categoriaAutonomia: CATEGORIAS_DOCUMENTO.REQUER_PARCERIA_TECNICA,
    grupo: 'Parceria tecnica',
    motivoParceria: 'Requer medicao com luximetro calibrado e emissao de laudo tecnico.',
  },
]

const EXIGIVEIS: DocumentoOntologia[] = [
  { nome: 'Cartao CNPJ', categoriaAutonomia: CATEGORIAS_DOCUMENTO.EXIGIVEL_CLIENTE, grupo: 'Exigivel cliente' },
  { nome: 'Licenca Ambiental vigente', categoriaAutonomia: CATEGORIAS_DOCUMENTO.EXIGIVEL_CLIENTE, grupo: 'Exigivel cliente' },
  { nome: 'AVCB ou CLCB vigente', categoriaAutonomia: CATEGORIAS_DOCUMENTO.EXIGIVEL_CLIENTE, grupo: 'Exigivel cliente' },
  { nome: 'Alvara de Funcionamento', categoriaAutonomia: CATEGORIAS_DOCUMENTO.EXIGIVEL_CLIENTE, grupo: 'Exigivel cliente' },
  { nome: 'Certificados de Extintores', categoriaAutonomia: CATEGORIAS_DOCUMENTO.EXIGIVEL_CLIENTE, grupo: 'Exigivel cliente' },
  { nome: 'FISPQs dos produtos quimicos', categoriaAutonomia: CATEGORIAS_DOCUMENTO.EXIGIVEL_CLIENTE, grupo: 'Exigivel cliente' },
  { nome: 'Certificados de treinamentos obrigatorios', categoriaAutonomia: CATEGORIAS_DOCUMENTO.EXIGIVEL_CLIENTE, grupo: 'Exigivel cliente' },
]

export const DOCUMENTOS_ONTOLOGIA: DocumentoOntologia[] = [
  ...AUTONOMOS,
  ...PARCERIA,
  ...EXIGIVEIS,
]

export function getDocumentosRecomendadosPorSetor(setor: string) {
  const setorNormalizado = normalizarDocumentoNome(setor)
  const adicionaisQuimico = setorNormalizado.includes('quim')
    ? [
        documentoAutonomo('Plano de Atendimento a Emergencia Quimica', 'SST Documental'),
        documentoAutonomo('Inventario de Substancias Perigosas', 'Ambiental'),
        documentoAutonomo('Procedimento de Armazenamento Quimico', 'Ambiental'),
      ]
    : []

  return [...DOCUMENTOS_ONTOLOGIA, ...adicionaisQuimico]
}

export function getDocumentoInfo(nome: string) {
  const alvo = normalizarDocumentoNome(nome)
  return DOCUMENTOS_ONTOLOGIA.find((documento) => {
    const doc = normalizarDocumentoNome(documento.nome)
    return doc === alvo || doc.includes(alvo) || alvo.includes(doc)
  })
}

export function normalizarDocumentoNome(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function documentoAutonomo(nome: string, grupo: GrupoDocumento): DocumentoOntologia {
  return {
    nome,
    grupo,
    categoriaAutonomia: CATEGORIAS_DOCUMENTO.CONSULTORIA_AUTONOMA,
  }
}
