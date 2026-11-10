//usuarioRepository.js
// Todas as consultas SQL da tabela tbl_usuario ficam aqui
const db = require('../Connection/db');

const usuarioRepository = {
    // Login aceita e-mail ou número de telefone
    buscarPorLogin: async (login) => {
        const [rows] = await db.query(
            'SELECT * FROM tbl_usuario WHERE email = ? OR numero_usuario = ? LIMIT 1',
            [login, login]
        );
        return rows[0] || null;
    },

    buscarPorEmail: async (email) => {
        const [rows] = await db.query('SELECT * FROM tbl_usuario WHERE email = ?', [email]);
        return rows[0] || null;
    },

    buscarPorId: async (id) => {
        const [rows] = await db.query('SELECT * FROM tbl_usuario WHERE id = ?', [id]);
        return rows[0] || null;
    },

    // Perfil completo: dados do usuário + carros + se o carro está estacionado agora
    buscarPerfil: async (id) => {
        const [usuarios] = await db.query(
            `SELECT id, nome_usuario, email, numero_usuario, cargo, data_cadastro
             FROM tbl_usuario WHERE id = ?`,
            [id]
        );
        if (usuarios.length === 0) return null;

        const [carros] = await db.query(
            `SELECT c.id, c.placa, c.marca, c.modelo, c.cor, c.tipo_veiculo, c.ano,
                    v.codigo_vaga AS vaga_atual, r.data_entrada AS estacionado_desde
             FROM tbl_carro c
             LEFT JOIN tbl_registro_ocupacao r ON r.id_carro = c.id AND r.data_saida IS NULL
             LEFT JOIN tbl_vaga v ON v.id = r.id_vaga
             WHERE c.id_usuario = ?
             ORDER BY c.placa`,
            [id]
        );

        return { ...usuarios[0], carros };
    },

    atualizarPerfil: async (id, { nome, email, telefone }) => {
        await db.query(
            'UPDATE tbl_usuario SET nome_usuario = ?, email = ?, numero_usuario = ? WHERE id = ?',
            [nome, email, telefone || null, id]
        );
    },

    atualizarSenha: async (id, senhaHash) => {
        await db.query('UPDATE tbl_usuario SET senha = ? WHERE id = ?', [senhaHash, id]);
    },

    criar: async ({ nome, email, telefone, senhaHash, cargo }) => {
        const [resultado] = await db.query(
            `INSERT INTO tbl_usuario (nome_usuario, email, numero_usuario, senha, cargo)
             VALUES (?, ?, ?, ?, ?)`,
            [nome, email, telefone || null, senhaHash, cargo]
        );
        return resultado.insertId;
    }
};

module.exports = usuarioRepository;
