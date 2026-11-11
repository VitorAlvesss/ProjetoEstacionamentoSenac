//usuarioRoutes.js

const express = require('express');
const router = express.Router();
const usuarioController = require('../Controllers/usuarioController');
const { verificarToken } = require('../middlewares/authMiddleware');

router.use(verificarToken);

// Perfil do usuário logado (nome, e-mail, telefone, cargo e carros)
router.get('/perfil', usuarioController.getPerfil);
router.put('/perfil', usuarioController.atualizarPerfil);

module.exports = router;
