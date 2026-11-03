const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const db = require('../database/mysql').promise();

const VALIDADE_MIN = 10;
const MAX_TENTATIVAS = 5;
const INTERVALO_REENVIO_S = 60;

/**
 * Gera um código de 6 dígitos, guarda só o hash e invalida os anteriores.
 * Retorna { codigo } ou { erro: 'aguarde', segundos } se o reenvio foi cedo demais.
 */
async function gerar(usuarioId, tipo) {
    const [recentes] = await db.query(
        `SELECT TIMESTAMPDIFF(SECOND, criado_em, NOW()) AS segundos
         FROM codigo_verificacao
         WHERE usuario_id = ? AND tipo = ?
         ORDER BY id DESC LIMIT 1`,
        [usuarioId, tipo]
    );
    if (recentes.length && recentes[0].segundos < INTERVALO_REENVIO_S) {
        return { erro: 'aguarde', segundos: INTERVALO_REENVIO_S - recentes[0].segundos };
    }

    await db.query('UPDATE codigo_verificacao SET usado = TRUE WHERE usuario_id = ? AND tipo = ? AND usado = FALSE', [usuarioId, tipo]);

    const codigo = String(crypto.randomInt(0, 1000000)).padStart(6, '0');
    const hash = bcrypt.hashSync(codigo, 8);

    await db.query(
        `INSERT INTO codigo_verificacao (usuario_id, tipo, codigo_hash, expira_em)
         VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL ? MINUTE))`,
        [usuarioId, tipo, hash, VALIDADE_MIN]
    );

    return { codigo };
}

/**
 * Valida o código. Retorna { ok: true } ou { ok: false, motivo }.
 * motivos: 'invalido' | 'expirado' | 'tentativas'
 */
async function validar(usuarioId, tipo, codigo) {
    const [rows] = await db.query(
        `SELECT id, codigo_hash, tentativas, (expira_em < NOW()) AS expirado
         FROM codigo_verificacao
         WHERE usuario_id = ? AND tipo = ? AND usado = FALSE
         ORDER BY id DESC LIMIT 1`,
        [usuarioId, tipo]
    );

    if (!rows.length) return { ok: false, motivo: 'invalido' };
    const registro = rows[0];

    if (registro.expirado) return { ok: false, motivo: 'expirado' };
    if (registro.tentativas >= MAX_TENTATIVAS) return { ok: false, motivo: 'tentativas' };

    const correto = /^\d{6}$/.test(String(codigo || '').trim()) && bcrypt.compareSync(String(codigo).trim(), registro.codigo_hash);

    if (!correto) {
        await db.query('UPDATE codigo_verificacao SET tentativas = tentativas + 1 WHERE id = ?', [registro.id]);
        return { ok: false, motivo: 'invalido' };
    }

    await db.query('UPDATE codigo_verificacao SET usado = TRUE WHERE id = ?', [registro.id]);
    return { ok: true };
}

module.exports = { gerar, validar, VALIDADE_MIN, INTERVALO_REENVIO_S };
