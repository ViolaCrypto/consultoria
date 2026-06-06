import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ModeloDetalheClient } from '@/components/modelo/ModeloDetalheClient'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function ModeloDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const modelo = await prisma.modeloAvaliacao.findUnique({
    where: { id },
    include: {
      requisitos: {
        orderBy: [{ ordem: 'asc' }, { titulo: 'asc' }],
      },
    },
  })

  if (!modelo) {
    notFound()
  }

  return (
    <div>
      <Link
        href="/modelos"
        className="mb-6 inline-block text-sm font-medium text-slate-600 hover:text-slate-950"
      >
        Voltar para modelos
      </Link>
      <ModeloDetalheClient modelo={modelo} />
    </div>
  )
}
