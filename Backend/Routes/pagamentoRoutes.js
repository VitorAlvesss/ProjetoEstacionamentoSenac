const express = require("express");
const router = express.Router();
const pagamentoController = require("../Controllers/pagamentoController");

// rota que o frontend chama pra gerar um novo pagamento PIX
router.post("/pagamentos", pagamentoController.criarPagamento);

// rota que o próprio Mercado Pago chama pra avisar mudança de status
router.post("/pagamentos/webhook", pagamentoController.receberWebhook);

module.exports = router;