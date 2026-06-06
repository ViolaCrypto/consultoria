'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import {
  BookOpen,
  Building2,
  ChevronRight,
  ClipboardCheck,
  Factory,
} from 'lucide-react'

type DashboardLink = {
  href: string
  label: string
  count?: number
  icon: 'empresas' | 'modelos' | 'biblioteca'
}

const icons = {
  empresas: Building2,
  modelos: ClipboardCheck,
  biblioteca: BookOpen,
}

export function DashboardShell({
  children,
  links,
}: {
  children: React.ReactNode
  links: DashboardLink[]
}) {
  const pathname = usePathname()
  const [dynamicLabels, setDynamicLabels] = useState<Record<string, string>>({})
  const breadcrumbs = buildBreadcrumbs(pathname, dynamicLabels)

  useEffect(() => {
    let active = true
    const parts = pathname.split('/').filter(Boolean)
    const empresaId = parts[0] === 'empresas' ? parts[1] : undefined
    const projetoId =
      parts[0] === 'empresas' && parts[2] === 'projetos' ? parts[3] : undefined

    async function loadLabels() {
      const labels: Record<string, string> = {}

      try {
        if (empresaId) {
          const empresasResponse = await fetch('/api/empresas')

          if (empresasResponse.ok) {
            const empresas = (await empresasResponse.json()) as Array<{
              id: string
              nome: string
            }>
            const empresa = empresas.find((item) => item.id === empresaId)

            if (empresa) {
              labels[empresaId] = empresa.nome
            }
          }
        }

        if (projetoId) {
          const projetoResponse = await fetch(`/api/projetos/${projetoId}`)

          if (projetoResponse.ok) {
            const projeto = (await projetoResponse.json()) as {
              id: string
              nome: string
            }
            labels[projetoId] = projeto.nome
          }
        }
      } catch {
        // Breadcrumbs keep their readable fallback labels if the API is unavailable.
      }

      if (active) {
        setDynamicLabels(labels)
      }
    }

    loadLabels()

    return () => {
      active = false
    }
  }, [pathname])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <aside className="fixed inset-y-0 left-0 hidden w-72 flex-col bg-[var(--color-sidebar-bg)] px-5 py-6 text-[var(--color-sidebar-text)] lg:flex">
        <div className="flex items-center gap-3 rounded-lg bg-white/10 px-3 py-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[var(--color-primary)]">
            <Factory className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
              Consultoria
            </p>
            <h1 className="text-base font-semibold">Plataforma SGI</h1>
          </div>
        </div>

        <nav className="mt-8 space-y-2">
          {links.map((link) => {
            const Icon = icons[link.icon]
            const active =
              pathname === link.href || pathname.startsWith(`${link.href}/`)

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center justify-between rounded-md px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? 'bg-[var(--color-primary)] text-white shadow-sm'
                    : 'text-slate-200 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon className="h-4 w-4" />
                  {link.label}
                </span>
                {typeof link.count === 'number' ? (
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      active ? 'bg-white/20 text-white' : 'bg-white/10 text-slate-200'
                    }`}
                  >
                    {link.count}
                  </span>
                ) : null}
              </Link>
            )
          })}
        </nav>

        <div className="mt-auto border-t border-white/10 pt-4 text-xs text-slate-400">
          v1.0 — Plataforma Interna
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="border-b border-slate-200 bg-white px-5 py-4 sm:px-8 lg:px-10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Navegação
              </p>
              <nav className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-600">
                {breadcrumbs.map((item, index) => (
                  <span key={`${item}-${index}`} className="flex items-center gap-2">
                    {index > 0 ? <ChevronRight className="h-4 w-4 text-slate-400" /> : null}
                    <span className={index === breadcrumbs.length - 1 ? 'font-medium text-slate-950' : ''}>
                      {item}
                    </span>
                  </span>
                ))}
              </nav>
            </div>

            <nav className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
              {links.map((link) => {
                const Icon = icons[link.icon]
                const active =
                  pathname === link.href || pathname.startsWith(`${link.href}/`)

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${
                      active
                        ? 'bg-[var(--color-primary)] text-white'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{link.label}</span>
                    {typeof link.count === 'number' ? (
                      <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">
                        {link.count}
                      </span>
                    ) : null}
                  </Link>
                )
              })}
            </nav>
          </div>
        </header>

        <main className="min-h-screen px-5 py-8 sm:px-8 lg:px-10">
          {children}
        </main>
      </div>
    </div>
  )
}

function buildBreadcrumbs(pathname: string, dynamicLabels: Record<string, string>) {
  const parts = pathname.split('/').filter(Boolean)

  if (parts.length === 0) {
    return ['Empresas']
  }

  const labels: string[] = []

  for (let index = 0; index < parts.length; index++) {
    const part = parts[index]

    if (part === 'empresas') {
      labels.push('Empresas')
      continue
    }

    if (part === 'projetos') {
      labels.push('Projetos')
      continue
    }

    if (part === 'modelos') {
      labels.push('Modelos de Avaliação')
      continue
    }

    if (part === 'entrega') {
      labels.push('Entrega Final')
      continue
    }

    if (parts[index - 1] === 'empresas') {
      labels.push(dynamicLabels[part] || 'Empresa')
      continue
    }

    if (parts[index - 1] === 'projetos') {
      labels.push(dynamicLabels[part] || 'Projeto')
      continue
    }

    labels.push(prettifySegment(part))
  }

  return labels
}

function prettifySegment(segment: string) {
  return segment
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
