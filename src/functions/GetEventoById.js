const { app } = require('@azure/functions');
const { pool } = require('../../shared/database');

app.http('GetEventoById', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'eventos/{id}',
  handler: async (request, context) => {
    const id = parseInt(request.params.id);
    context.log(`Processando solicitação GET para /api/eventos/${id}`);
    
    try {
      if (isNaN(id)) {
        return {
          status: 400,
          jsonBody: {
            sucesso: false,
            mensagem: 'ID inválido'
          }
        };
      }
      
      const client = await pool.connect();
      
      // Consulta para obter o evento específico com seus tipos
      const result = await client.query(`
        SELECT e.id, e.nome, e.data, e.latitude, e.longitude, e.timestamp,
               array_agg(te.descricao) as eventos
        FROM eventos e
        LEFT JOIN eventos_tipos et ON e.id = et.evento_id
        LEFT JOIN tipo_evento te ON et.tipo_evento_id = te.id
        WHERE e.id = $1
        GROUP BY e.id
      `, [id]);
      
      client.release();
      
      if (result.rows.length === 0) {
        return {
          status: 404,
          jsonBody: {
            sucesso: false,
            mensagem: 'Evento não encontrado'
          }
        };
      }
      
      // Formatar os dados para o formato esperado pelo cliente
      const row = result.rows[0];
      const eventoFormatado = {
        id: row.id,
        nome: row.nome,
        data: row.data,
        coordenadas: {
          latitude: parseFloat(row.latitude),
          longitude: parseFloat(row.longitude)
        },
        eventos: row.eventos || [],
        timestamp: row.timestamp
      };
      
      return {
        status: 200,
        jsonBody: eventoFormatado
      };
      
    } catch (erro) {
      context.log.error('Erro ao buscar evento:', erro);
      return {
        status: 500,
        jsonBody: {
          sucesso: false,
          mensagem: 'Erro ao buscar evento do banco de dados'
        }
      };
    }
  }
});