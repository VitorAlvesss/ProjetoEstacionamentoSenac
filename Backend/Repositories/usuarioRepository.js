const db = require('../Connection/db');

async function criarUsuario(usuario){
    const [resultado] = await db.query('INSERT INTO tbl_usuario (nome_usuario, email, senha, cargo) VALUES (?, ?, ?, ?)', [usuario.nome_usuario, usuario.email, usuario.senha, usuario.cargo]);
    return resultado.insertId;
};


async function buscarTodosUsuarios(){
    const [linhas] = await db.query('SELECT * FROM tbl_usuario');
    return linhas[0];
};

/*async function buscarPorNome(){

}*/
//Busca por filtros
async function buscarFiltros(filtros){
    let query = 'SELECT * FROM tbl_usuarios WHERE 1=1';
    const params = [];

    if(filtros.nome_usuario){
        query += 'AND nome_usuario LIKE ?';
        params.push(`%${filtros.nome_usuario}%`);
    }
    if(filtros.email){
        query += 'AND email LIKE ?';
        params.push(`%${filtros.email}`);
    }
    if (filtros.ativo){
        query += 'AND ativo LIKE ?';
        params.push(`%${filtros.ativo}`)
    }
};

module.exports = {criarUsuario, buscarTodosUsuarios, buscarFiltros}