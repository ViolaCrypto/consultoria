import { z } from 'zod'
import { openai } from '@/lib/openai'

type DadosSetor = {
  produtosQuimicos?: string | null
  residuosPerigosos?: string | null
  observacoesGerais?: string | null
}

type AnamneseInput = {
  numFuncionarios: number | null
  turnos: string | null
  processosPrincipais: string | null
  dadosSetor: DadosSetor | null
}

type EmpresaInput = {
  nome: string
  setor: string | null
  cnae: string | null
}

const perfilSchema = z.object({
  processos_provaveis: z.array(z.string()),
  riscos_sst: z.array(z.string()),
  aspectos_ambientais: z.array(z.string()),
  documentos_esperados: z.array(z.string()),
  legislacao_aplicavel: z.array(z.string()),
  observacoes: z.string(),
})

export type PerfilOperacional = z.infer<typeof perfilSchema>

export async function gerarPerfilOperacional(
  anamnese: AnamneseInput,
  empresa: EmpresaInput,
): Promise<PerfilOperacional> {
  const dadosSetor = anamnese.dadosSetor

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content:
          'Você é um especialista em SST e gestão ambiental ISO 14001/45001. Analise os dados da empresa e retorne APENAS JSON válido com o perfil operacional técnico. Nunca seja genérico — sempre referencie o setor, processos e características reais da empresa informada.',
      },
      {
        role: 'user',
        content: [
          'Retorne um JSON com as chaves:',
          'processos_provaveis, riscos_sst, aspectos_ambientais, documentos_esperados, legislacao_aplicavel, observacoes.',
          '',
          `Nome da empresa: ${empresa.nome}`,
          `Setor: ${empresa.setor || 'não informado'}`,
          `CNAE: ${empresa.cnae || 'não informado'}`,
          `Número de funcionários: ${anamnese.numFuncionarios ?? 'não informado'}`,
          `Turnos: ${anamnese.turnos || 'não informado'}`,
          `Processos principais: ${anamnese.processosPrincipais || 'não informado'}`,
          `Produtos químicos utilizados: ${dadosSetor?.produtosQuimicos || 'não informado'}`,
          `Gera resíduos perigosos: ${dadosSetor?.residuosPerigosos || 'não informado'}`,
          `Observações da anamnese: ${dadosSetor?.observacoesGerais || 'não informado'}`,
        ].join('\n'),
      },
    ],
  })

  const content = completion.choices[0]?.message.content

  if (!content) {
    throw new Error('A OpenAI não retornou conteúdo para o perfil operacional.')
  }

  return perfilSchema.parse(JSON.parse(content))
}
