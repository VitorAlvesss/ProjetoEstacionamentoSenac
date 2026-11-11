const conexao = require("../Connection/db");

exports.autenticar = async (identificador, senha) => {
    const sql = `
        SELECT id, nome_usuario, email, cargo
        FROM tbl_usuario
        WHERE (email = ? OR nome_usuario = ?)
          AND senha = ?
          AND ativo = 1
        LIMIT 1
    `;

    const [usuarios] = await conexao.execute(sql, [identificador, identificador, senha]);
    return usuarios[0] || null;
};
