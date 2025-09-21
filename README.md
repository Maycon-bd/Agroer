# AGROER - Analisador de Notas Fiscais

Sistema web para upload e análise de notas fiscais em PDF, desenvolvido com React, TypeScript e integração com IA Gemini para extração automática de dados.

## Funcionalidades

- Upload de arquivos PDF de notas fiscais
- Extração automática de dados usando IA Gemini
- Visualização dos dados extraídos em formato JSON
- Interface responsiva e intuitiva
- API backend para processamento de PDFs

## Tecnologias

- **Frontend**: React 18, TypeScript, Vite
- **Backend**: Node.js, Express
- **IA**: Google Gemini API
- **Processamento**: PDF-parse, Multer

## Instalação

1. Clone o repositório
2. Instale as dependências do frontend:
   ```bash
   npm install
   ```
3. Instale as dependências do backend:
   ```bash
   cd backend
   npm install
   ```
4. Configure as variáveis de ambiente no backend (.env)
5. Execute o backend:
   ```bash
   npm run dev
   ```
6. Execute o frontend:
   ```bash
   npm run dev
   ```

## Uso

1. Acesse a aplicação em `http://localhost:5173/`
2. Faça upload de um arquivo PDF de nota fiscal
3. Clique em "EXTRAIR DADOS" para processar
4. Visualize os dados extraídos em formato JSON

## Estrutura do Projeto

- `/src` - Código fonte do frontend React
- `/backend` - API Node.js para processamento de PDFs
- `/backend/src/services` - Serviços de processamento e IA
- `/backend/src/routes` - Rotas da API

Este projeto faz parte de um sistema de gestão financeira para o agronegócio.
