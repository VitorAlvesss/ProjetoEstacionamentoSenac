const repositoryVaga = require("../Repositories/vagaRepository");

exports.inserirVaga = async(vaga) => {
    const resultado = await repositoryVaga.inserirVaga(vaga);
    return resultado;
};

exports.listarVagas = async () => {
    const resultado = await repositoryVaga.todasAsVagas();
    return resultado;
};

exports.listasVagasDisponveis = async() =>{
    const resultado = await repositoryVaga.vagasDisponiveis();
    return resultado;
};

exports.mudarDisponibilidadeDaVaga = async (vaga) =>{
    const resultado = await repositoryVaga.alterarEstadoOcupacao(vaga);
    return resultado;
};