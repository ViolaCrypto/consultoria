import { Plus } from 'lucide-react'
import { prisma } from '@/lib/prisma'

export default async function OntologiaPage() {
  const setores = await prisma.setorIndustrial.findMany({
    orderBy: { nome: 'asc' },
    include: {
      processos: {
        orderBy: { nome: 'asc' },
        include: {
          riscosSST: { orderBy: { nome: 'asc' } },
          aspectosAmbientais: { orderBy: { nome: 'asc' } },
        },
      },
    },
  })

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
            Base técnica
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            Ontologia de domínio
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600">
            Setores industriais, processos típicos, riscos SST e aspectos ambientais usados como contexto estruturado pelos agentes de IA.
          </p>
        </div>
        <button
          type="button"
          disabled
          className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-medium text-slate-500"
          title="Cadastro manual será habilitado em uma próxima etapa."
        >
          <Plus className="h-4 w-4" />
          Adicionar setor
        </button>
      </div>

      {setores.length > 0 ? (
        <div className="space-y-5">
          {setores.map((setor) => {
            const riscos = uniqueByName(
              setor.processos.flatMap((processo) => processo.riscosSST),
            )
            const aspectos = uniqueByName(
              setor.processos.flatMap((processo) => processo.aspectosAmbientais),
            )

            return (
              <section
                key={setor.id}
                className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
              >
                <div className="border-b border-slate-200 bg-slate-50 p-5">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-xl font-semibold text-slate-950">
                          {setor.nome}
                        </h2>
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                          {setor.codigo}
                        </span>
                      </div>
                      {setor.descricao ? (
                        <p className="mt-2 max-w-4xl text-sm text-slate-600">
                          {setor.descricao}
                        </p>
                      ) : null}
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
                      {setor.processos.length} processos
                    </span>
                  </div>
                </div>

                <div className="grid gap-6 p-5 lg:grid-cols-3">
                  <OntologyList
                    title="Processos"
                    items={setor.processos.map((processo) => processo.nome)}
                  />
                  <OntologyList
                    title="Riscos SST"
                    items={riscos.map(
                      (risco) =>
                        `${risco.nome} (${risco.nrsAplicaveis.join(', ') || 'sem NR'})`,
                    )}
                  />
                  <OntologyList
                    title="Aspectos ambientais"
                    items={aspectos.map((aspecto) => `${aspecto.nome} - ${aspecto.tipo}`)}
                  />
                </div>
              </section>
            )
          })}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
          <h2 className="text-lg font-semibold text-slate-950">
            Nenhum setor cadastrado
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Rode o seed de ontologia para popular a base técnica inicial.
          </p>
        </div>
      )}
    </div>
  )
}

function OntologyList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
        {title}
      </h3>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li
            key={item}
            className="rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-700"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

function uniqueByName<T extends { nome: string }>(items: T[]) {
  const map = new Map<string, T>()

  for (const item of items) {
    if (!map.has(item.nome)) {
      map.set(item.nome, item)
    }
  }

  return Array.from(map.values())
}
