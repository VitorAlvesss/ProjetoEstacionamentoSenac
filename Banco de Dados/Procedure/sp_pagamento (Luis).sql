-- =====================================================================
-- Estou criando a Procedure e CRUD de pagamento/vaga --
USE estacionamentoSenac;
-- =====================================================================
-- 2. Criando o CRUD de pagamento  --
-- =====================================================================

DELIMITER $$

-- Criar cobrança manualmente, caso precise gerar fora do fluxo de saída--
DROP PROCEDURE IF EXISTS sp_pagamento_inserir$$
CREATE PROCEDURE sp_pagamento_inserir (
    IN p_id_registro INT,
    IN p_total_pago DECIMAL(6,2)
)
BEGIN
    UPDATE tbl_registro_ocupacao
    SET total_pago = p_total_pago,
        pago = FALSE
    WHERE id = p_id_registro;

    SELECT 'Cobrança registrada.' AS mensagem;
END$$

-- Listar pagamentos, todos os registros com valor cobrado --
DROP PROCEDURE IF EXISTS sp_pagamento_listar$$
CREATE PROCEDURE sp_pagamento_listar ()
BEGIN
    SELECT
        r.id AS id_registro,
        c.placa,
        v.codigo_vaga,
        r.data_entrada,
        r.data_saida,
        r.tempo_uso,
        r.total_pago,
        r.pago
    FROM tbl_registro_ocupacao r
    JOIN tbl_carro c ON c.id = r.id_carro
    JOIN tbl_vaga v ON v.id = r.id_vaga
    WHERE r.total_pago IS NOT NULL
    ORDER BY r.data_saida DESC;
END$$

-- Buscar pagamento por id do registro --
DROP PROCEDURE IF EXISTS sp_pagamento_buscar_por_id$$
CREATE PROCEDURE sp_pagamento_buscar_por_id (
    IN p_id_registro INT
)
BEGIN
    SELECT
        r.id AS id_registro,
        c.placa,
        v.codigo_vaga,
        r.data_entrada,
        r.data_saida,
        r.tempo_uso,
        r.total_pago,
        r.pago
    FROM tbl_registro_ocupacao r
    JOIN tbl_carro c ON c.id = r.id_carro
    JOIN tbl_vaga v ON v.id = r.id_vaga
    WHERE r.id = p_id_registro;
END$$

-- Atualizar valor cobrado, correção manual --
DROP PROCEDURE IF EXISTS sp_pagamento_atualizar$$
CREATE PROCEDURE sp_pagamento_atualizar (
    IN p_id_registro INT,
    IN p_total_pago DECIMAL(6,2)
)
BEGIN
    UPDATE tbl_registro_ocupacao
    SET total_pago = p_total_pago
    WHERE id = p_id_registro;

    SELECT 'Valor de pagamento atualizado.' AS mensagem;
END$$

-- Confirmar pagamento, marca como pago --
DROP PROCEDURE IF EXISTS sp_pagamento_confirmar$$
CREATE PROCEDURE sp_pagamento_confirmar (
    IN p_id_registro INT
)
BEGIN
    UPDATE tbl_registro_ocupacao
    SET pago = TRUE
    WHERE id = p_id_registro;

    SELECT 'Pagamento confirmado.' AS mensagem;
END$$

-- Procedure criada para estornar e cancelar pagamento --
DROP PROCEDURE IF EXISTS sp_pagamento_deletar$$
CREATE PROCEDURE sp_pagamento_deletar (
    IN p_id_registro INT
)
BEGIN
    UPDATE tbl_registro_ocupacao
    SET total_pago = NULL,
        pago = FALSE
    WHERE id = p_id_registro;

    SELECT 'Cobrança removida.' AS mensagem;
END$$

DELIMITER ;

-- =====================================================================
-- 3. EXEMPLOS DE USO
-- CALL sp_vaga_inserir('A01', NULL);
-- CALL sp_vagas_disponiveis();
-- CALL sp_vagas_ocupadas();
--
-- CALL sp_pagamento_inserir(1, 16.50);
-- CALL sp_pagamento_listar();
-- CALL sp_pagamento_confirmar(1);