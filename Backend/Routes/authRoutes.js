//authRoutes.js

const express = require('express');
const router = express.Router();
const { rateLimit } = require('express-rate-limit');
const authController = require('../Controllers/authController');
const { verificarToken } = require('../middlewares/authMiddleware');

// Proteção contra força bruta: limita tentativas por IP
const limiteLogin = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    skipSuccessfulRequests: true,
    message: { success: false, erro: "Muitas tentativas de login. Aguarde 15 minutos e tente novamente." }
});

const limiteRecuperacao = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    message: { success: false, erro: "Muitos pedidos de recuperação. Aguarde 15 minutos e tente novamente." }
});

const limiteRedefinicao = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    message: { success: false, erro: "Muitas tentativas. Aguarde 15 minutos e tente novamente." }
});

router.post('/login', limiteLogin, authController.login);
router.post('/refresh', authController.refresh);
router.post('/esqueci-senha', limiteRecuperacao, authController.esqueciSenha);
router.post('/redefinir-senha', limiteRedefinicao, authController.redefinirSenha);

// Rotas protegidas (precisa estar logado)
router.get('/me', verificarToken, authController.me);
router.put('/senha', verificarToken, limiteRedefinicao, authController.alterarSenha);

module.exports = router;
