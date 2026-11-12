const db = require('../Connection/db'); // Conexão mysql2/promise
const veiculoRepository = require("../Repositories/veiculoRepository");

class CarroController {

  // 1. Cadastrar um novo veículo e vincular a um usuário
  async criar(req, res) {
    try {
      const { id_usuario, placa, marca, modelo, cor, tipo_veiculo, ano } = req.body;

      // Validação dos campos obrigatórios
      if (!id_usuario || !placa || !marca || !modelo) {
        return res.status(400).json({ 
          mensagem: 'Usuário (id_usuario), placa, marca e modelo são obrigatórios.' 
        });
      }

      // Normaliza a placa (remove espaços/traços e deixa em caixa alta)
      const placaFormatada = placa.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

      if (placaFormatada.length !== 7) {
        return res.status(400).json({ mensagem: 'A placa deve conter exatamente 7 caracteres.' });
      }

      // 1. Verifica se o usuário existe e está ativo
      const [usuarioExiste] = await db.execute(
        'SELECT id FROM tbl_usuario WHERE id = ? AND ativo = TRUE', 
        [id_usuario]
      );
      if (usuarioExiste.length === 0) {
        return res.status(404).json({ mensagem: 'Usuário informado não foi encontrado ou está inativo.' });
      }

      // 2. Verifica se a placa já está cadastrada
      const [placaExiste] = await db.execute(
        'SELECT id FROM tbl_carro WHERE placa = ?', 
        [placaFormatada]
      );
      if (placaExiste.length > 0) {
        return res.status(409).json({ mensagem: 'Veículo com esta placa já está cadastrado.' });
      }

      // 3. Insere o veículo no banco
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
        mensagem: 'Veículo cadastrado com sucesso!', 
        id_carro: result.insertId 
      });

    } catch (error) {
      return res.status(500).json({ erro: 'Erro interno ao cadastrar veículo.', detalhe: error.message });
    }
  }

  // 2. Listar todos os veículos cadastrados (com dados do proprietário)
  async listarTodos(req, res) {
    try {
      const [veiculos, cards] = await Promise.all([
        veiculoRepository.buscarVeiculo(),
        veiculoRepository.buscarCards()
      ]);
      return res.status(200).json({ veiculos, cards });
    } catch (error) {
      console.error("Erro ao listar veículos:", error);
      return res.status(500).json({ erro: "Erro interno ao listar veículos." });
    }
  }

  // 3. Buscar veículo específico por Placa
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
        return res.status(404).json({ mensagem: 'Veículo não encontrado.' });
      }

      return res.status(200).json(rows[0]);
    } catch (error) {
      return res.status(500).json({ erro: 'Erro interno ao buscar veículo.', detalhe: error.message });
    }
  }

  // 4. Listar todos os veículos de um usuário específico
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
      return res.status(500).json({ erro: 'Erro interno ao listar veículos do usuário.', detalhe: error.message });
    }
  }

  // 5. Atualizar dados do veículo (Marca, Modelo, Cor, Ano)
  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const { marca, modelo, cor, tipo_veiculo, ano } = req.body;

      // Verifica se o veículo existe
      const [carro] = await db.execute('SELECT id FROM tbl_carro WHERE id = ?', [id]);
      if (carro.length === 0) {
        return res.status(404).json({ mensagem: 'Veículo não encontrado.' });
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

      return res.status(200).json({ mensagem: 'Dados do veículo atualizados com sucesso!' });
    } catch (error) {
      return res.status(500).json({ erro: 'Erro interno ao atualizar veículo.', detalhe: error.message });
    }
  }

  // 6. Deletar veículo
  async deletar(req, res) {
    try {
      const { id } = req.params;

      // Verifica se o veículo está com alguma ocupação ativa no momento antes de deletar
      const [ocupacaoAtiva] = await db.execute(
        'SELECT id FROM tbl_registro_ocupacao WHERE id_carro = ? AND status_pagamento = "pendente"', 
        [id]
      );
      
      if (ocupacaoAtiva.length > 0) {
        return res.status(400).json({ 
          mensagem: 'Não é possível remover o veículo pois ele está atualmente no estacionamento.' 
        });
      }

      const [result] = await db.execute('DELETE FROM tbl_carro WHERE id = ?', [id]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ mensagem: 'Veículo não encontrado.' });
      }

      return res.status(200).json({ mensagem: 'Veículo removido com sucesso!' });
    } catch (error) {
      return res.status(500).json({ erro: 'Erro interno ao remover veículo.', detalhe: error.message });
    }
  }

}

module.exports = new CarroController();

