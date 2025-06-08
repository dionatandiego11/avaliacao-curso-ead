// routes/api.js
const express = require('express');
const router = express.Router();
const { dbAll, dbRun, dbGet } = require('../db');

// Middleware para verificar login do usuário (para ações que exigem)
const requireUserAuth = (req, res, next) => {
    if (req.session && req.session.userId) {
        next();
    } else {
        // Redireciona para a página de login com mensagem de erro
        res.redirect('/login?message=Você precisa estar logado para realizar esta ação.&error=true');
    }
};

// API para instituições (agora com filtro por tipo) - usada pelo formulário de registro
router.get('/instituicoes', async (req, res) => {
    const { type } = req.query;
    let sql = 'SELECT id, nome, tipo FROM instituicoes';
    const params = [];

    if (type) {
        sql += ' WHERE tipo = ?';
        params.push(type);
    }
    sql += ' ORDER BY nome';

    try {
        const instituicoes = await dbAll(sql, params);
        res.json(instituicoes);
    } catch (error) {
        console.error('Erro ao buscar instituições:', error);
        res.status(500).json({ error: 'Erro ao buscar instituições.' });
    }
});

// API para cursos (agora com filtro por area) - usada pelo formulário de registro
router.get('/cursos', async (req, res) => {
    const { area } = req.query; // Removido instituicao_id daqui, pois a ligação será feita pelo perfil do user no register
    let sql = 'SELECT id, nome, area FROM cursos';
    const params = [];
    const conditions = [];

    if (area) {
        conditions.push('area = ?');
        params.push(area);
    }

    if (conditions.length > 0) {
        sql += ' WHERE ' + conditions.join(' AND ');
    }
    sql += ' ORDER BY nome';

    try {
        const cursos = await dbAll(sql, params);
        res.json(cursos);
    } catch (error) {
        console.error('Erro ao buscar cursos:', error);
        res.status(500).json({ error: 'Erro ao buscar cursos.' });
    }
});

