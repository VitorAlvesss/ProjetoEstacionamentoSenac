-- =====================================================================
-- TABELA DO MÓDULO DE LOGIN (recuperação de senha)
-- O banco do grupo já está na nuvem (Aiven) e já tem esta tabela.
-- Este arquivo só serve para recriar a tabela se um dia ela sumir.
-- As outras tabelas (usuário, carro, vaga, registro de ocupação...) são do grupo.
-- Notificações não têm tabela: lidas/não lidas ficam no localStorage do navegador.
-- =====================================================================

SET NAMES utf8mb4;

USE estacionamentoSenac;

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
