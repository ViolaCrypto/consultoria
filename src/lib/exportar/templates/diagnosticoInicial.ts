export function diagnosticoInicialTemplate(contentHtml: string, chartsHtml: string) {
  return `
    <section class="template-section">
      <h1>Relatório Executivo de Diagnóstico Inicial</h1>
      <p>Este relatório consolida conformidade, lacunas críticas e recomendações técnicas.</p>
      <h1>Sumário Executivo Visual</h1>
      <div class="charts-grid">${chartsHtml}</div>
      ${contentHtml}
    </section>
  `
}
