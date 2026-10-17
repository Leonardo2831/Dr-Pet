const express = require('express');
const router = express.Router();
const { verificarLogin } = require('./middlewares');

router.get('/agenda', verificarLogin, (req, res) => {
    res.render('agenda');
});

module.exports = router;