
Diagnóstico rápido (por que você não consegue logar)
- O app está tentando autenticar no projeto Supabase antigo: `uxafpoydheganjeuktuf`.
- Os logs de rede mostram `POST /auth/v1/token` nesse domínio e erro `TypeError: Load failed`.
- Você passou outro projeto (`ouzxkijkhkmjvnhaswhi`) e o código ainda não está apontando para ele.
- Resultado: o login falha antes mesmo de validar email/senha.

```text
Tela Login
  -> useAuth.signInWithPassword()
    -> supabase client (URL antiga: uxaf...)
      -> request /auth/v1/token
        -> Load failed (sem resposta útil)
          -> usuário não autentica
```

Plano passo a passo para fazer o app funcionar novamente

1) Corrigir conexão do Supabase no frontend
- Atualizar `src/integrations/supabase/client.ts` para usar a URL e anon key do projeto correto (`ouzxkijkhkmjvnhaswhi`).
- Isso é o bloqueio principal do login hoje.

2) Remover dependências hardcoded do projeto antigo
- Atualizar `src/components/CalendarSyncSection.tsx` (hoje usa URL fixa `uxaf...` no iCal).
- Trocar para montar a URL com base na configuração ativa do Supabase (evita quebrar de novo em migrações).

3) Alinhar configuração do Supabase CLI/projeto
- Atualizar `supabase/config.toml` (`project_id`) para o projeto atual.
- Assim migrations/edge functions passam a ser aplicadas no projeto certo.

4) Validar backend mínimo no Supabase novo
- No dashboard Supabase:
  - Authentication > Providers: Email habilitado.
  - Authentication > URL Configuration:
    - Site URL
    - Redirect URLs com seus domínios de preview/publicação (`lovableproject.com`, `lovable.app`, domínio publicado).
- Confirmar que schema/tabelas e políticas existem (especialmente `profiles`, `jobs`, `properties`, trigger `handle_new_user`, RLS).
- Se o projeto novo estiver “limpo”, aplicar as migrations existentes da pasta `supabase/migrations`.

5) Melhorar tratamento de erro no login (para não ficar “cego”)
- Em `src/pages/auth/Login.tsx` e/ou `src/hooks/useAuth.ts`, capturar exceções de rede e mostrar mensagem clara:
  - Exemplo: “Falha de conexão com o servidor de autenticação. Verifique URL/keys do Supabase.”
- Hoje, em erro de rede puro, a UI pode não exibir motivo suficiente.

6) Corrigir warning secundário de ref (não bloqueia login, mas precisa limpar)
- Warning atual: “Function components cannot be given refs… ForgotPasswordModal”.
- Ajustar `ForgotPasswordModal` para compatibilidade com Framer Motion/AnimatePresence (via `forwardRef` ou estrutura de render sem passar ref para function component).

Checklist de validação (fim a fim)
1. Abrir `/login`.
2. Tentar login com usuário existente (deve autenticar e navegar para `/dashboard`).
3. Testar criar conta (signup) e confirmar comportamento de email.
4. Testar “Esqueci minha senha” e fluxo `/reset-password`.
5. Verificar se não há mais `Load failed` para `/auth/v1/token` no domínio antigo.
6. Verificar se iCal gera link no domínio correto do Supabase atual.

Arquivos que serão alterados na implementação
- `src/integrations/supabase/client.ts` (obrigatório)
- `src/components/CalendarSyncSection.tsx` (obrigatório)
- `supabase/config.toml` (obrigatório para deploy/migrations/funções)
- `src/pages/auth/Login.tsx` e possivelmente `src/hooks/useAuth.ts` (melhoria de erro)
- `src/components/ForgotPasswordModal.tsx` (warning de ref)

Detalhes técnicos (se você quiser saber o “por trás”)
- O erro `Load failed` indica falha de transporte/rede (não é “senha inválida” do Supabase).
- Como a request está indo para `uxaf...`, a correção não é no formulário de login; é na origem de autenticação (URL/key/projeto).
- A anon key é publicável (pode ficar no frontend), mas precisa corresponder exatamente ao projeto da URL.
- Se trocar de projeto Supabase, não basta só login: qualquer URL fixa (como Edge Function iCal) e `project_id` também precisam ser sincronizados.
