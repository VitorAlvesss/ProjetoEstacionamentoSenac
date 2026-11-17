const db = require('../Connection/db.js');
const TarifaModel = require('../Model/tarifaModel.js');

class TarifaRepository {
    // Busca a tarifa ativa (ideal para carregar a tela sem precisar passar ID)
    async buscarAtiva() {
        const query = `
            SELECT id, valor_primeira_hora, valor_hora_adicional, tolerancia_minutos, ativo
            FROM tbl_tarifa
            WHERE ativo = 1
            LIMIT 1
        `;
        const [linhas] = await db.query(query);

        return linhas.length > 0 ? new TarifaModel(linhas[0]) : null;
    }

    async buscarPorId(id) {
        const query = `
            SELECT id, valor_primeira_hora, valor_hora_adicional, tolerancia_minutos, ativo
            FROM tbl_tarifa
            WHERE id = ?
        `;
        const [linhas] = await db.query(query, [id]);

        return linhas.length > 0 ? new TarifaModel(linhas[0]) : null;
    }

    async atualizar(id, tarifa) {
        const query = `
            UPDATE tbl_tarifa
            SET
                valor_primeira_hora = ?,
                valor_hora_adicional = ?,
                tolerancia_minutos = ?,
                ativo = ?
            WHERE id = 1
        `;

        const [resultado] = await db.query(query, [
            tarifa.valor_primeira_hora,
            tarifa.valor_hora_adicional,
            tarifa.tolerancia_minutos,
            tarifa.ativo,
            id
        ]);

        return resultado.affectedRows > 0; 
    }
}

module.exports = new TarifaRepository();