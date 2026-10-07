CREATE DATABASE petshop;
USE petshop;

CREATE TABLE slides_home (
id_slide INT AUTO_INCREMENT PRIMARY KEY,
titulo VARCHAR(150),
descricao TEXT,
imagem TEXT NOT NULL,
ordem INT DEFAULT 0,
ativo BOOLEAN DEFAULT TRUE,
data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE servicos(
id_servico INT AUTO_INCREMENT PRIMARY KEY,
nome VARCHAR(100) NOT NULL,
descricao TEXT,
imagem_url VARCHAR(255)
);

CREATE TABLE categorias_petshop(
id_categoria INT AUTO_INCREMENT PRIMARY KEY,
nome VARCHAR(50) NOT NULL,
icone_url VARCHAR(255)
);

CREATE TABLE empresa (
id_empresa INT AUTO_INCREMENT PRIMARY KEY,
sobre_nos TEXT,
endereco VARCHAR(255),
telefone VARCHAR(20),
email VARCHAR(100),
instagram VARCHAR(100)
);