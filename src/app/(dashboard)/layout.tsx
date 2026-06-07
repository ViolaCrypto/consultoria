import { DashboardShell } from '@/components/layout/DashboardShell'
import { prisma } from '@/lib/prisma'

const baseLinks = [
  {
    href: '/biblioteca-documentos',
    label: 'Biblioteca de Documentos',
    icon: 'biblioteca' as const,
  },
]

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [empresasCount, modelosCount, setoresCount, memoriasCount] = await Promise.all([
    prisma.empresa.count(),
    prisma.modeloAvaliacao.count(),
    prisma.setorIndustrial.count(),
    prisma.memoriaConsultoria.count(),
  ])

  const links = [
    {
      href: '/empresas',
      label: 'Empresas',
      count: empresasCount,
      icon: 'empresas' as const,
    },
    {
      href: '/modelos',
      label: 'Modelos de Avaliação',
      count: modelosCount,
      icon: 'modelos' as const,
    },
    {
      href: '/ontologia',
      label: 'Ontologia',
      count: setoresCount,
      icon: 'ontologia' as const,
    },
    {
      href: '/memoria',
      label: 'Memória',
      count: memoriasCount,
      icon: 'memoria' as const,
    },
    ...baseLinks,
  ]

  return <DashboardShell links={links}>{children}</DashboardShell>
}
