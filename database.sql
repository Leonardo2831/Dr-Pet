USE petshop;

CREATE TABLE usuario (
    id INTEGER NOT NULL AUTO_INCREMENT,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    telefone CHAR(12) NULL,
    senha VARCHAR(255) NULL,
    tipo_usuario ENUM('admin', 'comum') NOT NULL DEFAULT 'comum',
    avatar LONGBLOB,
    google_id VARCHAR(64) NULL UNIQUE,
    email_verificado BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY(id)
);

CREATE TABLE codigo_verificacao (
    id INTEGER NOT NULL AUTO_INCREMENT,
    usuario_id INTEGER NOT NULL,
    tipo ENUM('verificar_email', 'recuperar_senha') NOT NULL,
    codigo_hash VARCHAR(255) NOT NULL,
    expira_em DATETIME NOT NULL,
    tentativas INTEGER NOT NULL DEFAULT 0,
    usado BOOLEAN NOT NULL DEFAULT FALSE,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(id),
    INDEX idx_codigo_usuario_tipo (usuario_id, tipo),
    FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE
);

CREATE TABLE endereco (
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
    FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE,
    PRIMARY KEY(id)
);

CREATE TABLE pet (
    id INTEGER NOT NULL AUTO_INCREMENT,
    usuario_id INTEGER NOT NULL,
    nome VARCHAR(100) NOT NULL,
    raca VARCHAR(100),
    genero ENUM('macho', 'femea') NOT NULL,
    descricao VARCHAR(255),
    FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE,
    PRIMARY KEY(id)
);

CREATE TABLE service_infos(
    id INTEGER NOT NULL AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    duracao DECIMAL(10,2) NOT NULL,
    preco DECIMAL(10,2) NOT NULL,
    descricao VARCHAR(500) NOT NULL,
    imagem LONGBLOB NULL,
	PRIMARY KEY(id)
);

CREATE TABLE agenda (
    id INTEGER NOT NULL AUTO_INCREMENT,
    dateAgendamento DATE NOT NULL,
    hourAgendamento TIME NOT NULL,
    buscarResidencia BOOLEAN NOT NULL DEFAULT FALSE,
    observation VARCHAR(255),
    endereco VARCHAR(255) NOT NULL,
    nome VARCHAR(255) NOT NULL,
    telefone CHAR(12) NOT NULL,
    pendente BOOLEAN NOT NULL DEFAULT TRUE,
    nomePet VARCHAR(100) NOT NULL,
    fk_user INTEGER NOT NULL,
    fk_service INTEGER NOT NULL,
    FOREIGN KEY(fk_user) REFERENCES usuario(id),
    FOREIGN KEY(fk_service) REFERENCES service_infos(id),
    PRIMARY KEY(id)
);

-- Histórico de agendamentos cancelados/recusados (usado nos relatórios).
-- Sem chaves estrangeiras de propósito: o histórico precisa sobreviver à exclusão de usuário ou serviço.
CREATE TABLE agenda_cancelada (
    id INTEGER NOT NULL AUTO_INCREMENT,
    agenda_id INTEGER NULL,
    dateAgendamento DATE NOT NULL,
    hourAgendamento TIME NOT NULL,
    buscarResidencia BOOLEAN NOT NULL DEFAULT FALSE,
    observation VARCHAR(255),
    endereco VARCHAR(255),
    nome VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    nomePet VARCHAR(100),
    fk_user INTEGER NULL,
    fk_service INTEGER NULL,
    servico_nome VARCHAR(100),
    estava_pendente BOOLEAN NOT NULL DEFAULT FALSE,
    origem ENUM('cliente', 'admin', 'recusado') NOT NULL,
    cancelado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(id),
    INDEX idx_cancelada_data (dateAgendamento),
    INDEX idx_cancelada_servico (fk_service)
);

CREATE TABLE slide_home (
    id INTEGER AUTO_INCREMENT,
    image LONGBLOB NOT NULL,
    alt VARCHAR(150) NOT NULL,
    ordem INTEGER NOT NULL DEFAULT 1 CHECK(ordem > 0),
    PRIMARY KEY(id)
);

CREATE TABLE produto (
    id INTEGER NOT NULL AUTO_INCREMENT,
    nome VARCHAR(255) NOT NULL,
    preco DECIMAL(10,2) NOT NULL,
    categoria VARCHAR (100) NOT NULL,
    short_description VARCHAR(80) NOT NULL,
    long_description VARCHAR(1000) NOT NULL,
    main_image LONGBLOB NOT NULL,
    main_alt_image VARCHAR(100) NOT NULL,
    PRIMARY KEY(id)
);

CREATE TABLE produto_image (
    id INTEGER NOT NULL AUTO_INCREMENT,
    fk_produto INTEGER NOT NULL,
    image LONGBLOB NOT NULL,
    alt VARCHAR(100) NOT NULL,
    ordem INTEGER NOT NULL DEFAULT 1 CHECK (ordem > 0),
    PRIMARY KEY(id),
    FOREIGN KEY(fk_produto) REFERENCES produto(id)
);

INSERT INTO usuario(nome, email, telefone, senha, tipo_usuario, avatar, email_verificado)
VALUES('Administrador', 'adm@hotmail.com', '11999999999', '$2b$10$kLXdP/Dtm.XdFh1PzcvGH.bh0e1OwFBnYEJrbhXKYoN4qbo23HSqy', 'admin', null, TRUE);

-- Exemplos opcionais de inserção de serviços (caso queira adicionar serviços para agendamento):
-- INSERT INTO service_infos (nome, duracao, preco, descricao, imagem) VALUES
-- ('Banho e Tosa', 90.00, 100.00, 'Banho completo e tosa especializada com profissionais dedicados.', NULL),
-- ('Vacinação', 30.00, 50.00, 'Vacinação segura com acompanhamento e carteirinha em dia.', NULL),
-- ('Cirurgia', 150.00, 200.00, 'Procedimentos cirúrgicos veterinários com ambiente esterilizado.', NULL);

-- Para quem ja criou a database no computador
-- Para bancos já criados, rode apenas o comando abaixo (descomente) em vez de recriar a tabela:
-- ALTER TABLE service_infos
--     ADD COLUMN descricao VARCHAR(500) NOT NULL,
--     ADD COLUMN imagem MEDIUMBLOB NULL;
-- ALTER TABLE slide_home MODIFY COLUMN image LONGBLOB NOT NULL;