import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const todosSetores = [
  'metalurgia',
  'quimico',
  'plastico',
  'logistica',
  'construcao',
  'alimenticio',
  'tintas_vernizes',
  'servicos_escritorio',
]

const requisitos = [
  {
    codigo: 'NR-1',
    nome: 'Disposições gerais e gerenciamento de riscos ocupacionais',
    descricao: 'Exige GRO, PGR, inventário de riscos e plano de ação de SST.',
    tipo: 'NR',
    orgao: 'MTE',
    setores: todosSetores,
  },
  {
    codigo: 'NR-5',
    nome: 'Comissão Interna de Prevenção de Acidentes e de Assédio',
    descricao: 'Define regras de dimensionamento, eleição, treinamento e funcionamento da CIPA.',
    tipo: 'NR',
    orgao: 'MTE',
    setores: todosSetores,
  },
  {
    codigo: 'NR-6',
    nome: 'Equipamento de Proteção Individual',
    descricao: 'Estabelece obrigações para seleção, fornecimento, uso, higienização e registro de EPIs.',
    tipo: 'NR',
    orgao: 'MTE',
    setores: todosSetores,
  },
  {
    codigo: 'NR-7',
    nome: 'Programa de Controle Médico de Saúde Ocupacional',
    descricao: 'Exige PCMSO alinhado aos riscos ocupacionais e exames médicos pertinentes.',
    tipo: 'NR',
    orgao: 'MTE',
    setores: todosSetores,
  },
  {
    codigo: 'NR-9',
    nome: 'Avaliação e controle das exposições ocupacionais',
    descricao: 'Define avaliação e controle de agentes físicos, químicos e biológicos.',
    tipo: 'NR',
    orgao: 'MTE',
    setores: todosSetores,
  },
  {
    codigo: 'NR-10',
    nome: 'Segurança em instalações e serviços em eletricidade',
    descricao: 'Requisitos de prontuário, capacitação, procedimentos e controle de riscos elétricos.',
    tipo: 'NR',
    orgao: 'MTE',
    setores: ['metalurgia', 'quimico', 'plastico', 'logistica', 'construcao', 'alimenticio', 'tintas_vernizes'],
  },
  {
    codigo: 'NR-11',
    nome: 'Transporte, movimentação, armazenagem e manuseio de materiais',
    descricao: 'Regras para movimentação de cargas, equipamentos, operadores e armazenagem segura.',
    tipo: 'NR',
    orgao: 'MTE',
    setores: ['metalurgia', 'quimico', 'plastico', 'logistica', 'construcao', 'alimenticio', 'tintas_vernizes'],
  },
  {
    codigo: 'NR-12',
    nome: 'Segurança no trabalho em máquinas e equipamentos',
    descricao: 'Exige proteções, dispositivos de segurança, apreciação de riscos e inventário de máquinas.',
    tipo: 'NR',
    orgao: 'MTE',
    setores: ['metalurgia', 'quimico', 'plastico', 'logistica', 'construcao', 'alimenticio', 'tintas_vernizes'],
  },
  {
    codigo: 'NR-13',
    nome: 'Caldeiras, vasos de pressão, tubulações e tanques metálicos',
    descricao: 'Define inspeções, prontuários, segurança operacional e responsabilidade técnica.',
    tipo: 'NR',
    orgao: 'MTE',
    setores: ['metalurgia', 'quimico', 'alimenticio', 'tintas_vernizes'],
  },
  {
    codigo: 'NR-15',
    nome: 'Atividades e operações insalubres',
    descricao: 'Define limites e critérios para caracterização de insalubridade.',
    tipo: 'NR',
    orgao: 'MTE',
    setores: ['metalurgia', 'quimico', 'plastico', 'construcao', 'alimenticio', 'tintas_vernizes'],
  },
  {
    codigo: 'NR-17',
    nome: 'Ergonomia',
    descricao: 'Exige adaptação das condições de trabalho, avaliação ergonômica e organização do trabalho.',
    tipo: 'NR',
    orgao: 'MTE',
    setores: todosSetores,
  },
  {
    codigo: 'NR-18',
    nome: 'Segurança e saúde no trabalho na indústria da construção',
    descricao: 'Define requisitos para canteiros, frentes de obra, máquinas, escavações e trabalho em altura.',
    tipo: 'NR',
    orgao: 'MTE',
    setores: ['construcao'],
  },
  {
    codigo: 'NR-20',
    nome: 'Segurança e saúde no trabalho com inflamáveis e combustíveis',
    descricao: 'Exige classificação de instalações, análise de risco, capacitação e plano de resposta.',
    tipo: 'NR',
    orgao: 'MTE',
    setores: ['metalurgia', 'quimico', 'logistica', 'tintas_vernizes'],
  },
  {
    codigo: 'NR-23',
    nome: 'Proteção contra incêndios',
    descricao: 'Estabelece medidas de prevenção, saídas, informação e resposta a incêndios.',
    tipo: 'NR',
    orgao: 'MTE',
    setores: todosSetores,
  },
  {
    codigo: 'NR-26',
    nome: 'Sinalização de segurança',
    descricao: 'Inclui sinalização, classificação e rotulagem preventiva de produtos químicos pelo GHS.',
    tipo: 'NR',
    orgao: 'MTE',
    setores: ['metalurgia', 'quimico', 'construcao', 'alimenticio', 'tintas_vernizes'],
  },
  {
    codigo: 'NR-33',
    nome: 'Segurança e saúde nos trabalhos em espaços confinados',
    descricao: 'Define gestão, permissão de entrada, capacitação e controle de atmosferas perigosas.',
    tipo: 'NR',
    orgao: 'MTE',
    setores: ['metalurgia', 'quimico', 'logistica', 'construcao', 'alimenticio', 'tintas_vernizes'],
  },
  {
    codigo: 'NR-35',
    nome: 'Trabalho em altura',
    descricao: 'Requisitos para planejamento, capacitação, autorização e medidas de proteção em altura.',
    tipo: 'NR',
    orgao: 'MTE',
    setores: ['logistica', 'construcao', 'metalurgia', 'alimenticio'],
  },
  {
    codigo: 'CONAMA 307',
    nome: 'Gestão de resíduos da construção civil',
    descricao: 'Classifica RCC e define diretrizes para gestão, segregação e destinação.',
    tipo: 'CONAMA',
    orgao: 'CONAMA',
    setores: ['construcao'],
  },
  {
    codigo: 'CONAMA 358',
    nome: 'Tratamento e disposição final de resíduos dos serviços de saúde',
    descricao: 'Define requisitos para resíduos de serviços de saúde e riscos associados.',
    tipo: 'CONAMA',
    orgao: 'CONAMA',
    setores: ['alimenticio'],
  },
  {
    codigo: 'CONAMA 430',
    nome: 'Condições e padrões de lançamento de efluentes',
    descricao: 'Complementa regras de lançamento de efluentes e padrões de controle ambiental.',
    tipo: 'CONAMA',
    orgao: 'CONAMA',
    setores: ['metalurgia', 'quimico', 'alimenticio', 'tintas_vernizes'],
  },
  {
    codigo: 'Lei 12.305/2010',
    nome: 'Política Nacional de Resíduos Sólidos',
    descricao: 'Define princípios, responsabilidades, logística reversa e gestão de resíduos sólidos.',
    tipo: 'Lei',
    orgao: 'Governo Federal',
    setores: todosSetores,
  },
  {
    codigo: 'NBR ISO 14001:2015',
    nome: 'Sistema de gestão ambiental',
    descricao: 'Requisitos para sistema de gestão ambiental com perspectiva de ciclo de vida.',
    tipo: 'NBR',
    orgao: 'ABNT/ISO',
    setores: todosSetores,
  },
  {
    codigo: 'NBR ISO 45001:2018',
    nome: 'Sistema de gestão de saúde e segurança ocupacional',
    descricao: 'Requisitos para gestão de SST, riscos, oportunidades e participação dos trabalhadores.',
    tipo: 'NBR',
    orgao: 'ABNT/ISO',
    setores: todosSetores,
  },
]

async function main() {
  await prisma.requisitoLegal.deleteMany()

  await prisma.requisitoLegal.createMany({
    data: requisitos.map((requisito) => ({
      ...requisito,
      obrigatorio: true,
    })),
  })

  const count = await prisma.requisitoLegal.count()
  console.log('Seed de requisitos legais concluído.')
  console.log(`Requisitos legais: ${count}`)
}

main()
  .catch((error) => {
    console.error('Erro ao executar seed legal:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
