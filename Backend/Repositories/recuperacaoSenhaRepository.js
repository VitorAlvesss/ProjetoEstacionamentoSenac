//recuperacaoSenhaRepository.js
// Consultas da tabela tbl_recuperacao_senha (pedidos de "esqueci minha senha")
const db = require('../Connection/db');

const recuperacaoSenhaRepository = {
    // Cancela pedidos antigos do usuário e cria um novo, válido por X minutos
    criar: async (idUsuario, tokenHash, codigoHash, minutosValidade) => {
        await db.query(
            'UPDATE tbl_recuperacao_senha SET usado = TRUE WHERE id_usuario = ? AND usado = FALSE',
            [idUsuario]
        );
        await db.query(
            `INSERT INTO tbl_recuperacao_senha (id_usuario, token_hash, codigo_hash, expira_em)
             VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL ? MINUTE))`,
            [idUsuario, tokenHash, codigoHash, minutosValidade]
        );
    },

    buscarAtivoPorToken: async (tokenHash) => {
        const [rows] = await db.query(
            `SELECT * FROM tbl_recuperacao_senha
             WHERE token_hash = ? AND usado = FALSE AND expira_em > NOW()`,
            [tokenHash]
        );
        return rows[0] || null;
    },

    buscarAtivoPorUsuario: async (idUsuario) => {
        const [rows] = await db.query(
            `SELECT * FROM tbl_recuperacao_senha
             WHERE id_usuario = ? AND usado = FALSE AND expira_em > NOW()
             ORDER BY id DESC LIMIT 1`,
            [idUsuario]
        );
        return rows[0] || null;
    },

    registrarTentativaErrada: async (id) => {
        await db.query('UPDATE tbl_recuperacao_senha SET tentativas = tentativas + 1 WHERE id = ?', [id]);
    },

    invalidarTodosDoUsuario: async (idUsuario) => {
        await db.query(
            'UPDATE tbl_recuperacao_senha SET usado = TRUE WHERE id_usuario = ? AND usado = FALSE',
            [idUsuario]
        );
    }
};

module.exports = recuperacaoSenhaRepository;
