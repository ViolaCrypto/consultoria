'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, MapPin, Plus } from 'lucide-react'
import { ProjetoForm } from '@/components/projeto/ProjetoForm'

type ProjetoResumo = {
  id: string
  nome: string
  tipo: string
  status: string
  createdAt: string
}

type EmpresaDetalhe = {
  id: string
  nome: string
  cnpj: string | null
  setor: string | null
  cidade: string | null
  estado: string | null
  projetos: ProjetoResumo[]
}

export function EmpresaDetalheClient({ empresa }: { empresa: EmpresaDetalhe }) {
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)

  function handleCreated() {
    setIsModalOpen(false)
    router.refresh()
  }

  return (
    <div className="mx-auto max-w-6xl">
      <Link
        href="/empresas"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-950"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para empresas
      </Link>

      <section className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-gradient-to-br from-blue-50 to-white p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
                Empresa
              </p>
              <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-950">
                {empresa.nome}
              </h1>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                <span className="rounded-full bg-blue-100 px-3 py-1 font-medium text-blue-700">
                  {empresa.setor || 'Setor não informado'}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-[var(--color-primary)]" />
                  {[empresa.cidade, empresa.estado].filter(Boolean).join(', ') ||
                    'Cidade não informada'}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/empresas"
                className="inline-flex items-center gap-2 rounded-md border border-blue-200 bg-white px-4 py-2 text-sm font-medium text-[var(--color-primary)] transition hover:bg-blue-50"
              >
                <Plus className="h-4 w-4" />
                Nova empresa
              </Link>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                Novo projeto
              </button>
            </div>
          </div>
        </div>
        <div className="p-6">
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Info label="CNPJ" value={empresa.cnpj || 'Não informado'} />
            <Info label="Setor" value={empresa.setor || 'Não informado'} />
            <Info
              label="Cidade"
              value={
                [empresa.cidade, empresa.estado].filter(Boolean).join(', ') ||
                'Não informada'
              }
            />
            <Info label="Projetos" value={String(empresa.projetos.length)} />
          </dl>
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-950">Projetos</h2>
        </div>

        {empresa.projetos.length > 0 ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {empresa.projetos.map((projeto) => (
              <Link
                key={projeto.id}
                href={`/empresas/${empresa.id}/projetos/${projeto.id}`}
                className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-950/10"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-950">
                      {projeto.nome}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">{projeto.tipo}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusBadgeClass(projeto.status)}`}>
                    {projeto.status}
                  </span>
                </div>
                <p className="mt-4 text-sm text-slate-500">
                  Criado em {new Date(projeto.createdAt).toLocaleDateString('pt-BR')}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
            <h3 className="text-lg font-semibold text-slate-950">
              Nenhum projeto cadastrado
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Crie o primeiro projeto para esta empresa.
            </p>
          </div>
        )}
      </section>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-8">
          <div className="w-full max-w-xl rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">
                  Criar projeto
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Defina o escopo inicial do atendimento.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-md px-2 py-1 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              >
                Fechar
              </button>
            </div>
            <ProjetoForm
              empresaId={empresa.id}
              onCreated={handleCreated}
              onCancel={() => setIsModalOpen(false)}
            />
          </div>
        </div>
      ) : null}
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-slate-50 p-4">
      <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
        {label}
      </dt>
      <dd className="mt-2 text-sm font-medium text-slate-950">{value}</dd>
    </div>
  )
}

function statusBadgeClass(status: string) {
  const classes: Record<string, string> = {
    em_andamento: 'bg-blue-50 text-blue-700',
    concluido: 'bg-emerald-50 text-emerald-700',
    pausado: 'bg-slate-100 text-slate-700',
  }

  return classes[status] || classes.pausado
}
