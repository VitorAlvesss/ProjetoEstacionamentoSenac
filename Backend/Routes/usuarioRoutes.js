//usuarioRoutes.js

const express = require('express');
const router = express.Router();
const perfilController = require('../Controllers/perfilController');
const { verificarToken } = require('../middlewares/authMiddleware');

router.use(verificarToken);

// Perfil do usuário logado (nome, e-mail, telefone, cargo e carros)
router.get('/perfil', perfilController.getPerfil);
router.put('/perfil', perfilController.atualizarPerfil);

module.exports = router;
