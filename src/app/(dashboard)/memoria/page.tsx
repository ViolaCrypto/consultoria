import { MemoriaClient } from '@/components/memoria/MemoriaClient'
import { prisma } from '@/lib/prisma'

export default async function MemoriaPage() {
  const [padroes, licoes, setores, documentosAprovados, memoriasDocumento] =
    await Promise.all([
      prisma.padraoDocumento.findMany({
        orderBy: [{ setor: 'asc' }, { updatedAt: 'desc' }],
      }),
      prisma.memoriaConsultoria.findMany({
        where: { tipo: 'licao_aprendida' },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      prisma.setorIndustrial.findMany({
        orderBy: { codigo: 'asc' },
        select: { codigo: true },
      }),
      prisma.docProjeto.findMany({
        where: { status: 'aprovado' },
        select: { nome: true },
      }),
      prisma.memoriaConsultoria.findMany({
        where: { tipo: 'documento_aprovado' },
        select: { setor: true },
      }),
    ])

  const setoresMaisAtendidos = countBy(memoriasDocumento.map((item) => item.setor))
  const documentosMaisGerados = countBy(documentosAprovados.map((item) => item.nome))

  return (
    <MemoriaClient
      padroes={padroes.map((padrao) => ({
        id: padrao.id,
        nome: padrao.nome,
        tipo: padrao.tipo,
        setor: padrao.setor,
        vezes_usado: padrao.vezes_usado,
        score_medio: padrao.score_medio,
        createdAt: padrao.createdAt.toISOString(),
      }))}
      licoes={licoes.map((licao) => ({
        id: licao.id,
        setor: licao.setor,
        conteudo: licao.conteudo,
        projetoId: licao.projetoId,
        createdAt: licao.createdAt.toISOString(),
      }))}
      setores={setores.map((setor) => setor.codigo)}
      estatisticas={{
        totalDocumentosAprovados: documentosAprovados.length,
        setoresMaisAtendidos,
        documentosMaisGerados,
      }}
    />
  )
}

function countBy(values: string[]) {
  const counts = values.reduce<Record<string, number>>((acc, value) => {
    acc[value] = (acc[value] || 0) + 1
    return acc
  }, {})

  return Object.entries(counts)
    .map(([setor, total]) => ({ setor, nome: setor, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)
}
