export function politicaSSTTemplate(contentHtml: string) {
  return `
    <section class="template-section">
      <h1>Apresentação</h1>
      <p>Este documento estabelece compromissos formais de saúde e segurança ocupacional.</p>
      <h1>Política de SST</h1>
      ${contentHtml}
      <h1>Compromissos de SST</h1>
      <ul>
        <li>Eliminação de perigos e redução de riscos ocupacionais.</li>
        <li>Consulta e participação dos trabalhadores.</li>
        <li>Atendimento aos requisitos legais aplicáveis.</li>
      </ul>
      <h1>Comunicação, Revisão e Divulgação</h1>
      <p>A política deve ser disponibilizada aos trabalhadores e revisada quando houver mudanças relevantes.</p>
    </section>
  `
}
