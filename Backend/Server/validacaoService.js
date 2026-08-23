const FORMAS_PAGAMENTO_VALIDAS = ['dinheiro', 'debito', 'credito', 'pix', 'isento']; // formas aceitas pelo sistema

function validarDadosPagamento(dados) { // valida os dados recebidos para confirmação de pagamento
    const erros = [];

    if (!dados.id_registro || typeof dados.id_registro !== 'number') {
        erros.push('id_registro é obrigatório e deve ser um número.');
    }

    if (!dados.forma_pagamento || !FORMAS_PAGAMENTO_VALIDAS.includes(dados.forma_pagamento)) {
        erros.push(`forma_pagamento é obrigatória e deve ser uma das opções: ${FORMAS_PAGAMENTO_VALIDAS.join(', ')}.`);
    }

    // isento não cobra valor, então só exige valor > 0 pras outras formas
    if (dados.forma_pagamento !== 'isento') {
        if (dados.valor === undefined || typeof dados.valor !== 'number' || dados.valor < 0) {
            erros.push('valor é obrigatório e deve ser um número maior ou igual a zero.');
        }
    }

    return {
        valido: erros.length === 0,
        erros
    };
}

module.exports = { validarDadosPagamento };