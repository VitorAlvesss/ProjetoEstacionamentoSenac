-- =====================================================================
-- Estou criando a Procedure e CRUD de pagamento/vaga --
USE estacionamentoSenac;
-- =====================================================================
-- 1. VAGA - consultas + CRUD
-- =====================================================================

DELIMITER $$

-- Criando a lista de vagas livres --
DROP PROCEDURE IF EXISTS sp_vagas_disponiveis$$
CREATE PROCEDURE sp_vagas_disponiveis ()
BEGIN
    SELECT id, codigo_vaga, vaga_especial
    FROM tbl_vaga
    WHERE ocupada = FALSE
    ORDER BY codigo_vaga;
END$$

-- Criando procedure de vagas ocupadas --
DROP PROCEDURE IF EXISTS sp_vagas_ocupadas$$
CREATE PROCEDURE sp_vagas_ocupadas ()
BEGIN
    SELECT
        v.codigo_vaga,
        c.placa,
        c.modelo,
        r.data_entrada,
        TIMEDIFF(NOW(), r.data_entrada) AS tempo_decorrido
    FROM tbl_registro_ocupacao r
    JOIN tbl_vaga v ON v.id = r.id_vaga
    JOIN tbl_carro c ON c.id = r.id_carro
    WHERE r.data_saida IS NULL
    ORDER BY r.data_entrada;
END$$

-- Criando procudere de vagas especial e padrão --
DROP PROCEDURE IF EXISTS sp_vaga_inserir$$
CREATE PROCEDURE sp_vaga_inserir (
    IN p_codigo_vaga VARCHAR(10),
    IN p_vaga_especial ENUM('deficiente','idoso')
)
BEGIN
    INSERT INTO tbl_vaga (codigo_vaga, vaga_especial, ocupada)
    VALUES (p_codigo_vaga, p_vaga_especial, FALSE);

    SELECT LAST_INSERT_ID() AS id_vaga;
END$$

-- Procedure para listar todas as vagas --
DROP PROCEDURE IF EXISTS sp_vaga_listar$$
CREATE PROCEDURE sp_vaga_listar ()
BEGIN
    SELECT id, codigo_vaga, vaga_especial, ocupada
    FROM tbl_vaga
    ORDER BY codigo_vaga;
END$$

-- Buscar vaga por id
DROP PROCEDURE IF EXISTS sp_vaga_buscar_por_id$$
CREATE PROCEDURE sp_vaga_buscar_por_id (
    IN p_id INT
)
BEGIN
    SELECT id, codigo_vaga, vaga_especial, ocupada
    FROM tbl_vaga
    WHERE id = p_id;
END$$

-- Atualizar vaga
DROP PROCEDURE IF EXISTS sp_vaga_atualizar$$
CREATE PROCEDURE sp_vaga_atualizar (
    IN p_id INT,
    IN p_codigo_vaga VARCHAR(10),
    IN p_vaga_especial ENUM('deficiente','idoso')
)
BEGIN
    UPDATE tbl_vaga
    SET codigo_vaga = p_codigo_vaga,
        vaga_especial = p_vaga_especial
    WHERE id = p_id;

    SELECT 'Vaga atualizada.' AS mensagem;
END$$

-- Deletar vaga
DROP PROCEDURE IF EXISTS sp_vaga_deletar$$
CREATE PROCEDURE sp_vaga_deletar (
    IN p_id INT
)
BEGIN
    DELETE FROM tbl_vaga WHERE id = p_id;
    SELECT 'Vaga removida.' AS mensagem;
END$$

DELIMITER ;

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