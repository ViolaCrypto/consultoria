'use client'

import { ClipboardList, FileUp, ListChecks, SearchCheck, Sparkles, CheckCircle2 } from 'lucide-react'
import type { OnboardingStep, OnboardingStepId } from '@/lib/projeto-onboarding'

const icons: Record<OnboardingStepId, typeof ClipboardList> = {
  anamnese: ClipboardList,
  arquivos: FileUp,
  modelos: ListChecks,
  gap: SearchCheck,
  diagnostico: Sparkles,
}

export function OnboardingGuia({
  steps,
  onAction,
}: {
  steps: OnboardingStep[]
  onAction: (step: OnboardingStepId) => void
}) {
  return (
    <section className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">
            Primeiros passos
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">
            Guia de onboarding do projeto
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Siga esta sequência para alimentar o contexto, avaliar os requisitos e gerar entregáveis técnicos.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-5">
        {steps.map((step, index) => {
          const Icon = icons[step.id]
          const current = step.status === 'em_andamento'
          const done = step.status === 'concluido'

          return (
            <article
              key={step.id}
              className={`rounded-lg border p-4 transition ${
                done
                  ? 'border-emerald-200 bg-emerald-50'
                  : current
                    ? 'border-blue-300 bg-white shadow-md shadow-blue-950/10'
                    : 'border-slate-200 bg-slate-50 opacity-75'
              }`}
            >
              <div className="flex items-center justify-between">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    done ? 'bg-emerald-600 text-white' : current ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {done ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                </div>
                <span className="text-xs font-semibold text-slate-500">Passo {index + 1}</span>
              </div>
              <h3 className="mt-4 font-semibold text-slate-950">{step.title}</h3>
              <p className="mt-2 min-h-10 text-sm text-slate-600">{step.description}</p>
              <button
                type="button"
                disabled={!current && !done}
                onClick={() => onAction(step.id)}
                className={`mt-4 w-full rounded-md px-3 py-2 text-sm font-medium transition ${
                  current
                    ? 'bg-blue-700 text-white hover:bg-blue-800'
                    : done
                      ? 'border border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50'
                      : 'cursor-not-allowed bg-slate-200 text-slate-500'
                }`}
              >
                {done ? 'Revisar' : step.actionLabel}
              </button>
            </article>
          )
        })}
      </div>
    </section>
  )
}
