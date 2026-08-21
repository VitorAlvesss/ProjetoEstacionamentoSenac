DELIMITER $$

CREATE PROCEDURE sp_tarifaVaga(
    IN r_id INT,                    -- ID do registro de ocupação
    OUT tarifa DECIMAL(6, 2)        -- Valor final da tarifa
)
BEGIN

    -- Variáveis utilizadas pela procedure
    DECLARE horaEntrada DATETIME;
    DECLARE horaSaida DATETIME;
    DECLARE tempoUso TIME;
    DECLARE valorHora DECIMAL(4, 2);
    DECLARE tempoUsado INT;
    DECLARE existeID INT DEFAULT 0;
    DECLARE idVaga INT;


    -- Verifica se o ID informado existe na tabela
    SELECT COUNT(*)
    INTO existeID
    FROM tbl_registro_ocupacao
    WHERE id = r_id;


    -- Caso o ID não exista, gera um erro
    IF existeID = 0 THEN

        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'ID do registro de ocupacao nao existe';


    ELSE

        -- Busca os dados necessários para calcular a tarifa
        SELECT data_entrada, valor_hora, id_vaga, data_saida
        INTO horaEntrada, valorHora, idVaga, horaSaida
        FROM tbl_registro_ocupacao
        WHERE id = r_id;


        -- Verifica se o veículo ainda está dentro do estacionamento
        IF horaSaida IS NULL THEN

            -- Se ainda não saiu, considera o momento atual como saída
            SET horaSaida = NOW();

            -- Libera a vaga
            UPDATE tbl_vaga
            SET ocupada = FALSE
            WHERE id = idVaga;

        END IF;


        -- Calcula o tempo total de permanência
        SET tempoUso = TIMEDIFF(horaSaida, horaEntrada);


        -- Converte o tempo para segundos
        SET tempoUsado = TIME_TO_SEC(tempoUso);


        -- ==========================================
        -- CÁLCULO DA TARIFA
        -- ==========================================

        -- Até 15 minutos: gratuito
        IF tempoUsado <= 900 THEN

            SET tarifa = 0.00;


        -- Acima de 15 minutos até 1 hora:
        -- cobra somente o valor normal da primeira hora
        ELSEIF tempoUsado <= 3600 THEN

            SET tarifa = valorHora;


        -- Acima de 1 hora:
        -- primeira hora = valor normal
        -- horas adicionais = valorHora + 10%
        ELSE

            SET tarifa =
                valorHora
                + (CEIL(tempoUsado / 3600.0) - 1)
                * valorHora
                * 1.10;

        END IF;


        -- Atualiza o registro com os dados da saída
        UPDATE tbl_registro_ocupacao
        SET
            data_saida = horaSaida,
            tempo_uso = tempoUso,
            total_pago = tarifa
        WHERE id = r_id;

    END IF;

END $$

DELIMITER ;