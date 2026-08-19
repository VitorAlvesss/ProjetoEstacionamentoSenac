const DB_CONEXAO = require('../Connection/db'); // ajustado o caminho 

  const TABELA_OCUPACAO = 'tbl_registro_ocupado'; // constante que referece a tabela

const PAGAMENTO_MODEL = {
    async buscarPorId(id_registro) {
        const sql_query = `
            SELECT id, id_carro, id_vaga, id_tarifa, adicional_atraso, 
              valor_hora, total_pago, pago, data_entrada, tempo_uso, data_saida 
            FROM ${NOME_TABELA} 
            WHERE id = ? `;

      const [linhas_resultado] = await DB_CONEXAO.execute(sql_query, [id_registro]);
      return linha_resultado[0];
    },
    async atualizar (id_registro, dados_pagamento){
      const sql_query = `
      UPDATE ${NOME_TABELA}
      SET total_pago = ?, pago = ?, data_saida = ?, tempo_uso = ?
      WHERE id = ?
      `;
      const [resultado_atualizacao] = await DB_CONEXAO.execute(sql_query, [
        dados_pagamento.total_pago,
        dados_pagamento.pago,
        dados_pagamento.data_saida,
        dados_pagamento.tempo_uso,
        id_registro
      ]);

      return resultado_atualizacao;
    }
  };

module.exports = PAGAMENTO_MODEL;