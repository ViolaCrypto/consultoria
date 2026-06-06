import { DashboardShell } from '@/components/layout/DashboardShell'
import { prisma } from '@/lib/prisma'

const baseLinks = [
  { href: '/biblioteca-documentos', label: 'Biblioteca de Documentos', icon: 'biblioteca' as const },
]

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const empresasCount = await prisma.empresa.count()
  const modelosCount = await prisma.modeloAvaliacao.count()
  const links = [
    { href: '/empresas', label: 'Empresas', count: empresasCount, icon: 'empresas' as const },
    { href: '/modelos', label: 'Modelos de Avaliação', count: modelosCount, icon: 'modelos' as const },
    ...baseLinks,
  ]

  return <DashboardShell links={links}>{children}</DashboardShell>
}
