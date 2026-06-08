'use client'

import type { OnboardingStep } from '@/lib/projeto-onboarding'

export function ChecklistRapido({ steps }: { steps: OnboardingStep[] }) {
  const completed = steps.filter((step) => step.status === 'concluido').length

  return (
    <aside className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-950">Checklist rápido</h2>
          <p className="mt-1 text-xs text-slate-500">
            {completed}/{steps.length} passos
          </p>
        </div>
        <div className="flex gap-2">
          {steps.map((step, index) => (
            <span
              key={step.id}
              title={`${index + 1}. ${step.title}: ${step.description} (${labelStatus(step.status)})`}
              className={`h-3.5 w-3.5 rounded-full ${
                step.status === 'concluido'
                  ? 'bg-emerald-500'
                  : step.status === 'em_andamento'
                    ? 'bg-blue-600 ring-4 ring-blue-100'
                    : 'bg-slate-300'
              }`}
            />
          ))}
        </div>
      </div>
    </aside>
  )
}

function labelStatus(status: OnboardingStep['status']) {
  if (status === 'concluido') return 'concluído'
  if (status === 'em_andamento') return 'em andamento'
  return 'pendente'
}
