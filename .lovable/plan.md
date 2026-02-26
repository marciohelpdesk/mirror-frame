

## Plano: Corrigir links de compartilhamento de relatórios (404 e dados vazios)

### Problemas identificados

Testei a edge function diretamente e ela **funciona** -- retorna HTML correto com OG tags da Pur. Porém existem **2 problemas** que causam o erro 404:

#### Problema 1: URL de redirecionamento errada

A edge function redireciona para `https://mirror-frame.lovable.app/r/{token}`, mas o domínio publicado real do app é `https://maisonpur.lovable.app`. O domínio `mirror-frame` não existe, causando 404.

#### Problema 2: Políticas de acesso bloqueiam leitura pública

Todas as políticas de SELECT na tabela `cleaning_reports` são **restritivas** (RESTRICTIVE). No PostgreSQL, quando não há nenhuma política permissiva, o acesso é negado por padrão. Isso significa que usuários anônimos (sem login) **não conseguem ler** os relatórios publicados, mesmo com a política "Public can view reports by token" -- porque ela é restritiva e não permissiva.

O mesmo problema afeta `report_rooms` e `report_photos`.

### Solução

#### 1. Corrigir APP_URL na edge function

**Arquivo:** `supabase/functions/share-report/index.ts`

Mudar de:
```
const APP_URL = "https://mirror-frame.lovable.app";
```
Para:
```
const APP_URL = "https://maisonpur.lovable.app";
```

#### 2. Corrigir políticas RLS para acesso público

Criar uma migração SQL que:
- Remove a política restritiva "Public can view reports by token" da tabela `cleaning_reports`
- Cria uma política **permissiva** para leitura pública de relatórios publicados (filtrada por `status = 'published'`)
- Remove as políticas restritivas "Public can view report rooms/photos by report" 
- Cria políticas **permissivas** equivalentes nas tabelas `report_rooms` e `report_photos`
- Também converte a política "Users can view their own reports" para permissiva

```sql
-- cleaning_reports: trocar restritivas por permissivas
DROP POLICY "Public can view reports by token" ON cleaning_reports;
DROP POLICY "Users can view their own reports" ON cleaning_reports;
CREATE POLICY "Users can view own reports" ON cleaning_reports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Public can view published reports" ON cleaning_reports FOR SELECT TO anon USING (status = 'published');

-- report_rooms: trocar restritiva por permissiva  
DROP POLICY "Public can view report rooms by report" ON report_rooms;
CREATE POLICY "Public can view report rooms" ON report_rooms FOR SELECT TO anon USING (
  EXISTS (SELECT 1 FROM cleaning_reports WHERE id = report_rooms.report_id AND status = 'published')
);

-- report_photos: trocar restritiva por permissiva
DROP POLICY "Public can view report photos by report" ON report_photos;
CREATE POLICY "Public can view report photos" ON report_photos FOR SELECT TO anon USING (
  EXISTS (SELECT 1 FROM cleaning_reports WHERE id = report_photos.report_id AND status = 'published')
);
```

### Arquivos a editar/criar

| Arquivo | Mudança |
|---|---|
| `supabase/functions/share-report/index.ts` | Corrigir APP_URL para `maisonpur.lovable.app` |
| Nova migração SQL | Converter políticas SELECT de restritivas para permissivas |

### Resultado esperado

Ao copiar o link e enviar por WhatsApp/iMessage:
1. Preview mostra branding Pur com nome da propriedade
2. Clicando, redireciona para `maisonpur.lovable.app/r/{token}`
3. Página carrega os dados do relatório **sem necessidade de login**

