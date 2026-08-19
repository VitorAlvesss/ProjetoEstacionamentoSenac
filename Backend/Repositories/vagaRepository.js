const fs = require("fs");
const conexao = require("../Connection/db");

exports.inserirVaga = (vaga, callback) => {
    const sql = "INSERT INTO tbl_vaga (codigo_vaga, vaga_especial, ocupada) VALUES (?,?,?)"

    conexao.query(sql, [vaga.codigo_vaga, vaga.vaga_especial, vaga.ocupada], (erro, resultado) =>{
        if(erro){
            throw erro;
        }
        callback(resultado.affectedRows > 0);
    });
}   

exports.todasAsVagas = (callback) =>{
    const sql = "SELECT *FROM tbl_vaga"

    conexao.query(sql, (erro, resultado) =>{
        if(erro){
            throw erro;
        }
        callback(resultado)
    })
}