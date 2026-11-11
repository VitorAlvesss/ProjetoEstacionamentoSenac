const db = require('../Connection/db'); // ConexÃ£o mysql2/promise

class CarroController {

  // 1. Cadastrar um novo veÃ­culo e vincular a um usuÃ¡rio
  async criar(req, res) {
    try {
      const { id_usuario, placa, marca, modelo, cor, tipo_veiculo, ano } = req.body;

      // ValidaÃ§Ã£o dos campos obrigatÃ³rios
      if (!id_usuario || !placa || !marca || !modelo) {
        return res.status(400).json({ 
          mensagem: 'UsuÃ¡rio (id_usuario), placa, marca e modelo sÃ£o obrigatÃ³rios.' 
        });
      }

      // Normaliza a placa (remove espaÃ§os/traÃ§os e deixa em caixa alta)
      const placaFormatada = placa.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

      if (placaFormatada.length !== 7) {
        return res.status(400).json({ mensagem: 'A placa deve conter exatamente 7 caracteres.' });
      }

      // 1. Verifica se o usuÃ¡rio existe e estÃ¡ ativo
      const [usuarioExiste] = await db.execute(
        'SELECT id FROM tbl_usuario WHERE id = ? AND ativo = TRUE', 
        [id_usuario]
      );
      if (usuarioExiste.length === 0) {
        return res.status(404).json({ mensagem: 'UsuÃ¡rio informado nÃ£o foi encontrado ou estÃ¡ inativo.' });
      }

      // 2. Verifica se a placa jÃ¡ estÃ¡ cadastrada
      const [placaExiste] = await db.execute(
        'SELECT id FROM tbl_carro WHERE placa = ?', 
        [placaFormatada]
      );
      if (placaExiste.length > 0) {
        return res.status(409).json({ mensagem: 'VeÃ­culo com esta placa jÃ¡ estÃ¡ cadastrado.' });
      }

      // 3. Insere o veÃ­culo no banco
      const sql = `
        INSERT INTO tbl_carro (id_usuario, placa, marca, modelo, cor, tipo_veiculo, ano) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      
      const [result] = await db.execute(sql, [
        id_usuario,
        placaFormatada,
        marca,
        modelo,
        cor || null,
        tipo_veiculo || 'carro',
        ano || null
      ]);

      return res.status(201).json({ 
        mensagem: 'VeÃ­culo cadastrado com sucesso!', 
        id_carro: result.insertId 
      });

    } catch (error) {
      return res.status(500).json({ erro: 'Erro interno ao cadastrar veÃ­culo.', detalhe: error.message });
    }
  }

  // 2. Listar todos os veÃ­culos cadastrados (com dados do proprietÃ¡rio)
  async listarTodos(req, res) {
    try {
      const sql = `
        SELECT 
          c.id, 
          c.placa, 
          c.marca, 
          c.modelo, 
          c.cor, 
          c.tipo_veiculo, 
          c.ano,
          u.id AS id_proprietario,
          u.nome_usuario AS nome_proprietario,
          u.numero_usuario AS telefone_proprietario
        FROM tbl_carro c
        INNER JOIN tbl_usuario u ON c.id_usuario = u.id
        ORDER BY c.id DESC
      `;
      const [carros] = await db.execute(sql);

      return res.status(200).json(carros);
    } catch (error) {
      return res.status(500).json({ erro: 'Erro interno ao listar veÃ­culos.', detalhe: error.message });
    }
  }

  // 3. Buscar veÃ­culo especÃ­fico por Placa
  async buscarPorPlaca(req, res) {
    try {
      const { placa } = req.params;
      const placaFormatada = placa.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

      const sql = `
        SELECT 
          c.*, 
          u.nome_usuario AS nome_proprietario,
          u.email AS email_proprietario
        FROM tbl_carro c
        INNER JOIN tbl_usuario u ON c.id_usuario = u.id
        WHERE c.placa = ?
      `;
      const [rows] = await db.execute(sql, [placaFormatada]);

      if (rows.length === 0) {
        return res.status(404).json({ mensagem: 'VeÃ­culo nÃ£o encontrado.' });
      }

      return res.status(200).json(rows[0]);
    } catch (error) {
      return res.status(500).json({ erro: 'Erro interno ao buscar veÃ­culo.', detalhe: error.message });
    }
  }

  // 4. Listar todos os veÃ­culos de um usuÃ¡rio especÃ­fico
  async listarPorUsuario(req, res) {
    try {
      const { id_usuario } = req.params;

      const sql = `
        SELECT id, placa, marca, modelo, cor, tipo_veiculo, ano 
        FROM tbl_carro 
        WHERE id_usuario = ?
      `;
      const [carros] = await db.execute(sql, [id_usuario]);

      return res.status(200).json(carros);
    } catch (error) {
      return res.status(500).json({ erro: 'Erro interno ao listar veÃ­culos do usuÃ¡rio.', detalhe: error.message });
    }
  }

  // 5. Atualizar dados do veÃ­culo (Marca, Modelo, Cor, Ano)
  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const { marca, modelo, cor, tipo_veiculo, ano } = req.body;

      // Verifica se o veÃ­culo existe
      const [carro] = await db.execute('SELECT id FROM tbl_carro WHERE id = ?', [id]);
      if (carro.length === 0) {
        return res.status(404).json({ mensagem: 'VeÃ­culo nÃ£o encontrado.' });
      }

      const sql = `
        UPDATE tbl_carro 
        SET marca = COALESCE(?, marca), 
            modelo = COALESCE(?, modelo), 
            cor = COALESCE(?, cor), 
            tipo_veiculo = COALESCE(?, tipo_veiculo),
            ano = COALESCE(?, ano) 
        WHERE id = ?
      `;
      await db.execute(sql, [marca, modelo, cor, tipo_veiculo, ano, id]);

      return res.status(200).json({ mensagem: 'Dados do veÃ­culo atualizados com sucesso!' });
    } catch (error) {
      return res.status(500).json({ erro: 'Erro interno ao atualizar veÃ­culo.', detalhe: error.message });
    }
  }

  // 6. Deletar veÃ­culo
  async deletar(req, res) {
    try {
      const { id } = req.params;

      // Verifica se o veÃ­culo estÃ¡ com alguma ocupaÃ§Ã£o ativa no momento antes de deletar
      const [ocupacaoAtiva] = await db.execute(
        'SELECT id FROM tbl_registro_ocupacao WHERE id_carro = ? AND status_pagamento = "pendente"', 
        [id]
      );
      
      if (ocupacaoAtiva.length > 0) {
        return res.status(400).json({ 
          mensagem: 'NÃ£o Ã© possÃ­vel remover o veÃ­culo pois ele estÃ¡ atualmente no estacionamento.' 
        });
      }

      const [result] = await db.execute('DELETE FROM tbl_carro WHERE id = ?', [id]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ mensagem: 'VeÃ­culo nÃ£o encontrado.' });
      }

      return res.status(200).json({ mensagem: 'VeÃ­culo removido com sucesso!' });
    } catch (error) {
      return res.status(500).json({ erro: 'Erro interno ao remover veÃ­culo.', detalhe: error.message });
    }
  }
}

module.exports = new CarroController();
