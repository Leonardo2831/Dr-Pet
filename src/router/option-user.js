const express = require('express');
const router = express.Router();
const db = require('../database/mysql');
const { enviarCodigo, enviarLinkRecuperacao, mascararEmail, AVISO_DEV } = require('../utils/enviarCodigo');
const { emailValido } = require('../utils/sessao');

const { verificarLogin } = require('./middlewares');

router.get('/option-user', verificarLogin, (req, res) => {
    const userId = req.session.usuario.id;
    const feedback = req.session.optionUserFeedback || null;
    delete req.session.optionUserFeedback;

    db.query(
        'SELECT * FROM usuario WHERE id = ?',
        [userId],
        (err, userResults) => {
            if (err) {
                console.log(err);
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
                        console.log(err);
                    }
                    const enderecos = addressResults;
                    db.query(
                        'SELECT * FROM pet WHERE usuario_id = ?',
                        [userId],
                        (err, petResult) => {
                            if(err) {
                                console.log(err);
                            }
                            const pets = petResult;

                            res.render('option-user', {
                                user,
                                enderecos,
                                pets,
                                avatarV: req.session.usuario.avatarV,
                                feedback,
                                emailMascarado: mascararEmail(user.email)
                            });
                        }
                    );
                }
            );
        }
    );
});

router.post('/option-user/create-address', verificarLogin, (req,res) => {
    const { rua, numero, cep, cidade, estado, bairro, telefone} = req.body;
    if(!rua || !numero || !cep || !cidade || !estado || !bairro || !telefone) {
        return res.status(400)
        .send('Não foram preenchidos todos os campos obrigatórios! Preencha todos e tente novamente.');
    }
    const cepRegex = cep.replace(/\D/g, "");
    const phoneRegex = telefone.replace(/\D/g, "");
    const estadoRegex = estado.trim().toUpperCase();
    const ruaLimpo = rua.trim();
    const cidadeLimpo = cidade.trim();
    const bairroLimpo = bairro.trim();
    const numeroLimpo = numero.trim();
    
    const id = req.session.usuario.id;
    
    db.query (
        'INSERT INTO endereco (usuario_id, rua, numero, cep, cidade, estado, bairro, telefone_contato) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [id, ruaLimpo, numeroLimpo, cepRegex, cidadeLimpo, estadoRegex, bairroLimpo, phoneRegex],
        (err) => {
            if(err){
                console.log(err);
            } else {
                res.redirect('/option-user');
            }
        }
    );
});

router.post('/option-user/create-pet', verificarLogin, (req,res) => {
    const { name, race, gender, descriptionPet } = req.body;
    if(!name || !race || !gender || !descriptionPet) {
        return res.status(400)
        .send('Não foram preenchidos todos os campos obrigatórios! Preencha todos e tente novamente.');
    }
    const nome = name.trim();
    const raca = race.trim();
    const descricao = descriptionPet.trim();
    
    const id = req.session.usuario.id;
    db.query (
        'INSERT INTO pet (usuario_id, nome, raca, genero, descricao) VALUES (?, ?, ?, ?, ?)',
        [id, nome, raca, gender, descricao ],
        (err) => {
            if(err){
                console.log(err);
            } else {
                res.redirect('/option-user');
            }
        }
    );
});

router.post('/option-user/update-name', verificarLogin, (req,res) => {
    const { nome } = req.body;
    if(typeof nome !== 'string' || !nome.trim()) {
        return res.status(400).send('Preencha o nome e tente novamente.');
    }

    const nomeLimpo = nome.trim();
    const id = req.session.usuario.id;
    
    db.query(
        'UPDATE usuario SET nome = ? WHERE id = ?',
        [nomeLimpo, id],
        (err, result) => {
            if(err) {
                console.log(err);
                return res.status(500).send('Erro ao atualizar o nome.');
            }
            if(result.affectedRows === 0) {
                return res.status(404).send('Usuário não encontrado');
            }

            req.session.usuario.nome = nomeLimpo; 
            
            res.redirect('/option-user');
        }
    );
});

