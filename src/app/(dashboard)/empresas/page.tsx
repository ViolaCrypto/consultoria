import { type EmpresaCardData } from '@/components/empresa/EmpresaCard'
import { EmpresasClient } from '@/components/empresa/EmpresasClient'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function EmpresasPage() {
  const empresas = await prisma.empresa.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { projetos: true },
      },
    },
  })

  const empresasData: EmpresaCardData[] = empresas.map((empresa) => ({
    id: empresa.id,
    nome: empresa.nome,
    cnpj: empresa.cnpj,
    cnae: empresa.cnae,
    setor: empresa.setor,
    cidade: empresa.cidade,
    estado: empresa.estado,
    _count: empresa._count,
  }))

  return <EmpresasClient empresas={empresasData} />
}
