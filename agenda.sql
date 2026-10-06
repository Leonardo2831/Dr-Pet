CREATE DATABASE petShop;
USE petShop;

CREATE TABLE AGENDA (
    id INTEGER NOT NULL AUTO_INCREMENT,
    date DATE NOT NULL,
    hour TIME NOT NULL,
    buscarResidencia BOOLEAN NOT NULL DEFAULT FALSE,
    fk_user INTEGER NOT NULL,
    fk_pet INTEGER NOT NULL,
    fk_service INTEGER NOT NULL,
    FOREIGN KEY(fk_user) REFERENCES usuarios(id),
    FOREIGN KEY(fk_pet) REFERENCES pets(id),
    FOREIGN KEY(fk_service) REFERENCES service_infos(id),
    PRIMARY KEY(id)
);


-- pegas dos demais criadores o restante
CREATE TABLE usuarios (
    id INTEGER NOT NULL AUTO_INCREMENT,
    PRIMARY KEY(id)
);

CREATE TABLE pets (
    id INTEGER NOT NULL AUTO_INCREMENT,
    PRIMARY KEY(id)
);

CREATE TABLE service_infos (
    id INTEGER NOT NULL AUTO_INCREMENT,
    PRIMARY KEY(id)
);