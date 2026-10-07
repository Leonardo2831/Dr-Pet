CREATE DATABASE petShop;
USE petShop;

CREATE TABLE agenda (
    id INTEGER NOT NULL AUTO_INCREMENT,
    date_agendamento DATE NOT NULL,
    hour_agendamento TIME NOT NULL,
    buscarResidencia BOOLEAN NOT NULL DEFAULT FALSE,
    observation TEXT,
    fk_user INTEGER NOT NULL,
    fk_pet INTEGER NOT NULL,
    fk_service INTEGER NOT NULL,
    fk_endereco INTEGER NOT NULL,
    FOREIGN KEY(fk_user) REFERENCES usuarios(id),
    FOREIGN KEY(fk_pet) REFERENCES pets(id),
    FOREIGN KEY(fk_service) REFERENCES service_infos(id),
    FOREIGN KEY(fk_endereco) REFERENCES endereco(id),
    PRIMARY KEY(id)
);

-- pegas dos demais criadores o restante
CREATE TABLE usuarios (
    id INTEGER NOT NULL AUTO_INCREMENT,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    telefone CHAR(12) NOT NULL, 
    senha VARCHAR(255) NOT NULL,
    tipo_usuario ENUM('admin', 'comum') NOT NULL DEFAULT 'comum',
    avatar BLOB,
    PRIMARY KEY(id)
);

CREATE TABLE enderecos (
    id INTEGER NOT NULL AUTO_INCREMENT,
    usuario_id INTEGER NOT NULL,
    rua VARCHAR(255) NOT NULL,
    numero VARCHAR(20),
    cep CHAR(8) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    estado CHAR(2) NOT NULL,
    bairro VARCHAR(100) NOT NULL,
    telefone_contato VARCHAR(20) NOT NULL,
    complemento VARCHAR(100),
    FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE,
    PRIMARY KEY(id)
);

CREATE TABLE pets (
    id INTEGER NOT NULL AUTO_INCREMENT,
    usuario_id INTEGER NOT NULL,
    nome VARCHAR(100) NOT NULL,
    raca VARCHAR(100),
    genero ENUM('macho', 'femea') NOT NULL,
    descricao VARCHAR(255),
    FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE,
    PRIMARY KEY(id)
);

CREATE TABLE service_infos(
    id INTEGER AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    imagem_url VARCHAR(255),
	PRIMARY KEY(id)
);

CREATE TABLE slides_home (
    id_slide INTEGER AUTO_INCREMENT,
    alt VARCHAR(150),
    imagem BLOB NOT NULL,
    ordem INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY(id)
);