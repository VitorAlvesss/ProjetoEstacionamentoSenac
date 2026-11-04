const express = require('express');
const router = express.Router();

const cntrl = require('../Controllers/dispositivoController');

router.post('/dispositivo/salvar', cntrl.salvarDispositivo);
router.get('/dispositivo', cntrl.listarDispositivos);
router.delete('/dispositivo/delete', cntrl.deletarDispositivo);
router.put('/dispositivo/update', cntrl.atualizarDispositivo);

module.exports = router;
