// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { dbGet, dbRun, dbAll } = require('../db');

// Listas estáticas para Estado e Cidade
const STATES = [
  'AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MG', 'MS', 'MT', 'PA', 'PB', 'PE', 'PI', 'PR', 'RJ', 'RN',
  'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO'
];

const CITIES_BY_STATE = {
  'SP': ['São Paulo', 'Campinas', 'Ribeirão Preto', 'Santos', 'Sorocaba'],
  'RJ': ['Rio de Janeiro', 'Niterói', 'São Gonçalo', 'Duque de Caxias', 'Nova Iguaçu'],
  'MG': ['Belo Horizonte', 'Uberlândia', 'Contagem', 'Juiz de Fora', 'Montes Claros'],
  'BA': ['Salvador', 'Feira de Santana', 'Vitória da Conquista', 'Camaçari', 'Itabuna'],
  'PR': ['Curitiba', 'Londrina', 'Maringá', 'Ponta Grossa', 'Cascavel'],
  'RS': ['Porto Alegre', 'Caxias do Sul', 'Canoas', 'Pelotas', 'Santa Maria'],
  'SC': ['Florianópolis', 'Joinville', 'Blumenau', 'São José', 'Criciúma'],
  'CE': ['Fortaleza', 'Caucaia', 'Juazeiro do Norte', 'Sobral', 'Crato'],
};

// GET /register - Página de registro
router.get('/register', async (req, res) => {
  const message = req.query.message || '';
  const isError = req.query.error === 'true';

  try {
    const instituicoes = await dbAll('SELECT id, nome, tipo FROM instituicoes ORDER BY nome');
    const cursos = await dbAll('SELECT id, nome, area FROM cursos ORDER BY nome');

    res.render('register', {
      message,
      isError,
      instituicoes,
      cursos,
      states: STATES,
      citiesByState: JSON.stringify(CITIES_BY_STATE),
      username: req.session.username || null,
    });
  } catch (error) {
    console.error('Erro ao carregar dados para registro:', error);
    res.status(500).send('Erro ao carregar página de registro.');
  }
});

// POST /register - Envio de registro
router.post('/register', async (req, res) => {
  const {
    username,
    password,
    name,
    ra,
    instituicao_id,
    curso_id,
    state,
    city
  } = req.body;

  if (!username || !password || !name || !instituicao_id || !curso_id || !state || !city) {
    return res.redirect('/register?message=Todos os campos obrigatórios devem ser preenchidos.&error=true');
  }

  try {
    const existingUser = await dbGet('SELECT id FROM users WHERE username = ?', [username]);
    if (existingUser) {
      return res.redirect('/register?message=Usuário (email) já existe.&error=true');
    }

    if (ra) {
      const existingRA = await dbGet('SELECT id FROM users WHERE ra = ?', [ra]);
      if (existingRA) {
        return res.redirect('/register?message=RA já cadastrado para outro usuário.&error=true');
      }
    }

    const password_hash = await bcrypt.hash(password, 10);

    const sql = `
      INSERT INTO users (
        username, password_hash, name, ra, instituicao_id, curso_id, state, city
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await dbRun(sql, [
      username,
      password_hash,
      name,
      ra || null,
      parseInt(instituicao_id),
      parseInt(curso_id),
      state,
      city,
    ]);

    res.redirect('/login?message=Registro realizado com sucesso! Faça login.');
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    res.redirect('/register?message=Erro ao registrar usuário. Tente novamente mais tarde.&error=true');
  }
});

// GET /login - Página de login
router.get('/login', (req, res) => {
  const message = req.query.message || '';
  const isError = req.query.error === 'true';

  res.render('login', {
    message,
    isError,
    username: req.session.username || null,
  });
});

// POST /login - Envio de login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await dbGet('SELECT * FROM users WHERE username = ?', [username]);

    if (user && await bcrypt.compare(password, user.password_hash)) {
      req.session.userId = user.id;
      req.session.username = user.username;
      req.session.name = user.name;
      req.session.ra = user.ra;
      req.session.instituicao_id = user.instituicao_id;
      req.session.curso_id = user.curso_id;
      req.session.state = user.state;
      req.session.city = user.city;

      return res.redirect('/avaliar?message=Login realizado com sucesso! Agora você pode avaliar seu curso.');
    }

    res.redirect('/login?message=Usuário ou senha inválidos.&error=true');
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.redirect('/login?message=Erro ao fazer login. Tente novamente mais tarde.&error=true');
  }
});

// GET /logout - Logout
router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Erro ao encerrar sessão:', err);
      return res.status(500).send('Erro ao fazer logout.');
    }
    res.redirect('/login?message=Você foi desconectado.');
  });
});

module.exports = router;
