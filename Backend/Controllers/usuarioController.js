const db = require('../Connection/db');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

class UsuarioController {

  async login(req, res) {
    try {
      const { email, senha } = req.body || {};
      if (typeof email !== 'string' || typeof senha !== 'string' || !email.trim() || !senha) {
        return res.status(400).json({ mensagem: 'Informe usuário/e-mail e senha.' });
      }

      const identificador = email.trim();
      const [usuarios] = await db.execute(
        `SELECT id, nome_usuario, email, senha, cargo
         FROM tbl_usuario
         WHERE (email = ? OR nome_usuario = ?) AND ativo = 1
         LIMIT 1`,
        [identificador, identificador]
      );

      if (!usuarios.length || !(await bcrypt.compare(senha, usuarios[0].senha))) {
        return res.status(401).json({ mensagem: 'Usuário ou senha inválidos.' });
      }

      const { senha: _senha, ...usuarioSeguro } = usuarios[0];
      return res.status(200).json({ usuario: usuarioSeguro });
    } catch (error) {
      console.error('Erro no login:', error);
      return res.status(500).json({ mensagem: 'Erro interno ao validar o login.' });
    }
  }

  async solicitarRecuperacao(req, res) {
    const mensagemGenerica = 'Se o e-mail estiver cadastrado, enviaremos as instruções de recuperação.';
    const email = typeof req.body?.email === 'string' ? req.body.email.trim() : '';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ erro: 'Informe um e-mail válido.' });
    }

    try {
      const [usuarios] = await db.execute(
        'SELECT id, email FROM tbl_usuario WHERE email = ? AND ativo = 1 LIMIT 1',
        [email]
      );
      if (!usuarios.length) {
        return res.status(404).json({ erro: 'Esse e-mail não está cadastrado.' });
      }

      const smtpHost = process.env.SMTP_HOST;
      const smtpPort = Number(process.env.SMTP_PORT || 587);
      const smtpUser = process.env.SMTP_USER;
      const smtpPass = process.env.SMTP_PASS;
      if (!smtpHost || !smtpUser || !smtpPass) {
        return res.status(503).json({ erro: 'O envio de e-mail ainda não está configurado no servidor.' });
      }

      const usuario = usuarios[0];
      const codigo = crypto.randomInt(0, 1000000).toString().padStart(6, '0');
      const token = crypto.randomBytes(32).toString('hex');
      const hash = (valor) => crypto.createHash('sha256').update(valor).digest('hex');

      await db.execute('DELETE FROM tbl_recuperacao_senha WHERE id_usuario = ?', [usuario.id]);
      await db.execute(
        `INSERT INTO tbl_recuperacao_senha
         (id_usuario, codigo_hash, token_hash, expira_em, usado)
         VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 15 MINUTE), 0)`,
        [usuario.id, hash(codigo), hash(token)]
      );

      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: process.env.SMTP_SECURE === 'true' || smtpPort === 465,
        auth: { user: smtpUser, pass: smtpPass }
      });

      const paginaRecuperacao = process.env.FRONTEND_URL || 'http://localhost:5500/Frontend/esqueciSenha/index.html';
      const link = new URL(paginaRecuperacao);
      link.searchParams.set('token', token);
      link.searchParams.set('email', usuario.email);

      await transporter.sendMail({
        from: process.env.EMAIL_FROM || smtpUser,
        to: usuario.email,
        subject: 'Recuperação de senha',
        text: `Seu código de recuperação é ${codigo}. Ele expira em 15 minutos.\n\nVocê também pode redefinir a senha por este link: ${link.toString()}`
      });

      return res.status(200).json({ mensagem: mensagemGenerica });
    } catch (error) {
      console.error('Erro ao solicitar recuperação de senha:', error);
      return res.status(500).json({ erro: 'Não foi possível enviar as instruções de recuperação.' });
    }
  }

  async redefinirSenha(req, res) {
    const { email, codigo, token, novaSenha } = req.body || {};
    if (typeof novaSenha !== 'string' || novaSenha.length < 8 || !/[A-Za-z]/.test(novaSenha) || !/\d/.test(novaSenha)) {
      return res.status(400).json({ erro: 'A senha precisa ter 8 caracteres, uma letra e um número.' });
    }
    if (!token && (typeof email !== 'string' || typeof codigo !== 'string' || !/^\d{6}$/.test(codigo))) {
      return res.status(400).json({ erro: 'Informe o e-mail e o código de 6 dígitos.' });
    }

    const hash = (valor) => crypto.createHash('sha256').update(valor).digest('hex');
    let conexao;
    try {
      conexao = await db.getConnection();
      await conexao.beginTransaction();
      let sql;
      let valores;
      if (typeof token === 'string' && token) {
        sql = `SELECT r.id, r.id_usuario FROM tbl_recuperacao_senha r
               JOIN tbl_usuario u ON u.id = r.id_usuario
               WHERE r.token_hash = ? AND r.usado = 0 AND r.expira_em > NOW() AND u.ativo = 1
               LIMIT 1 FOR UPDATE`;
        valores = [hash(token)];
      } else {
        sql = `SELECT r.id, r.id_usuario FROM tbl_recuperacao_senha r
               JOIN tbl_usuario u ON u.id = r.id_usuario
               WHERE u.email = ? AND r.codigo_hash = ? AND r.usado = 0
                 AND r.expira_em > NOW() AND u.ativo = 1
               LIMIT 1 FOR UPDATE`;
        valores = [email.trim(), hash(codigo)];
      }

      const [recuperacoes] = await conexao.execute(sql, valores);
      if (!recuperacoes.length) {
        await conexao.rollback();
        return res.status(400).json({ erro: 'Código ou link inválido ou expirado.' });
      }

      const recuperacao = recuperacoes[0];
      const senhaHash = await bcrypt.hash(novaSenha, 10);
      await conexao.execute('UPDATE tbl_usuario SET senha = ? WHERE id = ?', [senhaHash, recuperacao.id_usuario]);
      await conexao.execute('UPDATE tbl_recuperacao_senha SET usado = 1 WHERE id_usuario = ?', [recuperacao.id_usuario]);
      await conexao.commit();
      return res.status(200).json({ mensagem: 'Senha redefinida com sucesso.' });
    } catch (error) {
      if (conexao) await conexao.rollback();
      console.error('Erro ao redefinir senha:', error);
      return res.status(500).json({ erro: 'Não foi possível redefinir a senha.' });
    } finally {
      if (conexao) conexao.release();
    }
  }
  
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
