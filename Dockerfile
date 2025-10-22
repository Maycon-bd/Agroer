# Dockerfile para Frontend React
FROM node:20-alpine

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências (inclui devDependencies para rodar Vite em modo dev)
RUN npm ci

# Copiar código fonte
COPY . .

# Expor porta
EXPOSE 5173

# Comando para iniciar a aplicação
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]