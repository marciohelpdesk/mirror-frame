## PDF Reestruturado - Concluido

### Mudancas realizadas
1. **pdfGenerator.ts** - Reescrito completamente:
   - Removidos todos os emojis unicode (substituidos por texto ASCII)
   - Fotos renderizadas como links clicaveis em vez de imagens embutidas
   - Adicionado link do Dossie Digital Interativo na capa, rodape e banner final
   - Caracteres acentuados removidos para compatibilidade com Helvetica/jsPDF
   
2. **Execution.tsx** - PDF gerado apos createReport para ter acesso ao public_token
3. **SummaryStep.tsx** - Simplificado: apenas passa a nota, PDF gerado no Execution
