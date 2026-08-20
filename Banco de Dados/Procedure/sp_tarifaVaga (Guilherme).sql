DELIMITER $$

CREATE PROCEDURE sp_tarifaVaga(
    IN r_id INT,
    OUT Tarifa DECIMAL(10, 2)
)
BEGIN

    DECLARE horaEntrada DATETIME;
    DECLARE horaSaida DATETIME;
    DECLARE valorHora DECIMAL (4,2);

    SELECT data_entrada, valor_hora
    INTO horaEntrada, valorHora
    FROM tbl_registro_ocupacao
    WHERE id = r_id;

    SET horaSaida = NOW();

    SET Tarifa = CEIL(TIMESTAMPDIFF(MINUTE, horaEntrada, horaSaida) / 60) * valorHora;

END $$

DELIMITER ;