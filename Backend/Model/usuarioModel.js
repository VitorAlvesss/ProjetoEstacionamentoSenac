const repositoryUsuario = require("../Repositories/usuarioRepository");

class Usuario{
    constructor(id, nome_usuario, email, senha, cargo, ativo){
    this.id = id,
    this.nome_usuario = nome_usuario,
    this.email = email,
    this.senha = senha,
    this.cargo = cargo,
    this.ativo = ativo
    };
};

exports.buscarInfUsuarioCarro = (infUsuCar, resultado) => {
    repositoryUsuario.buscarInfUsuarioCarro(infUsuCar, resposta => {
        callback(resultado)
    });
};