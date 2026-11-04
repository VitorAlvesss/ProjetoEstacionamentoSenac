const express = require('express');
const router = express.Router();

const cntrl = require('../Controllers/permissaoController');

router.post('/permissao/salvar', cntrl.salvarPermissao);
router.get('/permissao', cntrl.listarPermissoes);
router.delete('/permissao/delete', cntrl.deletarPermissao);
router.put('/permissao/update', cntrl.atualizarPermissao);

module.exports = router;
