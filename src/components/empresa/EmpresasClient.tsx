'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { EmpresaCard, type EmpresaCardData } from '@/components/empresa/EmpresaCard'
import { EmpresaForm } from '@/components/empresa/EmpresaForm'

export function EmpresasClient({ empresas }: { empresas: EmpresaCardData[] }) {
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)

  function handleCreated() {
    setIsModalOpen(false)
    router.refresh()
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            Empresas
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            Empresas
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Cadastre empresas e acompanhe seus projetos de consultoria.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Nova Empresa
        </button>
      </div>

      <section className="mt-8">
        {empresas.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {empresas.map((empresa) => (
              <EmpresaCard key={empresa.id} empresa={empresa} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
            <h2 className="text-lg font-semibold text-slate-950">
              Nenhuma empresa cadastrada
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Comece cadastrando a primeira empresa da carteira.
            </p>
          </div>
        )}
      </section>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-8">
          <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">
                  Cadastrar empresa
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Informe os dados principais para iniciar a consultoria.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-md px-2 py-1 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                aria-label="Fechar modal"
              >
                Fechar
              </button>
            </div>

            <EmpresaForm
              onCreated={handleCreated}
              onCancel={() => setIsModalOpen(false)}
            />
          </div>
        </div>
      ) : null}
    </div>
  )
}
