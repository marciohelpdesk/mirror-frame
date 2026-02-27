

## Plano: Branding nos links compartilhados

### Problema atual
1. O `getShareUrl` aponta diretamente para `maisonpur.lovable.app/r/{token}` — os bots de redes sociais (WhatsApp, iMessage, Instagram) não conseguem ler as OG tags porque o SPA não as serve no HTML inicial
2. A edge function `share-report` existe exatamente para resolver isso (serve OG tags para bots, redireciona browsers normais), mas **não está sendo usada** no link copiado
3. A imagem OG na edge function aponta para `/og-image.png` (genérica), enquanto o `index.html` já usa uma imagem branded diferente

### Mudanças

**1. `src/pages/Reports.tsx`** — Alterar `getShareUrl` para usar a edge function
```
// De:
return `https://maisonpur.lovable.app/r/${report.public_token}`;

// Para:
return `https://ebafqcanwdqomqcrifrj.supabase.co/functions/v1/share-report?token=${report.public_token}`;
```

**2. `supabase/functions/share-report/index.ts`** — Atualizar OG image para a imagem branded e melhorar os textos
- Trocar `OG_IMAGE` de `/og-image.png` para a imagem branded já usada no index.html: `https://storage.googleapis.com/gpt-engineer-file-uploads/LWW1I6T5b8gH99kiEm571PLbSUL2/social-images/social-1772082935113-Design_sem_nome.webp`
- Melhorar `og:site_name` para `"Pur"` 
- Melhorar description para incluir data formatada e propriedade: `"Visit Report for {property} — {date}"`
- Adicionar `og:image:width`, `og:image:height` para melhor rendering em previews

**3. `src/pages/PublicReport.tsx`** (linha 82) — Corrigir referência OG image no useEffect
- Trocar `'https://mirror-frame.lovable.app/og-image.png'` pela mesma imagem branded

### Resultado
Ao colar o link no WhatsApp, iMessage, Instagram ou qualquer rede social, aparecerá:
- **Imagem**: banner branded da Pur
- **Título**: "Pur | Nome da Propriedade"  
- **Descrição**: "Visit Report — Kamila Petters"
- **Site**: "Pur"

