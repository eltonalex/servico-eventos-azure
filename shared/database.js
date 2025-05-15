// shared/database.js
const { Pool } = require('pg');

// Configuração do PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT, 10)
});

// Inicialização do banco de dados
async function initDatabase() {
  try {
    const client = await pool.connect();
    
    // Cria a tabela eventos se não existir
    await client.query(`
      CREATE TABLE IF NOT EXISTS eventos (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        data TIMESTAMP NOT NULL,
        latitude DECIMAL(10, 7) NOT NULL,
        longitude DECIMAL(10, 7) NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Cria a tabela tipo_evento
    await client.query(`
      CREATE TABLE IF NOT EXISTS tipo_evento (
        id SERIAL PRIMARY KEY,
        descricao VARCHAR(255) NOT NULL,
        ativo BOOLEAN DEFAULT TRUE,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Cria a tabela eventos_tipos
    await client.query(`
      CREATE TABLE IF NOT EXISTS eventos_tipos (
        id SERIAL PRIMARY KEY,
        evento_id INTEGER REFERENCES eventos(id) ON DELETE CASCADE,
        tipo_evento_id INTEGER REFERENCES tipo_evento(id),
        UNIQUE(evento_id, tipo_evento_id)
      );
    `);
    
    // Insere tipos de eventos padrão (se não existirem)
    const tiposExistentes = await client.query('SELECT COUNT(*) FROM tipo_evento');
    if (tiposExistentes.rows[0].count === '0') {
      await client.query(`
        INSERT INTO tipo_evento (descricao) VALUES 
          ('Sem Chuva'),
          ('Chuva Fraca'),
          ('Chuva Forte'),
          ('Granizo'),
          ('Raios'),
          ('Deslizamento'),
          ('Alagamento'),
          ('Queda de Árvore'),
          ('Rio Transbordando'),
          ('Neblina/Nevoeiro'),
          ('Queimada');
      `);
    }
    
    console.log('Tabelas criadas com sucesso');
    client.release();
    return true;
  } catch (err) {
    console.error('Erro ao inicializar o banco de dados:', err);
    return false;
  }
}

// Classe para validação de dados
class Evento {
  constructor(dados) {
    this.eventos = dados.eventos;
    this.nome = dados.nome;
    this.data = dados.data;
    this.coordenadas = dados.coordenadas;
  }

  validar() {
    if (!this.eventos || !Array.isArray(this.eventos)) {
      return { valido: false, mensagem: 'Eventos deve ser um array' };
    }
    
    if (!this.nome || typeof this.nome !== 'string') {
      return { valido: false, mensagem: 'Nome é obrigatório e deve ser uma string' };
    }
    
    if (!this.data || !this.isValidISODate(this.data)) {
      return { valido: false, mensagem: 'Data deve ser um ISO8601 string válido' };
    }
    
    if (!this.coordenadas || 
        !this.coordenadas.hasOwnProperty('latitude') || 
        !this.coordenadas.hasOwnProperty('longitude')) {
      return { valido: false, mensagem: 'Coordenadas devem conter latitude e longitude' };
    }
    
    return { valido: true };
  }
  
  isValidISODate(dateString) {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return false;
      }
      return true;
    } catch (e) {
      return false;
    }
  }
}

// Executar a inicialização do banco de dados quando este módulo for carregado
(async () => {
  await initDatabase();
})();

module.exports = {
  pool,
  Evento
};
