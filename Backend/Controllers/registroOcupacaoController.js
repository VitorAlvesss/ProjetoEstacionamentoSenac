const repository = require('../Repositories/registroOcupacaoRepository');

const COLUMNS = Object.create(null);
COLUMNS.data_entrada = "data_entrada";
COLUMNS.data_saida = "data_saida";
COLUMNS.pago = "pago";
COLUMNS.valor_hora = "valor_hora";
COLUMNS.valor_pago = "valor_pago";
COLUMNS.tempo_uso = "tempo_uso";
COLUMNS.id_carro = "id_carro";
COLUMNS.id_vaga = "id_vaga";



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
		const DATA_ENTRADA = new Date();
		
		const CARRO_PLACA = req.body.placa;
		try {
			const CARRO_ID = await repository.encontrarCarroId(CARRO_PLACA);
			const resultado = await repository.salvarRegistro(CARRO_ID, VAGA_ID, valor_hora, DATA_ENTRADA);
			return res.status(200).json(resultado);
			} catch (err) {
				return res.status(500).json({erro: err.message})
				}
    } catch (err) {
        return res.status(500).json({erro: err.message});
    }
}

async function atualizarRegistro(req, res) { //precisa carregar os dados do req.body
    try {
		const id = req.body.id;
		let colunas = req.body.colunas;
		let valores = req.body.valores;
        const resultado = await repository.atualizarRegistro(id, colunas, valores);
        return res.json(resultado);
    } catch (err) {
        return res.json({erro: err, msg: err.message});
    }
}

async function deletarRegistro() {
    try {
		const id = req.body.id;
        const resultado = await repository.deletarRegistro(id);
        return res.json(resultado);
    } catch (err) {
        return res.json({erro: err.message});
    }
} 

module.exports = {listarRegistros, salvarRegistro, atualizarRegistro, deletarRegistro, listarQuantos};
