const pagamento_model = require('../models/pagamentoModel');

const pagamento_repository = {
    async obterPorId(id_registro) {
        // Chama a função do model para buscar o registro
        const registro = await pagamento_model.buscarPorId(id_registro);
        return registro;
    },

    async salvarAtualizacao(id_registro, dados_pagamento) {
        // Chama a função do model para atualizar os dados no banco
        const resultado = await pagamento_model.atualizar(id_registro, dados_pagamento);
        return resultado;
    }
};

module.exports = pagamento_repository;