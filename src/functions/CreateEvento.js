const { app } = require('@azure/functions');
const { pool, Evento } = require('../../shared/database');

app.http('CreateEvento', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'eventos',
  handler: async (request, context) => {
    context.log('Processando solicitação POST para /api/eventos');
    
    try {
      const dadosRecebidos = await request.json();
      const evento = new Evento(dadosRecebidos);
      
      // Validar os dados recebidos
      const validacao = evento.validar();
      
      if (!validacao.valido) {
        return {
          status: 400,
          jsonBody: {
            sucesso: false,
            mensagem: validacao.mensagem
          }
        };
      }
      
      const client = await pool.connect();
      
      try {
        // Iniciar transação
        await client.query('BEGIN');
        
        // Inserir o evento principal
        const eventoResult = await client.query(
          `INSERT INTO eventos(nome, data, latitude, longitude) 
           VALUES($1, $2, $3, $4) RETURNING id`,
          [
            evento.nome, 
            evento.data, 
            evento.coordenadas.latitude, 
            evento.coordenadas.longitude
          ]
        );
        
        const eventoId = eventoResult.rows[0].id;
        
        // Para cada tipo de evento, buscar o tipo_evento_id correspondente
        for (const tipoEvento of evento.eventos) {
          const tipoResult = await client.query(
            'SELECT id FROM tipo_evento WHERE descricao = $1 AND ativo = true',
            [tipoEvento]
          );
          
          // Se o tipo de evento for encontrado, inserir na tabela eventos_tipos
          if (tipoResult.rows.length > 0) {
            const tipoEventoId = tipoResult.rows[0].id;
            await client.query(
              'INSERT INTO eventos_tipos(evento_id, tipo_evento_id) VALUES($1, $2)',
              [eventoId, tipoEventoId]
            );
          } else {
            // Se o tipo de evento não for encontrado, emitir um aviso
            context.log.warn(`Tipo de evento não encontrado: ${tipoEvento}`);
          }
        }
        
        // Finalizar transação
        await client.query('COMMIT');
        
        // Responder com sucesso
        return {
          status: 201,
          jsonBody: {
            sucesso: true,
            mensagem: 'Evento recebido com sucesso',
            id: eventoId
          }
        };
        
      } catch (dbError) {
        // Em caso de erro, reverter a transação
        await client.query('ROLLBACK');
        context.log.error('Erro na transação do banco de dados:', dbError);
        
        return {
          status: 500,
          jsonBody: {
            sucesso: false,
            mensagem: 'Erro ao salvar os dados no banco de dados'
          }
        };
      } finally {
        client.release();
      }
      
    } catch (erro) {
      context.log.error('Erro ao processar evento:', erro);
      return {
        status: 500,
        jsonBody: {
          sucesso: false,
          mensagem: 'Erro interno do servidor'
        }
      };req_6644deeda0ec473c8d12ddeb6c729cf3
    }
  }
});
