

## Plano: Corrigir branding dos links compartilhados e tornar 100% externos

### Problema identificado

Quando um link de relatório é compartilhado via iMessage/WhatsApp, o preview mostra **branding da Lovable** ("Build apps and websites by chatting with AI") ao invés da marca Pur. Isso acontece porque:

1. **Crawlers não executam JavaScript** — os meta tags OG dinâmicos definidos no `PublicReport.tsx` via `useEffect` nunca são lidos pelos crawlers do iMessage/WhatsApp
2. **O domínio do link é `lovableproject.com`** — que tem seus próprios meta tags padrão da plataforma Lovable
3. **O link `window.location.origin/r/TOKEN`** aponta para o domínio Lovable, exigindo que o app SPA carregue primeiro

### Solução

Criar uma **backend function** (`share-report`) que serve HTML server-side com os meta tags OG corretos da Pur. O link compartilhado passará a ser uma URL externa do backend, não do domínio Lovable.

#### 1. Nova backend function: `share-report`

**Arquivo:** `supabase/functions/share-report/index.ts`

A function:
- Recebe o token como query param (`?token=XXX`)
- Busca os dados do relatório no banco (nome da propriedade, nome da cleaner, data)
- Retorna uma página HTML completa com:
  - OG title: `Pur | {Nome da Propriedade}`
  - OG description: `Visit Report — {Nome da Cleaner}`
  - OG image: a imagem `og-image.png` da Pur (hospedada no domínio publicado `mirror-frame.lovable.app/og-image.png`)
  - Meta refresh + redirect JavaScript para a página do relatório no app publicado (`https://mirror-frame.lovable.app/r/TOKEN`)
- Não requer autenticação (público)
- Usa `SUPABASE_SERVICE_ROLE_KEY` para acessar os dados

#### 2. Atualizar o link de compartilhamento

**Arquivo:** `src/pages/Reports.tsx`

Mudar `handleCopyLink` para gerar a URL da backend function ao invés do domínio SPA:

```text
// Antes:
const url = `${window.location.origin}/r/${report.public_token}`;

// Depois:
const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/share-report?token=${report.public_token}`;
```

Também atualizar o botão "View" que abre em nova aba para continuar abrindo via `/r/TOKEN` (já que é visualização direta, não compartilhamento).

#### 3. Atualizar o fluxo de auto-share pós-execução

Verificar se existe algum outro lugar no código que gere links de compartilhamento e atualizar para usar a mesma URL externa.

### Fluxo resultante

```text
Cliente recebe link → Backend function serve HTML com OG tags Pur
                    → Crawler lê meta tags corretos (preview com branding Pur)
                    → Browser redireciona para mirror-frame.lovable.app/r/TOKEN
                    → Página pública carrega sem login
```

### Detalhes técnicos

**Edge function HTML response (simplificado):**
```text
<html>
<head>
  <meta property="og:title" content="Pur | {property_name}" />
  <meta property="og:description" content="Visit Report — {cleaner_name}" />
  <meta property="og:image" content="https://mirror-frame.lovable.app/og-image.png" />
  <meta http-equiv="refresh" content="0;url=https://mirror-frame.lovable.app/r/{token}" />
</head>
<body>
  <script>window.location.href = "https://mirror-frame.lovable.app/r/{token}";</script>
</body>
</html>
```

**Config (verify_jwt = false para acesso público):**
```text
[functions.share-report]
verify_jwt = false
```

### Arquivos a editar/criar

| Arquivo | Mudança |
|---|---|
| `supabase/functions/share-report/index.ts` | Nova function que serve HTML com OG tags da Pur |
| `supabase/config.toml` | Adicionar `[functions.share-report] verify_jwt = false` |
| `src/pages/Reports.tsx` | Atualizar `handleCopyLink` para usar URL da backend function |

