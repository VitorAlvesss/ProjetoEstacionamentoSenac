# ProjetoEstacionamentoSenac
Projeto de estacionamento com arduíno e programação web realizado pela turma de Desenvolvimento de Sistemas do Senac Taboão. 

## Como rodar

1. **Dependências:** `npm install`
2. **Configuração:** copie `.env.example` para `.env` e preencha (principalmente `DB_PASSWORD`).
   Coloque a chave do Firebase como `projectparkingtoken.json` na raiz (peça no grupo, em particular — ela **não** vai para o GitHub).
3. **Banco + dados de exemplo:** `npm run criar-banco -- exemplos`
4. **Backend:** `npm run dev` (API em http://localhost:3000)
5. **Frontend:** abra `Frontend/Login/telaLogin.html` com o Live Server (porta 5501)

Os dados de exemplo criam usuários com senhas conhecidas (ver `Backend/Database/dadosExemplo.sql`): use só no seu PC para testar.
Para o sistema de verdade, rode `npm run criar-banco` (sem `exemplos`) e crie o administrador com `npm run criar-usuario`.

## Comandos

| Comando | O que faz |
|---|---|
| `npm run dev` | Liga o backend (reinicia sozinho ao salvar) |
| `npm run criar-banco -- exemplos` | Cria o banco, as tabelas e os dados de exemplo (sem Workbench) |
| `npm run criar-usuario -- "Nome" email Senha123 administrador` | Cria um usuário com a senha criptografada |
| `npm run testar` | Teste automático do login, perfil e notificações (56 verificações) |
| `npm run gerar-token -- email@exemplo.com` | Gera um token para testar a API no Insomnia |

## Documentação

- [Módulo de Login, Sessão, Perfil e Notificações](docs/MODULO_LOGIN.md) — como funciona, segurança, rotas
  e **como usar o login nas outras telas**.

### Resumo para quem faz outras telas

Toda tela protegida carrega, antes do `</body>`:

```html
<script src="/Frontend/src/assets/js/auth.js"></script>
<script src="/Frontend/src/assets/js/sessao.js" defer></script>
```

Para chamar o backend autenticado use `Auth.fetch('/sua-rota')` no lugar de `fetch`, e no backend
proteja a rota com `verificarToken` (ver a [documentação](docs/MODULO_LOGIN.md#15-como-o-resto-do-grupo-usa-o-login-nas-suas-telas)).
