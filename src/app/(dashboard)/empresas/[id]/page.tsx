import { notFound } from 'next/navigation'
import { EmpresaDetalheClient } from '@/components/projeto/EmpresaDetalheClient'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function EmpresaDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const empresa = await prisma.empresa.findUnique({
    where: { id },
    include: {
      projetos: {
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!empresa) {
    notFound()
  }

  const empresaData = {
    id: empresa.id,
    nome: empresa.nome,
    cnpj: empresa.cnpj,
    setor: empresa.setor,
    cidade: empresa.cidade,
    estado: empresa.estado,
    projetos: empresa.projetos.map((projeto) => ({
      id: projeto.id,
      nome: projeto.nome,
      tipo: projeto.tipo,
      status: projeto.status,
      createdAt: projeto.createdAt.toISOString(),
    })),
  }

  return <EmpresaDetalheClient empresa={empresaData} />
}
