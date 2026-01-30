# 🔧 Guia de Correção - Erros Identificados e Soluções

## ✅ Correções Aplicadas

### 1. ✅ Erro de Acessibilidade - DialogContent
**Problema:** `DialogContent` sem `DialogTitle` para leitores de tela
**Solução:** Adicionado `DialogVisuallyHidden` no dialog de visualização de fotos
**Arquivo:** `src/components/gallery/photo-card.tsx`

### 2. ✅ Erro Runtime - Header getInitials
**Problema:** `Cannot read properties of undefined (reading 'split')`
**Solução:** Adicionada validação de `name` antes do split
**Arquivo:** `src/components/layout/header.tsx`
```typescript
const getInitials = (name: string | undefined | null) => {
  if (!name) return '??'
  return name.split(' ')...
}
```

### 3. ✅ Configurações de Email Corrigidas
**Problema:** Variáveis de ambiente incorretas
**Solução:** Corrigidas as variáveis no `.env.local`
**Arquivo:** `.env.local`

---

## ⚠️ AÇÃO NECESSÁRIA: Configurar Senha de App do Gmail

### Problema Atual
O Gmail está rejeitando a autenticação porque você está usando a senha normal da conta.
**Gmail requer uma "Senha de App" quando o 2FA está ativado.**

### 📋 Passo a Passo para Gerar Senha de App

#### Opção 1: Habilitar 2FA e Criar Senha de App (Recomendado)

1. **Ative a Verificação em Duas Etapas (2FA)**
   - Acesse: https://myaccount.google.com/security
   - Encontre "Verificação em duas etapas"
   - Clique em "Começar" e siga as instruções

2. **Gere uma Senha de App**
   - Acesse: https://myaccount.google.com/apppasswords
   - Selecione "App: Email"
   - Selecione "Device: Outro (nome personalizado)"
   - Digite: "IBS London System"
   - Clique em "Gerar"
   - **COPIE A SENHA GERADA** (16 caracteres sem espaços)

3. **Atualize o .env.local**
   ```env
   EMAIL_PASS=xxxx xxxx xxxx xxxx  # Cole a senha de app aqui (pode ter espaços)
   ```

4. **Teste novamente**
   ```bash
   npx tsx scripts/test-email.ts
   ```

#### Opção 2: Usar "Acesso a apps menos seguros" (Não Recomendado)

⚠️ **Esta opção é menos segura e o Google pode desativá-la no futuro**

1. Acesse: https://myaccount.google.com/lesssecureapps
2. Ative "Permitir apps menos seguros"
3. Teste o email novamente

---

## 🧪 Scripts de Teste Disponíveis

### Testar Conexão MongoDB
```bash
npx tsx scripts/test-mongodb-connection.ts
```

### Testar Envio de Email
```bash
npx tsx scripts/test-email.ts
```

### Testar Rota de Registro
```bash
npx tsx scripts/test-register.ts
```

---

## 📊 Status das Correções

| Item | Status | Observação |
|------|--------|------------|
| DialogContent acessibilidade | ✅ Corrigido | Adicionado DialogVisuallyHidden |
| Header getInitials error | ✅ Corrigido | Proteção contra undefined |
| Variáveis de email | ✅ Corrigido | Nomes corretos no .env.local |
| Senha de App Gmail | ⚠️ Pendente | **Você precisa gerar** |
| MongoDB Whitelist IP | ⚠️ Pendente | Adicionar IP no Atlas |

---

## 🎯 Próximos Passos

1. **Configure a Senha de App do Gmail** (instruções acima)
2. **Adicione seu IP no MongoDB Atlas**
   - Acesse: https://cloud.mongodb.com
   - Security → Network Access
   - Add IP Address → Add Current IP
3. **Teste tudo novamente**
   ```bash
   # Terminal 1
   npm run dev

   # Terminal 2
   npx tsx scripts/test-email.ts
   npx tsx scripts/test-register.ts
   ```

---

## ✅ Quando Tudo Estiver Funcionando

Você verá:
- ✅ Email de verificação enviado
- ✅ Usuário cadastrado no MongoDB
- ✅ Sem erros no console do navegador
- ✅ Sem warnings de acessibilidade

