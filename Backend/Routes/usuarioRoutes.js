const express = require("express");
const usuarioController = require("../Controllers/usuarioController");

const router = express.Router();
router.post("/login", usuarioController.login.bind(usuarioController));
router.post("/esqueci-senha", usuarioController.solicitarRecuperacao.bind(usuarioController));
router.post("/redefinir-senha", usuarioController.redefinirSenha.bind(usuarioController));

module.exports = router;
