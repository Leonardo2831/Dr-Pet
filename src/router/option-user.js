const express = require('express');
const router = express.Router();
const db = require('../database/mysql');

router.get('/option-user', (req, res) => {
    // const userId = req.body.id;
    const userId = 1;

    db.query(
        'SELECT * FROM usuario WHERE id = ?', 
        [userId], 
        (err, results) => {
            if (err) {
                console.error('Erro ao buscar usuário:', err);
                return res.status(500).send('Erro ao buscar usuário');
            } else {
                const user = results[0];
                console.log(user)
                res.render('option-user', { user });
            }
        }
    );    
});

module.exports = router;