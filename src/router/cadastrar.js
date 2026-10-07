const express = require('express');
const router = express.Router();

router.get('/cadastrar', (req, res) => {
    res.render('cadastrar');
});

module.exports = router;
