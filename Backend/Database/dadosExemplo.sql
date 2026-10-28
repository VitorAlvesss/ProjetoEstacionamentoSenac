-- =====================================================================
-- DADOS DE EXEMPLO (OPCIONAL) - para testar o sistema logo depois de criar o banco
-- Rode DEPOIS do estacionamentoSenac.sql
--
-- Usuários para login (TROQUE as senhas se for usar fora da sala de aula):
--   Administrador: admin@goiabinha.com  / Admin1234
--   Usuário comum: maria@goiabinha.com  / Usuario1234
-- As senhas abaixo estão criptografadas com bcrypt (não dá para ver a senha pelo banco).
-- =====================================================================

USE estacionamentoSenac;

INSERT INTO tbl_usuario (nome_usuario, email, numero_usuario, senha, cargo) VALUES
('Administrador Goiabinha', 'admin@goiabinha.com', '11900000001',
 '$2b$12$XHGbf.tKNQ0O./9OxxPgb.RktsOTO13eKoRVauB/yx.UZjYQy7GfK', 'administrador'),
('Maria Silva', 'maria@goiabinha.com', '11900000002',
 '$2b$12$5B6AITicsr/tSZfImswcZuJiSdasgwmO3qekue/MPe3urSLh415P6', 'usuario');

-- Carros da Maria
INSERT INTO tbl_carro (id_usuario, placa, marca, modelo, cor, tipo_veiculo, ano) VALUES
((SELECT id FROM tbl_usuario WHERE email = 'maria@goiabinha.com'), 'ABC1D23', 'Fiat', 'Argo', 'Branco', 'carro', 2022),
((SELECT id FROM tbl_usuario WHERE email = 'maria@goiabinha.com'), 'XYZ9K87', 'Honda', 'CG 160', 'Vermelha', 'MOTO', 2021);

-- 20 vagas (A01 a A20), duas especiais
INSERT INTO tbl_vaga (codigo_vaga, vaga_especial) VALUES
('A01', 'deficiente'), ('A02', 'idoso'), ('A03', NULL), ('A04', NULL), ('A05', NULL),
('A06', NULL), ('A07', NULL), ('A08', NULL), ('A09', NULL), ('A10', NULL),
('A11', NULL), ('A12', NULL), ('A13', NULL), ('A14', NULL), ('A15', NULL),
('A16', NULL), ('A17', NULL), ('A18', NULL), ('A19', NULL), ('A20', NULL);

INSERT INTO tbl_tarifa (valor_primeira_hora, valor_hora_adicional, tolerancia_minutos) VALUES
(10.00, 5.00, 15);

-- Movimentações: o Argo entrou e saiu ontem; a moto está estacionada agora na A05
INSERT INTO tbl_registro_ocupacao (id_carro, id_vaga, valor_hora, total_pago, status_pagamento,
                                   data_entrada, forma_pagamento, data_saida, tempo_uso) VALUES
((SELECT id FROM tbl_carro WHERE placa = 'ABC1D23'), (SELECT id FROM tbl_vaga WHERE codigo_vaga = 'A03'),
 10.00, 15.00, 'pago', NOW() - INTERVAL 1 DAY, 'pix', NOW() - INTERVAL 1 DAY + INTERVAL 2 HOUR, '02:00:00');

INSERT INTO tbl_registro_ocupacao (id_carro, id_vaga, valor_hora, data_entrada) VALUES
((SELECT id FROM tbl_carro WHERE placa = 'XYZ9K87'), (SELECT id FROM tbl_vaga WHERE codigo_vaga = 'A05'),
 10.00, NOW() - INTERVAL 30 MINUTE);

UPDATE tbl_vaga SET ocupada = TRUE WHERE codigo_vaga = 'A05';
