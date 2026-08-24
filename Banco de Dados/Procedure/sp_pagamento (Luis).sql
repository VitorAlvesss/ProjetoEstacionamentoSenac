-- =====================================================================
-- ESTACIONAMENTO SENAC - VAGA + PAGAMENTO + RELATÓRIO
-- Banco: estacionamentoSenac
-- =====================================================================

USE estacionamentoSenac;

-- =====================================================================
-- 1. VAGA - consultas + CRUD
-- =====================================================================

DELIMITER $$

-- Lista vagas livres
DROP PROCEDURE IF EXISTS sp_vagas_disponiveis$$
CREATE PROCEDURE sp_vagas_disponiveis ()
BEGIN
    SELECT id, codigo_vaga, vaga_especial
    FROM tbl_vaga
    WHERE ocupada = FALSE
    ORDER BY codigo_vaga;
END$$

-- Lista vagas ocupadas, com carro e tempo decorrido
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

-- Criar vaga
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

-- Listar todas as vagas
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
-- 2. PAGAMENTO - CRUD + procedure de cobrança
-- =====================================================================

DELIMITER $$

-- Criar cobrança manualmente (caso precise gerar fora do fluxo de saída)
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

-- Listar pagamentos (todos os registros com valor cobrado)
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

-- Buscar pagamento por id do registro
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

-- Atualizar valor cobrado (correção manual)
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

-- Confirmar pagamento (marca como pago)
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

-- Estornar/cancelar pagamento (volta pra pendente)
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

-- Gerar cobrança na saída: registra o tempo REAL de permanência
-- e calcula o valor cobrado com cobrança mínima de 1 hora
DROP PROCEDURE IF EXISTS sp_pagamento_gerar_cobranca$$
CREATE PROCEDURE sp_pagamento_gerar_cobranca (IN p_id_registro INT)
BEGIN
    DECLARE v_data_entrada DATETIME;
    DECLARE v_valor_hora DECIMAL(4,2);
    DECLARE v_minutos_reais INT;
    DECLARE v_minutos_cobrados INT;
    DECLARE v_horas_cobradas INT;
    DECLARE v_total DECIMAL(6,2);

    -- 1. Busca os dados de entrada (só se ainda estiver em aberto)
    SELECT data_entrada, valor_hora
    INTO v_data_entrada, v_valor_hora
    FROM tbl_registro_ocupacao
    WHERE id = p_id_registro AND data_saida IS NULL;

    IF v_data_entrada IS NOT NULL THEN

        -- 2. Tempo real de permanência (pra registro/relatório)
        SET v_minutos_reais = TIMESTAMPDIFF(MINUTE, v_data_entrada, NOW());

        -- 3. Tempo usado só para cálculo da cobrança (mínimo 1h)
        SET v_minutos_cobrados = v_minutos_reais;
        IF v_minutos_cobrados < 60 THEN
            SET v_minutos_cobrados = 60;
        END IF;

        -- 4. Horas cobradas (arredondando pra cima) e valor total
        SET v_horas_cobradas = CEIL(v_minutos_cobrados / 60.0);
        SET v_total = v_horas_cobradas * v_valor_hora;

        -- 5. Grava saída: tempo REAL + valor cobrado
        UPDATE tbl_registro_ocupacao
        SET data_saida = NOW(),
            tempo_uso = SEC_TO_TIME(v_minutos_reais * 60),
            total_pago = v_total,
            pago = FALSE
        WHERE id = p_id_registro;

        -- 6. Retorna os dois números pra quem chamou a procedure
        SELECT
            v_minutos_reais AS minutos_permanencia_real,
            SEC_TO_TIME(v_minutos_reais * 60) AS tempo_uso_real,
            v_horas_cobradas AS horas_cobradas,
            v_total AS total_a_pagar;
    ELSE
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Registro inválido ou saída já processada.';
    END IF;

END$$

DELIMITER ;


-- =====================================================================
-- 3. RELATÓRIO - tempo real x horas cobradas x valor
-- =====================================================================

-- Relatório completo: todos os registros já finalizados
SELECT
    r.id AS id_registro,
    c.placa,
    v.codigo_vaga,
    r.data_entrada,
    r.data_saida,
    r.tempo_uso AS tempo_real_permanencia,
    (r.total_pago / r.valor_hora) AS horas_cobradas,
    r.valor_hora,
    r.total_pago AS valor_cobrado,
    r.pago
FROM tbl_registro_ocupacao r
JOIN tbl_carro c ON c.id = r.id_carro
JOIN tbl_vaga v ON v.id = r.id_vaga
WHERE r.data_saida IS NOT NULL
ORDER BY r.data_saida DESC;

-- Variação: só os casos em que a cobrança mínima de 1h "pesou"
-- (carro ficou menos de 1 hora, mas pagou hora cheia)
SELECT
    c.placa,
    v.codigo_vaga,
    r.tempo_uso AS tempo_real,
    (r.total_pago / r.valor_hora) AS horas_cobradas,
    r.total_pago AS valor_cobrado
FROM tbl_registro_ocupacao r
JOIN tbl_carro c ON c.id = r.id_carro
JOIN tbl_vaga v ON v.id = r.id_vaga
WHERE r.data_saida IS NOT NULL
  AND TIME_TO_SEC(r.tempo_uso) < 3600
ORDER BY r.data_saida DESC;


-- =====================================================================
-- 4. EXEMPLOS DE USO (comentados)
-- =====================================================================

-- CALL sp_vaga_inserir('A01', NULL);
-- CALL sp_vagas_disponiveis();
-- CALL sp_vagas_ocupadas();
--
-- CALL sp_pagamento_gerar_cobranca(1);   -- gera a cobrança na saída do carro
-- CALL sp_pagamento_listar();
-- CALL sp_pagamento_confirmar(1);