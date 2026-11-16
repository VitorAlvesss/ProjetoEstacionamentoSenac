//notificacaoRoutes.js

const express = require('express');
const router = express.Router();
const NotificacaoController = require('../Controllers/notificacaoController');
const { verificarToken } = require('../middlewares/authMiddleware');

// Todas as rotas de notificação exigem login
router.use(verificarToken);

// Rota para buscar as notificações e o número da bolinha (GET ?desde=...)
// Zerar a bolinha é feito no navegador (localStorage), sem rota no servidor.
router.get('/', NotificacaoController.getNotificacoes);

module.exports = router;
