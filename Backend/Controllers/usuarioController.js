const db = require('../Connection/db');
const bcrypt = require('bcryptjs');

class UsuarioController {
  // Login, "esqueci a senha" e redefinir senha ficam no authController (rotas /api/auth).

  // 1. Criar novo usuário
  async criar(req, res) {
    try {
      const { nome_usuario, email, numero_usuario, senha, cargo } = req.body;

      // Validação de campos obrigatórios
      if (!nome_usuario || !email || !senha) {
        return res.status(400).json({ mensagem: 'Nome, e-mail e senha são obrigatórios.' });
      }

      // Validação básica de tamanho de senha
      if (senha.length < 6) {
        return res.status(400).json({ mensagem: 'A senha deve ter no mínimo 6 caracteres.' });
      }

      // Verifica se o e-mail já está cadastrado
      const [emailExiste] = await db.execute('SELECT id FROM tbl_usuario WHERE email = ?', [email]);
      if (emailExiste.length > 0) {
        return res.status(409).json({ mensagem: 'Este e-mail já está em uso.' });
      }

      const saltRounds = 10;
      const senhaHash = await bcrypt.hash(senha, saltRounds);

      const sql = `
        INSERT INTO tbl_usuario (nome_usuario, email, numero_usuario, senha, cargo) 
        VALUES (?, ?, ?, ?, ?)
      `;
      
      const [result] = await db.execute(sql, [
        nome_usuario, 
        email, 
        numero_usuario || null, 
        senhaHash, 
        cargo || 'usuario'
      ]);

      return res.status(201).json({ 
        mensagem: 'Usuário criado com sucesso!', 
        id_usuario: result.insertId 
      });

    } catch (error) {
      console.error('Erro ao criar usuário:', error); // Log interno para o desenvolvedor
      return res.status(500).json({ erro: 'Erro interno ao criar usuário.' }); // Mensagem genérica para o cliente
    }
  }

  // 2. Listar todos os usuários ativos
  async listarTodos(req, res) {
    try {
      const sql = `
        SELECT id, nome_usuario, email, numero_usuario, cargo, data_cadastro, ativo 
        FROM tbl_usuario 
        WHERE ativo = TRUE 
        ORDER BY id DESC
      `;
      const [usuarios] = await db.execute(sql);

      return res.status(200).json(usuarios);
    } catch (error) {
      console.error('Erro ao listar usuários:', error);
      return res.status(500).json({ erro: 'Erro interno ao listar usuários.' });
    }
  }

  // 3. Buscar um usuário específico por ID
  async buscarPorId(req, res) {
    try {
      const { id } = req.params;

      const sql = `
        SELECT id, nome_usuario, email, numero_usuario, cargo, data_cadastro, ativo 
        FROM tbl_usuario 
        WHERE id = ?
      `;
      const [rows] = await db.execute(sql, [id]);

      if (rows.length === 0) {
        return res.status(404).json({ mensagem: 'Usuário não encontrado.' });
      }

      return res.status(200).json(rows[0]);
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      return res.status(500).json({ erro: 'Erro interno ao buscar usuário.' });
    }
  }

  // 4. Atualizar dados do usuário (Nome e Telefone)
  async atualizar(req, res) {
    try {
      const { id } = req.params;
      // Removido o campo "cargo" daqui para evitar escalonamento de privilégios.
      const { nome_usuario, numero_usuario } = req.body;

      const [usuario] = await db.execute('SELECT id FROM tbl_usuario WHERE id = ?', [id]);
      if (usuario.length === 0) {
        return res.status(404).json({ mensagem: 'Usuário não encontrado.' });
      }

      // Converte undefined para null para evitar quebra no mysql2
      const nomeSafe = nome_usuario !== undefined ? nome_usuario : null;
      const numeroSafe = numero_usuario !== undefined ? numero_usuario : null;

      const sql = `
        UPDATE tbl_usuario 
        SET nome_usuario = COALESCE(?, nome_usuario), 
            numero_usuario = COALESCE(?, numero_usuario)
        WHERE id = ?
      `;
      await db.execute(sql, [nomeSafe, numeroSafe, id]);

      return res.status(200).json({ mensagem: 'Dados do usuário atualizados com sucesso!' });
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      return res.status(500).json({ erro: 'Erro interno ao atualizar usuário.' });
    }
  }

  // 5. Desativar usuário (Soft Delete)
  async desativar(req, res) {
    try {
      const { id } = req.params;

      const [result] = await db.execute('UPDATE tbl_usuario SET ativo = FALSE WHERE id = ?', [id]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ mensagem: 'Usuário não encontrado.' });
      }

      return res.status(200).json({ mensagem: 'Usuário desativado com sucesso!' });
    } catch (error) {
      console.error('Erro ao desativar usuário:', error);
      return res.status(500).json({ erro: 'Erro interno ao desativar usuário.' });
    }
  }
}

module.exports = new UsuarioController();
