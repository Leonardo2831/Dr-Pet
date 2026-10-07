const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('form-agendar');
});

module.exports = router;
