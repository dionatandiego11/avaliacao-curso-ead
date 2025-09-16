// routes/admin.js

const express = require('express');
const router = express.Router();
const { dbGet, dbAll, dbRun } = require('../db');

// Configuração de Autenticação (SIMPLES - APENAS PARA EXEMPLO!)
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'ead123'; // NÃO USAR EM PRODUÇÃO!

// Middleware de autenticação
const requireAuth = (req, res, next) => {
    if (req.session && req.session.isAdmin) {
        next();
    } else {
        res.redirect('/admin/login?message=Faça login para acessar o painel administrativo.');
    }
};

// Login (GET)
router.get('/login', (req, res) => {
    const message = req.query.message || '';
    res.render('admin/admin-login', { message });
});

// Login (POST)
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        req.session.isAdmin = true;
        res.redirect('/admin?message=Login realizado com sucesso!');
    } else {
        res.redirect('/admin/login?message=Usuário ou senha inválidos.');
    }
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Erro ao encerrar sessão:', err);
            return res.status(500).send('Erro ao fazer logout.');
        }
        res.redirect('/admin/login?message=Você foi desconectado.');
    });
});

// Middleware: exige autenticação para as rotas abaixo
router.use(requireAuth);

// Painel Administrativo (Dashboard)
router.get('/', async (req, res) => {
    try {
        const totalRow = await dbGet(`SELECT COUNT(*) AS total FROM avaliacoes`);
        const mediaConteudoRow = await dbGet(`SELECT ROUND(AVG(conteudo), 1) as media_conteudo FROM avaliacoes`);
        const mediaProfessoresRow = await dbGet(`SELECT ROUND(AVG(professores), 1) as media_professores FROM avaliacoes`);
        const totalRecomendacoesRow = await dbGet(`SELECT COUNT(*) AS total_recomendacoes FROM avaliacoes WHERE experiencia >= 4`);

        const totalAvaliacoes = totalRow?.total || 0;
        const percentRecomenda = totalAvaliacoes > 0
            ? ((totalRecomendacoesRow.total_recomendacoes / totalAvaliacoes) * 100).toFixed(1)
            : 0;

        const message = req.query.message || '';
        res.render('admin/admin', {
            total_avaliacoes: totalAvaliacoes,
            media_conteudo: mediaConteudoRow?.media_conteudo ?? 'N/A',
            media_professores: mediaProfessoresRow?.media_professores ?? 'N/A',
            percent_recomenda: percentRecomenda,
            message
        });
    } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
        res.status(500).send('Erro interno no servidor.');
    }
});

// --- Gerenciar Instituições ---
router.get('/instituicoes', async (req, res) => {
    try {
        const instituicoes = await dbAll('SELECT id, nome, tipo FROM instituicoes ORDER BY nome');
        const message = req.query.message || '';
        const editId = req.query.edit_id;
        const editInstituicao = editId
            ? await dbGet('SELECT id, nome, tipo FROM instituicoes WHERE id = ?', [editId])
            : null;

        res.render('admin/admin-instituicoes', { instituicoes, message, editInstituicao });
    } catch (error) {
        console.error('Erro ao carregar instituições:', error);
        res.status(500).send('Erro ao carregar lista de instituições.');
    }
});

router.post('/instituicoes/add', async (req, res) => {
    const { nome, tipo } = req.body;
    if (!nome || !tipo || nome.trim() === '' || tipo.trim() === '') {
        return res.redirect('/admin/instituicoes?message=O nome e o tipo da instituição são obrigatórios.&error=true');
    }
    try {
        await dbRun(`INSERT INTO instituicoes (nome, tipo) VALUES (?, ?)`, [nome.trim(), tipo.trim()]);
        res.redirect('/admin/instituicoes?message=Instituição adicionada com sucesso!');
    } catch (error) {
        console.error('Erro ao adicionar instituição:', error);
        const msg = error.message.includes('UNIQUE constraint failed')
            ? 'Instituição já existe.'
            : 'Erro ao adicionar instituição.';
        res.redirect(`/admin/instituicoes?message=${msg}&error=true`);
    }
});

router.get('/instituicoes/edit/:id', (req, res) => {
    res.redirect(`/admin/instituicoes?edit_id=${req.params.id}`);
});

