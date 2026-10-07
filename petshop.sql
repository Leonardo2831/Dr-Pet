CREATE DATABASE petshop;
USE petshop;

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