// Submeter avaliação - Agora exige que o usuário esteja logado
router.post('/avaliar', requireUserAuth, async (req, res) => {
    // Esses campos são agora inferidos da sessão do usuário, não do req.body
    const userId = req.session.userId;
    const ra = req.session.ra; // RA registrado do usuário
    const instituicao_id = req.session.instituicao_id; // Instituição registrada do usuário
    const curso_id = req.session.curso_id;       // Curso registrado do usuário

    const {
        conteudo,
        professores,
        apoio,
        estrutura,
        material,
        experiencia,
        comentario
    } = req.body;

    // Valida se o usuário tem instituição e curso registrados em seu perfil
    if (!instituicao_id || !curso_id) {
        // Isso significa que o perfil do usuário está incompleto, ele não pode avaliar.
        return res.redirect('/avaliar?error=true&message=Seu perfil de usuário está incompleto. Por favor, entre em contato com o suporte ou refaça seu registro.');
    }

    // Validação básica para as notas
    if (!conteudo || !professores || !apoio || !estrutura || !material || !experiencia) {
        return res.redirect('/avaliar?error=true&message=Todos os campos de nota são obrigatórios.');
    }

    // Validar notas
    const ratings = { conteudo, professores, apoio, estrutura, material, experiencia };
    for (const key in ratings) {
        const ratingValue = parseInt(ratings[key], 10);
        if (isNaN(ratingValue) || ratingValue < 1 || ratingValue > 5) {
            return res.redirect(`/avaliar?error=true&message=A nota '${key}' deve estar entre 1 e 5.`);
        }
    }

    const sql = `INSERT INTO avaliacoes (
        ra, instituicao_id, curso_id, user_id, conteudo, professores,
        apoio, estrutura, material, experiencia, comentario
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    try {
        await dbRun(sql, [
            ra || null, // Usa o RA registrado, ou nulo se o usuário não forneceu um
            instituicao_id,
            curso_id,
            userId,
            parseInt(conteudo),
            parseInt(professores),
            parseInt(apoio),
            parseInt(estrutura),
            parseInt(material),
            parseInt(experiencia),
            comentario || null
        ]);
        res.redirect('/obrigado');
    } catch (error) {
        console.error('Erro ao submeter avaliação:', error);
        res.redirect('/avaliar?error=true&message=Erro ao submeter avaliação. Tente novamente mais tarde.');
    }
});

// NOVO: Rota para listar avaliações do usuário logado
router.get('/my-evaluations', requireUserAuth, async (req, res) => {
    try {
        const avaliacoes = await dbAll(`
            SELECT
                a.id, a.ra, i.nome as instituicao_nome, c.nome as curso_nome,
                a.conteudo, a.professores, a.apoio, a.estrutura, a.material, a.experiencia,
                a.comentario,
                strftime('%d/%m/%Y %H:%M', a.data) as data_formatada
            FROM avaliacoes a
            LEFT JOIN instituicoes i ON a.instituicao_id = i.id
            LEFT JOIN cursos c ON a.curso_id = c.id
            WHERE a.user_id = ?
            ORDER BY a.data DESC
        `, [req.session.userId]);
        res.json(avaliacoes); // Retorna JSON para o frontend processar
    } catch (error) {
        console.error('Erro ao buscar minhas avaliações:', error);
        res.status(500).json({ error: 'Erro ao buscar minhas avaliações.' });
    }
});

// NOVO: Rota para buscar uma única avaliação (para edição)
router.get('/avaliacoes/:id', requireUserAuth, async (req, res) => {
    const { id } = req.params;
    try {
        const avaliacao = await dbGet('SELECT * FROM avaliacoes WHERE id = ? AND user_id = ?', [id, req.session.userId]);
        if (!avaliacao) {
            return res.status(404).json({ message: 'Avaliação não encontrada ou você não tem permissão para acessá-la.' });
        }
        res.json(avaliacao);
    } catch (error) {
        console.error('Erro ao buscar avaliação para edição:', error);
        res.status(500).json({ error: 'Erro ao buscar avaliação.' });
    }
});

// NOVO: Rota para deletar avaliação do usuário logado
router.delete('/avaliacoes/:id', requireUserAuth, async (req, res) => {
    const { id } = req.params;
    try {
        const result = await dbRun('DELETE FROM avaliacoes WHERE id = ? AND user_id = ?', [id, req.session.userId]);
        if (result.changes === 0) {
            return res.status(404).json({ message: 'Avaliação não encontrada ou você não tem permissão para deletá-la.' });
        }
        res.json({ message: 'Avaliação removida com sucesso!' });
    } catch (error) {
        console.error('Erro ao remover avaliação:', error);
        res.status(500).json({ error: 'Erro ao remover avaliação.' });
    }
});

// NOVO: Rota para editar avaliação do usuário logado (exemplo - pode ser PUT ou POST)
router.put('/avaliacoes/:id', requireUserAuth, async (req, res) => {
    const { id } = req.params;
    const { conteudo, professores, apoio, estrutura, material, experiencia, comentario } = req.body;

    // Validação de notas
    const ratings = { conteudo, professores, apoio, estrutura, material, experiencia };
    for (const key in ratings) {
        const ratingValue = parseInt(ratings[key], 10);
        if (isNaN(ratingValue) || ratingValue < 1 || ratingValue > 5) {
            return res.status(400).json({ message: `A nota '${key}' deve estar entre 1 e 5.` });
        }
    }

    try {
        const sql = `UPDATE avaliacoes SET
            conteudo = ?, professores = ?, apoio = ?, estrutura = ?, material = ?, experiencia = ?, comentario = ?
            WHERE id = ? AND user_id = ?`;
        const result = await dbRun(sql, [
            parseInt(conteudo), parseInt(professores), parseInt(apoio), parseInt(estrutura), parseInt(material),
            parseInt(experiencia), comentario || null, id, req.session.userId
        ]);
        if (result.changes === 0) {
            return res.status(404).json({ message: 'Avaliação não encontrada ou você não tem permissão para editá-la.' });
        }
        res.json({ message: 'Avaliação atualizada com sucesso!' });
    } catch (error) {
        console.error('Erro ao editar avaliação:', error);
        res.status(500).json({ error: 'Erro ao editar avaliação.' });
    }
});

module.exports = router;