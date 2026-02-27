
### Diagnóstico confirmado
- O link atual copiado em `/reports` usa o endpoint de compartilhamento (`.../functions/v1/share-report?...`).
- Esse endpoint está sendo renderizado como texto em alguns acessos, então o cliente vê código HTML em vez do relatório interativo.
- A rota pública `/r/:token` já funciona sem login e abre o relatório corretamente.
- Em `PhotoCaptureStep`, o upload múltiplo de Antes/Depois tem condição de corrida: cada arquivo atualiza com estado antigo (`onPhotosChange([...photos, url])`), causando comportamento de “uma por uma”.
- Antes/Depois exigem mínimo de 1 foto e hoje não existe opção de pular.

### Plano de implementação (correção definitiva)
1. **Tornar o link do cliente sempre direto e público**
   - Em `src/pages/Reports.tsx`, mudar o link principal (copiar/abrir) para:
     - `https://maisonpur.lovable.app/r/${report.public_token}`
   - Não usar o endpoint de função como link principal para o cliente.

2. **Blindar a função de compartilhamento para não mostrar HTML bruto**
   - Em `supabase/functions/share-report/index.ts`:
     - aplicar headers consistentes em todas as respostas.
     - para navegadores comuns: responder com **redirect HTTP 302** para `/r/{token}`.
     - para bots de preview social: manter resposta HTML com OG tags.

3. **Corrigir upload múltiplo em Fotos Antes/Depois**
   - Em `src/components/execution/PhotoCaptureStep.tsx`:
     - remover atualização de estado por arquivo dentro de `processAndUpload`.
     - no `handleFileSelect`, fazer `Promise.all`, juntar URLs e chamar `onPhotosChange` uma única vez com todas as novas fotos.
     - manter feedback visual de processamento/upload.

4. **Permitir pular Antes/Depois sem fotos**
   - Em `src/views/ExecutionView.tsx`, alterar `minPhotos` de `1` para `0` nas etapas BEFORE_PHOTOS e AFTER_PHOTOS.
   - Em `src/components/execution/PhotoCaptureStep.tsx`, adicionar botão “Pular etapa” quando não houver foto.
   - Em `src/contexts/LanguageContext.tsx`, adicionar textos PT/EN para “Pular etapa”.

### Arquivos a alterar
- `src/pages/Reports.tsx`
- `supabase/functions/share-report/index.ts`
- `src/components/execution/PhotoCaptureStep.tsx`
- `src/views/ExecutionView.tsx`
- `src/contexts/LanguageContext.tsx`

### Validação end-to-end
1. Gerar relatório, copiar link e abrir em aba anônima: deve abrir direto no relatório interativo sem login.
2. Selecionar múltiplas fotos em “Fotos Antes”: todas devem entrar de uma vez.
3. Selecionar múltiplas fotos em “Fotos Depois”: todas devem entrar de uma vez.
4. Testar “Pular etapa” em Antes e Depois com 0 fotos e concluir execução.
5. Validar compartilhamento social com preview de marca quando usar link de preview.
