
# Plano: Editar Perfil

## Resumo
Adicionar funcionalidade para editar o perfil do usuário diretamente na tela de Configurações, permitindo alterar nome, e-mail, telefone e foto de perfil.

## O que será criado

### 1. Modal de Edição de Perfil
Um novo componente de diálogo que permite ao usuário:
- Alterar foto de perfil (simulada com fotos demo)
- Editar nome completo
- Editar e-mail
- Editar telefone
- Visualizar cargo (somente leitura)

### 2. Fluxo de Interação
- O cartão de perfil na tela de Configurações terá um ícone de edição
- Ao clicar, abre o modal com os dados atuais pré-preenchidos
- Após salvar, os dados são atualizados e uma notificação de sucesso aparece

## Arquivos a serem modificados/criados

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `src/components/EditProfileModal.tsx` | Criar | Modal de edição com formulário validado |
| `src/views/SettingsView.tsx` | Modificar | Adicionar botão de edição e integrar modal |
| `src/pages/Index.tsx` | Modificar | Adicionar handler `onUpdateProfile` |
| `src/contexts/LanguageContext.tsx` | Modificar | Adicionar traduções EN/PT |

## Detalhes Técnicos

### Validação do Formulário (Zod)
```text
name: obrigatório, max 100 caracteres
email: formato de e-mail válido, max 255 caracteres
phone: opcional, max 20 caracteres
```

### Novas Traduções
- `profile.edit` - "Editar Perfil" / "Edit Profile"
- `profile.name` - "Nome" / "Name"
- `profile.email` - "E-mail" / "Email"
- `profile.phone` - "Telefone" / "Phone"
- `profile.role` - "Cargo" / "Role"
- `profile.photo` - "Foto" / "Photo"
- `profile.changePhoto` - "Alterar Foto" / "Change Photo"
- `profile.updated` - "Perfil Atualizado" / "Profile Updated"
- `profile.updatedDesc` - "Suas informações foram salvas" / "Your information has been saved"

### Estrutura do Modal
1. **Seção de Foto**: Avatar circular com botão de câmera sobreposto
2. **Campos de Formulário**: 
   - Nome (input text)
   - E-mail (input email)
   - Telefone (input tel)
   - Cargo (texto somente leitura com badge)
3. **Botões**: Cancelar e Salvar

### Integração no Index.tsx
Nova função `handleUpdateProfile` que recebe `UserProfile` atualizado e chama `setUserProfile`

### Integração no SettingsView
- Novo estado `isEditProfileOpen`
- Ícone de lápis no canto do cartão de perfil
- Componente `EditProfileModal` renderizado condicionalmente
