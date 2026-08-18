const pagamento_repository = require('../repositories/pagamentoRepository');
const { validarDadosPagamento } = require('../services/validacaoService'); // ou onde estiver sua função de validação

const pagamento_controller = {
    async criarCobranca(requisicao, resposta) {
        try {
            const dados_recebidos = requisicao.body;

            // 1. Valida os dados usando a função que criamos
            const validacao = validarDadosPagamento(dados_recebidos);
            if (!validacao.valido) {
                return resposta.status(400).json({ erros: validacao.erros });
            }

            // 2. Busca o registro de ocupação no banco pelo ID informado
            const registro_ocupacao = await pagamento_repository.obterPorId(dados_recebidos.id_registro);
            if (!registro_ocupacao) {
                return resposta.status(404).json({ mensagem: "Registro de ocupação não encontrado." });
            }

            // 3. Aqui entraria a integração com o Mercado Pago para gerar o PIX
            // const cobranca_pix = await servicoMercadoPago.gerarPix(dados_recebidos.valor, dados_recebidos.email);

            // 4. Retorna a resposta de sucesso com os dados do pagamento
            return resposta.status(201).json({
                mensagem: "Cobrança PIX gerada com sucesso!",
                valor_cobrado: dados_recebidos.valor,
                // qr_code: cobranca_pix.qr_code
            });

        } catch (erro_interno) {
            console.error("Erro ao criar cobrança:", erro_interno);
            return resposta.status(500).json({ mensagem: "Erro interno no servidor ao processar pagamento." });
        }
    }
};

module.exports = pagamento_controller;