const fs = require("fs");
const conexao = require("../Connection/db");

exports.inserirVaga = async (vaga) => {
    const sql = "INSERT INTO tbl_vaga (codigo_vaga, vaga_especial, ocupada) VALUES (?,?,?)"
    const [resultado] = await conexao.query(sql, [vaga.codigo_vaga, vaga.vaga_especial, vaga.ocupada])
    return resultado;
}

exports.todasAsVagas = async () =>{
    const sql = "SELECT *FROM tbl_vaga"
    const [resultado] = await conexao.query(sql)
    return resultado;
}

exports.vagasDisponiveis = async () =>{
    const sql = "SELECT *FROM tbl_vaga WHERE ocupada = FALSE"
    const [resultado] = await conexao.query(sql)
    return resultado;
}

exports.alterarEstadoOcupacao = async (vaga) =>{
    const sql = "UPDATE tbl_vaga SET ocupada = ? WHERE id = ?"
    const [resultado] = await conexao.query(sql, [vaga.ocupada, vaga.id])
    return resultado;
}

exports.buscarQuantidade = async () =>{
    const sql = "SELECT " +
    "COUNT(codigo_vaga) AS total, " +
    "SUM(CASE WHEN ocupada = 1 THEN 1 ELSE 0 END) AS ocupadas, " +
    "SUM(CASE WHEN ocupada = 0 THEN 1 ELSE 0 END) AS livres " +
    "FROM tbl_vaga " +
    "WHERE codigo_vaga != ''"
    const [resultado] = await conexao.query(sql)
    return resultado;
}

exports.buscarPorId = async (id) =>{
    const sql = "SELECT *FROM tbl_vaga WHERE id = ?"
    const [resultado] = await conexao.query(sql, id)
    return resultado;
}
exports.buscarRegistroOcupacao= async (id) =>{
    const sql = "SELECT c.id, c.placa, v.id, v.codigo_vaga, v.vaga_especial, v.ocupada, r.data_entrada, r.valor_hora FROM tbl_registro_ocupacao r INNER JOIN "+
    "tbl_carro c ON r.id_carro = c.id INNER JOIN tbl_vaga v on r.id_vaga = v.id "+
    "WHERE r.id_vaga = ? and v.ocupada = true"
    const [resultado] = await conexao.query(sql, id)
    return resultado;
}

