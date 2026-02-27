

## Plano: Atualizar logotipo para nova identidade visual (gota)

O novo logo esta disponivel em: `https://i.ibb.co/LXGHmRYY/Logo-solo.png`

### Mudancas

#### 1. Baixar e substituir o asset do logo
- Usar `lov-fetch-website` para baixar a imagem do logo
- Copiar para `src/assets/pur-logo.png` (substituindo o atual)
- Copiar tambem para `public/apple-touch-icon.png`, `public/logo-192.png`, `public/logo-512.png` e `public/favicon.png` para PWA e favicon

#### 2. Arquivos que ja importam `pur-logo.png` (nao precisam de mudanca de codigo)
Todos estes arquivos ja fazem `import purLogo from '@/assets/pur-logo.png'`, entao ao substituir o arquivo, o logo atualiza automaticamente:
- `src/views/LoginView.tsx`
- `src/views/DashboardView.tsx`
- `src/views/ResetPasswordView.tsx`
- `src/pages/auth/Login.tsx`
- `src/pages/auth/ResetPassword.tsx`
- `src/pages/PublicReport.tsx`
- `src/lib/pdfGenerator.ts`

#### 3. Favicon no `index.html`
- Atualizar referencia do favicon para `/favicon.png` (ja esta como `/apple-touch-icon.png`, ambos serao atualizados)

Nenhuma logica ou funcionalidade sera alterada — apenas substituicao do asset de imagem.

