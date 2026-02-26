

## Plano: Adicionar 29 propriedades e configurar permissoes de acesso

### Resumo
Adicionar todas as 29 propriedades ao banco de dados, tornar propriedades visíveis para todos os usuários autenticados, e restringir a exclusão apenas para kamila13petters@gmail.com e marcioasoliveira@hotmail.com.

### 1. Alterações no banco de dados (Migration)

**Atualizar políticas RLS na tabela `properties`:**

| Política | Atual | Nova |
|---|---|---|
| SELECT | Apenas próprias (`user_id = auth.uid()`) | Todos os autenticados (`true` para `authenticated`) |
| UPDATE | Apenas próprias | Todos os autenticados (para que qualquer usuário possa editar) |
| DELETE | Apenas próprias | Apenas os dois emails admin (verificação via `auth.jwt()->>'email'`) |
| INSERT | Apenas próprias | Manter como está |

**Inserir 29 propriedades** usando o `user_id` de Kamila (`54a0452c-9808-4c67-92a5-3c588584b81d`) como proprietária inicial. Todas com `service_type = 'Airbnb Cleaning'`, `type = 'House'`, `status = 'READY'`.

### 2. Alterações no frontend

**`src/hooks/useProperties.ts`:**
- Remover filtro `.eq('user_id', userId)` no SELECT (buscar todas as propriedades)
- Remover filtro `.eq('user_id', userId)` no UPDATE (permitir edição por qualquer usuário)
- Remover filtro `.eq('user_id', userId)` no DELETE (o RLS controla quem pode excluir)
- Manter `queryKey` como `['properties']` sem userId

**`src/views/PropertyDetailsView.tsx`:**
- Mostrar botão "Delete Property" apenas quando `user?.email` for um dos dois emails autorizados
- Esconder o botão para todos os outros usuários

**`src/pages/Properties.tsx`:**
- Ajustar chamada do hook (userId ainda necessário para INSERT)

### 3. Dados das 29 propriedades

Todas as propriedades da lista serão inseridas com os dados fornecidos (nome, endereço/bairro, quartos, banheiros, preço base estimado). O usuário poderá editar cada uma individualmente depois.

### Detalhes técnicos

**RLS DELETE policy:**
```text
CREATE POLICY "Only admins can delete properties"
ON public.properties FOR DELETE TO authenticated
USING (
  auth.jwt()->>'email' IN (
    'kamila13petters@gmail.com',
    'marcioasoliveira@hotmail.com'
  )
);
```

**useProperties.ts query change:**
```text
// Antes: .eq('user_id', userId)
// Depois: sem filtro (RLS permite SELECT para todos autenticados)
const { data, error } = await supabase
  .from('properties')
  .select('*')
  .order('created_at', { ascending: false });
```

**PropertyDetailsView delete button:**
```text
const ADMIN_EMAILS = ['kamila13petters@gmail.com', 'marcioasoliveira@hotmail.com'];
const canDelete = user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase());
// Renderizar botão delete apenas se canDelete === true
```

### Arquivos a editar

| Arquivo | Mudança |
|---|---|
| Migration SQL | Atualizar 3 RLS policies + inserir 29 propriedades |
| `src/hooks/useProperties.ts` | Remover filtros user_id no SELECT/UPDATE/DELETE |
| `src/views/PropertyDetailsView.tsx` | Condicionar botão delete ao email do usuário |
| `src/pages/Properties.tsx` | Ajustar uso do hook |
| `src/pages/PropertyDetails.tsx` | Ajustar uso do hook |

