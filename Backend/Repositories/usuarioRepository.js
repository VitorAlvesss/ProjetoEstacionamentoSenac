const db = require('../Connection/db');

async function criarUsuario(usuario){
    const [resultado] = await db.query('INSERT INTO tbl_usuario (nome_usuario, email, senha, cargo) VALUES (?, ?, ?, ?)', [usuario.nome_usuario, usuario.email, usuario.senha, usuario.cargo]);
    return resultado.insertId;
};


async function buscarTodosUsuarios(){
    const [linhas] = await db.query('SELECT * FROM tbl_usuario');
    return linhas;
};

async function buscarInfUsuarioCarro() {
    const [linhas] = await db.query("SELECT c.placa, u.nome_usuario AS 'nome/usuario', u.cargo, u.email FROM tbl_usuario u INNER JOIN ON tbl_carro c")
    return linhas;
}

async function updateUsuario(id, nome_usuario, email, cargo, ativo){
const sql = `
    UPDATE tbl_usuario
    SET 
        nome_usuario = ?,
        email = ?,
        cargo = ?,
        ativo = ?
    WHERE id = ?
    `;

    const [resultado] = await db.query(sql, [
        nome_usuario,
        email,
        cargo,
        ativo,
        id
    ]);
    return resultado;
};

async function deleteUser(id){

    await db.query(`
        DELETE FROM tbl_carro
        WHERE id_usuario = ?;        
        `[id]);

    const [resultado] = await db.query(`
        DELETE FROM tbl_usuario
        WHERE id = ?
        `, [id]);
        return resultado;
}

/*async function buscarPorNome(){

}*/
//Busca por filtros

async function buscarFiltros(filtros){
    let query = 'SELECT * FROM tbl_usuario WHERE 1=1';
    const params = [];

    if(filtros.nome_usuario){
        query += ' AND nome_usuario LIKE ?';
        params.push(`%${filtros.nome_usuario}%`);
    }
    if(filtros.email){
        query += ' AND email LIKE ?';
        params.push(`%${filtros.email}%`);
    }
    if (filtros.ativo){
        query += ' AND ativo LIKE ?';
        params.push(`%${filtros.ativo}%`)
    }
    const [resultado] = await db.query(query, params);
    return resultado
};


module.exports = {criarUsuario, buscarTodosUsuarios, buscarFiltros, buscarInfUsuarioCarro,
    updateUsuario, deleteUser
}