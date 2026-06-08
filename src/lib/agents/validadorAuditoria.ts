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

  if (tipo === 'politica_ambiental') {
    const temNRsTrabalhistas = /NR[\s-]?\d{1,2}/i.test(conteudo)
    if (temNRsTrabalhistas) {
      problemas.push({
        severidade: 'critica',
        tipo: 'erro_tecnico',
        descricao:
          'Politica Ambiental cita NRs (normas trabalhistas). NRs sao de SST, nao ambientais. Use ISO 14001, CONAMA, leis ambientais e ABNT NBR ambientais.',
      })
      score.total -= 25
    }

    const subsecoesObrigatorias = ['4.1', '4.2', '4.3', '4.4', '4.5', '4.6']
    const faltantes = subsecoesObrigatorias.filter((sub) => !conteudo.includes(sub))
    if (faltantes.length > 0) {
      problemas.push({
        severidade: 'alta',
        tipo: 'estrutura',
        descricao: `Subsecoes faltantes em Diretrizes Ambientais: ${faltantes.join(', ')}`,
      })
      score.total -= 10
    }

    const temISO14001 = /ISO\s*14001/i.test(conteudo)
    if (!temISO14001) {
      problemas.push({
        severidade: 'critica',
        tipo: 'norma_obrigatoria',
        descricao: 'Politica Ambiental nao cita ISO 14001 - obrigatorio',
      })
      score.total -= 20
    }
  }

  if (tipo === 'pgr') {
    if (!conteudo.match(/elimina..o[\s\S]*substitui..o[\s\S]*engenharia[\s\S]*administrativ[\s\S]*EPI/i)) {
      problemas.push({
        severidade: 'alta',
        tipo: 'metodologia',
        descricao:
          'PGR nao menciona hierarquia de controles (NR-01 item 1.5.5): Eliminacao, Substituicao, Engenharia, Administrativa, EPI',
      })
      score.total -= 10
    }

    if (!conteudo.match(/probabilidade[\s\S]*gravidade/i)) {
      problemas.push({
        severidade: 'alta',
        tipo: 'metodologia',
        descricao:
          'PGR nao apresenta matriz probabilidade x gravidade para classificacao de risco',
      })
      score.total -= 10
    }

    if (!conteudo.match(/CIPA|NR.{0,3}05/i)) {
      problemas.push({
        severidade: 'alta',
        tipo: 'estrutura',
        descricao: 'PGR nao menciona CIPA / NR-05 - obrigatorio',
      })
      score.total -= 10
    }

    if (!conteudo.match(/vig.ncia|validade|2\s*anos|3\s*anos/i)) {
      problemas.push({
        severidade: 'alta',
        tipo: 'controle',
        descricao: 'PGR sem definicao clara de vigencia (2 anos ou 3 anos com SGSST)',
      })
      score.total -= 10
    }

    if (!conteudo.match(/plano\s+de\s+a..o/i)) {
      problemas.push({
        severidade: 'critica',
        tipo: 'estrutura',
        descricao: 'PGR sem Plano de Acao - obrigatorio NR-01',
      })
      score.total -= 20
    }

    const nrsCitadas = [...conteudo.matchAll(/NR[\s-]?(\d{1,2})/gi)]
    if (nrsCitadas.length < 5) {
      problemas.push({
        severidade: 'media',
        tipo: 'fundamentacao',
        descricao: `PGR cita apenas ${nrsCitadas.length} NRs - documento tecnico deveria fundamentar com mais normas`,
      })
      score.total -= 5
    }

    if (conteudo.match(/EPI/i) && !conteudo.match(/CA\s*\d|certificado\s+de\s+aprova/i)) {
      problemas.push({
        severidade: 'alta',
        tipo: 'epi',
        descricao:
          'PGR cita EPIs sem mencionar CA (Certificado de Aprovacao) - obrigatorio NR-06',
      })
      score.total -= 10
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
  if (tipo.includes('politica') && tipo.includes('ambiental')) return 'politica_ambiental'
  if (tipo.includes('pgrs')) return 'pgrs'
  if (tipo.includes('pgr')) return 'pgr'
  if (tipo.includes('inventario') && tipo.includes('risco')) return 'inventario_riscos'
  if (tipo.includes('ltcat')) return 'ltcat'
  return tipo
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
