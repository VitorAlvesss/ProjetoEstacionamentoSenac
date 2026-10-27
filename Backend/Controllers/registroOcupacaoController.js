const repository = require('../Repositories/registroOcupacaoRepository');
const service = require('../Services/registroOcupacaoService.js');

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


async function salvarRegistro(req, res) { //POST
    try {
	const VAGA_ID = req.body.id_vaga;
	const CARRO_PLACA = req.body.placa;
	const VALOR_HORA = req.body.valor_hora;
	const resultado = await service.salvarRegistro(CARRO_PLACA, VAGA_ID, VALOR_HORA);

	if (!Array.isArray(resultado)) {
		if (Object.hasOwn(resultado, "affectedRows")) {
			return res.status(200).json(resultado);
		}
		return res.status(500).json(resultado);
	};

	return res.status(200).json(resultado);
    } catch (err) {
        return res.status(500).json({erro: err.message});
    }
}

module.exports = {listarRegistros, salvarRegistro, listarQuantos};
