//notificacaoModel.js
const db = require('../Connection/db');

const NotificacaoModel = {

    // Cada registro de ocupação gera até 2 eventos: a ENTRADA e (se já saiu) a SAÍDA.
    // Usuário comum vê só os eventos dos próprios carros; administrador vê todos.
    // "nao_lida" compara com a última vez que ESSE usuário abriu o sino.
    buscarEventos: async (idUsuario, verTodos) => {
        const filtroDono = verTodos ? '' : 'WHERE c.id_usuario = ?';
        const params = verTodos ? [idUsuario] : [idUsuario, idUsuario, idUsuario];

        const [rows] = await db.query(`
            SELECT e.*, (e.data_evento > COALESCE(nv.ultima_visualizacao, '1970-01-01')) AS nao_lida
            FROM (
                SELECT r.id, 'ENTRADA' AS tipo_evento, r.data_entrada AS data_evento,
                       c.placa, c.modelo, v.codigo_vaga
                FROM tbl_registro_ocupacao r
                JOIN tbl_carro c ON r.id_carro = c.id
                JOIN tbl_vaga v ON r.id_vaga = v.id
                ${filtroDono}
                UNION ALL
                SELECT r.id, 'SAIDA', r.data_saida, c.placa, c.modelo, v.codigo_vaga
                FROM tbl_registro_ocupacao r
                JOIN tbl_carro c ON r.id_carro = c.id
                JOIN tbl_vaga v ON r.id_vaga = v.id
                ${filtroDono ? filtroDono + ' AND' : 'WHERE'} r.data_saida IS NOT NULL
            ) e
            LEFT JOIN tbl_notificacao_visualizacao nv ON nv.id_usuario = ?
            ORDER BY e.data_evento DESC
            LIMIT 20
        `, params);
        return rows;
    },

    // Conta TODAS as não lidas (a lista acima mostra só as 20 mais recentes)
    contarNaoLidas: async (idUsuario, verTodos) => {
        const filtroDono = verTodos ? '' : 'WHERE c.id_usuario = ?';
        const params = verTodos ? [idUsuario] : [idUsuario, idUsuario];

        const [rows] = await db.query(`
            SELECT COALESCE(SUM(
                (r.data_entrada > COALESCE(nv.ultima_visualizacao, '1970-01-01'))
              + COALESCE(r.data_saida > COALESCE(nv.ultima_visualizacao, '1970-01-01'), 0)
            ), 0) AS total
            FROM tbl_registro_ocupacao r
            JOIN tbl_carro c ON r.id_carro = c.id
            LEFT JOIN tbl_notificacao_visualizacao nv ON nv.id_usuario = ?
            ${filtroDono}
        `, params);
        return Number(rows[0].total);
    },

    marcarComoLidas: async (idUsuario) => {
        await db.query(
            `INSERT INTO tbl_notificacao_visualizacao (id_usuario, ultima_visualizacao)
             VALUES (?, NOW())
             ON DUPLICATE KEY UPDATE ultima_visualizacao = NOW()`,
            [idUsuario]
        );
    }
};

module.exports = NotificacaoModel;
