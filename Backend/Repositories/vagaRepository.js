const db = require('../Connection/db');

async function criarVaga(vagas){
    const [resultado] = await db.query("INSER INTO tbl_vaga (vaga_especial, ocupada) VALUES (?, ?)"
    [vagas.vagas_especial, vagas.ocupada]);
    return resultado.insertId;
};

async function buscarTodas(){
    const [linhas] = await db.query('SELECT * FROM tbl_vaga');
    return linhas;
};

async function buscarPorId(){
    const [linhas] = await db.query('SELECT * FROM tbl_vaga WHERE id = ?', [id]);
    return linhas[0];
}

async function buscarLivres(){
    const [linhas] = await db.query("SELECT * FROM tbl_vaga WHERE ocupada = FALSE");
    return linhas;
}

async function atualizarStatus(id, ocupada) {
  await db.query('UPDATE tbl_vaga SET ocupada = ? WHERE id = ?', [ocupada, id]);
}

async function deletar(id) {
  await db.query('DELETE FROM tbl_vaga WHERE id = ?', [id]);
}

module.exports = {criarVaga, buscarTodas, buscarPorId, buscarLivres, atualizarStatus, deletar}