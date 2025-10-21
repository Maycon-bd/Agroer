# 🐳 Executando Agroer com Docker

Este guia mostra como executar o projeto Agroer usando Docker e Docker Compose.

## 📋 Pré-requisitos

1. **Docker Desktop** instalado e funcionando
2. **Git** (opcional, para clonar o repositório)

## 🚀 Execução Rápida

### 1. Clone ou baixe o projeto
```bash
git clone [seu-repositorio]
cd Agroer
```

### 2. Configure as variáveis de ambiente
**Não é mais necessário configurar manualmente!** Todas as configurações já estão incluídas:

- ✅ **Chave Gemini**: Já configurada nos arquivos Docker
- ✅ **Banco PostgreSQL**: Credenciais já definidas
- ✅ **URLs dos serviços**: Configuração automática

### 3. Execute o projeto
```bash
cd docker
docker-compose up --build
```

**Pronto! 🎉** Todos os serviços estarão rodando automaticamente.

## 🌐 Acessos

Após a execução, os serviços estarão disponíveis em:

- **Frontend (Interface Principal)**: http://localhost:5173
- **Agente1 (Processamento PDF)**: http://localhost:3001
- **Agente2 (Validação/Banco)**: http://localhost:3002
- **pgAdmin (Gerenciamento do Banco)**: http://localhost:8080
- **PostgreSQL**: localhost:5432

## 🔐 Credenciais

### pgAdmin
- **Email**: admin@agroer.com
- **Senha**: admin123

### PostgreSQL
- **Host**: postgres (interno) / localhost (externo)
- **Porta**: 5432
- **Banco**: Agroer
- **Usuário**: postgres
- **Senha**: admin

## 📊 Configurando pgAdmin

1. Acesse http://localhost:8080
2. Faça login com as credenciais acima
3. Clique em "Add New Server"
4. Configure:
   - **Name**: Agroer Database
   - **Host**: postgres
   - **Port**: 5432
   - **Database**: Agroer
   - **Username**: postgres
   - **Password**: admin

## 🛠️ Comandos Úteis

```bash
# Executar em background
cd docker
docker-compose up -d --build

# Ver logs
docker-compose logs -f

# Parar todos os serviços
docker-compose down

# Reconstruir e executar
docker-compose up --build --force-recreate

# Ver status dos containers
docker ps
```

### Parar e remover volumes (limpar dados)
```bash
docker-compose down -v
```

### Ver logs de um serviço específico
```bash
docker-compose logs frontend
docker-compose logs agente1
docker-compose logs agente2
docker-compose logs postgres
```

### Reconstruir apenas um serviço
```bash
docker-compose up --build frontend
```

## 🏗️ Arquitetura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Agente1      │    │    Agente2      │
│   (React)       │    │  (PDF Process)  │    │ (Validation/DB) │
│   Port: 5173    │    │   Port: 3001    │    │   Port: 3002    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐    ┌─────────────────┐
                    │   PostgreSQL    │    │     pgAdmin     │
                    │   Port: 5432    │    │   Port: 8080    │
                    └─────────────────┘    └─────────────────┘
```

## 🔧 Desenvolvimento

### Modificar código
Os arquivos são copiados para o container durante o build. Para ver mudanças:

1. Modifique o código
2. Reconstrua o serviço: `docker-compose up --build [serviço]`

### Acessar container
```bash
# Acessar container do frontend
docker exec -it agroer_frontend sh

# Acessar container do agente1
docker exec -it agroer_agente1 sh

# Acessar container do agente2
docker exec -it agroer_agente2 sh
```

## 🔍 Verificação de Funcionamento

Para verificar se todos os serviços estão funcionando:

**Windows:**
```bash
cd docker
.\check-services.ps1
```

**Linux/Mac:**
```bash
cd docker
chmod +x check-services.sh
./check-services.sh
```

## 🐛 Solução de Problemas

### Erro de conexão com banco
- Verifique se o PostgreSQL está rodando: `docker-compose logs postgres`
- Aguarde alguns segundos para o banco inicializar completamente

### Porta já em uso
- Modifique as portas no `docker-compose.yml` se necessário
- Verifique processos rodando: `netstat -tulpn | grep :5173`

### Problemas de build
- Limpe o cache: `docker system prune -a`
- Reconstrua tudo: `docker-compose up --build --force-recreate`

## 📝 Notas para Apresentação

1. **Demonstração completa**: Todos os serviços rodam com um único comando
2. **Banco de dados**: PostgreSQL com dados persistentes
3. **Interface de administração**: pgAdmin para visualizar dados
4. **Isolamento**: Cada serviço roda em seu próprio container
5. **Rede interna**: Comunicação segura entre serviços
6. **Logs centralizados**: Fácil debugging e monitoramento

## 🎯 Funcionalidades Disponíveis

- ✅ Upload e processamento de PDFs
- ✅ Extração de dados com IA (Gemini)
- ✅ Validação de dados no banco PostgreSQL
- ✅ Criação de movimentos financeiros
- ✅ Verificação de duplicatas
- ✅ Interface web responsiva
- ✅ Gerenciamento de banco via pgAdmin