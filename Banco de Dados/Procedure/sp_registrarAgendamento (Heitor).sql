DELIMITER $$

CREATE PROCEDURE registrarAgendamento(
    IN p_id_carro INT,
    IN p_id_vaga INT
)
BEGIN

    DECLARE v_vaga INT;
    DECLARE v_ocupado BOOLEAN;
    DECLARE v_valor_hora DECIMAL(4,2);

    SELECT id, ocupada
    INTO v_vaga, v_ocupada
    FROM tbl_vaga
    WHERE id = p_id_vaga;

    IF v_vaga IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Vaga não encontrada';
    END IF;
    
    IF v_ocupada = TRUE THEN
		SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Vaga Ocupada';
	END IF;
    
    SELECT valor_hora
    INTO v_valor_hora
    FROM tbl_tarifa
    LIMIT 1;
    
    INSERT INTO tbl_registro_ocupacao (
    id_carro,
    id_vaga,
    valor_hora,
    data_entrada
    )
    VALUES (
	p_id_carro,
    p_id_vaga,
    v_valor_hora,
    NOW()
    );
    
    UPDATE tbl_vaga
    SET	ocupada = TRUE
    WHERE id = p_id_vaga;

END $$


DELIMITER ;