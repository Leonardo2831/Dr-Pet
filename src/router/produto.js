const express = require('express');
const router = express.Router();

router.get('/produto', (req, res) => {
    res.render('produto');
});

module.exports = router;
