const express = require('express');
const app = express();

const verificarToken = require('../middlewares/authMiddleware');
const authController = require('../controllers/authController');
app.use(express.json());

app.get('/api/auth/me', verificarToken, authController.testarLogin);

const PORTA = 3000;
app.listen(PORTA, () => {
    console.log(`🚀 Módulo de Autenticação rodando na porta ${PORTA}`);
});