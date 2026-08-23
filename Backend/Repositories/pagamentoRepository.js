const PAGAMENTO_MODEL = require('./pagamentoModel');
const MERCADO_PAGO_SERVICE = require('./mercadoPagoService');
const { calcularValorTotal } = require('./calculoPagamento');

const PAGAMENTO_REPOSITORY = {

    // Gera a cobrança PIX pro carro que está saindo, calculando o valor no momento
    async criarCobranca(id_registro, email_cliente) {
        const registro = await PAGAMENTO_MODEL.buscarPorId(id_registro);

        if (!registro) {
            throw new Error(`Registro de ocupação ${id_registro} não encontrado.`);
        }

        if (registro.pago) {
            throw new Error(`Registro ${id_registro} já está pago.`);
        }

        const { total_pago } = calcularValorTotal({
            data_entrada: registro.data_entrada,
            valor_hora: registro.valor_hora,
            adicional_atraso: registro.adicional_atraso
        });

        const cobranca = await MERCADO_PAGO_SERVICE.criarCobrancaPix(id_registro, total_pago, email_cliente);

        return { ...cobranca, valor_calculado: total_pago };
    },

    // Função central: dado o id do registro e o id do pagamento no Mercado Pago,
    // confirma se foi aprovado e atualiza a tbl_registro_ocupado.
    // Pode ser chamada tanto pelo webhook quanto por uma rota de polling.
    async confirmarPagamento(id_registro, id_pagamento_mp) {
        const registro = await PAGAMENTO_MODEL.buscarPorId(id_registro);

        if (!registro) {
            throw new Error(`Registro de ocupação ${id_registro} não encontrado.`);
        }

        if (registro.pago) {
            return { ja_confirmado: true, registro };
        }

        const status_pagamento = await MERCADO_PAGO_SERVICE.consultarPagamento(id_pagamento_mp);

        if (status_pagamento.status !== 'approved') {
            return { aprovado: false, status: status_pagamento.status };
        }

        const { total_pago, tempo_uso_minutos, data_saida } = calcularValorTotal({
            data_entrada: registro.data_entrada,
            valor_hora: registro.valor_hora,
            adicional_atraso: registro.adicional_atraso
        });

        const resultado_atualizacao = await PAGAMENTO_MODEL.atualizar(id_registro, {
            total_pago,
            pago: true,
            data_saida,
            tempo_uso: tempo_uso_minutos
        });

        return { aprovado: true, total_pago, tempo_uso_minutos, resultado_atualizacao };
    }
};

module.exports = PAGAMENTO_REPOSITORY;