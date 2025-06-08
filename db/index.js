// db/index.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'database.db'); // Caminho relativo ao server.js

let db;

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

// Função para inicializar o banco de dados
async function initializeDb() {
    return new Promise((resolve, reject) => {
        db = new sqlite3.Database(DB_PATH, (err) => {
            if (err) {
                console.error('Erro ao abrir o banco de dados:', err.message);
                return reject(err);
            }
            console.log('Conectado ao banco de dados SQLite.');

            db.serialize(async () => {
                try {
                    // Tabela de instituições (garantindo coluna 'tipo')
                    await dbRun(`CREATE TABLE IF NOT EXISTS instituicoes (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        nome TEXT NOT NULL UNIQUE,
                        tipo TEXT CHECK(tipo IN ('Publica', 'Privada')) NOT NULL DEFAULT 'Privada'
                    )`);
                    // Migration: Add 'tipo' column if it doesn't exist
                    try {
                        await dbRun(`SELECT tipo FROM instituicoes LIMIT 1`);
                    } catch (e) {
                        if (e.message.includes('no such column: tipo')) {
                            await dbRun(`ALTER TABLE instituicoes ADD COLUMN tipo TEXT CHECK(tipo IN ('Publica', 'Privada')) NOT NULL DEFAULT 'Privada'`);
                            console.log("Coluna 'tipo' adicionada à tabela 'instituicoes'.");
                        }
                    }
                    console.log("Tabela 'instituicoes' verificada/criada.");

                    // Tabela de cursos (garantindo coluna 'area')
                    // ATENÇÃO: Se um curso "Engenharia de Software" pode existir em várias instituições,
                    // a coluna 'nome' não deve ser UNIQUE, e 'instituicao_id' deveria ser uma FK aqui,
                    // com UNIQUE(instituicao_id, nome). Para manter a simplicidade e a estrutura atual,
                    // assumimos que nomes de cursos são únicos globalmente por enquanto.
                    await dbRun(`CREATE TABLE IF NOT EXISTS cursos (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        nome TEXT NOT NULL UNIQUE,
                        area TEXT CHECK(area IN ('Saude', 'Humanas', 'Tecnologia', 'Exatas', 'Biologica', 'Outra')) NOT NULL DEFAULT 'Outra'
                    )`);
                    // Migration: Add 'area' column if it doesn't exist
                    try {
                        await dbRun(`SELECT area FROM cursos LIMIT 1`);
                    } catch (e) {
                        if (e.message.includes('no such column: area')) {
                            await dbRun(`ALTER TABLE cursos ADD COLUMN area TEXT CHECK(area IN ('Saude', 'Humanas', 'Tecnologia', 'Exatas', 'Biologica', 'Outra')) NOT NULL DEFAULT 'Outra'`);
                            console.log("Coluna 'area' adicionada à tabela 'cursos'.");
                        }
                    }
                    console.log("Tabela 'cursos' verificada/criada.");

                    // Tabela de usuários (ATUALIZADA COM MAIS CAMPOS DE REGISTRO)
                    await dbRun(`CREATE TABLE IF NOT EXISTS users (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        username TEXT NOT NULL UNIQUE, -- Geralmente o email
                        password_hash TEXT NOT NULL,
                        name TEXT NOT NULL,
                        ra TEXT UNIQUE, -- RA é único por usuário, pode ser nulo se não obrigatório no registro
                        instituicao_id INTEGER NOT NULL,
                        curso_id INTEGER NOT NULL,
                        state TEXT NOT NULL,
                        city TEXT NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (instituicao_id) REFERENCES instituicoes(id) ON DELETE RESTRICT,
                        FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE RESTRICT
                    )`);
                    // Migration: Add new columns if they don't exist
                    const userColumns = ['name', 'ra', 'instituicao_id', 'curso_id', 'state', 'city'];
                    for (const col of userColumns) {
                        try {
                            await dbRun(`SELECT ${col} FROM users LIMIT 1`);
                        } catch (e) {
                            if (e.message.includes(`no such column: ${col}`)) {
                                // Add columns with a temporary default or nullable
                                if (col === 'ra') {
                                    await dbRun(`ALTER TABLE users ADD COLUMN ${col} TEXT`); // RA can be nullable
                                } else {
                                    await dbRun(`ALTER TABLE users ADD COLUMN ${col} INTEGER`); // For IDs, could be TEXT for others
                                    // NOTE: For NOT NULL columns, after adding, you'd typically need to populate existing rows
                                    // before altering it to NOT NULL. For simplicity here, they are added.
                                }
                                console.log(`Coluna '${col}' adicionada à tabela 'users'.`);
                            }
                        }
                    }
                    console.log("Tabela 'users' verificada/criada.");

                    // Tabela de avaliações (permanece inalterada no schema, user_id já existia e RA, Instituição, Curso também)
                    // RA, Instituição e Curso são mantidos aqui para que a avaliação possa ser um registro independente
                    // mesmo que, na nova lógica, eles sejam *preenchidos* pelo perfil do usuário.
                    await dbRun(`CREATE TABLE IF NOT EXISTS avaliacoes (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        ra TEXT,
                        instituicao_id INTEGER NOT NULL,
                        curso_id INTEGER NOT NULL,
                        user_id INTEGER, -- Associar avaliação ao usuário logado
                        conteudo INTEGER CHECK(conteudo >= 1 AND conteudo <= 5),
                        professores INTEGER CHECK(professores >= 1 AND professores <= 5),
                        apoio INTEGER CHECK(apoio >= 1 AND apoio <= 5),
                        estrutura INTEGER CHECK(estrutura >= 1 AND estrutura <= 5),
                        material INTEGER CHECK(material >= 1 AND material <= 5),
                        experiencia INTEGER CHECK(experiencia >= 1 AND experiencia <= 5),
                        comentario TEXT,
                        data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (instituicao_id) REFERENCES instituicoes(id) ON DELETE RESTRICT,
                        FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE RESTRICT,
                        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                    )`);
                    console.log("Tabela 'avaliacoes' verificada/criada.");
                    resolve();
                } catch (error) {
                    console.error("Erro ao inicializar tabelas:", error.message);
                    reject(error);
                }
            });
        });
    });
}

function getDbInstance() {
    if (!db) {
        throw new Error('Banco de dados não inicializado. Chame initializeDb() primeiro.');
    }
    return db;
}

function closeDb() {
    return new Promise((resolve, reject) => {
        if (db) {
            db.close((err) => {
                if (err) {
                    console.error('Erro ao fechar o banco de dados:', err.message);
                    return reject(err);
                }
                console.log('Conexão com o banco de dados fechada.');
                db = null; // Reset db instance
                resolve();
            });
        } else {
            resolve();
        }
    });
}

module.exports = {
    initializeDb,
    getDbInstance,
    dbGet,
    dbAll,
    dbRun,
    closeDb
};