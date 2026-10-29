const express = require('express');
const router = express.Router();
const db = require('../../database/mysql');

const produtosRouter = require('./produtos');
const slideHomeRouter = require('./slide-home');
const usuariosRouter = require('./usuarios');
const servicosRouter = require('./servicos');
const agendaRouter = require('./agenda');

router.use(produtosRouter);
router.use(slideHomeRouter);
router.use(usuariosRouter);
router.use(servicosRouter);
router.use(agendaRouter);

function executarQuery(sql, params = []) {
    return new Promise((resolve) => {
        db.query(sql, params, (err, results) => {
            if (err) {
                console.error(`Erro ao executar query [${sql.slice(0, 45).replace(/\s+/g, ' ')}...]:`, err.message);
                resolve([]);
            } else {
                resolve(results || []);
            }
        });
    });
}

router.get('/administrador', async (req, res) => {
    const querySlides = 'SELECT id, alt, ordem FROM slide_home ORDER BY ordem ASC';
    const queryUsers = 'SELECT id, nome, email, telefone, tipo_usuario, (avatar IS NOT NULL AND LENGTH(avatar) > 0) AS has_avatar FROM usuario ORDER BY id ASC';
    const queryProdutos = 'SELECT id, nome, categoria, preco, short_description, long_description FROM produto ORDER BY id ASC';
    const queryServicos = 'SELECT id, nome, duracao, preco, descricao, (imagem IS NOT NULL AND LENGTH(imagem) > 0) AS has_imagem FROM service_infos ORDER BY id ASC';
    const queryAgendamento = `
        SELECT 
            a.id,
            a.dateAgendamento,
            a.hourAgendamento,
            a.buscarResidencia,
            a.observation,
            a.endereco,
            a.nome,
            a.telefone,
            a.pendente,
            a.nomePet,
            a.fk_user,
            a.fk_service,
            u.nome AS usuario_nome,
            u.email AS usuario_email,
            u.telefone AS usuario_telefone,
            (u.avatar IS NOT NULL AND LENGTH(u.avatar) > 0) AS usuario_has_avatar,
            s.nome AS service_nome,
            s.duracao AS service_duracao,
            s.preco AS service_preco,
            s.descricao AS service_descricao
        FROM agenda a
        LEFT JOIN usuario u ON a.fk_user = u.id
        LEFT JOIN service_infos s ON a.fk_service = s.id
        ORDER BY a.dateAgendamento ASC, a.hourAgendamento ASC;
    `;

    try {
        const [slides, produtos, usuarios, rawAgendamentos, servicos] = await Promise.all([
            executarQuery(querySlides),
            executarQuery(queryProdutos),
            executarQuery(queryUsers),
            executarQuery(queryAgendamento),
            executarQuery(queryServicos)
        ]);

        const agendamentos = (rawAgendamentos || []).map(a => {
            let dateStr = '';
            if (a.dateAgendamento) {
                dateStr = String(a.dateAgendamento).split('T')[0];
            }

            let hourStr = '';
            if (a.hourAgendamento) {
                hourStr = String(a.hourAgendamento).slice(0, 5);
            }

            const agObj = {
                id: a.id,
                dateAgendamento: a.dateAgendamento,
                hourAgendamento: a.hourAgendamento,
                buscarResidencia: Boolean(a.buscarResidencia),
                observation: a.observation || '',
                endereco: a.endereco || '',
                nome: a.nome || a.usuario_nome || '',
                telefone: a.telefone || a.usuario_telefone || '',
                pendente: a.pendente,
                nomePet: a.nomePet || '',
                fk_user: a.fk_user,
                fk_service: a.fk_service
            };

            const usrObj = {
                id: a.fk_user,
                nome: a.usuario_nome || a.nome || '',
                email: a.usuario_email || '',
                telefone: a.usuario_telefone || a.telefone || '',
                avatar: a.usuario_has_avatar ? true : null
            };

            const srvObj = {
                id: a.fk_service,
                nome: a.service_nome || '',
                duracao: a.service_duracao || 0,
                preco: a.service_preco || 0,
                descricao: a.service_descricao || ''
            };

            return {
                id: a.id,
                date: dateStr,
                hour: hourStr,
                buscarResidencia: Boolean(a.buscarResidencia),
                observation: a.observation || '',
                endereco: a.endereco || '',
                pendente: a.pendente,
                nomePet: a.nomePet || '',
                nome: a.nome || a.usuario_nome || '',
                telefone: a.telefone || a.usuario_telefone || '',
                fk_service: a.fk_service,
                fk_user: a.fk_user,
                user: {
                    id: a.fk_user,
                    username: a.nome || a.usuario_nome || 'Cliente',
                    phone: a.telefone || a.usuario_telefone || '',
                    endereco: a.endereco || ''
                },
                petAgendado: {
                    name: a.nomePet || 'Pet'
                },
                service: {
                    id: a.fk_service,
                    name: a.service_nome || '',
                    nome: a.service_nome || '',
                    observations: a.observation || ''
                },
                agenda: agObj,
                usuario: usrObj,
                service_infos: srvObj
            };
        });

        return res.render('administrador', {
            slides: slides || [],
            produtos: produtos || [],
            usuarios: usuarios || [],
            agendamentos: agendamentos || [],
            servicos: servicos || []
        });
    } catch (err) {
        console.error("Erro ao renderizar painel administrador:", err);
        return res.render('administrador', {
            slides: [],
            produtos: [],
            usuarios: [],
            agendamentos: [],
            servicos: []
        });
    }
});

module.exports = router;