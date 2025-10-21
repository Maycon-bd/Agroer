# Dockerfile para Agente2 - Validação e Banco
FROM node:18-alpine

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production

# Copiar código fonte
COPY . .

# Expor porta
EXPOSE 3002

# Comando para iniciar a aplicação
CMD ["npm", "start"]