const express = require('express');
const router = express.Router();

const cntrl = require('../Controllers/registroOcupacaoController');

router.post('/registro/salvar', cntrl.salvarRegistro);
router.put('/registro/atualizar', cntrl.atualizarRegistro);
router.delete('/registro/deletar', cntrl.deletarRegistro);
router.get('/registro', cntrl.listarRegistros);
router.get('/registro/quantidade', cntrl.listarQuantos);

module.exports = router;