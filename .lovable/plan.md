
# Plano Completo: Integrar App com Supabase

## Visao Geral

Este plano implementa toda a infraestrutura necessaria para que o aplicativo Pur - CheckClean funcione com persistencia de dados real no Supabase. Quando concluido:

- Seus dados serao salvos permanentemente
- Login/Cadastro funcionarao com autenticacao real
- Fotos serao armazenadas no Supabase Storage
- Atualizar o navegador nao perdera mais os dados

---

## Fase 1: Criar Estrutura do Banco de Dados

### Tabelas a Criar

```text
+------------------+     +------------------+     +------------------+
|     profiles     |     |    properties    |     |       jobs       |
+------------------+     +------------------+     +------------------+
| id (uuid, PK)    |     | id (uuid, PK)    |     | id (uuid, PK)    |
| user_id (FK)     |     | user_id (FK)     |     | user_id (FK)     |
| name             |<--->| name             |<--->| property_id (FK) |
| email            |     | address          |     | client_name      |
| phone            |     | type             |     | date             |
| avatar_url       |     | service_type     |     | time             |
| role             |     | access_code      |     | status           |
| created_at       |     | wifi_password    |     | type             |
+------------------+     | status           |     | price            |
                         | base_price       |     | checklist (JSON) |
+------------------+     | bedrooms         |     | assigned_to      |
|    employees     |     | bathrooms        |     | photos_before    |
+------------------+     | sqft             |     | photos_after     |
| id (uuid, PK)    |     | notes            |     | damages (JSON)   |
| user_id (FK)     |     | photo_url        |     | inventory (JSON) |
| name             |     | checklist (JSON) |     | lost_found (JSON)|
| avatar_url       |     | created_at       |     | start_time       |
| created_at       |     +------------------+     | end_time         |
+------------------+                              | report_note      |
                                                  | created_at       |
+------------------+                              +------------------+
|    inventory     |
+------------------+
| id (uuid, PK)    |
| user_id (FK)     |
| name             |
| quantity         |
| unit             |
| threshold        |
| category         |
| created_at       |
+------------------+
```

### Politicas de Seguranca (RLS)

Cada tabela tera politicas que garantem:
- Usuarios so podem ver/editar seus proprios dados
- Anonimos nao tem acesso a nenhum dado

---

## Fase 2: Configurar Storage para Fotos

### Bucket: `cleaning-photos`

Armazenara todas as imagens do app:
- Fotos antes/depois da limpeza
- Fotos de danos reportados
- Fotos de itens perdidos/achados
- Fotos de perfil
- Fotos de propriedades

### Estrutura de Pastas

```text
cleaning-photos/
  ├── {user_id}/
  │   ├── profile/
  │   │   └── avatar.jpg
  │   ├── properties/
  │   │   └── {property_id}/
  │   │       └── cover.jpg
  │   ├── jobs/
  │   │   └── {job_id}/
  │   │       ├── before/
  │   │       ├── after/
  │   │       ├── damages/
  │   │       └── lost-found/
```

---

## Fase 3: Implementar Autenticacao

### Arquivos a Criar/Modificar

| Arquivo | Acao | Descricao |
|---------|------|-----------|
| `src/hooks/useAuth.ts` | Criar | Hook com logica de autenticacao Supabase |
| `src/views/LoginView.tsx` | Modificar | Conectar ao Supabase Auth real |
| `src/pages/Index.tsx` | Modificar | Usar hook de autenticacao |

### Funcionalidades

1. **Sign Up**: Criar conta com email/senha
2. **Sign In**: Entrar com credenciais
3. **Sign Out**: Sair da conta
4. **Sessao Persistente**: Manter logado ao recarregar
5. **Auto-refresh Token**: Renovar sessao automaticamente

---

## Fase 4: Implementar Hooks de Dados

### Hooks a Criar

| Hook | Responsabilidade |
|------|------------------|
| `useProfile.ts` | Carregar/atualizar perfil do usuario |
| `useProperties.ts` | CRUD de propriedades |
| `useJobs.ts` | CRUD de jobs/servicos |
| `useEmployees.ts` | CRUD de funcionarios |
| `useInventory.ts` | CRUD de itens de inventario |
| `usePhotoUpload.ts` | Upload de fotos para Storage |

