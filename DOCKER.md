# 🐳 Agroer - Execução com Docker

Este documento explica como executar o projeto Agroer usando Docker e Docker Compose.

## 📋 Pré-requisitos

- Docker Desktop instalado e rodando
- Docker Compose (incluído no Docker Desktop)
- Chave da API do Google Gemini

## 🚀 Execução Rápida

### 1. Configurar Variáveis de Ambiente

```bash
# Copiar o arquivo de exemplo
cp .env.docker .env

# Editar o arquivo .env e configurar sua chave do Google Gemini
# GOOGLE_GEMINI_API_KEY=sua_chave_aqui
```

### 2. Executar o Projeto

```bash
# Construir e iniciar todos os serviços
docker-compose up -d

# Verificar status dos containers
docker-compose ps

# Ver logs de todos os serviços
docker-compose logs

# Ver logs de um serviço específico
docker-compose logs frontend
docker-compose logs agente1
docker-compose logs agente2
```

### 3. Acessar os Serviços

- **Frontend**: http://localhost:5173
- **Agente1 (Extração)**: http://localhost:3001
- **Agente2 (Validação)**: http://localhost:3002
- **pgAdmin**: http://localhost:8080
- **PostgreSQL**: localhost:5432

## 🏗️ Arquitetura dos Containers

### Serviços Incluídos

1. **agroer_frontend** - Interface React (Porta 5173)
2. **agroer_agente1** - Serviço de extração de dados (Porta 3001)
3. **agroer_agente2** - Serviço de validação (Porta 3002)
4. **agroer_postgres** - Banco de dados PostgreSQL (Porta 5432)
5. **agroer_pgadmin** - Interface de administração do banco (Porta 8080)

### Volumes Persistentes

- `postgres_data` - Dados do PostgreSQL
- `pgadmin_data` - Configurações do pgAdmin
- `agente1_uploads` - Arquivos enviados para o Agente1

## 🔧 Comandos Úteis

### Gerenciamento dos Containers

```bash
# Parar todos os serviços
docker-compose down

# Parar e remover volumes (CUIDADO: apaga dados do banco)
docker-compose down -v

# Reconstruir containers após mudanças no código
docker-compose build

# Reconstruir um serviço específico
docker-compose build frontend

# Reiniciar um serviço específico
docker-compose restart agente1

# Executar comando dentro de um container
docker-compose exec agente1 npm test
docker-compose exec postgres psql -U postgres -d Agroer
```

### Logs e Debugging

```bash
# Seguir logs em tempo real
docker-compose logs -f

# Logs de um serviço específico
docker-compose logs -f agente2

# Verificar saúde dos containers
docker-compose ps

# Inspecionar um container
docker inspect agroer_agente1
```

### Limpeza

```bash
# Remover containers parados
docker container prune

# Remover imagens não utilizadas
docker image prune

# Limpeza completa do sistema Docker
docker system prune -a
```

## 🔐 Configuração do Banco de Dados

### Credenciais Padrão

- **Banco**: Agroer
- **Usuário**: postgres
- **Senha**: admin
- **Host**: localhost (ou agroer_postgres dentro da rede Docker)
- **Porta**: 5432

### pgAdmin

- **Email**: admin@agroer.com
- **Senha**: admin123
- **URL**: http://localhost:8080

Para conectar ao PostgreSQL via pgAdmin:
1. Acesse http://localhost:8080
2. Faça login com as credenciais acima
3. Adicione novo servidor:
   - Nome: Agroer
   - Host: agroer_postgres
   - Porta: 5432
   - Usuário: postgres
   - Senha: admin

## 🌐 Variáveis de Ambiente

### Arquivo .env

```env
# Google Gemini API Key (obrigatório para o Agente1)
GOOGLE_GEMINI_API_KEY=sua_chave_aqui

# PostgreSQL
POSTGRES_DB=Agroer
POSTGRES_USER=postgres
POSTGRES_PASSWORD=admin

# pgAdmin
PGADMIN_DEFAULT_EMAIL=admin@agroer.com
PGADMIN_DEFAULT_PASSWORD=admin123

# Portas dos serviços
FRONTEND_PORT=5173
AGENTE1_PORT=3001
AGENTE2_PORT=3002
POSTGRES_PORT=5432
PGADMIN_PORT=8080
```

## 🔍 Verificação de Saúde

Os containers incluem health checks automáticos:

```bash
# Verificar saúde de todos os serviços
docker-compose ps

# Status detalhado de um container
docker inspect --format='{{.State.Health.Status}}' agroer_agente1
```

## 🚨 Solução de Problemas

### Container não inicia

```bash
# Verificar logs do container
docker-compose logs nome_do_servico

# Verificar se as portas estão disponíveis
netstat -an | findstr :5173
netstat -an | findstr :3001
netstat -an | findstr :3002
```

### Problemas de conectividade

```bash
# Verificar rede Docker
docker network ls
docker network inspect agroer_agroer_network

# Testar conectividade entre containers
docker-compose exec agente2 ping agroer_postgres
```

### Reconstruir do zero

```bash
# Parar tudo e limpar
docker-compose down -v
docker system prune -f

# Reconstruir e iniciar
docker-compose build --no-cache
docker-compose up -d
```

## 📊 Monitoramento

### Recursos dos Containers

```bash
# Ver uso de recursos
docker stats

# Informações detalhadas de um container
docker-compose top agente1
```

### Backup do Banco

```bash
# Backup do PostgreSQL
docker-compose exec postgres pg_dump -U postgres Agroer > backup.sql

# Restaurar backup
docker-compose exec -T postgres psql -U postgres Agroer < backup.sql
```

## 🔄 Desenvolvimento

Para desenvolvimento com hot-reload:

```bash
# Usar docker-compose.override.yml para configurações de desenvolvimento
# Montar volumes do código fonte para hot-reload
```

## 📝 Notas Importantes

1. **Primeira execução**: O PostgreSQL pode demorar alguns segundos para inicializar
2. **Dependências**: O Agente2 aguarda o PostgreSQL estar saudável antes de iniciar
3. **Volumes**: Os dados do banco são persistidos entre reinicializações
4. **Rede**: Todos os containers estão na mesma rede Docker para comunicação interna
5. **Segurança**: Os containers rodam com usuário não-root para maior segurança

## 🆘 Suporte

Se encontrar problemas:

1. Verifique os logs: `docker-compose logs`
2. Confirme que todas as portas estão disponíveis
3. Verifique se o Docker Desktop está rodando
4. Confirme que as variáveis de ambiente estão configuradas
5. Tente reconstruir os containers: `docker-compose build --no-cache`