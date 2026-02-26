

## Plano: Substituir branding Lovable por logotipo Pur nos links compartilhados

### Problema
Quando voce envia o link do relatorio por WhatsApp/iMessage, a preview mostra o logotipo e branding do Lovable porque as meta tags Open Graph (OG) no `index.html` apontam para `https://lovable.dev/opengraph-image-p98pqg.png`.

### Solucao

#### 1. Criar imagem OG personalizada da Pur
- Criar uma imagem OG (1200x630px) usando o logotipo da Pur (`src/assets/pur-logo.png`) com fundo estilizado
- Salvar como `public/og-image.png` para que fique acessivel via URL publica

#### 2. Atualizar `index.html`
- Linha 21: trocar `og:image` de `https://lovable.dev/opengraph-image-p98pqg.png` para a URL absoluta da imagem OG da Pur (usando o dominio publicado `https://mirror-frame.lovable.app/og-image.png`)
- Linha 25: trocar `twitter:image` da mesma forma
- Atualizar `og:title` e `og:description` se necessario para refletir melhor a marca

#### 3. Meta tags dinamicas para relatorios publicos (`PublicReport.tsx`)
- Adicionar `useEffect` que atualiza `document.title` e as meta tags OG dinamicamente quando o relatorio carrega, para que o link do relatorio mostre o nome da propriedade e branding Pur na preview
- Exemplo: titulo = "Pur | Relatorio - [Nome da Propriedade]"

#### 4. Atualizar `manifest.json`
- Ja esta correto com icones Pur -- nenhuma mudanca necessaria

### Arquivos a editar

| Arquivo | Mudanca |
|---|---|
| `public/og-image.png` | Novo arquivo -- imagem OG 1200x630 com logo Pur |
| `index.html` | Substituir URLs de `og:image` e `twitter:image` |
| `src/pages/PublicReport.tsx` | Adicionar meta tags OG dinamicas por relatorio |

### Nota importante
As imagens OG precisam ser URLs absolutas acessiveis publicamente. Usaremos o dominio publicado (`mirror-frame.lovable.app`) como base. Para gerar a imagem OG, vou criar um arquivo PNG simples com o logo da Pur centralizado sobre um fundo gradiente que combina com a identidade visual do app.

