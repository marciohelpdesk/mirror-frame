

## Plano: Melhorias visuais inspiradas na imagem de referencia

Analisando os circulos azuis na imagem, identifico 3 areas de melhoria:

### 1. Header do Dashboard — estilo da referencia
- Avatar do usuario a direita, logo Pur a esquerda
- Data formatada abaixo da saudacao (ex: "27 Fevereiro 2026")
- Gradiente verde mais suave, com transicao melhor para o conteudo

### 2. Categorias com cores variadas (nao so verde)
As categorias atualmente usam todas tons de verde. Na referencia, cada categoria tem cor/ilustracao distinta:
- **Airbnb**: fundo coral/salmon `from-orange-400 to-amber-300`
- **Residencial**: fundo verde-menta `from-emerald-400 to-teal-300`
- **Pos-obra**: fundo amarelo/dourado `from-amber-400 to-yellow-300`
- **Comercial**: fundo azul-slate `from-slate-500 to-slate-400`

Isso quebra a monotonia do verde e traz variedade visual.

### 3. Bottom nav — estilo da referencia
Na imagem, o bottom nav tem:
- O primeiro icone (Home) elevado com circulo verde, nao o central
- Icones mais espassados e limpos
- Mudar: o icone elevado sera o **Home** (indice 0), nao o Reports (indice 2)
- Sem sliding indicator — apenas icone ativo com cor primary e dot abaixo

### 4. Toques de cor adicional
- Progress bars e badges com variedade: amber para pendente, emerald para completo, coral para atrasado
- Cards de checklist com bordas coloridas sutis (cada template com cor diferente)
- Botoes CTA mantidos em amber/dourado

### Arquivos a alterar

| Arquivo | Mudanca |
|---|---|
| `src/views/DashboardView.tsx` | Header com data, categorias multicoloridas, checklist cards coloridos |
| `src/components/layout/BottomNavRouter.tsx` | Icone Home elevado (nao central), remover sliding indicator |

Nenhuma logica ou funcionalidade alterada.

