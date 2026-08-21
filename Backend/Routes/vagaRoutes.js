const express = require("express");
const router = express.Router();

const vagaController = require("../Controllers/vagaController");

const validacaoVaga = require("../../validacaoVaga/validacao")

router.post("/", validacaoVaga.validacaoInsertVaga, vagaController.salvar);
router.get("/", vagaController.listarTodos);
router.get("/livres", vagaController.listasVagasLivres);
router.put("/:id", vagaController.mudarOcupacaoVaga);
router.get("/total", vagaController.listarQuantidade);
router.get("/:id", vagaController.buscarVagaId);
router.get("/registro/:id", vagaController.buscarRegistroOcupacao);

module.exports = router;