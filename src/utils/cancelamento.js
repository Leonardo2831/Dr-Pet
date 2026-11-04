const pool = require('../database/mysql').promise();

const ORIGENS = ['cliente', 'admin', 'recusado'];

/**
 * Cancela um agendamento: copia a linha para agenda_cancelada (histórico dos relatórios) e remove de agenda,
 * na mesma transação. Remover de agenda libera o horário, como já acontecia antes.
 *
 * origem: 'cliente' (cliente cancelou) | 'admin' (clínica cancelou) | 'recusado' (solicitação recusada)
 * Retorna true se o agendamento existia e foi cancelado, false se não existia.
 */
async function cancelarAgendamento(id, origem) {
    if (!ORIGENS.includes(origem)) throw new Error(`Origem de cancelamento inválida: ${origem}`);

    const conexao = await pool.getConnection();
    try {
        await conexao.beginTransaction();

        await conexao.query(
            `INSERT INTO agenda_cancelada
                (agenda_id, dateAgendamento, hourAgendamento, buscarResidencia, observation, endereco,
                 nome, telefone, nomePet, fk_user, fk_service, servico_nome, estava_pendente, origem)
             SELECT a.id, a.dateAgendamento, a.hourAgendamento, a.buscarResidencia, a.observation, a.endereco,
                    a.nome, a.telefone, a.nomePet, a.fk_user, a.fk_service, s.nome, a.pendente, ?
             FROM agenda a
             LEFT JOIN service_infos s ON s.id = a.fk_service
             WHERE a.id = ?`,
            [origem, id]
        );

        const [remocao] = await conexao.query('DELETE FROM agenda WHERE id = ?', [id]);

        await conexao.commit();
        return remocao.affectedRows > 0;
    } catch (err) {
        await conexao.rollback();
        throw err;
    } finally {
        conexao.release();
    }
}

module.exports = { cancelarAgendamento };
