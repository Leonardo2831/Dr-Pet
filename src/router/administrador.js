const express = require('express');
const router = express.Router();

router.get('/administrador', (req, res) => {
    res.render('administrador');
});

module.exports = router;
