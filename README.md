# ProjetoEstacionamentoSenac
Projeto de estacionamento com arduíno e programação web realizado pela turma de Desenvolvimento de Sistemas do Senac Taboão.

## Como rodar

1. Na pasta raiz, crie o `.env` (modelo em `.env.example`; os valores do banco estão com o grupo)
   e coloque a chave do Firebase `projectparkingtoken.json`. Os dois **não** vão para o GitHub.
2. `cd Backend`, depois `npm install` e `npm start` (API em http://localhost:3000)
3. Abra `Frontend/Login/index.html` com o Live Server

## Login, perfil e notificações

Toda tela protegida carrega, antes do `</body>`:

```html
<script src="/Frontend/src/assets/js/auth.js"></script>
<script src="/Frontend/src/assets/js/sessao.js" defer></script>
```

Como funciona, rotas e segurança: [docs/MODULO_LOGIN.md](docs/MODULO_LOGIN.md).
