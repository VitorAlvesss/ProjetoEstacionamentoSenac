const db = require("../Connection/db");

async function buscarVeiculo() {
    const [veiculos] = await db.execute(`
        SELECT
            c.id,
            c.placa,
            u.id AS id_proprietario,
            u.nome_usuario AS nome,
            CONCAT_WS(' / ', u.email, NULLIF(u.numero_usuario, '')) AS contato,
            DATE_FORMAT(u.data_cadastro, '%d/%m/%Y') AS data_cadastro_usuario
        FROM tbl_carro AS c
        INNER JOIN tbl_usuario AS u ON u.id = c.id_usuario
        WHERE u.ativo = 1
        ORDER BY u.data_cadastro DESC
    `);

    return veiculos;
}

async function buscarCards() {
    const [[cards]] = await db.execute(`
        SELECT
            (SELECT COUNT(*) FROM tbl_usuario WHERE ativo = 1) AS usuarios,
            (SELECT COUNT(DISTINCT c.id)
             FROM tbl_carro AS c
             INNER JOIN tbl_usuario AS u ON u.id = c.id_usuario
             WHERE u.ativo = 1) AS veiculos
    `);

    return cards || { usuarios: 0, veiculos: 0 };
}

module.exports = { buscarVeiculo, buscarCards };