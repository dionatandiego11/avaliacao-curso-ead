const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Configuração do Banco de Dados ---
const db = new sqlite3.Database('database.db', (err) => {
    if (err) {
        console.error('Erro ao abrir o banco de dados:', err.message);
        process.exit(1);
    } else {
        console.log('Conectado ao banco de dados SQLite.');
        initializeDb();
    }
});

// Função para inicializar o banco de dados
function initializeDb() {
    db.serialize(() => {
        // Tabela de instituições
        db.run(`CREATE TABLE IF NOT EXISTS instituicoes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL UNIQUE,
            tipo TEXT CHECK(tipo IN ('publica', 'privada'))
        )`, (err) => {
            if (err) console.error("Erro ao criar/modificar tabela 'instituicoes':", err.message);
            else console.log("Tabela 'instituicoes' verificada/modificada.");
        });

        // Tabela de cursos
        db.run(`CREATE TABLE IF NOT EXISTS cursos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            instituicao_id INTEGER,
            FOREIGN KEY (instituicao_id) REFERENCES instituicoes(id)
        )`, (err) => {
            if (err) console.error("Erro ao criar/modificar tabela 'cursos':", err.message);
            else console.log("Tabela 'cursos' verificada/modificada.");
        });

        // Tabela de avaliações (agora com IDs de instituições e cursos)
        db.run(`CREATE TABLE IF NOT EXISTS avaliacoes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ra TEXT,
            instituicao_id INTEGER NOT NULL,
            curso_id INTEGER NOT NULL,
            polo TEXT,
            cidade TEXT,
            conteudo INTEGER CHECK(conteudo >= 1 AND conteudo <= 5),
            professores INTEGER CHECK(professores >= 1 AND professores <= 5),
            apoio INTEGER CHECK(apoio >= 1 AND apoio <= 5),
            estrutura INTEGER CHECK(estrutura >= 1 AND estrutura <= 5),
            material INTEGER CHECK(material >= 1 AND material <= 5),
            experiencia INTEGER CHECK(experiencia >= 1 AND experiencia <= 5),
            comentario TEXT,
            data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (instituicao_id) REFERENCES instituicoes(id),
            FOREIGN KEY (curso_id) REFERENCES cursos(id)
        )`, (err) => {
            if (err) console.error("Erro ao criar/modificar tabela 'avaliacoes':", err.message);
            else console.log("Tabela 'avaliacoes' verificada/modificada.");
        });

        // Tabela de usuários
        db.run(`CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            ra TEXT NOT NULL UNIQUE,
            senha TEXT NOT NULL,
            universidade TEXT,
            curso TEXT,
            polo TEXT,
            cidade TEXT
        )`, (err) => {
            if (err) console.error("Erro ao criar tabela 'usuarios':", err.message);
            else console.log("Tabela 'usuarios' verificada/criada.");
        });
    });
}

// Funções auxiliares para async/await
const dbGet = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
};

const dbAll = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

const dbRun = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
};

const saltRounds = 10; // For bcrypt

async function hashPassword(password) {
    return await bcrypt.hash(password, saltRounds);
}

async function comparePassword(password, hash) {
    return await bcrypt.compare(password, hash);
}

// --- Middlewares ---
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// Certifique-se de que a pasta 'views' está no mesmo nível que 'server.js'
app.use(express.static(path.join(__dirname, 'public'))); 

// --- Session Configuration ---
app.use(session({
    store: new SQLiteStore({
        db: 'database.db', // Use the same database file
        dir: '.', // Directory to store session db file, if different
        table: 'sessions' // Name of the session table
    }),
    secret: 'a_very_secure_secret_key_replace_me', // Replace with a strong secret
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 } // 1 week
}));

// --- Rotas ---

