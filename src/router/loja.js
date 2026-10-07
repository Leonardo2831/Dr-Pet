const express = require('express');
const router = express.Router();

router.get('/loja', (req, res) => {
    res.render('loja');
});

module.exports = router;
