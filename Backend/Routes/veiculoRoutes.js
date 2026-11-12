const express = require("express");
const veiculoController = require("../Controllers/veiculoController");

const router = express.Router();
router.post("/salvar", veiculoController.criar.bind(veiculoController));
router.get("/", veiculoController.listarTodos.bind(veiculoController));
router.get("/placa/:placa", veiculoController.buscarPorPlaca.bind(veiculoController));
router.get("/usuario/:id_usuario", veiculoController.listarPorUsuario.bind(veiculoController));
router.put("/:id", veiculoController.atualizar.bind(veiculoController));
router.delete("/:id", veiculoController.deletar.bind(veiculoController));

module.exports = router;