router.post('/instituicoes/edit/:id', async (req, res) => {
    const { nome, tipo } = req.body;
    const { id } = req.params;
    if (!nome || !tipo || nome.trim() === '' || tipo.trim() === '') {
        return res.redirect(`/admin/instituicoes?message=O nome e o tipo da instituição são obrigatórios.&error=true&edit_id=${id}`);
    }
    try {
        await dbRun(`UPDATE instituicoes SET nome = ?, tipo = ? WHERE id = ?`, [nome.trim(), tipo.trim(), id]);
        res.redirect('/admin/instituicoes?message=Instituição atualizada com sucesso!');
    } catch (error) {
        console.error('Erro ao atualizar instituição:', error);
        const msg = error.message.includes('UNIQUE constraint failed')
            ? 'Instituição já existe.'
            : 'Erro ao atualizar instituição.';
        res.redirect(`/admin/instituicoes?message=${msg}&error=true&edit_id=${id}`);
    }
});

router.post('/instituicoes/delete/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const checkEvaluations = await dbGet('SELECT COUNT(*) AS total FROM avaliacoes WHERE instituicao_id = ?', [id]);
        if (checkEvaluations.total > 0) {
            return res.redirect('/admin/instituicoes?message=Não é possível remover a instituição: existem avaliações associadas.&error=true');
        }
        const checkUsers = await dbGet('SELECT COUNT(*) AS total FROM users WHERE instituicao_id = ?', [id]);
        if (checkUsers.total > 0) {
            return res.redirect('/admin/instituicoes?message=Não é possível remover a instituição: existem usuários registrados nela.&error=true');
        }

        await dbRun(`DELETE FROM instituicoes WHERE id = ?`, [id]);
        res.redirect('/admin/instituicoes?message=Instituição removida com sucesso!');
    } catch (error) {
        console.error('Erro ao remover instituição:', error);
        res.redirect('/admin/instituicoes?message=Erro ao remover instituição.&error=true');
    }
});

// --- Gerenciar Cursos ---
router.get('/cursos', async (req, res) => {
    try {
        const cursos = await dbAll('SELECT id, nome, area FROM cursos ORDER BY nome');
        const message = req.query.message || '';
        const editId = req.query.edit_id;
        const editCurso = editId
            ? await dbGet('SELECT id, nome, area FROM cursos WHERE id = ?', [editId])
            : null;

        res.render('admin/admin-cursos', { cursos, message, editCurso });
    } catch (error) {
        console.error('Erro ao carregar cursos:', error);
        res.status(500).send('Erro ao carregar lista de cursos.');
    }
});

router.post('/cursos/add', async (req, res) => {
    const { nome, area } = req.body;
    if (!nome || !area || nome.trim() === '' || area.trim() === '') {
        return res.redirect('/admin/cursos?message=O nome e a área do curso são obrigatórios.&error=true');
    }
    try {
        await dbRun(`INSERT INTO cursos (nome, area) VALUES (?, ?)`, [nome.trim(), area.trim()]);
        res.redirect('/admin/cursos?message=Curso adicionado com sucesso!');
    } catch (error) {
        console.error('Erro ao adicionar curso:', error);
        const msg = error.message.includes('UNIQUE constraint failed')
            ? 'Curso já existe.'
            : 'Erro ao adicionar curso.';
        res.redirect(`/admin/cursos?message=${msg}&error=true`);
    }
});

// --- Gerenciar Avaliações ---
router.get('/avaliacoes', async (req, res) => {
    try {
        const avaliacoes = await dbAll(`
            SELECT
                a.id,
                u.name as user_name,
                i.nome as instituicao_nome,
                c.nome as curso_nome,
                a.comentario,
                strftime('%d/%m/%Y', a.data) as data_formatada
            FROM avaliacoes a
            LEFT JOIN users u ON a.user_id = u.id
            LEFT JOIN instituicoes i ON a.instituicao_id = i.id
            LEFT JOIN cursos c ON a.curso_id = c.id
            ORDER BY a.data DESC
        `);
        const message = req.query.message || '';
        res.render('admin/admin-avaliacoes', { avaliacoes, message });
    } catch (error) {
        console.error('Erro ao carregar avaliações:', error);
        res.status(500).send('Erro ao carregar lista de avaliações.');
    }
});

router.post('/avaliacoes/delete/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await dbRun(`DELETE FROM avaliacoes WHERE id = ?`, [id]);
        res.redirect('/admin/avaliacoes?message=Avaliação removida com sucesso!');
    } catch (error) {
        console.error('Erro ao remover avaliação:', error);
        res.redirect('/admin/avaliacoes?message=Erro ao remover avaliação.&error=true');
    }
});

// Exportar o roteador
module.exports = router;