### Padrao de Implementacao

Cada hook usara TanStack Query para:
- Cache automatico
- Revalidacao em segundo plano
- Estado de loading/error
- Mutations otimistas

---

## Fase 5: Conectar Views aos Hooks

### Modificacoes Necessarias

| View | Mudanca |
|------|---------|
| `Index.tsx` | Substituir useState por hooks de dados |
| `DashboardView.tsx` | Receber dados dos hooks |
| `AgendaView.tsx` | Jobs vindo do Supabase |
| `PropertiesView.tsx` | Properties do Supabase |
| `PropertyDetailsView.tsx` | Editar salva no banco |
| `ExecutionView.tsx` | Fotos vao para Storage |
| `SettingsView.tsx` | Profile do banco |

---

## Sequencia de Implementacao

```text
1. Migrations SQL (Tabelas + RLS)
         ↓
2. Bucket de Storage  
         ↓
3. Hook useAuth + Trigger de Profile
         ↓
4. Conectar LoginView ao Auth
         ↓
5. Hooks de dados (useProfile, useJobs, etc)
         ↓
6. Atualizar Index.tsx com hooks
         ↓
7. Testar fluxo completo
```

---

## Detalhes Tecnicos

### Migration SQL Principal

Criacao das 5 tabelas:
- `profiles` - dados do usuario logado
- `properties` - imoveis cadastrados
- `jobs` - servicos de limpeza
- `employees` - membros da equipe
- `inventory` - estoque de produtos

Cada tabela tera:
- Coluna `user_id` referenciando `auth.users`
- RLS habilitado
- Politicas SELECT/INSERT/UPDATE/DELETE para o proprio usuario

### Hook useAuth

```text
Estados:
- user: Usuario | null
- session: Session | null
- loading: boolean

Metodos:
- signIn(email, password)
- signUp(email, password)
- signOut()

Comportamento:
- onAuthStateChange configura listener
- getSession carrega sessao inicial
- Trigger cria profile automaticamente ao cadastrar
```

### Trigger de Auto-Criacao de Profile

Quando um usuario se cadastra, um trigger automaticamente:
1. Cria registro na tabela `profiles`
2. Usa email do auth.users
3. Define nome padrao baseado no email
4. Define role como 'Cleaner'

---

## Resultado Esperado

Apos implementacao:

| Antes | Depois |
|-------|--------|
| Dados em memoria (useState) | Dados no Supabase (persistente) |
| Login simulado | Supabase Auth real |
| Fotos nao salvas | Fotos no Supabase Storage |
| Perda ao atualizar | Dados mantidos |
| Sem multi-dispositivo | Acesso de qualquer lugar |

---

## Arquivos que Serao Criados

1. `src/hooks/useAuth.ts`
2. `src/hooks/useProfile.ts`
3. `src/hooks/useProperties.ts`
4. `src/hooks/useJobs.ts`
5. `src/hooks/useEmployees.ts`
6. `src/hooks/useInventory.ts`
7. `src/hooks/usePhotoUpload.ts`

## Arquivos que Serao Modificados

1. `src/pages/Index.tsx` - Usar hooks de dados
2. `src/views/LoginView.tsx` - Supabase Auth
3. `src/integrations/supabase/types.ts` - Atualizado apos migrations

## Migrations SQL

1. Criar tabelas (profiles, properties, jobs, employees, inventory)
2. Habilitar RLS em todas as tabelas
3. Criar politicas de seguranca
4. Criar trigger para auto-criacao de profile
5. Criar bucket de storage

---

## Observacoes Importantes

1. **Primeira execucao**: O banco estara vazio. Os dados de exemplo (`initialData.ts`) nao serao migrados automaticamente - voce precisara criar novos dados pelo app.

2. **Usuarios existentes**: Como o login era simulado antes, nao ha usuarios reais. Cada pessoa precisara criar uma conta nova.

3. **Fotos antigas**: Fotos capturadas antes da integracao (em base64 na memoria) nao serao migradas.