router.post('/option-user/update-email', verificarLogin, async (req, res) => {
    const novoEmail = String(req.body.email || '').trim().toLowerCase();
    const userId = req.session.usuario.id;

    const voltarComErro = (mensagem) => {
        req.session.optionUserFeedback = { tipo: 'erro', mensagem };
        req.session.save(() => res.redirect('/option-user'));
    };

    if (!emailValido(novoEmail)) {
        return voltarComErro('Informe um endereço de e-mail válido.');
    }

    try {
        const [usuarios] = await db.promise().query(
            'SELECT id, nome, email FROM usuario WHERE id = ?',
            [userId]
        );
        if (usuarios.length === 0) {
            return res.status(404).send('Usuário não encontrado');
        }

        if (usuarios[0].email.toLowerCase() === novoEmail) {
            return voltarComErro('Esse já é o e-mail cadastrado na sua conta.');
        }

        const [existentes] = await db.promise().query(
            'SELECT id FROM usuario WHERE email = ? AND id <> ?',
            [novoEmail, userId]
        );
        if (existentes.length > 0) {
            return voltarComErro('Este e-mail já está cadastrado.');
        }

        const resultado = await enviarCodigo(
            { id: userId, nome: usuarios[0].nome, email: novoEmail },
            'alterar_email'
        );

        if (!resultado.ok) {
            const mensagem = resultado.erro === 'aguarde'
                ? `Aguarde ${resultado.segundos}s para solicitar outro código.`
                : 'Não foi possível enviar o código agora. Tente novamente em instantes.';
            return voltarComErro(mensagem);
        }

        req.session.alteracaoEmailPendente = { usuarioId: userId, novoEmail };
        req.session.alteracaoEmailInfo = resultado.dev ? AVISO_DEV : null;
        req.session.save(() => res.redirect('/alterar-email'));
    } catch (err) {
        console.error('Erro ao solicitar alteração de e-mail:', err);
        voltarComErro('Não foi possível iniciar a alteração de e-mail. Tente novamente em instantes.');
    }
});

router.post('/option-user/update-phone', verificarLogin, (req,res) => {
    const { telefone } = req.body;
    if(typeof telefone !== 'string' || !telefone.trim()) {
        return res.status(400).send('Preencha o telefone e tente novamente.');
    }

    const telefoneLimpo = telefone.replace(/\D/g, '');
    if(telefoneLimpo.length !== 10 && telefoneLimpo.length !== 11) {
        return res.status(400).send('Preencha um telefone válido.');
    }

    const id = req.session.usuario.id; 
    
    db.query(
        'UPDATE usuario SET telefone = ? WHERE id = ?',
        [telefoneLimpo, id],
        (err, result) => {
            if(err) {
                console.log(err);
                return res.status(500).send('Erro ao atualizar o telefone.');
            }
            if(result.affectedRows === 0) {
                return res.status(404).send('Usuário não encontrado');
            }
            
            req.session.usuario.telefone = telefoneLimpo;
            
            res.redirect('/option-user');
        }
    );
});

router.post('/option-user/request-password-reset', verificarLogin, async (req, res) => {
    const userId = req.session.usuario.id;

    try {
        const [usuarios] = await db.promise().query(
            'SELECT id, nome, email FROM usuario WHERE id = ?',
            [userId]
        );

        if (usuarios.length === 0) {
            return res.status(404).send('Usuário não encontrado');
        }

        const resultado = await enviarLinkRecuperacao(usuarios[0]);

        if (!resultado.ok) {
            const mensagem = resultado.erro === 'aguarde'
                ? `Já enviamos um link. Aguarde ${resultado.segundos}s para solicitar outro.`
                : 'Não foi possível enviar o e-mail agora. Tente novamente em instantes.';
            req.session.optionUserFeedback = { tipo: 'erro', mensagem };
        } else {
            req.session.optionUserFeedback = {
                tipo: 'sucesso',
                mensagem: resultado.dev
                    ? AVISO_DEV
                    : `Enviamos o link para ${mascararEmail(usuarios[0].email)}. Ele vale por 30 minutos.`
            };
        }

        req.session.save(() => res.redirect('/option-user'));
    } catch (err) {
        console.error('Erro ao solicitar alteração de senha:', err);
        req.session.optionUserFeedback = {
            tipo: 'erro',
            mensagem: 'Não foi possível enviar o e-mail agora. Tente novamente em instantes.'
        };
        req.session.save(() => res.redirect('/option-user'));
    }
});

