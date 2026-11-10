//notificacaoRoutes.js

const express = require('express');
const router = express.Router();
const NotificacaoController = require('../Controllers/notificacaoController');
const { verificarToken } = require('../middlewares/authMiddleware');

// Todas as rotas de notificação exigem login
router.use(verificarToken);

// Rota para buscar as notificações e o número da bolinha (GET)
router.get('/', NotificacaoController.getNotificacoes);

// Rota para zerar a bolinha quando o usuário abrir o sino (POST)
router.post('/marcar-lidas', NotificacaoController.marcarComoLidas);

module.exports = router;
