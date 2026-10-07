const express = require('express');
const router = express.Router();

router.get('/agenda', (req, res) => {
    res.render('agenda');
});

module.exports = router;
