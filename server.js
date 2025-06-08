// server.js
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const { initializeDb, closeDb } = require('./db');

// Importar rotas
const indexRouter = require('./routes/index');
const adminRouter = require('./routes/admin');
const apiRouter = require('./routes/api');
const authRouter = require('./routes/auth'); // Rota de autenticação de usuário

const app = express();
const PORT = process.env.PORT || 3000;

// --- Configuração do Banco de Dados ---
initializeDb()
  .then(() => {
    console.log('Banco de dados inicializado com sucesso.');
  })
  .catch((err) => {
    console.error('Falha ao inicializar o banco de dados. Encerrando aplicação.', err);
    process.exit(1);
  });

// --- Middlewares ---
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Servir arquivos estáticos da pasta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Configuração do EJS como motor de templates
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Pasta base para os templates

// Configuração de sessão
app.use(session({
  secret: process.env.SESSION_SECRET || 'sua_secreta_muito_segura_aqui_e_mais_longa_para_prod',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 3600000, // 1 hora
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true
  }
}));

// --- Rotas ---
app.use('/', indexRouter);       // Rotas públicas
app.use('/admin', adminRouter);  // Rotas administrativas
app.use('/api', apiRouter);      // Rotas de API
app.use('/', authRouter);        // Login/registro/logout

// --- Inicialização do Servidor ---
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  console.log(`Página principal: http://localhost:${PORT}/`);
  console.log(`Página de avaliação: http://localhost:${PORT}/avaliar`);
  console.log(`Página de admin: http://localhost:${PORT}/admin`);
  console.log(`Página de login admin: http://localhost:${PORT}/admin/login`);
  console.log(`Página de registro: http://localhost:${PORT}/register`);
  console.log(`Página de login de usuário: http://localhost:${PORT}/login`);
});

// --- Encerramento Gracioso ---
process.on('SIGINT', async () => {
  console.log('\nEncerrando o servidor...');
  try {
    await closeDb();
    process.exit(0);
  } catch (err) {
    console.error('Erro ao fechar o banco de dados durante o encerramento:', err.message);
    process.exit(1);
  }
});
