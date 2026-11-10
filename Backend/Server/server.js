//server.js
// Liga a API (montada no app.js) na porta do .env
const app = require('./app');
const emailService = require('../Services/emailService');

const PORTA = Number(process.env.PORT) || 3000;
app.listen(PORTA, () => {
    console.log(`🚀 API do estacionamento rodando na porta ${PORTA}`);
    emailService.verificarConexao();
});
