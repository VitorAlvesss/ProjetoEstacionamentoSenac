const repository = require('../Repositories/registroOcupacaoRepository');

async function salvarRegistro(carro_placa, id_vaga, valor_hora) {
	const DATA_ENTRADA = new Date();
	try {
		const ID_CARRO = await repository.encontrarCarroId(carro_placa);
		const REGISTROS_OCUPADOS = await repository.listarRegistrosOcupados();
		
		if (REGISTROS_OCUPADOS.length != 0) {
			for (let i = 0; i < REGISTROS_OCUPADOS.length; i++) {
				if (REGISTROS_OCUPADOS[i].id_carro == ID_CARRO[0].id || REGISTROS_OCUPADOS[i].id_vaga == id_vaga) {
					return 'Erro! Vaga ou veículo em uso.';
				}
			}
		}

		const RESULTADO = await repository.salvarRegistro(ID_CARRO[0].id, id_vaga, valor_hora, DATA_ENTRADA);
		return RESULTADO;
		
	} catch (err) {
		return err.message;
	}
}

module.exports = {salvarRegistro};