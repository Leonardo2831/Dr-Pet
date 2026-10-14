const express = require('express');
const router = express.Router();
const db = require('../database/mysql');

const { verificarLogin } = require('./middlewares');

router.get('/option-user', verificarLogin, (req, res) => {
    const userId = req.session.usuario.id;

    db.query(
        'SELECT * FROM usuario WHERE id = ?',
        [userId],
        (err, userResults) => {
            if (err) {
                console.log(err)
            }
            if (userResults.length === 0) {
                return res.status(404).send('Usuário não encontrado');
            }

            const user = userResults[0];

            db.query(
                'SELECT * FROM endereco WHERE usuario_id = ?',
                [userId],
                (err, addressResults) => {
                    if (err) {
                        console.log(err)
                    }
                    const enderecos = addressResults;
                    db.query(
                        'SELECT * FROM pet WHERE usuario_id = ?',
                        [userId],
                        (err, petResult) => {
                            if(err) {
                                console.log(err)
                            }
                            const pets = petResult;

                            res.render('option-user', {user, enderecos, pets})
                        }
                    )
                }
            );
        }
    );
});

router.post('/option-user/create-address', verificarLogin, (req,res) => {
    const { rua, numero, cep, cidade, estado, bairro, telefone} = req.body
    if(!rua || !numero || !cep || !cidade || !estado || !bairro || !telefone) {
        return res.status(400)
        .send('Não foram preenchidos todos os campos obrigatórios! Preencha todos e tente novamente.');
    }
    const cepRegex = cep.replace(/\D/g, "");
    const phoneRegex = telefone.replace(/\D/g, "");
    const estadoRegex = estado.trim().toUpperCase();
    const ruaLimpo = rua.trim()
    const cidadeLimpo = cidade.trim()
    const bairroLimpo = bairro.trim()
    const numeroLimpo = numero.trim()
    
    const id = req.session.usuario.id;
    
    db.query (
        'INSERT INTO endereco (usuario_id, rua, numero, cep, cidade, estado, bairro, telefone_contato) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [id, ruaLimpo, numeroLimpo, cepRegex, cidadeLimpo, estadoRegex, bairroLimpo, phoneRegex],
        (err) => {
            if(err){
                console.log(err)
            } else {
                res.redirect('/option-user')
            }
        }
    )
})

router.post('/option-user/create-pet', verificarLogin, (req,res) => {
    const { name, race, gender, descriptionPet } = req.body
    if(!name || !race || !gender || !descriptionPet) {
        return res.status(400)
        .send('Não foram preenchidos todos os campos obrigatórios! Preencha todos e tente novamente.');
    }
    const nome = name.trim()
    const raca = race.trim()
    const descricao = descriptionPet.trim()
    
    const id = req.session.usuario.id;
    db.query (
        'INSERT INTO pet (usuario_id, nome, raca, genero, descricao) VALUES (?, ?, ?, ?, ?)',
        [id, nome, raca, gender, descricao ],
        (err) => {
            if(err){
                console.log(err)
            } else {
                res.redirect('/option-user')
            }
        }
    )
})

router.post('/option-user/update-name', verificarLogin, (req,res) => {
    const { nome } = req.body
    if(typeof nome !== 'string' || !nome.trim()) {
        return res.status(400).send('Preencha o nome e tente novamente.');
    }

    const nomeLimpo = nome.trim()
    const id = req.session.usuario.id;
    
    db.query(
        'UPDATE usuario SET nome = ? WHERE id = ?',
        [nomeLimpo, id],
        (err, result) => {
            if(err) {
                console.log(err)
                return res.status(500).send('Erro ao atualizar o nome.');
            }
            if(result.affectedRows === 0) {
                return res.status(404).send('Usuário não encontrado');
            }

            req.session.usuario.nome = nomeLimpo; 
            
            res.redirect('/option-user')
        }
    )
})

router.post('/option-user/update-email', verificarLogin, (req,res) => {
    const { email } = req.body
    if(typeof email !== 'string' || !email.trim()) {
        return res.status(400).send('Preencha o email e tente novamente.');
    }

    const emailLimpo = email.trim()
    const id = req.session.usuario.id;
    
    db.query(
        'UPDATE usuario SET email = ? WHERE id = ?',
        [emailLimpo, id],
        (err, result) => {
            if(err) {
                console.log(err)
                if(err.code === 'ER_DUP_ENTRY') {
                    return res.status(409).send('Este email já está cadastrado.');
                }
                return res.status(500).send('Erro ao atualizar o email.');
            }
            if(result.affectedRows === 0) {
                return res.status(404).send('Usuário não encontrado');
            }
            
            req.session.usuario.email = emailLimpo;
            
            res.redirect('/option-user')
        }
    )
})

router.post('/option-user/update-phone', verificarLogin, (req,res) => {
    const { telefone } = req.body
    if(typeof telefone !== 'string' || !telefone.trim()) {
        return res.status(400).send('Preencha o telefone e tente novamente.');
    }

    const telefoneLimpo = telefone.replace(/\D/g, '')
    if(telefoneLimpo.length !== 10 && telefoneLimpo.length !== 11) {
        return res.status(400).send('Preencha um telefone válido.');
    }

    const id = req.session.usuario.id; 
    
    db.query(
        'UPDATE usuario SET telefone = ? WHERE id = ?',
        [telefoneLimpo, id],
        (err, result) => {
            if(err) {
                console.log(err)
                return res.status(500).send('Erro ao atualizar o telefone.');
            }
            if(result.affectedRows === 0) {
                return res.status(404).send('Usuário não encontrado');
            }
            
            req.session.usuario.telefone = telefoneLimpo;
            
            res.redirect('/option-user')
        }
    )
})

router.post('/option-user/update-password', verificarLogin, (req,res) => {
    const { senhaAtual, senha } = req.body
    if(typeof senhaAtual !== 'string' || !senhaAtual || typeof senha !== 'string' || !senha.trim()) {
        return res.status(400).send('Preencha a senha atual e a nova senha.');
    }

    const id = req.session.usuario.id; 
    
    db.query(
        'SELECT senha FROM usuario WHERE id = ?',
        [id],
        (err, userResults) => {
            if(err) {
                console.log(err)
                return res.status(500).send('Erro ao verificar a senha.');
            }
            if(userResults.length === 0) {
                return res.status(404).send('Usuário não encontrado');
            }
            if(userResults[0].senha !== senhaAtual) {
                return res.status(400).send('A senha atual está incorreta.');
            }

            db.query(
                'UPDATE usuario SET senha = ? WHERE id = ?',
                [senha, id],
                (err) => {
                    if(err) {
                        console.log(err)
                        return res.status(500).send('Erro ao atualizar a senha.');
                    }
                    res.redirect('/option-user')
                }
            )
        }
    )
})

module.exports = router;