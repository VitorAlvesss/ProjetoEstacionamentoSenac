//notificacaoModel.js
const db = require('../Connection/db');

// "Lida / não lida" NÃO fica no banco: o navegador guarda no localStorage a data do
// último evento que o usuário já viu e manda aqui como "desde".
// Tudo que aconteceu DEPOIS de "desde" conta como não lida (bolinha vermelha).

const NotificacaoModel = {

    // Cada registro de ocupação gera até 2 eventos: a ENTRADA e (se já saiu) a SAÍDA.
    // Usuário comum vê só os eventos dos próprios carros; administrador vê todos.
    buscarEventos: async (idUsuario, verTodos, desde) => {
        const filtroDono = verTodos ? '' : 'WHERE c.id_usuario = ?';
        const params = verTodos ? [desde] : [desde, idUsuario, idUsuario];

        const [rows] = await db.query(`
            SELECT e.*, (e.data_evento > ?) AS nao_lida
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
            ORDER BY e.data_evento DESC
            LIMIT 20
        `, params);
        return rows;
    },

    // Conta TODAS as não lidas (a lista acima mostra só as 20 mais recentes)
    contarNaoLidas: async (idUsuario, verTodos, desde) => {
        const filtroDono = verTodos ? '' : 'WHERE c.id_usuario = ?';
        const params = verTodos ? [desde, desde] : [desde, desde, idUsuario];

        const [rows] = await db.query(`
            SELECT COALESCE(SUM(
                (r.data_entrada > ?)
              + COALESCE(r.data_saida > ?, 0)
            ), 0) AS total
            FROM tbl_registro_ocupacao r
            JOIN tbl_carro c ON r.id_carro = c.id
            ${filtroDono}
        `, params);
        return Number(rows[0].total);
    }
};

module.exports = NotificacaoModel;
