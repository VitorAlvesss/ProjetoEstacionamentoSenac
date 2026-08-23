const express = require("express");
const router = express.Router();
const PAGAMENTO_CONTROLLER = require("../Controllers/pagamentoController");

// rota que o frontend chama pra confirmar o pagamento (qualquer forma)
router.post("/pagamentos/confirmar", PAGAMENTO_CONTROLLER.confirmarPagamento);

// rota que o próprio Mercado Pago chama pra avisar mudança de status do PIX
router.post("/pagamentos/webhook", PAGAMENTO_CONTROLLER.receberWebhook);

module.exports = router;