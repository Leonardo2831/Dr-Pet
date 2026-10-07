const express = require('express');
const router = express.Router();

router.get('/form-agendar', (req, res) => {
    res.render('form-agendar');
});

module.exports = router;
