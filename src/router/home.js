const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('home');
});

router.get('/', (req, res) => {
    // Isso vai imprimir no terminal do VSCode se o usuário chegou logado na Home
    console.log("Quem está acessando a Home agora?", req.session.usuario); 
    
    res.render('index');
});

module.exports = router;
