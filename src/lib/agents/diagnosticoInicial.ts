import { openai } from '@/lib/openai'

export async function gerarDiagnosticoInicial(
  projeto: unknown,
  empresa: unknown,
  anamnese: unknown,
  perfilOperacional: unknown,
  gapAnalysis: unknown,
) {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 4000,
    messages: [
      {
        role: 'system',
        content:
          'Você é consultor sênior em ISO 14001, ISO 45001 e SST com 20 anos de experiência. Gere um relatório de diagnóstico técnico profissional, específico para esta empresa. Use dados reais fornecidos. Nunca seja genérico. O relatório será entregue ao cliente.',
      },
      {
        role: 'user',
        content: [
          'Gere um relatório executivo completo em markdown com estas seções:',
          '1. Identificação da empresa (nome, setor, CNAE, localização)',
          '2. Resumo executivo (3-4 parágrafos com visão geral do diagnóstico)',
          '3. Perfil operacional (processos, riscos, aspectos baseados na ontologia)',
          '4. Situação atual — o que atende, o que não atende, percentual de conformidade',
          '5. Principais lacunas identificadas (top 5 mais críticas com justificativa)',
          '6. Documentos obrigatórios ausentes',
          '7. Documentos que precisam ser atualizados',
          '8. Plano de ação sugerido com prioridades (imediato/curto/médio prazo)',
          '9. Conclusão e próximos passos recomendados',
          '',
          'Dados consolidados:',
          JSON.stringify(
            {
              projeto,
              empresa,
              anamnese,
              perfilOperacional,
              gapAnalysis,
            },
            null,
            2,
          ),
        ].join('\n'),
      },
    ],
  })

  const content = completion.choices[0]?.message.content

  if (!content) {
    throw new Error('A OpenAI não retornou conteúdo para o diagnóstico inicial.')
  }

  return content
}
