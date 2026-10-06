CREATE TABLE usuarios (
    id VARCHAR(36) PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    telefone VARCHAR(20),
    senha VARCHAR(255) NOT NULL,
    tipo_usuario VARCHAR(50) DEFAULT 'comum',
    avatar VARCHAR(255)
);

CREATE TABLE pets (
    id VARCHAR(36) PRIMARY KEY,
    usuario_id VARCHAR(36) NOT NULL,
    nome VARCHAR(100) NOT NULL,
    raca VARCHAR(100),
    genero VARCHAR(20),
    descricao TEXT,
    FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE
);

CREATE TABLE enderecos (
    id VARCHAR(36) PRIMARY KEY,
    usuario_id VARCHAR(36) NOT NULL,
    rua VARCHAR(255) NOT NULL,
    numero VARCHAR(20),
    cep VARCHAR(15),
    cidade VARCHAR(100),
    estado CHAR(2),
    bairro VARCHAR(100),
    telefone_contato VARCHAR(20),
    FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE
);