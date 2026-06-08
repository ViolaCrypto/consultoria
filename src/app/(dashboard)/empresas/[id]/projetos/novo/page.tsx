import { notFound } from 'next/navigation'
import { NovoProjetoWizard } from '@/components/projeto/NovoProjetoWizard'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function NovoProjetoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [empresa, modelos] = await Promise.all([
    prisma.empresa.findUnique({
      where: { id },
      select: { id: true, nome: true },
    }),
    prisma.modeloAvaliacao.findMany({
      where: { ativo: true },
      orderBy: { nome: 'asc' },
      include: {
        _count: {
          select: { requisitos: true },
        },
      },
    }),
  ])

  if (!empresa) {
    notFound()
  }

  return (
    <NovoProjetoWizard
      empresa={empresa}
      modelos={modelos.map((modelo) => ({
        id: modelo.id,
        nome: modelo.nome,
        categoria: modelo.categoria,
        versao: modelo.versao,
        requisitosCount: modelo._count.requisitos,
      }))}
    />
  )
}
