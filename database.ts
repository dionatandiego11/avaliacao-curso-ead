import { Review } from './types';
import { MOCK_REVIEWS } from './constants';

// A interface para sql.js é carregada globalmente pelo script em index.html
declare const initSqlJs: any;

const DB_LOCAL_STORAGE_KEY = 'ead-reviews-sqlite-db';

let db: any = null;

/**
 * Salva o estado atual do banco de dados no localStorage.
 */
const saveDatabase = () => {
  if (db) {
    const data = db.export();
    // Converte Uint8Array para um array de números para ser serializável em JSON.
    localStorage.setItem(DB_LOCAL_STORAGE_KEY, JSON.stringify(Array.from(data)));
    console.log('Database saved to localStorage.');
  }
};

/**
 * Converte os resultados de uma consulta do sql.js em um array de objetos JavaScript.
 * @param stmt O statement executado.
 * @returns Um array de objetos representando as linhas do resultado.
 */
const parseResults = (stmt: any): Record<string, any>[] => {
    const results = [];
    while (stmt.step()) {
        results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
};

/**
 * Inicializa a conexão com o banco de dados.
 * Carrega o banco de dados do localStorage se existir, senão cria um novo e o popula com dados de exemplo.
 */
export const initDatabase = async () => {
  if (db) return; // Já inicializado

  try {
    const SQL = await initSqlJs({
      locateFile: (file: string) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/${file}`
    });

    const savedDb = localStorage.getItem(DB_LOCAL_STORAGE_KEY);
    if (savedDb) {
      const dbArray = Object.values(JSON.parse(savedDb));
      db = new SQL.Database(new Uint8Array(dbArray as number[]));
      console.log('Database loaded from localStorage.');
    } else {
      db = new SQL.Database();
      console.log('New database created. Seeding with mock data...');
      
      const createTableSQL = `
        CREATE TABLE reviews (
          id TEXT PRIMARY KEY,
          fullName TEXT NOT NULL,
          academicRegistry TEXT NOT NULL,
          university TEXT NOT NULL,
          course TEXT NOT NULL,
          degree INTEGER NOT NULL,
          campus TEXT NOT NULL,
          region TEXT NOT NULL,
          comment TEXT,
          createdAt TEXT NOT NULL,
          courseQuality INTEGER NOT NULL,
          professorQuality INTEGER NOT NULL,
          studySupport INTEGER NOT NULL,
          onSiteSupport INTEGER NOT NULL,
          didacticMaterial INTEGER NOT NULL
        );
      `;
      db.run(createTableSQL);

      const stmt = db.prepare(`
        INSERT INTO reviews VALUES (
          :id, :fullName, :academicRegistry, :university, :course, :degree, :campus, :region, :comment, :createdAt,
          :courseQuality, :professorQuality, :studySupport, :onSiteSupport, :didacticMaterial
        )
      `);
      
      MOCK_REVIEWS.forEach(review => {
        stmt.run({
          ':id': review.id,
          ':fullName': review.fullName,
          ':academicRegistry': review.academicRegistry,
          ':university': review.university,
          ':course': review.course,
          ':degree': review.degree,
          ':campus': review.campus,
          ':region': review.region,
          ':comment': review.comment || null,
          ':createdAt': review.createdAt.toISOString(),
          ':courseQuality': review.courseQuality,
          ':professorQuality': review.professorQuality,
          ':studySupport': review.studySupport,
          ':onSiteSupport': review.onSiteSupport,
          ':didacticMaterial': review.didacticMaterial
        });
      });
      stmt.free();
      saveDatabase();
    }
  } catch (error) {
    console.error("Failed to initialize database:", error);
    // Em caso de erro, limpa o storage para tentar recriar da próxima vez
    localStorage.removeItem(DB_LOCAL_STORAGE_KEY);
  }
};

/**
 * Busca todas as avaliações do banco de dados.
 * @returns Um array de objetos Review.
 */
export const getReviewsFromDb = (): Review[] => {
  if (!db) throw new Error("Database not initialized.");
  
  const stmt = db.prepare("SELECT * FROM reviews ORDER BY createdAt DESC");
  const results = parseResults(stmt);
  
  // Converte os resultados de volta para o tipo Review, especialmente o campo de data.
  return results.map((row: any) => ({
    ...row,
    createdAt: new Date(row.createdAt),
    comment: row.comment || undefined,
  })) as Review[];
};

/**
 * Adiciona uma nova avaliação ao banco de dados.
 * @param review O objeto de avaliação a ser adicionado.
 */
export const addReviewToDb = (review: Review) => {
    if (!db) throw new Error("Database not initialized.");

    const stmt = db.prepare(`
        INSERT INTO reviews VALUES (
          :id, :fullName, :academicRegistry, :university, :course, :degree, :campus, :region, :comment, :createdAt,
          :courseQuality, :professorQuality, :studySupport, :onSiteSupport, :didacticMaterial
        )
      `);
    
    stmt.run({
        ':id': review.id,
        ':fullName': review.fullName,
        ':academicRegistry': review.academicRegistry,
        ':university': review.university,
        ':course': review.course,
        ':degree': review.degree,
        ':campus': review.campus,
        ':region': review.region,
        ':comment': review.comment || null,
        ':createdAt': review.createdAt.toISOString(),
        ':courseQuality': review.courseQuality,
        ':professorQuality': review.professorQuality,
        ':studySupport': review.studySupport,
        ':onSiteSupport': review.onSiteSupport,
        ':didacticMaterial': review.didacticMaterial
    });

    stmt.free();
    saveDatabase(); // Salva as alterações no localStorage
};