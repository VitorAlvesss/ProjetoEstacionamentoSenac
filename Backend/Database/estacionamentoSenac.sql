-- =====================================================================
-- BANCO DE DADOS DO ESTACIONAMENTO SENAC
-- Rode este arquivo inteiro no MySQL Workbench (ou: mysql -u root -p < estacionamentoSenac.sql)
-- =====================================================================

CREATE DATABASE IF NOT EXISTS estacionamentoSenac;

USE estacionamentoSenac;

CREATE TABLE IF NOT EXISTS tbl_usuario (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nome_usuario VARCHAR(120) NOT NULL,
  email VARCHAR(120) UNIQUE NOT NULL,
  numero_usuario VARCHAR(11) UNIQUE,
  senha VARCHAR(250) NOT NULL,
  cargo ENUM('usuario','administrador') NOT NULL DEFAULT 'usuario',
  data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
  ativo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS tbl_carro (
  id INT PRIMARY KEY AUTO_INCREMENT,
  id_usuario INT NOT NULL,
  placa VARCHAR(7) UNIQUE NOT NULL,
  marca VARCHAR(50) NOT NULL,
  modelo VARCHAR(50) NOT NULL,
  cor VARCHAR(50),
  tipo_veiculo ENUM('carro','MOTO'),
  ano YEAR,
  FOREIGN KEY (id_usuario) REFERENCES tbl_usuario(id)
);

CREATE TABLE IF NOT EXISTS tbl_vaga (
  id INT PRIMARY KEY AUTO_INCREMENT,
  codigo_vaga VARCHAR(10) UNIQUE NOT NULL,
  vaga_especial ENUM('deficiente','idoso'),
  ocupada BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS tbl_tarifa (
  id INT PRIMARY KEY AUTO_INCREMENT,
  valor_primeira_hora DECIMAL(8,2) NOT NULL,
  valor_hora_adicional DECIMAL(8,2) NOT NULL,
  tolerancia_minutos INT DEFAULT 15,
  ativo BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS tbl_registro_ocupacao (
  id INT PRIMARY KEY AUTO_INCREMENT,
  id_carro INT NOT NULL,
  id_vaga INT NOT NULL,
  valor_hora DECIMAL(4,2) NOT NULL,
  total_pago DECIMAL(6,2),
  status_pagamento ENUM('pendente', 'pago', 'cancelado') DEFAULT 'pendente',
  data_entrada DATETIME NOT NULL,
  forma_pagamento ENUM('dinheiro', 'cartao_credito', 'cartao_debito', 'pix'),
  data_saida DATETIME,
  tempo_uso TIME,
  FOREIGN KEY (id_carro) REFERENCES tbl_carro(id),
  FOREIGN KEY (id_vaga) REFERENCES tbl_vaga(id)
);

CREATE TABLE IF NOT EXISTS tbl_dispositivo_iot (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nome_dispositivo VARCHAR(60) NOT NULL,
  tipo ENUM('sensor_presenca', 'cancela', 'camera_lpr') NOT NULL,
  ip_adress VARCHAR(45) NOT NULL,
  status_conexao ENUM('online', 'offline', 'erro') DEFAULT 'offline',
  ultma_leitura DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================================
-- TABELAS DO MÓDULO DE LOGIN (recuperação de senha e notificações)
-- =====================================================================

-- Pedidos de "esqueci minha senha".
-- Guardamos apenas o HASH do link e do código: se alguém roubar o banco,
-- não consegue usar os links/códigos que estão aqui.
CREATE TABLE IF NOT EXISTS tbl_recuperacao_senha (
  id INT PRIMARY KEY AUTO_INCREMENT,
  id_usuario INT NOT NULL,
  token_hash CHAR(64) NOT NULL UNIQUE,
  codigo_hash CHAR(64) NOT NULL,
  tentativas INT NOT NULL DEFAULT 0,
  usado BOOLEAN NOT NULL DEFAULT FALSE,
  expira_em DATETIME NOT NULL,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_usuario) REFERENCES tbl_usuario(id)
);

-- Última vez que cada usuário abriu o sino de notificações.
-- Tudo que aconteceu depois disso conta como "não lida" (bolinha vermelha).
CREATE TABLE IF NOT EXISTS tbl_notificacao_visualizacao (
  id_usuario INT PRIMARY KEY,
  ultima_visualizacao DATETIME NOT NULL,
  FOREIGN KEY (id_usuario) REFERENCES tbl_usuario(id)
);
