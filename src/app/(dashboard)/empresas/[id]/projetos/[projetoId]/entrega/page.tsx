import Link from 'next/link'
import { notFound } from 'next/navigation'
import { EntregaFinalClient } from '@/components/projeto/EntregaFinalClient'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function EntregaFinalPage({
  params,
}: {
  params: Promise<{ id: string; projetoId: string }>
}) {
  const { id, projetoId } = await params
  const projeto = await prisma.projeto.findUnique({
    where: { id: projetoId },
    include: {
      empresa: {
        select: {
          id: true,
          nome: true,
        },
      },
      documentos: {
        where: { status: 'aprovado' },
        orderBy: { updatedAt: 'desc' },
      },
      avaliacoes: {
        include: {
          itens: true,
        },
      },
    },
  })

  if (!projeto || projeto.empresa.id !== id) {
    notFound()
  }

  const itens = projeto.avaliacoes.flatMap((avaliacao) => avaliacao.itens)
  const conformes = itens.filter((item) =>
    ['atende', 'nao_se_aplica'].includes(item.status),
  ).length
  const conformidade = itens.length ? (conformes / itens.length) * 100 : 0

  return (
    <div>
      <Link
        href={`/empresas/${id}/projetos/${projetoId}`}
        className="mb-6 inline-block text-sm font-medium text-slate-600 hover:text-slate-950"
      >
        Voltar para projeto
      </Link>
      <EntregaFinalClient
        projeto={{
          id: projeto.id,
          nome: projeto.nome,
          tipo: projeto.tipo,
          status: projeto.status,
          createdAt: projeto.createdAt.toISOString(),
          empresa: { nome: projeto.empresa.nome },
          conformidade,
          documentos: projeto.documentos.map((documento) => ({
            id: documento.id,
            nome: documento.nome,
            tipo: documento.tipo,
            status: documento.status,
            versao: documento.versao,
            conteudo: documento.conteudo,
          })),
        }}
      />
    </div>
  )
}
