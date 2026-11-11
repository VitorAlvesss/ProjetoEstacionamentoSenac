const repository = require('../Repositories/registroOcupacaoRepository');

async function listarQuantos(req, res) {
    try {
        const resultado = await repository.listarQuantos();
        return res.json(resultado);
    } catch (err) {
        return res.json({erro: err, msg: err.message});
    }
}

async function listarRegistros(req, res) { // encontrar a placa do veiculo aqui
    try {
        const resultado = await repository.listarRegistros();
        return res.status(200).json(resultado);
    } catch (err) {
        return res.status(500).json({erro: err, msg: err.message});
    }
}



module.exports = {listarRegistros, listarQuantos};
