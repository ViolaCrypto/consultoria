'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Plus } from 'lucide-react'

type Padrao = {
  id: string
  nome: string
  tipo: string
  setor: string
  vezes_usado: number
  score_medio: number | null
  createdAt: string
}

type Licao = {
  id: string
  setor: string
  conteudo: string
  projetoId: string | null
  createdAt: string
}

type Estatisticas = {
  totalDocumentosAprovados: number
  setoresMaisAtendidos: { setor: string; total: number }[]
  documentosMaisGerados: { nome: string; total: number }[]
}

export function MemoriaClient({
  padroes,
  licoes,
  estatisticas,
  setores,
}: {
  padroes: Padrao[]
  licoes: Licao[]
  estatisticas: Estatisticas
  setores: string[]
}) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'padroes' | 'licoes' | 'estatisticas'>('padroes')
  const [conteudo, setConteudo] = useState('')
  const [setor, setSetor] = useState(setores[0] || 'geral')
  const [isSaving, setIsSaving] = useState(false)

  const padroesPorSetor = groupBy(padroes, (padrao) => padrao.setor)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSaving(true)

    try {
      const response = await fetch('/api/memoria/licoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conteudo, setor }),
      })

      if (!response.ok) {
        throw new Error('Falha ao salvar lição aprendida.')
      }

      setConteudo('')
      router.refresh()
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
          Aprendizado operacional
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
          Memória da consultoria
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">
          Documentos aprovados, padrões por setor e lições aprendidas que melhoram as próximas gerações da IA.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {[
          ['padroes', 'Padrões por setor'],
          ['licoes', 'Lições aprendidas'],
          ['estatisticas', 'Estatísticas'],
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id as typeof activeTab)}
            className={`rounded-md px-4 py-2 text-sm font-medium transition ${
              activeTab === id
                ? 'bg-[var(--color-primary)] text-white'
                : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'padroes' ? (
        <div className="space-y-5">
          {Object.entries(padroesPorSetor).length > 0 ? (
            Object.entries(padroesPorSetor).map(([setor, itens]) => (
              <section key={setor} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-950">{setor}</h2>
                <div className="mt-4 grid gap-3 lg:grid-cols-2">
                  {itens.map((padrao) => (
                    <article key={padrao.id} className="rounded-md bg-slate-50 p-4">
                      <h3 className="font-medium text-slate-950">{padrao.nome}</h3>
                      <p className="mt-1 text-sm text-slate-600">Tipo: {padrao.tipo}</p>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
                        <span className="rounded-full bg-white px-2.5 py-1 ring-1 ring-slate-200">
                          {padrao.vezes_usado} usos
                        </span>
                        <span className="rounded-full bg-white px-2.5 py-1 ring-1 ring-slate-200">
                          Score médio: {padrao.score_medio?.toFixed(1) || 'sem score'}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))
          ) : (
            <EmptyState text="Nenhum documento aprovado entrou na memória ainda." />
          )}
        </div>
      ) : null}

      {activeTab === 'licoes' ? (
        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
          <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-950">
              <Plus className="h-5 w-5" />
              Nova lição
            </h2>
            <label className="mt-4 block text-sm font-medium text-slate-700">
              Setor
              <select
                value={setor}
                onChange={(event) => setSetor(event.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              >
                {setores.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label className="mt-4 block text-sm font-medium text-slate-700">
              Lição aprendida
              <textarea
                value={conteudo}
                onChange={(event) => setConteudo(event.target.value)}
                rows={6}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                placeholder="Ex.: Para metalurgia com pintura, sempre validar FISPQ, ventilação local exaustora e destinação de borra classe I."
                required
              />
            </label>
            <button
              type="submit"
              disabled={isSaving}
              className="mt-4 rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {isSaving ? 'Salvando...' : 'Salvar lição'}
            </button>
          </form>

          <div className="space-y-3">
            {licoes.length > 0 ? (
              licoes.map((licao) => (
                <article key={licao.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                      {licao.setor}
                    </span>
                    <span className="text-xs text-slate-500">
                      {new Date(licao.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700">{licao.conteudo}</p>
                </article>
              ))
            ) : (
              <EmptyState text="Nenhuma lição aprendida cadastrada." />
            )}
          </div>
        </div>
      ) : null}

      {activeTab === 'estatisticas' ? (
        <div className="grid gap-5 lg:grid-cols-3">
          <StatCard title="Documentos aprovados" value={String(estatisticas.totalDocumentosAprovados)} />
          <StatList title="Setores mais atendidos" items={estatisticas.setoresMaisAtendidos.map((item) => `${item.setor}: ${item.total}`)} />
          <StatList title="Documentos mais gerados" items={estatisticas.documentosMaisGerados.map((item) => `${item.nome}: ${item.total}`)} />
        </div>
      ) : null}
    </div>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">
      {text}
    </div>
  )
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="mt-3 text-3xl font-semibold text-slate-950">{value}</p>
    </div>
  )
}

function StatList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
        {title}
      </h2>
      <ul className="mt-4 space-y-2 text-sm text-slate-700">
        {items.length > 0 ? items.map((item) => <li key={item}>{item}</li>) : <li>Sem dados ainda.</li>}
      </ul>
    </div>
  )
}

function groupBy<T>(items: T[], getKey: (item: T) => string) {
  return items.reduce<Record<string, T[]>>((acc, item) => {
    const key = getKey(item)
    acc[key] ||= []
    acc[key].push(item)
    return acc
  }, {})
}
