import { prisma } from '@/lib/prisma'

const documentosChave = [
  { key: 'pgr', termos: ['pgr', 'programa de gerenciamento de riscos'] },
  { key: 'pcmso', termos: ['pcmso'] },
  { key: 'licencaAmbiental', termos: ['licenca ambiental', 'licença ambiental'] },
  { key: 'avcbClcb', termos: ['avcb', 'clcb'] },
  { key: 'alvaraFuncionamento', termos: ['alvara', 'alvará'] },
  { key: 'planoEmergencia', termos: ['plano de emergencia', 'plano de emergência'] },
  {
    key: 'inventarioProdutosQuimicos',
    termos: ['inventario de produtos quimicos', 'inventário de produtos químicos', 'fispq'],
  },
  { key: 'matrizTreinamentos', termos: ['matriz de treinamentos', 'treinamento'] },
]

type DocumentoExistente = {
  possui?: boolean
  dataUltimaRevisao?: string | null
  responsavelTecnico?: string | null
  observacoes?: string | null
  arquivoUrl?: string | null
}

type DadosSetor = {
  documentosExistentes?: Record<string, DocumentoExistente>
  [key: string]: unknown
}

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function normalizeDadosSetor(value: unknown): DadosSetor {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as DadosSetor
  }

  return {}
}

function arquivoCorrespondeDocumento(
  arquivo: { nome: string; tipo: string; metadados: unknown },
  termos: string[],
) {
  const metadados =
    arquivo.metadados && typeof arquivo.metadados === 'object'
      ? (arquivo.metadados as { tipoDetectado?: string; analise?: { tipo_confirmado?: string } })
      : null
  const texto = normalize(
    [
      arquivo.nome,
      arquivo.tipo,
      metadados?.tipoDetectado,
      metadados?.analise?.tipo_confirmado,
    ]
      .filter(Boolean)
      .join(' '),
  )

  return termos.some((termo) => texto.includes(normalize(termo)))
}

function calcularQualidadeContexto(
  documentosAnamnese: Record<string, DocumentoExistente>,
  arquivos: { nome: string; tipo: string; metadados: unknown }[],
) {
  const totalPossivel = documentosChave.length * 2
  const pontos = documentosChave.reduce((acc, documento) => {
    const declarado = documentosAnamnese[documento.key]?.possui ? 1 : 0
    const processado = arquivos.some(
      (arquivo) => arquivo.metadados && arquivoCorrespondeDocumento(arquivo, documento.termos),
    )
      ? 1
      : 0

    return acc + declarado + processado
  }, 0)

  return Math.round((pontos / totalPossivel) * 100)
}

export async function montarContextoCompleto(projetoId: string) {
  const projeto = await prisma.projeto.findUnique({
    where: { id: projetoId },
    include: {
      empresa: true,
      anamnese: true,
      arquivos: {
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!projeto) {
    return null
  }

  const setor = projeto.empresa.setorCodigo || projeto.empresa.setor || ''
  const dadosSetor = normalizeDadosSetor(projeto.anamnese?.dadosSetor)
  const documentosAnamnese = dadosSetor.documentosExistentes || {}

  const setorIndustrial = setor
    ? await prisma.setorIndustrial.findFirst({
        where: {
          OR: [
            { codigo: { equals: setor, mode: 'insensitive' } },
            { nome: { equals: setor, mode: 'insensitive' } },
          ],
        },
        include: {
          processos: {
            include: {
              riscosSST: true,
              aspectosAmbientais: true,
            },
          },
        },
      })
    : null

  const [documentosObrigatorios, requisitosLegais] = setor
    ? await Promise.all([
        prisma.documentoObrigatorio.findMany({
          where: { setores: { has: setor } },
          orderBy: { nome: 'asc' },
        }),
        prisma.requisitoLegal.findMany({
          where: { setores: { has: setor } },
          orderBy: { nome: 'asc' },
        }),
      ])
    : [[], []]

  const arquivosProcessados = projeto.arquivos
    .filter((arquivo) => !!arquivo.metadados)
    .map((arquivo) => ({
      id: arquivo.id,
      nome: arquivo.nome,
      tipo: arquivo.tipo,
      url: arquivo.url,
      createdAt: arquivo.createdAt,
      metadados: arquivo.metadados,
    }))

  return {
    projeto: {
      id: projeto.id,
      nome: projeto.nome,
      tipo: projeto.tipo,
      status: projeto.status,
    },
    empresa: projeto.empresa,
    anamnese: projeto.anamnese
      ? {
          numFuncionarios: projeto.anamnese.numFuncionarios,
          turnos: projeto.anamnese.turnos,
          processosPrincipais: projeto.anamnese.processosPrincipais,
          dadosSetor,
          documentosExistentes: documentosAnamnese,
          perfilOperacional: projeto.anamnese.perfilOperacional,
        }
      : null,
    arquivosProcessados,
    ontologia: {
      setor: setorIndustrial,
      documentosObrigatorios,
      requisitosLegais,
    },
    qualidadeContexto: calcularQualidadeContexto(documentosAnamnese, projeto.arquivos),
  }
}
