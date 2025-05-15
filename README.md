<h1>Descrição do Projeto</h1>
<h2>Visão Geral</h2>

Este projeto consiste em uma aplicação serverless desenvolvida com Azure Functions utilizando Node.js como runtime. A aplicação se conecta a um banco de dados PostgreSQL hospedado na plataforma Supabase para armazenamento e gerenciamento de dados.
Arquitetura Técnica

    Backend: Azure Functions (Serverless)
    Runtime: Node.js
    Banco de Dados: PostgreSQL (Supabase)
    Infraestrutura: Microsoft Azure

<b>Características Principais</b>

    Arquitetura serverless para escalabilidade automática
    Conexão segura com banco de dados PostgreSQL
    Configuração baseada em variáveis de ambiente para diferentes ambientes de execução
    Implementação de boas práticas de segurança para credenciais

<b>Ambiente de Desenvolvimento</b>

O ambiente de desenvolvimento utiliza armazenamento local para Azure Functions e configurações específicas para conexão com o banco de dados PostgreSQL remoto.<br />
Para pleno funcionamento do projeto adicione o arquivo de configuração com variáveis de ambiente local.settings.json conforme estrutura a seguir :
    
    {
      "IsEncrypted": false,
      "Values": {
        "AzureWebJobsStorage": "UseDevelopmentStorage=true",
        "FUNCTIONS_WORKER_RUNTIME": "node",
        "DB_USER": "INFORMAR",
        "DB_HOST": "INFORMAR",
        "DB_NAME": "INFORMAR",
        "DB_PASSWORD": "INFORMAR",
        "DB_PORT": "INFORMAR"
      }
    }

<b>Ambiente de Produção</b>

Em produção, a aplicação é executada na plataforma Azure Functions com configurações de ambiente seguras para conexão com o banco de dados.
