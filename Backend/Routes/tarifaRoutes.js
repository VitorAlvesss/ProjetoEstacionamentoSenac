const express = require('express');
const router = express.Router();

const tarifaController = require('../Controllers/tarifaController');


router.get('/tarifas/ativa', tarifaController.buscarAtiva);


router.get('/tarifas/:id', tarifaController.buscarPorId);
router.put('/tarifas/:id', tarifaController.atualizar);

module.exports = router;