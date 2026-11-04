// Migração idempotente do banco (pode rodar várias vezes): npm run migrate
require('dotenv').config();
const db = require('../src/database/mysql').promise();
const { baixarFoto } = require('../src/utils/fotoGoogle');

async function colunaExiste(tabela, coluna) {
    const [rows] = await db.query(
        'SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?',
        [tabela, coluna]
    );
    return rows.length > 0;
}

async function main() {
    // --- usuario: suporte a Google, e-mail verificado e senha/telefone opcionais ---
    if (!(await colunaExiste('usuario', 'google_id'))) {
        await db.query('ALTER TABLE usuario ADD COLUMN google_id VARCHAR(64) NULL UNIQUE');
        console.log('+ usuario.google_id');
    }

    if (!(await colunaExiste('usuario', 'email_verificado'))) {
        await db.query('ALTER TABLE usuario ADD COLUMN email_verificado BOOLEAN NOT NULL DEFAULT FALSE');
        // Usuários que já existiam (fictícios, sem produção) são considerados verificados
        await db.query('UPDATE usuario SET email_verificado = TRUE');
        console.log('+ usuario.email_verificado (usuários existentes marcados como verificados)');
    }

    await db.query('ALTER TABLE usuario MODIFY senha VARCHAR(255) NULL');
    await db.query('ALTER TABLE usuario MODIFY telefone CHAR(12) NULL');

    // --- codigo_verificacao ---
    await db.query(`
        CREATE TABLE IF NOT EXISTS codigo_verificacao (
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
        )
    `);
    console.log('codigo_verificacao ok');

    // --- Alinha tipos com o database.sql (imagens em LONGBLOB, categoria livre) ---
    await db.query('ALTER TABLE service_infos MODIFY imagem LONGBLOB NULL');
    await db.query('ALTER TABLE usuario MODIFY avatar LONGBLOB NULL');
    await db.query('ALTER TABLE slide_home MODIFY image LONGBLOB NOT NULL');
    await db.query('ALTER TABLE produto MODIFY main_image LONGBLOB NOT NULL');
    await db.query('ALTER TABLE produto MODIFY categoria VARCHAR(100) NOT NULL');
    await db.query('ALTER TABLE produto_image MODIFY image LONGBLOB NOT NULL');

    // --- agenda: schema antigo (date_agendamento / fk_pet) -> schema atual ---
    if (await colunaExiste('agenda', 'date_agendamento')) {
        const [[{ total }]] = await db.query('SELECT COUNT(*) AS total FROM agenda');
        if (total > 0) {
            throw new Error(`A tabela agenda está no schema antigo e tem ${total} registro(s). Migre os dados manualmente antes de continuar.`);
        }
        await db.query('DROP TABLE agenda');
        await db.query(`
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
            )
        `);
        console.log('~ agenda recriada com o schema atual (estava vazia)');
    }

    // --- agenda_cancelada: histórico de agendamentos cancelados/recusados (usado nos relatórios) ---
    // Sem chaves estrangeiras de propósito: o histórico precisa sobreviver à exclusão de usuário ou serviço.
    await db.query(`
        CREATE TABLE IF NOT EXISTS agenda_cancelada (
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
        )
    `);
    console.log('agenda_cancelada ok');

    // --- avatar: versão antiga guardava só o link da foto do Google como texto; troca pela imagem de verdade ---
    const prefixoHttps = Buffer.from('https://').toString('hex').toUpperCase();
    const [legados] = await db.query(
        'SELECT id, avatar FROM usuario WHERE avatar IS NOT NULL AND LENGTH(avatar) < 600 AND HEX(LEFT(avatar, 8)) = ?',
        [prefixoHttps]
    );
    for (const usuario of legados) {
        const foto = await baixarFoto(usuario.avatar.toString('utf8'));
        await db.query('UPDATE usuario SET avatar = ? WHERE id = ?', [foto, usuario.id]); // sem foto => NULL => letra inicial
        console.log(`~ avatar do usuário ${usuario.id}: ${foto ? 'imagem baixada' : 'sem foto (será usada a letra inicial)'}`);
    }

    console.log('Migração concluída.');
}

main()
    .catch((err) => { console.error('Erro na migração:', err); process.exitCode = 1; })
    .finally(() => db.end());
