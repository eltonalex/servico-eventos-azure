const { app } = require('@azure/functions');
const { pool } = require('../../shared/database');

app.http('GetTiposEventos', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'tipos-eventos',
  handler: async (request, context) => {
    context.log('Processando solicitação GET para /api/tipos-eventos');
    
    try {
      const client = await pool.connect();
      const result = await client.query('SELECT id, descricao FROM tipo_evento WHERE ativo = true ORDER BY descricao');
      client.release();
      
      return {
        status: 200,
        jsonBody: result.rows
      };
      
    } catch (erro) {
      context.log.error('Erro ao buscar tipos de eventos:', erro);
      return {
        status: 500,
        jsonBody: {
          sucesso: false,
          mensagem: 'Erro ao buscar tipos de eventos do banco de dados'
        }
      };
    }
  }
});
