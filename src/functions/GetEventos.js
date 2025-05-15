const { app } = require('@azure/functions');
const { pool } = require('../../shared/database');

app.http('GetEventos', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'eventos',
  handler: async (request, context) => {
    context.log('Processando solicitação GET para /api/eventos');
    
    try {
      const client = await pool.connect();
      
      // Consulta para obter todos os eventos com seus tipos
      const result = await client.query(`
        SELECT e.id, e.nome, e.data, e.latitude, e.longitude, e.timestamp,
               array_agg(te.descricao) as eventos
        FROM eventos e
        LEFT JOIN eventos_tipos et ON e.id = et.evento_id
        LEFT JOIN tipo_evento te ON et.tipo_evento_id = te.id
        GROUP BY e.id
        ORDER BY e.timestamp DESC
      `);
      
      client.release();
      
      // Formatar os dados para o formato esperado pelo cliente
      const eventosFormatados = result.rows.map(row => ({
        id: row.id,
        nome: row.nome,
        data: row.data,
        coordenadas: {
          latitude: parseFloat(row.latitude),
          longitude: parseFloat(row.longitude)
        },
        eventos: row.eventos || [],
        timestamp: row.timestamp
      }));
      
      return {
        status: 200,
        jsonBody: eventosFormatados
      };
      
    } catch (erro) {
      context.log.error('Erro ao buscar eventos:', erro);
      return {
        status: 500,
        jsonBody: {
          sucesso: false,
          mensagem: 'Erro ao buscar eventos do banco de dados'
        }
      };
    }
  }
});

