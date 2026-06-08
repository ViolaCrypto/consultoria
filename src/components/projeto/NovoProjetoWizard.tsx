'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Modelo = {
  id: string
  nome: string
  categoria: string | null
  versao: string
  requisitosCount: number
}

const tipos = [
  { value: 'diagnostico_inicial', label: 'Diagnóstico inicial' },
  { value: 'adequacao_iso14001', label: 'Adequação ISO 14001' },
  { value: 'adequacao_iso45001', label: 'Adequação ISO 45001' },
  { value: 'homologacao_fornecedor', label: 'Homologação fornecedor' },
  { value: 'auditoria_interna', label: 'Auditoria interna' },
  { value: 'outro', label: 'Outro' },
]

export function NovoProjetoWizard({
  empresa,
  modelos,
}: {
  empresa: { id: string; nome: string }
  modelos: Modelo[]
}) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [nome, setNome] = useState('')
  const [tipo, setTipo] = useState('diagnostico_inicial')
  const [selectedModelos, setSelectedModelos] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const selectedResumo = useMemo(
    () => modelos.filter((modelo) => selectedModelos.includes(modelo.id)),
    [modelos, selectedModelos],
  )

  function toggleModelo(modeloId: string) {
    setSelectedModelos((current) =>
      current.includes(modeloId)
        ? current.filter((id) => id !== modeloId)
        : [...current, modeloId],
    )
  }

  async function submit() {
    setError('')
    setIsSubmitting(true)

    const response = await fetch('/api/projetos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome,
        tipo,
        status: 'em_andamento',
        empresaId: empresa.id,
        modeloIds: selectedModelos,
      }),
    })

    setIsSubmitting(false)

    if (!response.ok) {
      const payload = await response.json().catch(() => null)
      setError(payload?.error || 'Não foi possível criar o projeto.')
      return
    }

    const projeto = (await response.json()) as { id: string }
    router.push(`/empresas/${empresa.id}/projetos/${projeto.id}`)
  }

  return (
    <div className="mx-auto max-w-5xl">
      <Link href={`/empresas/${empresa.id}`} className="text-sm font-medium text-slate-600 hover:text-slate-950">
        Voltar para {empresa.nome}
      </Link>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">
          Novo projeto
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950">
          Criar projeto para {empresa.nome}
        </h1>

        <div className="mt-6 grid gap-2 sm:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className={`rounded-md px-4 py-3 text-sm font-medium ${
                step === item ? 'bg-blue-700 text-white' : step > item ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
              }`}
            >
              Passo {item}
            </div>
          ))}
        </div>

        {step === 1 ? (
          <div className="mt-8 grid gap-5">
            <Field label="Nome do projeto" value={nome} onChange={setNome} />
            <div>
              <label className="block text-sm font-medium text-slate-700">Tipo</label>
              <select
                value={tipo}
                onChange={(event) => setTipo(event.target.value)}
                className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              >
                {tipos.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-slate-950">Modelos de avaliação</h2>
            <p className="mt-1 text-sm text-slate-600">
              Selecione os modelos que já devem nascer vinculados ao projeto.
            </p>
            <div className="mt-5 grid gap-3 lg:grid-cols-2">
              {modelos.map((modelo) => (
                <label
                  key={modelo.id}
                  className={`cursor-pointer rounded-lg border p-4 transition ${
                    selectedModelos.includes(modelo.id)
                      ? 'border-blue-300 bg-blue-50'
                      : 'border-slate-200 bg-white hover:border-blue-200'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedModelos.includes(modelo.id)}
                    onChange={() => toggleModelo(modelo.id)}
                    className="sr-only"
                  />
                  <span className="font-semibold text-slate-950">{modelo.nome}</span>
                  <span className="mt-1 block text-sm text-slate-600">
                    {modelo.categoria || 'sem categoria'} · {modelo.requisitosCount} requisitos · v{modelo.versao}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="mt-8 rounded-lg bg-slate-50 p-5">
            <h2 className="text-lg font-semibold text-slate-950">Resumo</h2>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              <Summary label="Projeto" value={nome || 'Sem nome'} />
              <Summary label="Tipo" value={tipos.find((item) => item.value === tipo)?.label || tipo} />
              <Summary label="Empresa" value={empresa.nome} />
              <Summary label="Modelos" value={selectedResumo.length ? selectedResumo.map((item) => item.nome).join(', ') : 'Nenhum modelo vinculado agora'} />
            </dl>
          </div>
        ) : null}

        {error ? <p className="mt-5 text-sm text-red-600">{error}</p> : null}

        <div className="mt-8 flex justify-between gap-3">
          <button
            type="button"
            disabled={step === 1}
            onClick={() => setStep((current) => Math.max(1, current - 1))}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Voltar
          </button>
          {step < 3 ? (
            <button
              type="button"
              disabled={step === 1 && !nome.trim()}
              onClick={() => setStep((current) => current + 1)}
              className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Continuar
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting || !nome.trim()}
              onClick={submit}
              className="rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Criando...' : 'Criar projeto'}
            </button>
          )}
        </div>
      </section>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
      />
    </div>
  )
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-white p-4">
      <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
        {label}
      </dt>
      <dd className="mt-2 text-sm font-medium text-slate-950">{value}</dd>
    </div>
  )
}