router.post('/option-user/update-address/:id', verificarLogin, (req,res) => {
    const idAddress = req.params.id;
    const { rua, numero, cep, cidade, estado, bairro, telefone} = req.body;
    const idUser = req.session.usuario.id;

    db.query(
        'UPDATE endereco SET rua = ?, numero = ?, cep = ?, cidade = ?, estado = ?, bairro = ?, telefone_contato = ? WHERE id = ? AND usuario_id = ?', [rua, numero, cep, cidade, estado, bairro, telefone, idAddress, idUser ],
        (err) => {
            if(err) {
                return res.status(500).send('Erro ao alterar os dados do endereço! Tente novamente.');
            } else {
                res.redirect('/option-user');
            }
        }
    );
});

router.post('/option-user/update-pet/:id', verificarLogin, (req,res) => {
    const {name, race, gender, descriptionPet} = req.body;
    const idPet = req.params.id;
    const idUser = req.session.usuario.id;

    db.query(
        'UPDATE pet SET nome = ?, raca = ?, genero = ?, descricao = ? WHERE id = ? AND usuario_id = ?', [name, race, gender, descriptionPet, idPet, idUser],
        (err) => {
            if(err) {
                return res.status(500).send("Ocorreu um erro ao tentar atualizar os dados do seu pet! Tente novamente.");
            } else {
                res.redirect("/option-user");
            }
        }
    );
});

router.post('/option-user/delete-pet/:id', verificarLogin, (req,res) => {
    const idPet = req.params.id;
    
    db.query(
        'DELETE FROM pet WHERE id = ?', 
        [idPet],
        (err) => {
            if(err) {
                console.log(err);
            } else {
                return res.status(204).end();
            }
        }
    );
});

router.post('/option-user/delete-address/:id', verificarLogin, (req,res) => {
    const idAddress = req.params.id;
    const userId = req.session.usuario.id;
    
    db.query(
        'DELETE FROM endereco WHERE id = ? AND usuario_id = ?', 
        [idAddress, userId],
        (err) => {
            if(err) {
                console.log(err);
            } else {
                return res.status(204).end();
            }
        }
    );
});

router.post('/option-user/update-avatar', verificarLogin, (req, res) => {
    const userId = req.session.usuario.id;
    const { avatar } = req.body;
    let avatarBuffer = null;

    if (avatar && typeof avatar === 'string' && avatar.startsWith('data:image')) {
        const base64Data = avatar.replace(/^data:image\/\w+;base64,/, '');
        avatarBuffer = Buffer.from(base64Data, 'base64');
    }

    if (!avatarBuffer) {
        return res.status(400).send('Imagem inválida.');
    }

    db.query('UPDATE usuario SET avatar = ? WHERE id = ?', [avatarBuffer, userId], (err) => {
        if (err) {
            console.error('Erro ao atualizar avatar do usuário:', err);
            return res.status(500).send('Erro ao atualizar avatar.');
        }
        if (req.session.usuario) {
            req.session.usuario.temAvatar = true;
            req.session.usuario.avatarV = Date.now();
        }
        return res.status(200).json({ mensagem: 'Avatar atualizado com sucesso!' });
    });
});

module.exports = router;
