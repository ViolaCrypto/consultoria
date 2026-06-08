import { DashboardShell } from '@/components/layout/DashboardShell'
import { CONSULTORIA_CONFIG } from '@/lib/config/consultoria'
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
  const [empresasCount, modelosCount, setoresCount, memoriasCount, config] = await Promise.all([
    prisma.empresa.count(),
    prisma.modeloAvaliacao.count(),
    prisma.setorIndustrial.count(),
    prisma.memoriaConsultoria.count(),
    prisma.configuracaoConsultoria.findFirst({ orderBy: { updatedAt: 'desc' } }),
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

  return (
    <DashboardShell
      links={links}
      marca={{
        nome: config?.nome || CONSULTORIA_CONFIG.nome,
        nomeCompleto: config?.nomeCompleto || CONSULTORIA_CONFIG.nomeCompleto,
        slogan: config?.slogan || CONSULTORIA_CONFIG.slogan,
        corPrimaria: config?.corPrimaria || CONSULTORIA_CONFIG.corPrimaria,
        corSecundaria: config?.corSecundaria || CONSULTORIA_CONFIG.corSecundaria,
        logoUrl: config?.logoUrl || null,
        versao: CONSULTORIA_CONFIG.versao,
        ano: CONSULTORIA_CONFIG.ano,
      }}
    >
      {children}
    </DashboardShell>
  )
}
