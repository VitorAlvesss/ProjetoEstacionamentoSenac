const model = require("../Model/vagaModel");

exports.salvar = async (req, res) => {
    try {
        const resultado = await model.inserirVaga(req.body || {});
        return res.status(201).json({ mensagem: "Vaga cadastrada com sucesso.", id: resultado.insertId });
    } catch (erro) {
        console.error("Erro ao criar vaga:", erro);
        return res.status(500).json({ mensagem: "Erro interno ao inserir a vaga." });
    }
};

exports.listarTodos = async (req, res) => {
    try {
        const vagas = await model.listarVagas();
        return res.status(200).json(vagas);
    } catch (erro) {
        console.error("Erro ao listar vagas:", erro);
        return res.status(500).json({ mensagem: "Erro interno ao listar vagas." });
    }
};

exports.listasVagasLivres = async (req, res) => {
    try {
        const vagas = await model.listasVagasDisponveis();
        return res.status(200).json(vagas);
    } catch (erro) {
        console.error("Erro ao buscar vagas livres:", erro);
        return res.status(500).json({ mensagem: "Erro interno ao buscar vagas livres." });
    }
};

exports.mudarOcupacaoVaga = async (req, res) => {
    try {
        const vaga = { ...req.body, id: Number(req.params.id) };
        const resultado = await model.mudarDisponibilidadeDaVaga(vaga);
        if (!resultado.affectedRows) {
            return res.status(404).json({ mensagem: "Vaga não encontrada." });
        }
        return res.status(200).json({ mensagem: "Disponibilidade alterada com sucesso." });
    } catch (erro) {
        console.error("Erro ao atualizar vaga:", erro);
        return res.status(500).json({ mensagem: "Erro interno ao atualizar a vaga." });
    }
};

exports.listarQuantidade = async (req, res) => {
    try {
        const quantidade = await model.quantidadeVagas();
        return res.status(200).json(quantidade[0] || {});
    } catch (erro) {
        console.error("Erro ao contar vagas:", erro);
        return res.status(500).json({ mensagem: "Erro interno ao contar vagas." });
    }
};

exports.buscarVagaId = async (req, res) => {
    try {
        const vagas = await model.vagaPorId(Number(req.params.id));
        if (!vagas.length) {
            return res.status(404).json({ mensagem: "Vaga não encontrada." });
        }
        return res.status(200).json(vagas[0]);
    } catch (erro) {
        console.error("Erro ao buscar vaga:", erro);
        return res.status(500).json({ mensagem: "Erro interno ao buscar vaga." });
    }
};

exports.buscarRegistroOcupacao = async (req, res) => {
    try {
        const registros = await model.registroOcupacao(Number(req.params.id));
        return res.status(200).json(registros);
    } catch (erro) {
        console.error("Erro ao buscar ocupação da vaga:", erro);
        return res.status(500).json({ mensagem: "Erro interno ao buscar ocupação da vaga." });
    }
};
