CREATE DATABASE estacionamentoSenac;

USE estacionamentoSenac;

CREATE TABLE tbl_usuario (
id INT PRIMARY KEY AUTO_INCREMENT,
nome_usuario VARCHAR(120) NOT NULL,
email VARCHAR(120) UNIQUE NOT NULL,
senha VARCHAR(250) NOT NULL,
cargo ENUM('usuario','administrador') NOT NULL DEFAULT 'usuario',
ativo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE tbl_carro (
id INT PRIMARY KEY AUTO_INCREMENT,
id_usuario INT NOT NULL,
placa VARCHAR(7) UNIQUE NOT NULL,
marca VARCHAR(50) NOT NULL,
modelo VARCHAR(50) NOT NULL,
ano YEAR,
FOREIGN KEY (id_usuario) REFERENCES tbl_usuario(id)
);

CREATE TABLE tbl_vaga (
id INT PRIMARY KEY AUTO_INCREMENT, 
codigo_vaga VARCHAR(10) UNIQUE,
vaga_especial ENUM('deficiente','idoso'),
ocupada BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE tbl_dispositivo_iot (
id INT PRIMARY KEY AUTO_INCREMENT,
id_vaga INT,
nome_dispositivo VARCHAR(100) NOT NULL,
tipo_dispositivo VARCHAR(100) NOT NULL,
FOREIGN KEY (id_vaga) REFERENCES tbl_vaga(id)
);

CREATE TABLE tbl_tarifa(
id INT PRIMARY KEY AUTO_INCREMENT,
valor_hora DECIMAL(4,2) NOT NULL
);

CREATE TABLE tbl_registro_ocupacao (
id INT PRIMARY KEY AUTO_INCREMENT,
id_carro INT NOT NULL,
id_vaga INT NOT NULL,
valor_hora DECIMAL(4,2) NOT NULL,
total_pago DECIMAL(6,2),
pago BOOLEAN NOT NULL DEFAULT FALSE,
data_entrada DATETIME NOT NULL,
data_saida DATETIME,
tempo_uso TIME,
FOREIGN KEY (id_carro) REFERENCES tbl_carro(id),
FOREIGN KEY (id_vaga) REFERENCES tbl_vaga(id)
);

INSERT INTO tbl_usuario (nome_usuario, email, senha, cargo, ativo) VALUES
('Otávio', 'otavio@gmail.com', 123, 'usuario', true);

INSERT INTO tbl_carro (id_usuario, placa, marca, modelo, ano) VALUES
(1, 'LTG9023', 'Honda', 'Tucson', 2006);

SELECT c.placa, u.nome_usuario AS 'nome/usuario', u.cargo, u.email FROM tbl_usuario u
INNER JOIN tbl_carro c