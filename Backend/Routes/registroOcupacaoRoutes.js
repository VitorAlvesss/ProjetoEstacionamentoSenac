const express = require('express');
const router = express.Router();

const cntrl = require('../Controllers/registroOcupacaoController');

router.get('/registro', cntrl.listarRegistros);
router.get('/registro/quantidade', cntrl.listarQuantos);

module.exports = router;