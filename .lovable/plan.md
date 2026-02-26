

## Diagnostico e Plano de Correcao

### Problema 1: Todas as fotos vao para a Cozinha (primeiro ambiente)

**Causa raiz identificada:** O fluxo de criacao do relatorio em `Execution.tsx` coleta as fotos de cada sala mas **nao associa nenhum `room_id`** a elas. Isso acontece porque os rooms do relatorio sao criados no banco ao mesmo tempo que as fotos, e nao ha um passo para vincular os IDs gerados.

No `PublicReport.tsx` linha 118-119:
```text
getPhotosForRoom(roomId)  → filtra por room_id (que e null em todas as fotos)
generalPhotos             → fotos sem room_id vao TODAS para roomIdx === 0 (Cozinha)
```

Resultado: todas as fotos aparecem na Cozinha, e as outras salas ficam vazias.

**Correcao:** Modificar `useReports.ts` para:
1. Criar os rooms primeiro e capturar os IDs gerados (`.select()`)
2. Antes de inserir as fotos, associar cada foto ao `room_id` correto usando um identificador temporario (`_room_index`) que mapeia a posicao da sala
3. Inserir as fotos ja com o `room_id` correto

Em `Execution.tsx`, adicionar `_room_index` nas fotos de cada sala para identificar a qual room pertencem.

### Problema 2: Relatorio criado como "draft" -- cliente nao consegue ver

O relatorio e criado com `status: 'draft'` (Execution.tsx linha 114), mas o `PublicReport.tsx` filtra apenas `status = 'published'`. O cliente recebe o link mas ve "Relatorio nao encontrado".

**Correcao:** Mudar `status: 'draft'` para `status: 'published'` em `Execution.tsx` linha 114, para que o relatorio fique imediatamente acessivel ao cliente via link publico `/r/{token}`.

### Problema 3: Link publico ja esta desvinculado de login

A rota `/r/:token` ja e publica (sem `RequireAuth`), e as RLS policies permitem leitura anonima. Este ponto ja esta funcionando corretamente -- o unico bloqueio era o status `draft`.

---

### Arquivos a editar

| Arquivo | Mudanca |
|---|---|
| `src/hooks/useReports.ts` | Apos inserir rooms, recuperar IDs gerados e mapear `_room_index` das fotos para `room_id` real |
| `src/pages/Execution.tsx` | Adicionar `_room_index` nas fotos de sala; mudar status de `'draft'` para `'published'` |
| `src/pages/PublicReport.tsx` | Remover fallback que joga fotos sem `room_id` no primeiro room (linha 218-219) -- com a correcao, todas as fotos terao `room_id` correto |

### Detalhes tecnicos

**useReports.ts -- createReport mutation:**
```text
1. Insert rooms com .select() para retornar os IDs criados
2. Criar mapa: room_index -> room.id
3. Para cada foto com _room_index, atribuir room_id = mapa[_room_index]
4. Insert fotos com room_id correto
```

**Execution.tsx -- coleta de fotos:**
```text
// Room-specific photos: adicionar _room_index
finalJob.checklist.flatMap((section, sIdx) => {
  const roomPhotos = (section as any).roomPhotos || [];
  return roomPhotos.map((url, pIdx) => ({
    photo_url: url,
    photo_type: 'verification',
    _room_index: sIdx,        // <-- NOVO: identifica a sala
    display_order: pIdx,
    caption: section.title,
  }));
});

// Checklist item photos: tambem adicionar _room_index
finalJob.checklist.flatMap((section, sIdx) =>
  section.items.filter(item => item.photoUrl).map((item, idx) => ({
    photo_url: item.photoUrl!,
    photo_type: 'verification',
    _room_index: sIdx,        // <-- NOVO
    display_order: idx,
    caption: `${section.title}: ${item.label}`,
  }))
);

// status: 'published' em vez de 'draft'
```

**PublicReport.tsx:**
```text
// Remover logica que atribui generalPhotos ao primeiro room
// Linha 218: const roomGeneralPhotos = roomIdx === 0 ? generalPhotos : [];
// Substituir por: const allRoomPhotos = roomPhotos; (fotos ja vem com room_id correto)
// Manter generalPhotos como secao separada "Before/After" se existirem
```

