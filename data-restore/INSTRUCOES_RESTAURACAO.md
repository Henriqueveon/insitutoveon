# RESTAURACAO DE DADOS - VEON Recrutamento

## PASSO 1: Criar as Tabelas no Supabase

1. Acesse: https://supabase.com/dashboard/project/lzrquwyvguxywvlxsthj/sql/new
2. Copie TODO o conteudo do arquivo `EXECUTAR_NO_DASHBOARD.sql`
3. Cole no SQL Editor
4. Clique em "Run" (ou Ctrl+Enter)
5. Verifique se aparece "Tabelas criadas com sucesso!"

## PASSO 2: Obter a Service Key

1. Acesse: https://supabase.com/dashboard/project/lzrquwyvguxywvlxsthj/settings/api
2. Copie a chave "service_role" (secreta, nao compartilhe!)
3. A chave comeca com "eyJhbGciOi..."

## PASSO 3: Executar o Script de Restauracao

No PowerShell, execute:

```powershell
$env:SUPABASE_SERVICE_KEY="SUA_SERVICE_KEY_AQUI"
npx tsx data-restore/restore-data.ts
```

Ou em uma linha:

```powershell
$env:SUPABASE_SERVICE_KEY="eyJhbGciOi..."; npx tsx data-restore/restore-data.ts
```

## PASSO 4: Verificar os Dados

Apos executar, verifique no Supabase Dashboard:
- Table Editor > diferenciais_empresa (24 registros)
- Table Editor > cidades_coordenadas (15 registros)
- Table Editor > pacotes_creditos (3 registros)
- Table Editor > analistas (3 registros)
- Table Editor > empresas_recrutamento (2 registros)
- Table Editor > candidatos_recrutamento (5 registros)
- Table Editor > candidatos_disc (69 registros)
- Table Editor > codigos_indicacao (4 registros)

## PASSO 5: Testar Logins

### Analistas/Admin:
- operacional1@assessoriaveon.com | Eusouabussola
- henriquealves01648@gmail.com | Eufaturo1M$
- hermescostaconsultor@gmail.com | alterar1234

### Empresas:
- henriquealves01648@gmail.com | Eufaturo1M$ (Instituto Veon)
- rafaelbonoldi1074@gmail.com | Novasenha123

### Candidatos:
- kariny817@gmail.com | Veon@2024
- (outros candidatos com auth_user_id existente) | Veon@2024

## Problemas Comuns

### Erro "SUPABASE_SERVICE_KEY nao configurada"
- Certifique-se de configurar a variavel de ambiente corretamente
- Use a service_role key, NAO a anon key

### Erro "User already exists"
- Normal se o usuario ja foi criado
- O script continua mesmo com esse erro

### Erro de Constraint
- Verifique se as tabelas foram criadas corretamente (Passo 1)
- Execute novamente o SQL do dashboard
