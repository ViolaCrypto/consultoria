import { prisma } from '@/lib/prisma'

type DocProjetoMemoriaInput = {
  id: string
  nome: string
  tipo: string
  conteudo: string | null
  projetoId: string
}

type EmpresaMemoriaInput = {
  id?: string
  nome: string
  setor?: string | null
  setorCodigo?: string | null
}

export async function salvarDocumentoAprovado(
  docProjeto: DocProjetoMemoriaInput,
  empresa: EmpresaMemoriaInput,
  setor?: string | null,
) {
  if (!docProjeto.conteudo?.trim()) {
    return null
  }

  const setorMemoria = normalizarSetor(setor || empresa.setorCodigo || empresa.setor)
  const agora = new Date()

  const padrao = await prisma.padraoDocumento.create({
    data: {
      nome: docProjeto.nome,
      tipo: docProjeto.tipo,
      setor: setorMemoria,
      conteudo: docProjeto.conteudo,
      aprovadoEmAuditoria: true,
      vezes_usado: 0,
    },
  })

  await prisma.memoriaConsultoria.create({
    data: {
      tipo: 'documento_aprovado',
      setor: setorMemoria,
      conteudo: docProjeto.conteudo,
      aprovadoEm: agora,
      projetoId: docProjeto.projetoId,
      metadados: {
        docProjetoId: docProjeto.id,
        padraoDocumentoId: padrao.id,
        documento: docProjeto.nome,
        tipoDocumento: docProjeto.tipo,
        empresa: empresa.nome,
      },
    },
  })

  return padrao
}

export async function salvarLicaoAprendida(
  texto: string,
  setor: string,
  projetoId?: string | null,
) {
  return prisma.memoriaConsultoria.create({
    data: {
      tipo: 'licao_aprendida',
      setor: normalizarSetor(setor),
      conteudo: texto,
      projetoId: projetoId || null,
      metadados: {
        origem: 'manual',
      },
    },
  })
}

export async function buscarPadroesSetor(setor: string | null, tipoDocumento: string) {
  const setorMemoria = normalizarSetor(setor)

  if (!setorMemoria) {
    return []
  }

  const padroes = await prisma.padraoDocumento.findMany({
    where: {
      setor: setorMemoria,
      OR: [
        { tipo: tipoDocumento },
        { nome: { contains: tipoDocumento, mode: 'insensitive' } },
      ],
    },
    orderBy: [{ score_medio: 'desc' }, { vezes_usado: 'desc' }, { updatedAt: 'desc' }],
    take: 3,
  })

  if (padroes.length > 0) {
    await prisma.padraoDocumento.updateMany({
      where: { id: { in: padroes.map((padrao) => padrao.id) } },
      data: {
        vezes_usado: {
          increment: 1,
        },
      },
    })
  }

  return padroes
}

export async function buscarMemoriaSimilar(texto: string, setor: string | null) {
  const setorMemoria = normalizarSetor(setor)
  const termos = texto
    .split(/\s+/)
    .map((termo) => termo.trim())
    .filter((termo) => termo.length >= 4)
    .slice(0, 8)

  return prisma.memoriaConsultoria.findMany({
    where: {
      ...(setorMemoria ? { setor: setorMemoria } : {}),
      ...(termos.length
        ? {
            OR: termos.map((termo) => ({
              conteudo: { contains: termo, mode: 'insensitive' as const },
            })),
          }
        : {
            conteudo: { contains: texto.slice(0, 80), mode: 'insensitive' as const },
          }),
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
  })
}

export function normalizarSetor(setor?: string | null) {
  if (!setor) {
    return 'outro'
  }

  const normalizado = setor
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/-/g, '_')
    .replace(/\s+/g, '_')

  const aliases: Record<string, string> = {
    alimentos: 'alimenticio',
    servicos: 'servicos_escritorio',
    escritorio: 'servicos_escritorio',
    tintas: 'tintas_vernizes',
  }

  return aliases[normalizado] || normalizado
}
