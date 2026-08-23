const PAGAMENTO_REPOSITORY = require('./pagamentoRepository');

const PAGAMENTO_CONTROLLER = {

    // Rota: POST /pagamentos/confirmar
    // Chamada pelo frontend pra checar/confirmar o status de um pagamento sob demanda
    async confirmarPagamento(req, res) {
        try {
            const { id_registro, id_pagamento_mp } = req.body;

            if (!id_registro || !id_pagamento_mp) {
                return res.status(400).json({ erro: 'id_registro e id_pagamento_mp são obrigatórios' });
            }

            const resultado = await PAGAMENTO_REPOSITORY.confirmarPagamento(id_registro, id_pagamento_mp);

            return res.status(200).json(resultado);
        } catch (erro) {
            console.error('Erro ao confirmar pagamento:', erro);
            return res.status(500).json({ erro: erro.message || 'Falha ao confirmar pagamento' });
        }
    },

    // Rota: POST /pagamento/:id_registro/cobranca
    // Chamada quando o carro vai sair e precisa gerar o QR code PIX
    async criarCobranca(req, res) {
        try {
            const { id_registro } = req.params;
            const { email_cliente } = req.body;

            const cobranca = await PAGAMENTO_REPOSITORY.criarCobranca(id_registro, email_cliente);

            return res.status(201).json(cobranca);
        } catch (erro) {
            console.error('Erro ao criar cobrança PIX:', erro);
            return res.status(500).json({ erro: erro.message || 'Falha ao criar cobrança' });
        }
    },

    // Rota: POST /webhook/pagamento
    // O Mercado Pago manda esse POST toda vez que o status de um pagamento muda
    async receberWebhook(req, res) {
        try {
            const { data, type } = req.body;

            if (type !== 'payment') {
                return res.sendStatus(200); // ignora outros tipos de notificação
            }

            const id_pagamento_mp = data.id;

            // ⚠️ Aqui você precisa saber a qual id_registro esse pagamento pertence.
            // O jeito mais comum é usar o campo "external_reference" na hora de CRIAR
            // a cobrança PIX, passando o id_registro. Ajusta conforme seu fluxo de criação.
            const id_registro = req.body.external_reference || req.query.id_registro;

            const resultado = await PAGAMENTO_REPOSITORY.confirmarPagamento(id_registro, id_pagamento_mp);

            return res.status(200).json(resultado);
        } catch (erro) {
            console.error('Erro ao processar webhook de pagamento:', erro);
            return res.status(500).json({ erro: 'Falha ao processar pagamento' });
        }
    },

    // Rota alternativa pra polling manual, ex: GET /pagamento/:id_registro/status/:id_pagamento_mp
    async verificarStatus(req, res) {
        try {
            const { id_registro, id_pagamento_mp } = req.params;
            const resultado = await PAGAMENTO_REPOSITORY.confirmarPagamento(id_registro, id_pagamento_mp);
            return res.status(200).json(resultado);
        } catch (erro) {
            console.error('Erro ao verificar status do pagamento:', erro);
            return res.status(500).json({ erro: 'Falha ao verificar pagamento' });
        }
    }
};

module.exports = PAGAMENTO_CONTROLLER;