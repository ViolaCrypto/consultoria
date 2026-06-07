import { prisma } from '@/lib/prisma'

export async function getProjetoDashboard(projetoId: string) {
  const projeto = await prisma.projeto.findUnique({
    where: { id: projetoId },
    include: {
      empresa: true,
      anamnese: true,
      arquivos: true,
      documentos: true,
      avaliacoes: {
        include: {
          modelo: true,
          itens: {
            include: {
              requisito: true,
            },
          },
        },
      },
    },
  })

  if (!projeto) {
    return null
  }

  const itens = projeto.avaliacoes.flatMap((avaliacao) =>
    avaliacao.itens.map((item) => ({
      id: item.id,
      status: item.status,
      confiancaIA: item.confiancaIA,
      observacao: item.observacao,
      modelo: avaliacao.modelo.nome,
      requisito: {
        id: item.requisito.id,
        codigo: item.requisito.codigo,
        titulo: item.requisito.titulo,
        descricao: item.requisito.descricao,
        peso: item.requisito.peso,
        evidenciaEsperada: item.requisito.evidenciaEsperada,
        documentoEsperado: item.requisito.documentoEsperado,
        acaoRecomendada: item.requisito.acaoRecomendada,
      },
    })),
  )

  const contagem = {
    total: itens.length,
    atende: itens.filter((item) => item.status === 'atende').length,
    nao_atende: itens.filter((item) => item.status === 'nao_atende').length,
    atende_parcialmente: itens.filter((item) => item.status === 'atende_parcialmente').length,
    nao_se_aplica: itens.filter((item) => item.status === 'nao_se_aplica').length,
    precisa_validacao: itens.filter((item) => item.status === 'precisa_validacao').length,
  }

  const avaliaveis = itens.filter((item) => item.status !== 'nao_se_aplica').length
  const scoreConformidade = avaliaveis
    ? Math.round((contagem.atende / avaliaveis) * 100)
    : 0

  const gapsCriticos = itens
    .filter((item) => ['nao_atende', 'atende_parcialmente', 'precisa_validacao'].includes(item.status))
    .sort((a, b) => b.requisito.peso - a.requisito.peso)
    .slice(0, 5)

  const documentosPorStatus = projeto.documentos.reduce<Record<string, number>>(
    (acc, documento) => {
      acc[documento.status] = (acc[documento.status] || 0) + 1
      return acc
    },
    {},
  )

  const ultimaAtualizacao =
    [...projeto.documentos.map((doc) => doc.updatedAt), ...projeto.arquivos.map((arquivo) => arquivo.createdAt)]
      .sort((a, b) => b.getTime() - a.getTime())[0] || projeto.createdAt

  return {
    projeto: {
      id: projeto.id,
      nome: projeto.nome,
      tipo: projeto.tipo,
      status: projeto.status,
      createdAt: projeto.createdAt,
      ultimaAtualizacao,
    },
    empresa: projeto.empresa,
    anamnese: projeto.anamnese,
    perfilOperacional: projeto.anamnese?.perfilOperacional || null,
    gapAnalysis: {
      itens,
      contagem,
      scoreConformidade,
      gapsCriticos,
    },
    documentos: projeto.documentos,
    documentosPorStatus,
    arquivos: projeto.arquivos,
  }
}
