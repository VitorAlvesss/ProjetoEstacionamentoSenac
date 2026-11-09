const express = require("express");
const router = express.Router();

const usuarioController = require("../Controllers/usuarioController");

router.get("/usuarios", usuarioController.listarInfUsuCar);

module.exports = router;