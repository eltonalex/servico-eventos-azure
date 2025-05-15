const { app } = require('@azure/functions');
const { initDatabase } = require('../../shared/database');

app.timer('InitDatabase', {
  schedule: '0 */30 * * * *',
  handler: async (myTimer, context) => {
    const timeStamp = new Date().toISOString();
    
    context.log('Iniciando verificação do banco de dados:', timeStamp);
    
    try {
      const success = await initDatabase();
      if (success) {
        context.log('Banco de dados inicializado com sucesso');
      } else {
        context.log.error('Falha ao inicializar o banco de dados');
      }
    } catch (error) {
      context.log.error('Erro ao inicializar o banco de dados:', error);
    }
  }
});
