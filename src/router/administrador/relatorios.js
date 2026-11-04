const express = require('express');
const router = express.Router();
const db = require('../../database/mysql').promise();

const LIMITE = 5000;

function textoBusca(valor) {
    return String(valor || '').trim().slice(0, 50);
}

// Escapa % e _ para a busca LIKE tratar o que o usuário digitou como texto literal
function like(valor) {
    return `%${valor.replace(/[\\%_]/g, '\\$&')}%`;
}

function erro(res, contexto, err) {
    console.error(`Erro no relatório de ${contexto}:`, err);
    return res.status(500).json({ erro: `Erro ao gerar o relatório de ${contexto}.` });
}

// ---------------------------------------------------------------------------
// Produtos
// ---------------------------------------------------------------------------
router.get('/administrador/relatorios/produtos', async (req, res) => {
    const busca = textoBusca(req.query.busca);
    const categoria = textoBusca(req.query.categoria);

    const condicoes = [];
    const params = [];
    if (busca) {
        condicoes.push('(p.nome LIKE ? OR p.categoria LIKE ? OR p.short_description LIKE ?)');
        params.push(like(busca), like(busca), like(busca));
    }
    if (categoria) {
        condicoes.push('p.categoria = ?');
        params.push(categoria);
    }
    const where = condicoes.length ? `WHERE ${condicoes.join(' AND ')}` : '';

    try {
        const [itens] = await db.query(
            `SELECT p.id, p.nome, p.categoria, p.preco, p.short_description AS descricao,
                    (SELECT COUNT(*) FROM produto_image i WHERE i.fk_produto = p.id) AS imagens_extras
             FROM produto p ${where}
             ORDER BY p.nome ASC
             LIMIT ${LIMITE}`,
            params
        );
        const [categorias] = await db.query('SELECT categoria, COUNT(*) AS total FROM produto GROUP BY categoria ORDER BY categoria');

        res.json({
            resumo: {
                total: itens.length,
                categorias: categorias.map(c => ({ categoria: c.categoria, total: c.total }))
            },
            itens: itens.map(p => ({ ...p, preco: Number(p.preco) }))
        });
    } catch (err) {
        erro(res, 'produtos', err);
    }
});

// ---------------------------------------------------------------------------
// Serviços (tipos de serviço)
// ---------------------------------------------------------------------------
router.get('/administrador/relatorios/servicos', async (req, res) => {
    const busca = textoBusca(req.query.busca);

    const params = [];
    let where = '';
    if (busca) {
        where = 'WHERE s.nome LIKE ? OR s.descricao LIKE ?';
        params.push(like(busca), like(busca));
    }

    try {
        const [itens] = await db.query(
            `SELECT s.id, s.nome, s.duracao, s.preco, s.descricao,
                    (s.imagem IS NOT NULL AND LENGTH(s.imagem) > 0) AS has_imagem
             FROM service_infos s ${where}
             ORDER BY s.nome ASC
             LIMIT ${LIMITE}`,
            params
        );

        res.json({
            resumo: { total: itens.length },
            itens: itens.map(s => ({
                ...s,
                duracao: Number(s.duracao),
                preco: Number(s.preco),
                has_imagem: Boolean(s.has_imagem)
            }))
        });
    } catch (err) {
        erro(res, 'serviços', err);
    }
});

module.exports = router;