// Rota para a página inicial (home) - atualizada para preencher o ranking
app.get('/', (req, res) => {
  db.all(`
    SELECT T1.nome as curso, T2.nome as instituicao,
          ROUND(AVG((conteudo + professores + apoio + estrutura + material + experiencia)/6.0), 1) as media,
          COUNT(*) as total
    FROM avaliacoes
    INNER JOIN cursos AS T1 ON avaliacoes.curso_id = T1.id
    INNER JOIN instituicoes AS T2 ON avaliacoes.instituicao_id = T2.id
    GROUP BY curso, instituicao
    ORDER BY media DESC
    LIMIT 3
  `, (err, rows) => {
    if (err) {
      console.error('Erro ao buscar ranking:', err.message);
      return res.status(500).send('Erro ao carregar o ranking.');
    }

    let html = fs.readFileSync(path.join(__dirname, 'views', 'home.html'), 'utf-8');

    const blocos = rows.map(row => `
      <div class="flex items-center bg-white text-gray-800 p-3 rounded shadow justify-between">
        <div class="flex items-center gap-3">
          <div class="bg-yellow-400 text-white font-bold px-3 py-1 rounded-full">⭐ ${row.media}</div>
          <div>
            <p class="font-semibold">${row.curso} - ${row.instituicao}</p>
            <p class="text-sm text-gray-500">${row.total} avaliações recentes</p>
          </div>
        </div>
      </div>
    `).join('\n');

    html = html.replace('{{ranking}}', blocos);
    res.send(html);
  });
});

// Rota para a página Artigos
app.get('/artigos', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'artigos.html'));
});

// Rota para a página Entrar
app.get('/entrar', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'entrar.html'));
});

// Rota para a página Para Instituições
app.get('/para-instituicoes', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'para_instituicoes.html'));
});

// Rota atualizada para /avaliar
app.get('/avaliar', async (req, res) => {
    if (!req.session.userId) {
        // Optional: add a query param to show a message on the login page
        // return res.redirect('/entrar?message=login_required_for_avaliar');
        return res.redirect('/entrar');
    }

    try {
        // These are no longer strictly needed for the main dropdowns as they are dynamic,
        // but keeping them doesn't harm and might be useful if parts of the page still use them
        // or for fallback if JS is disabled (though current setup is JS-heavy).
        const instituicoes = await dbAll('SELECT id, nome FROM instituicoes ORDER BY nome');
        const cursos = await dbAll('SELECT id, nome FROM cursos ORDER BY nome');
        
        let html = fs.readFileSync(path.join(__dirname, 'views', 'avaliar.html'), 'utf-8');

        const instOptions = instituicoes.map(i => 
            `<option value="${i.id}">${i.nome}</option>`
        ).join('\n');
        
        const cursoOptions = cursos.map(c => 
            `<option value="${c.id}">${c.nome}</option>`
        ).join('\n');

        html = html
            .replace('{{instituicoes}}', instOptions) // This placeholder might be unused now
            .replace('{{cursos}}', cursoOptions);     // This placeholder might be unused now
        
        // Pass user's R.A. to the page using a simple, unique placeholder
        // Ensure this placeholder is unique and won't conflict with others.
        const userRaPlaceholder = "<!-- USER_RA_PLACEHOLDER -->";
        if (html.includes(userRaPlaceholder)) {
             html = html.replace(userRaPlaceholder, `<script>const loggedInUserRA = "${req.session.ra}";</script>`);
        } else {
            // Fallback: inject script at the end of head or start of body if placeholder not found
            // For simplicity, we expect the placeholder to be added to avalia.html manually for this step
            // Or, more robustly, find a tag like </head> and insert before it.
            // For now, we rely on the placeholder.
             console.warn("USER_RA_PLACEHOLDER not found in avalia.html. RA will not be pre-filled.");
        }

        res.send(html);
        
    } catch (error) {
        console.error('Erro ao carregar página de avaliação:', error);
        res.status(500).send('Erro ao carregar a página de avaliação.');
    }
});

app.get('/obrigado', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'obrigado.html'));
});

app.post('/api/registrar', async (req, res) => {
    const { nome, ra, senha, universidade, curso, polo, cidade } = req.body;

    if (!nome || !ra || !senha) {
        return res.status(400).json({ message: 'Nome, R.A. e Senha são obrigatórios.' });
    }

    try {
        // Check if RA already exists
        const existingUser = await dbGet('SELECT id FROM usuarios WHERE ra = ?', [ra]);
        if (existingUser) {
            return res.status(409).json({ message: 'R.A. já cadastrado.' });
        }

        const hashedPassword = await hashPassword(senha);
        const sql = `INSERT INTO usuarios (nome, ra, senha, universidade, curso, polo, cidade)
                     VALUES (?, ?, ?, ?, ?, ?, ?)`;
        const result = await dbRun(sql, [nome, ra, hashedPassword, universidade, curso, polo, cidade]);

        // Automatically log in the user after registration
        req.session.userId = result.lastID;
        req.session.ra = ra;

        res.status(201).json({ message: 'Usuário registrado com sucesso!', userId: result.lastID, ra: ra });

    } catch (error) {
        console.error('Erro ao registrar usuário:', error);
        res.status(500).json({ message: 'Erro interno ao registrar usuário.' });
    }
});

