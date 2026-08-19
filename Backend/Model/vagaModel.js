const repositoryVaga = require("../Repositories/vagaRepository");

exports.inserirVaga = (vaga, callback) => {
    repositoryVaga.inserirVaga(vaga, resultado =>{
        callback(resultado)
    });
};

exports.listarVagas = (callback) => {
    repositoryVaga.todasAsVagas(resultado =>{
        callback(resultado)
    });
};