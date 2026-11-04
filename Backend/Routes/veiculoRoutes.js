const express = require('express');
const router = express.Router();

const cntrl = require('../Controllers/veiculoController');

router.post('/veiculo/salvar', cntrl.salvarVeiculo);
router.get('/veiculo', cntrl.listarVeiculos);
router.delete('/veiculo/delete', cntrl.deletarVeiculo);
router.put('/veiculo/update', cntrl.atualizarVeiculo);

module.exports = router;
