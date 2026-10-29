const express = require('express');
const router = express.Router();
const db = require('../../database/mysql');

router.get('/administrador/usuarios', (req, res) => {
    const { busca, q } = req.query;
    const termo = (busca || q || '').trim();

    let query = 'SELECT id, nome, email, telefone, tipo_usuario, (avatar IS NOT NULL AND LENGTH(avatar) > 0) AS has_avatar FROM usuario';
    let params = [];

    if (termo) {
        query += ' WHERE nome LIKE ? OR email LIKE ? OR telefone LIKE ?';
        const likeTerm = `%${termo}%`;
        params.push(likeTerm, likeTerm, likeTerm);
    }

    query += ' ORDER BY id ASC';

    db.query(query, params, (err, results) => {
        if (err) {
            console.error('Erro ao buscar usuários no banco de dados:', err);
            return res.status(500).json({ message: 'Erro no servidor ao buscar usuários.' });
        }
        return res.status(200).json(results);
    });
});

router.get('/administrador/usuarios/avatar/:id', (req, res) => {
    const { id } = req.params;
    const query = 'SELECT avatar FROM usuario WHERE id = ?';

    db.query(query, [id], (err, results) => {
        if (err || results.length === 0 || !results[0].avatar) {
            return res.status(404).send('Avatar não encontrado');
        }

        const avatar = results[0].avatar;
        if (typeof avatar === 'string' && (avatar.startsWith('http') || avatar.startsWith('/'))) {
            return res.redirect(avatar);
        }

        res.setHeader('Content-Type', 'image/jpeg');
        return res.send(avatar);
    });
});

router.get('/administrador/usuarios/:id', (req, res) => {
    const { id } = req.params;

    db.query('SELECT id, nome, email, telefone, tipo_usuario FROM usuario WHERE id = ?', [id], (err, userRows) => {
        if (err || userRows.length === 0) {
            return res.status(404).json({ erro: 'Usuário não encontrado' });
        }
        const u = userRows[0];
        db.query('SELECT * FROM endereco WHERE usuario_id = ?', [id], (errAddr, addrs) => {
            db.query('SELECT * FROM pet WHERE usuario_id = ?', [id], (errPet, pets) => {
                return res.status(200).json({
                    id: u.id,
                    userName: u.nome,
                    nome: u.nome,
                    email: u.email,
                    phone: u.telefone,
                    telefone: u.telefone,
                    address: addrs || [],
                    enderecos: addrs || [],
                    pets: (pets || []).map(p => ({ ...p, name: p.nome }))
                });
            });
        });
    });
});

module.exports = router;
