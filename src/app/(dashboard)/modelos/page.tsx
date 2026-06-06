import { ModelosClient } from '@/components/modelo/ModelosClient'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function ModelosPage() {
  const modelos = await prisma.modeloAvaliacao.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { requisitos: true },
      },
    },
  })

  return <ModelosClient modelos={modelos} />
}
