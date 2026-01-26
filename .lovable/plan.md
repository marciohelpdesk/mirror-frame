
# Correção: Requisito de Senha de 6 Caracteres

## Problema Identificado

O campo de senha no formulário de login tem a propriedade `minLength={6}`, que bloqueia senhas com menos de 6 caracteres. Além disso, o Supabase Auth por padrão exige senhas com mínimo de 6 caracteres.

## Importante Saber

- **Supabase Auth**: Exige senhas de no mínimo 6 caracteres por padrão (configuração de segurança)
- **Usuários criados diretamente no banco**: Não funcionam para autenticação. O Supabase Auth usa hash criptográfico para senhas, então inserir manualmente não funciona

## Solução

Remover a validação `minLength={6}` do formulário para permitir que o Supabase retorne mensagens de erro apropriadas (em vez de bloquear silenciosamente no navegador). Isso dará mais flexibilidade ao usuário.

## Alteração

### Arquivo: `src/views/LoginView.tsx`

**Linha 89** - Remover `minLength={6}`:

```tsx
// Antes:
<input 
  type={showPassword ? 'text' : 'password'}
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  placeholder="••••••••"
  className="..."
  required
  minLength={6}  // ← Remover esta linha
/>

// Depois:
<input 
  type={showPassword ? 'text' : 'password'}
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  placeholder="••••••••"
  className="..."
  required
/>
```

## Resultado

Após a correção:
- O formulário aceitará qualquer tamanho de senha
- Se a senha for menor que 6 caracteres, o Supabase retornará um erro apropriado que será exibido ao usuário
- A experiência do usuário será melhor, pois ele verá a mensagem de erro real do sistema

## Observação

Se você precisa de um usuário para testes com senha de 4 caracteres, isso não é possível com Supabase Auth padrão. A recomendação é criar um novo usuário com uma senha de 6+ caracteres através do app ou do Supabase Dashboard.
