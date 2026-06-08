type ProblemaAuditoria = {
  severidade: 'critica' | 'alta' | 'media'
  tipo: string
  descricao: string
}

export function validarComoAuditor(
  conteudo: string,
  tipoDocumento: string,
  empresa: { nome: string },
) {
  const problemas: ProblemaAuditoria[] = []
  const score = { total: 100 }
  const tipo = normalizarTipo(tipoDocumento)
  const nomeEmpresa = empresa.nome
  const nomeRegex = escapeRegExp(nomeEmpresa)
  const ocorrencias = nomeRegex
    ? (conteudo.match(new RegExp(nomeRegex, 'gi')) || []).length
    : 0

  if (ocorrencias < 3) {
    problemas.push({
      severidade: 'alta',
      tipo: 'identificacao',
      descricao: `Nome da empresa "${nomeEmpresa}" aparece apenas ${ocorrencias} vezes - documento parece generico`,
    })
    score.total -= 15
  }

  const outrasEmpresas = ['Grupo KWM', 'Tempo BR', 'Brasil Ar', 'EMPRESA XYZ', 'EMPRESA TESTE']
  for (const outra of outrasEmpresas) {
    if (outra !== nomeEmpresa && conteudo.includes(outra)) {
      problemas.push({
        severidade: 'critica',
        tipo: 'erro_template',
        descricao: `Documento contem referencia a "${outra}" - template nao foi ajustado corretamente`,
      })
      score.total -= 30
    }
  }

  const placeholders = /\{\{.*?\}\}|\[INSERIR.*?\]|\[NOME.*?\]|XXXXX/g
  const phMatches = conteudo.match(placeholders)
  if (phMatches) {
    problemas.push({
      severidade: 'critica',
      tipo: 'placeholder',
      descricao: `Placeholders nao preenchidos: ${phMatches.join(', ')}`,
    })
    score.total -= 20
  }

  if (['pgr', 'pcmso', 'inventario_riscos'].includes(tipo)) {
    const nrsValidas = [
      '01',
      '04',
      '05',
      '06',
      '07',
      '09',
      '10',
      '11',
      '12',
      '13',
      '15',
      '16',
      '17',
      '18',
      '19',
      '20',
      '21',
      '22',
      '23',
      '24',
      '25',
      '26',
      '27',
      '28',
      '29',
      '30',
      '31',
      '32',
      '33',
      '34',
      '35',
      '36',
      '37',
      '38',
      '39',
    ]
    const nrsCitadas = [...conteudo.matchAll(/NR[\s-]?(\d{1,2})/gi)].map((match) =>
      match[1].padStart(2, '0'),
    )
    const nrsInvalidas = nrsCitadas.filter((nr) => !nrsValidas.includes(nr))

    if (nrsInvalidas.length > 0) {
      problemas.push({
        severidade: 'alta',
        tipo: 'nr_invalida',
        descricao: `NRs inexistentes citadas: ${[...new Set(nrsInvalidas)].join(', ')}`,
      })
      score.total -= 15
    }

    if (tipo === 'pgr' && !nrsCitadas.includes('01')) {
      problemas.push({
        severidade: 'critica',
        tipo: 'nr_obrigatoria',
        descricao: 'PGR nao cita NR-01 - obrigatorio',
      })
      score.total -= 20
    }

    if (tipo === 'pcmso' && !nrsCitadas.includes('07')) {
      problemas.push({
        severidade: 'critica',
        tipo: 'nr_obrigatoria',
        descricao: 'PCMSO nao cita NR-07 - obrigatorio',
      })
      score.total -= 20
    }
  }

  const temEmoji = /[\u{1F300}-\u{1F9FF}]/u.test(conteudo)
  if (temEmoji) {
    problemas.push({
      severidade: 'media',
      tipo: 'estilo',
      descricao: 'Documento contem emojis - inadequado para documento tecnico de auditoria',
    })
    score.total -= 5
  }

  const secoesNumeradas = (conteudo.match(/^#{1,3}\s+\d+\./gm) || []).length
  if (secoesNumeradas < 4) {
    problemas.push({
      severidade: 'media',
      tipo: 'estrutura',
      descricao: `Apenas ${secoesNumeradas} secoes numeradas encontradas - estrutura tecnica insuficiente`,
    })
    score.total -= 10
  }

  if (!conteudo.match(/vig.ncia|validade|revis[aã]o/i)) {
    problemas.push({
      severidade: 'alta',
      tipo: 'vigencia',
      descricao: 'Documento sem mencao a vigencia ou validade',
    })
    score.total -= 10
  }

  if (
    ['pgr', 'pcmso', 'ltcat'].includes(tipo) &&
    !conteudo.match(/respons.vel\s+t.cnico|CREA|CRM|engenheiro\s+de\s+seguran/i)
  ) {
    problemas.push({
      severidade: 'alta',
      tipo: 'rt',
      descricao: 'Documento tecnico sem indicacao de responsavel tecnico habilitado',
    })
    score.total -= 10
  }

  const scoreAuditoria = Math.max(0, score.total)

  return {
    scoreAuditoria,
    aprovadoAuditoria: scoreAuditoria >= 70,
    problemas,
    temProblemasCriticos: problemas.some((problema) => problema.severidade === 'critica'),
  }
}

function normalizarTipo(tipoDocumento: string) {
  const tipo = tipoDocumento
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

  if (tipo.includes('pcmso')) return 'pcmso'
  if (tipo.includes('pgrs')) return 'pgrs'
  if (tipo.includes('pgr')) return 'pgr'
  if (tipo.includes('inventario') && tipo.includes('risco')) return 'inventario_riscos'
  if (tipo.includes('ltcat')) return 'ltcat'
  return tipo
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
