const express = require("express");
const router = express.Router();

const vagaController = require("../Controllers/vagaController");

router.post("/", vagaController.salvar);
router.get("/", vagaController.listarTodos);

module.exports = router;