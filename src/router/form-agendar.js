const express = require('express');
const router = express.Router();
const { verificarLogin } = require('./middlewares');

router.get('/form-agendar', verificarLogin, (req, res) => {
    res.render('form-agendar');
});

module.exports = router;