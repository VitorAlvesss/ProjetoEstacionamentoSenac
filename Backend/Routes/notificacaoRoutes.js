const express = require('express');
const router = express.Router();
const NotificacaoController = require('../controllers/notificacaoController');

// Rota para buscar as notificações e o número da bolinha (GET)
router.get('/', NotificacaoController.getNotificacoes);

// Rota para zerar a bolinha quando o usuário abrir o sino (POST)
router.post('/marcar-lidas', NotificacaoController.marcarComoLidas);

module.exports = router;