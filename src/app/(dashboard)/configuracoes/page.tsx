import { ConfiguracoesClient } from '@/components/configuracoes/ConfiguracoesClient'
import { CONSULTORIA_CONFIG } from '@/lib/config/consultoria'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function ConfiguracoesPage() {
  const config =
    (await prisma.configuracaoConsultoria.findFirst({
      orderBy: { updatedAt: 'desc' },
    })) ||
    (await prisma.configuracaoConsultoria.create({
      data: {
        nome: CONSULTORIA_CONFIG.nome,
        nomeCompleto: CONSULTORIA_CONFIG.nomeCompleto,
        slogan: CONSULTORIA_CONFIG.slogan,
        corPrimaria: CONSULTORIA_CONFIG.corPrimaria,
        corSecundaria: CONSULTORIA_CONFIG.corSecundaria,
      },
    }))

  return (
    <ConfiguracoesClient
      initialConfig={{
        nome: config.nome,
        nomeCompleto: config.nomeCompleto,
        slogan: config.slogan,
        corPrimaria: config.corPrimaria,
        corSecundaria: config.corSecundaria,
        logoUrl: config.logoUrl,
        responsavelNome: config.responsavelNome,
        responsavelRegistro: config.responsavelRegistro,
        responsavelCargo: config.responsavelCargo,
        endereco: config.endereco,
        telefone: config.telefone,
        email: config.email,
        site: config.site,
      }}
    />
  )
}
