// routes/index.js
const express = require('express');
const router = express.Router();
const { dbAll, dbGet } = require('../db');

// Middleware para verificar login do usuário para rotas específicas
const requireUserAuth = (req, res, next) => {
    if (req.session && req.session.userId) {
        next();
    } else {
        res.redirect('/login?message=Você precisa estar logado para acessar esta página.&error=true');
    }
};

// Página inicial (home)
router.get('/', async (req, res) => {
    try {
        const ranking = await dbAll(`
            SELECT T1.nome as curso, T2.nome as instituicao,
                   ROUND(AVG((conteudo + professores + apoio + estrutura + material + experiencia)/6.0), 1) as media,
                   COUNT(*) as total
            FROM avaliacoes
            INNER JOIN cursos AS T1 ON avaliacoes.curso_id = T1.id
            INNER JOIN instituicoes AS T2 ON avaliacoes.instituicao_id = T2.id
            GROUP BY curso, instituicao
            ORDER BY media DESC
            LIMIT 3
        `);

        res.render('home', { ranking, username: req.session.username || null });
    } catch (err) {
        console.error('Erro ao buscar ranking:', err.message);
        res.status(500).send('Erro ao carregar o ranking.');
    }
});

// Página de avaliação — requer login e pode carregar dados para edição
router.get('/avaliar', requireUserAuth, async (req, res) => {
    try {
        const message = req.query.message || '';
        const isError = req.query.error === 'true';
        const editEvaluationId = req.query.edit_id;

        const userInstitution = await dbGet('SELECT nome FROM instituicoes WHERE id = ?', [req.session.instituicao_id]);
        const userCourse = await dbGet('SELECT nome FROM cursos WHERE id = ?', [req.session.curso_id]);

        let evaluationToEdit = null;
        if (editEvaluationId) {
            evaluationToEdit = await dbGet(
                'SELECT * FROM avaliacoes WHERE id = ? AND user_id = ?',
                [editEvaluationId, req.session.userId]
            );

            if (!evaluationToEdit) {
                return res.redirect('/avaliar?error=true&message=Avaliação não encontrada ou você não tem permissão para editá-la.');
            }
        }

        res.render('avaliar', {
            message,
            isError,
            username: req.session.username,
            ra: req.session.ra,
            instituicao_nome: userInstitution ? userInstitution.nome : 'Instituição não encontrada',
            curso_nome: userCourse ? userCourse.nome : 'Curso não encontrado',
            userId: req.session.userId,
            evaluationToEdit
        });

    } catch (error) {
        console.error('Erro ao carregar página de avaliação:', error);
        res.status(500).send('Erro ao carregar a página de avaliação.');
    }
});

// Página de agradecimento
router.get('/obrigado', (req, res) => {
    res.render('obrigado', { username: req.session.username || null });
});

// Busca por cursos ou instituições
router.get('/search', async (req, res) => {
    const query = req.query.q;
    const type = req.query.type;

    let results = [];
    let title = `Resultados da Busca para "${query}"`;
    let isError = false;
    let message = '';

    try {
        if (query) {
            if (type === 'curso') {
                results = await dbAll(`
                    SELECT c.nome as curso_nome, i.nome as instituicao_nome,
                           ROUND(AVG((a.conteudo + a.professores + a.apoio + a.estrutura + a.material + a.experiencia)/6.0), 1) as media,
                           'curso_instituicao' as result_type
                    FROM avaliacoes a
                    JOIN cursos c ON a.curso_id = c.id
                    JOIN instituicoes i ON a.instituicao_id = i.id
                    WHERE c.nome LIKE ?
                    GROUP BY c.id, i.id
                    ORDER BY media DESC
                `, [`%${query}%`]);
                title = `Cursos buscando por "${query}"`;
            } else if (type === 'instituicao') {
                results = await dbAll(`
                    SELECT c.nome as curso_nome, i.nome as instituicao_nome,
                           ROUND(AVG((a.conteudo + a.professores + a.apoio + a.estrutura + a.material + a.experiencia)/6.0), 1) as media,
                           'curso_instituicao' as result_type
                    FROM avaliacoes a
                    JOIN cursos c ON a.curso_id = c.id
                    JOIN instituicoes i ON a.instituicao_id = i.id
                    WHERE i.nome LIKE ?
                    GROUP BY c.id, i.id
                    ORDER BY media DESC
                `, [`%${query}%`]);
                title = `Instituições buscando por "${query}"`;
            } else {
                const courses = await dbAll(`
                    SELECT c.nome as nome, 'Curso' as tipo,
                           ROUND(AVG((a.conteudo + a.professores + a.apoio + a.estrutura + a.material + a.experiencia)/6.0), 1) as media
                    FROM avaliacoes a
                    JOIN cursos c ON a.curso_id = c.id
                    WHERE c.nome LIKE ?
                    GROUP BY c.id
                    ORDER BY media DESC
                `, [`%${query}%`]);

                const institutions = await dbAll(`
                    SELECT i.nome as nome, 'Instituição' as tipo,
                           ROUND(AVG((a.conteudo + a.professores + a.apoio + a.estrutura + a.material + a.experiencia)/6.0), 1) as media
                    FROM avaliacoes a
                    JOIN instituicoes i ON a.instituicao_id = i.id
                    WHERE i.nome LIKE ?
                    GROUP BY i.id
                    ORDER BY media DESC
                `, [`%${query}%`]);

                results = [...courses, ...institutions].sort((a, b) => b.media - a.media);
                title = `Resultados da Busca para "${query}"`;
            }
        } else {
            message = 'Por favor, insira um termo de busca.';
            isError = true;
        }
    } catch (error) {
        console.error('Erro na busca:', error);
        message = 'Erro ao realizar a busca.';
        isError = true;
    }

    res.render('search-results', {
        query,
        results,
        title,
        username: req.session.username || null,
        message,
        isError
    });
});

// Página "Minhas Avaliações"
router.get('/my-evaluations', requireUserAuth, async (req, res) => {
    try {
        res.render('my-evaluations', {
            username: req.session.username,
            message: req.query.message || '',
            isError: req.query.error === 'true'
        });
    } catch (error) {
        console.error('Erro ao carregar página "Minhas Avaliações":', error);
        res.status(500).send('Erro ao carregar a página de minhas avaliações.');
    }
});

module.exports = router;
