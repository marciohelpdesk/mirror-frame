

## Plano: Reestruturar PDF do relatorio para corresponder ao Digital Dossier

### Problemas no PDF atual
1. Fotos renderizam como thumbnails quebrados (mostram "0%" ao inves da imagem)
2. Logo/texto de marca renderiza com caracteres corrompidos ("Maisoe ParUimpesa Profssional Sirpilfcade")
3. Emojis usados como icones (📷, ✅, etc.) nao funcionam corretamente no jsPDF — aparecem como caracteres estranhos (Ø=Ü÷)
4. Estrutura nao corresponde ao relatório web publico

### Abordagem
Reescrever `src/lib/pdfGenerator.ts` com as seguintes mudancas:

#### 1. Remover emojis — usar texto simples
- Trocar todos os emojis por texto uppercase (ex: "FOTOS ANTES" ao inves de "📷 FOTOS ANTES")
- Usar simbolos ASCII simples para checkmarks e bullets

#### 2. Fotos: links ao inves de imagens embutidas
- Manter apenas a logo como imagem embutida (ja funciona via canvas)
- Para todas as outras fotos (before, after, verification, damage, lost&found): mostrar uma caixa estilizada com o label + URL clicavel (usando `pdf.textWithLink`)
- Isso resolve definitivamente o problema de fotos quebradas

#### 3. Adicionar link para o Digital Dossier
- Na capa e no rodape, incluir o link publico do relatorio web (`/r/{token}`) como URL clicavel
- Texto: "Acesse o relatorio interativo completo com fotos em alta resolucao"

#### 4. Limpar renderizacao de texto
- Garantir que nenhum emoji unicode seja usado em nenhuma parte do PDF
- Usar apenas caracteres ASCII/Latin-1 compativeis com Helvetica

### Arquivos a alterar

| Arquivo | Mudanca |
|---|---|
| `src/lib/pdfGenerator.ts` | Reescrever: remover emojis, fotos como links, adicionar link do dossier |
| `src/pages/Execution.tsx` | Passar public_token ao gerar PDF para incluir link do dossier |