app.post('/api/login', async (req, res) => {
    const { ra, senha } = req.body;

    if (!ra || !senha) {
        return res.status(400).json({ message: 'R.A. e Senha são obrigatórios.' });
    }

    try {
        const user = await dbGet('SELECT * FROM usuarios WHERE ra = ?', [ra]);
        if (!user) {
            return res.status(401).json({ message: 'R.A. ou Senha inválidos.' });
        }

        const match = await comparePassword(senha, user.senha);
        if (match) {
            req.session.userId = user.id;
            req.session.ra = user.ra;
            res.status(200).json({ message: 'Login bem-sucedido!', userId: user.id, ra: user.ra });
        } else {
            return res.status(401).json({ message: 'R.A. ou Senha inválidos.' });
        }
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        res.status(500).json({ message: 'Erro interno ao fazer login.' });
    }
});

app.get('/api/instituicoes/:tipo', async (req, res) => {
    const { tipo } = req.params;
    if (tipo !== 'publica' && tipo !== 'privada') {
        return res.status(400).json({ error: "Tipo inválido. Use 'publica' or 'privada'." });
    }
    try {
        const instituicoes = await dbAll('SELECT id, nome FROM instituicoes WHERE tipo = ? ORDER BY nome', [tipo]);
        res.json(instituicoes);
    } catch (error) {
        console.error('Erro ao buscar instituições por tipo:', error);
        res.status(500).json({ error: 'Erro ao buscar instituições.' });
    }
});

app.get('/api/cursos/instituicao/:instituicao_id', async (req, res) => {
    const { instituicao_id } = req.params;
    try {
        // Fetch courses directly linked to the institution_id
        const cursos = await dbAll('SELECT id, nome FROM cursos WHERE instituicao_id = ? ORDER BY nome', [instituicao_id]);
        if (!cursos) { // Should check if cursos array is empty or if it's null/undefined
            return res.status(404).json({ message: 'Nenhum curso encontrado para esta instituição ou instituição inválida.' });
        }
        res.json(cursos);
    } catch (error) {
        console.error('Erro ao buscar cursos por instituição:', error);
        res.status(500).json({ error: 'Erro ao buscar cursos.' });
    }
});

app.get('/api/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Erro ao fazer logout:', err);
            return res.status(500).json({ message: 'Erro interno ao fazer logout.' });
        }
        res.clearCookie('connect.sid');
        res.status(200).json({ message: 'Logout bem-sucedido.' });
    });
});

// API para instituições
app.get('/api/instituicoes', async (req, res) => {
    try {
        const instituicoes = await dbAll('SELECT id, nome FROM instituicoes ORDER BY nome');
        res.json(instituicoes);
    } catch (error) {
        console.error('Erro ao buscar instituições:', error);
        res.status(500).json({ error: 'Erro ao buscar instituições.' });
    }
});

// API para cursos
app.get('/api/cursos', async (req, res) => {
    try {
        const cursos = await dbAll('SELECT id, nome FROM cursos ORDER BY nome');
        res.json(cursos);
    } catch (error) {
        console.error('Erro ao buscar cursos:', error);
        res.status(500).json({ error: 'Erro ao buscar cursos.' });
    }
});

// Adicionar nova instituição (Admin)
app.post('/admin/instituicao', async (req, res) => {
    const { nome, tipo } = req.body;
    if (!nome || nome.trim() === '') {
        return res.status(400).send('O nome da instituição é obrigatório.');
    }
    if (!tipo || (tipo !== 'publica' && tipo !== 'privada')) {
        return res.status(400).send('O tipo da instituição (publica/privada) é obrigatório.');
    }
    try {
        await dbRun(`INSERT INTO instituicoes (nome, tipo) VALUES (?, ?)`, [nome.trim(), tipo]);
        res.redirect('/admin?message=Instituição adicionada com sucesso!');
    } catch (error) {
        console.error('Erro ao adicionar instituição:', error);
        if (error.message.includes('UNIQUE constraint failed')) {
            return res.status(409).send('Instituição já existe.');
        }
        res.status(500).send('Erro ao adicionar instituição.');
    }
});

