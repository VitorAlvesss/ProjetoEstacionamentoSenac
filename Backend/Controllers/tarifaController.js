const tarifaRepository = require('../Repositories/tarifaRepository.js');
const TarifaModel = require('../Model/tarifaModel.js');

class TarifaController {
  async buscarAtiva(req, res) {
    try {
      const tarifa = await tarifaRepository.buscarAtiva();
      if (!tarifa) return res.status(404).json({ erro: 'Nenhuma tarifa ativa encontrada.' });
      return res.status(200).json(tarifa);
    } catch (erro) {
      console.error('Erro ao buscar tarifa ativa:', erro);
      return res.status(500).json({ erro: 'Erro interno no servidor.' });
    }
  }

  async buscarPorId(req, res) {
    try {
      const id = req.params.id;
      const tarifa = await tarifaRepository.buscarPorId(id);
      if (!tarifa) return res.status(404).json({ erro: 'Tarifa não encontrada.' });
      return res.status(200).json(tarifa);
    } catch (erro) {
      console.error('Erro ao buscar tarifa por ID:', erro);
      return res.status(500).json({ erro: 'Erro interno no servidor.' });
    }
  }

  async atualizar(req, res) {
    try {
      const id = req.params.id;
      
      // Valida e formata os dados usando o seu TarifaModel
      const tarifaValidada = new TarifaModel({
        id,
        valor_primeira_hora: req.body.valor_primeira_hora,
        valor_hora_adicional: req.body.valor_hora_adicional,
        tolerancia_minutos: req.body.tolerancia_minutos,
        ativo: req.body.ativo ?? 1
      });

      const sucesso = await tarifaRepository.atualizar(id, tarifaValidada);

      if (!sucesso) {
        return res.status(404).json({ erro: 'Tarifa não encontrada ou nenhum dado alterado.' });
      }

      return res.status(200).json({ mensagem: 'Tarifa atualizada com sucesso!' });
    } catch (erro) {
      console.error('Erro ao atualizar tarifa:', erro);
      // Se for erro de validação do TarifaModel, retorna 400 (Bad Request)
      return res.status(400).json({ erro: erro.message || 'Erro ao atualizar tarifa.' });
    }
  }
}

module.exports = new TarifaController();