// Adicionar novo curso (Admin)
app.post('/admin/curso', async (req, res) => {
    const { nome, instituicao_id } = req.body;
    if (!nome || nome.trim() === '') {
        return res.status(400).send('O nome do curso é obrigatório.');
    }
    if (!instituicao_id) {
        return res.status(400).send('A instituição do curso é obrigatória.');
    }
    try {
        await dbRun(`INSERT INTO cursos (nome, instituicao_id) VALUES (?, ?)`, [nome.trim(), parseInt(instituicao_id)]);
        res.redirect('/admin?message=Curso adicionado com sucesso!');
    } catch (error) {
        console.error('Erro ao adicionar curso:', error);
        if (error.message.includes('UNIQUE constraint failed')) {
            return res.status(409).send('Curso já existe.');
        }
        res.status(500).send('Erro ao adicionar curso.');
    }
});

// Submeter avaliação
app.post('/api/avaliar', async (req, res) => {
    const {
        ra, 
        instituicao_id, // Agora recebemos o ID
        curso_id,       // Agora recebemos o ID
        polo,           // Added
        cidade,         // Added
        conteudo, 
        professores,
        apoio, 
        estrutura, 
        material, 
        experiencia, 
        comentario
    } = req.body;

    // Validação básica
    if (!instituicao_id || !curso_id || !conteudo || !professores || !apoio || !estrutura || !material || !experiencia) {
        return res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos.' });
    }

    // Validar notas
    const ratings = { conteudo, professores, apoio, estrutura, material, experiencia };
    for (const key in ratings) {
        const ratingValue = parseInt(ratings[key], 10);
        if (isNaN(ratingValue)) {
            return res.status(400).json({ error: `Valor inválido para '${key}': não é um número.` });
        }
        if (ratingValue < 1 || ratingValue > 5) {
            return res.status(400).json({ error: `A nota '${key}' deve estar entre 1 e 5.` });
        }
    }

    const sql = `INSERT INTO avaliacoes (
        ra, instituicao_id, curso_id, polo, cidade, conteudo, professores,
        apoio, estrutura, material, experiencia, comentario
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`; // Added two placeholders

    try {
        await dbRun(sql, [
            ra || null,
            parseInt(instituicao_id),
            parseInt(curso_id),
            polo || null,             // Added
            cidade || null,           // Added
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
        res.status(500).json({ error: 'Erro ao submeter avaliação.' });
    }
});

// Página de administração
app.get('/admin', async (req, res) => {
    try {
        // Estatísticas básicas
        const totalRow = await dbGet(`SELECT COUNT(*) AS total FROM avaliacoes`);
        const mediaConteudoRow = await dbGet(`SELECT ROUND(AVG(conteudo), 1) as media_conteudo FROM avaliacoes`);
        const mediaProfessoresRow = await dbGet(`SELECT ROUND(AVG(professores), 1) as media_professores FROM avaliacoes`);
        
        // Calcular % de recomendações (experiencia 4 ou 5)
        const totalRecomendacoesRow = await dbGet(`SELECT COUNT(*) AS total_recomendacoes FROM avaliacoes WHERE experiencia >= 4`);
        const totalAvaliacoesParaRecomendacao = totalRow ? totalRow.total : 0;
        let percentRecomenda = 0;
        if (totalAvaliacoesParaRecomendacao > 0) {
            percentRecomenda = ((totalRecomendacoesRow.total_recomendacoes / totalAvaliacoesParaRecomendacao) * 100).toFixed(1);
        }

        // Últimas 10 avaliações (agora com JOINs para nomes)
        const avaliacoesRecentes = await dbAll(`
            SELECT 
                a.id, a.ra, i.nome as instituicao_nome, c.nome as curso_nome, a.polo, a.cidade,
                a.conteudo, a.professores, a.apoio, a.estrutura, a.material, a.experiencia,
                a.comentario, 
                strftime('%d/%m/%Y %H:%M', a.data) as data_formatada
            FROM avaliacoes a
            LEFT JOIN instituicoes i ON a.instituicao_id = i.id
            LEFT JOIN cursos c ON a.curso_id = c.id
            ORDER BY a.data DESC
            LIMIT 10
        `);
        
        // Dados para dropdowns
        const todasInstituicoes = await dbAll('SELECT id, nome FROM instituicoes ORDER BY nome');
        const todosCursos = await dbAll('SELECT id, nome FROM cursos ORDER BY nome');

        // Carregar template HTML
        fs.readFile(path.join(__dirname, 'views', 'admin.html'), 'utf-8', (err, htmlTemplate) => {
            if (err) {
                console.error("Erro ao ler admin.html:", err);
                return res.status(500).send('Erro ao carregar a página de administração.');
            }

            // Substituir placeholders
            let htmlOutput = htmlTemplate
                .replace('{{total_avaliacoes}}', totalRow ? totalRow.total : '0')
                .replace('{{media_conteudo}}', mediaConteudoRow?.media_conteudo ?? 'N/A')
                .replace('{{media_professores}}', mediaProfessoresRow?.media_professores ?? 'N/A')
                .replace('{{percent_recomenda}}', percentRecomenda);

            // Lista de avaliações recentes
            let avaliacoesHtmlList = '<p class="text-gray-600">Nenhuma avaliação recente.</p>';
            if (avaliacoesRecentes?.length > 0) {
                avaliacoesHtmlList = '<ul class="space-y-4">';
                avaliacoesRecentes.forEach(av => {
                    avaliacoesHtmlList += `
                        <li class="bg-gray-50 p-4 rounded-md shadow-sm">
                            <p class="text-sm text-gray-700">
                                <strong>RA:</strong> ${av.ra || 'N/A'} | 
                                <strong>Inst:</strong> ${av.instituicao_nome || 'N/A'} | 
                                <strong>Curso:</strong> ${av.curso_nome || 'N/A'} |
                                <strong>Polo:</strong> ${av.polo || 'N/A'} |
                                <strong>Cidade:</strong> ${av.cidade || 'N/A'} |
                                <strong>Data:</strong> ${av.data_formatada}
                            </p>
                            <p class="text-sm text-gray-700 mt-2">
                                <strong>Notas:</strong> 
                                Conteúdo: ${av.conteudo}, 
                                Professores: ${av.professores}, 
                                Apoio: ${av.apoio}, 
                                Estrutura: ${av.estrutura}, 
                                Material: ${av.material}, 
                                Experiência: ${av.experiencia}
                            </p>
                            <p class="text-sm text-gray-700 mt-2">
                                <strong>Comentário:</strong> ${av.comentario || 'Nenhum'}
                            </p>
                        </li>`;
                });
                avaliacoesHtmlList += '</ul>';
            }
            htmlOutput = htmlOutput.replace('{{avaliacoes_recentes_placeholder}}', avaliacoesHtmlList);
            
            // Options para dropdowns
            let instituicoesOptions = '<option value="">Selecione uma Instituição</option>';
            todasInstituicoes.forEach(inst => {
                instituicoesOptions += `<option value="${inst.id}">${inst.nome}</option>`;
            });
            htmlOutput = htmlOutput.replace('{{instituicoes_options_placeholder}}', instituicoesOptions);

            let cursosOptions = '<option value="">Selecione um Curso</option>';
            todosCursos.forEach(cur => {
                cursosOptions += `<option value="${cur.id}">${cur.nome}</option>`;
            });
            htmlOutput = htmlOutput.replace('{{cursos_options_placeholder}}', cursosOptions);
            
            // Mensagem de feedback
            const feedbackMessage = req.query.message || '';
            htmlOutput = htmlOutput.replace(
                '{{admin_message_placeholder}}', 
                feedbackMessage ? `<div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
                                        <strong class="font-bold">Sucesso!</strong>
                                        <span class="block sm:inline">${feedbackMessage}</span>
                                       </div>` : ''
            );

            res.send(htmlOutput);
        });

    } catch (error) {
        console.error('Erro ao carregar página de administração:', error);
        res.status(500).send('Erro interno no servidor ao carregar a página de administração.');
    }
});

// --- Inicialização do Servidor ---
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
    console.log('Verifique os logs acima para o status da criação/verificação das tabelas.');
    console.log(`Página principal: http://localhost:${PORT}/`);
    console.log(`Página de avaliação: http://localhost:${PORT}/avaliar`);
    console.log(`Página de admin: http://localhost:${PORT}/admin`);
});

// --- Encerramento Gracioso ---
process.on('SIGINT', () => {
    console.log('\nEncerrando o servidor...');
    db.close((err) => {
        if (err) {
            console.error('Erro ao fechar o banco de dados:', err.message);
            process.exit(1);
        }
        console.log('Conexão com o banco de dados fechada.');
        process.exit(0);
    });
});

