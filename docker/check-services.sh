#!/bin/bash

# Script de Verificação dos Serviços Agroer
# Executa verificações de saúde em todos os serviços

echo "🔍 Verificando Serviços Agroer..."
echo "================================="

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Função para testar serviços HTTP
test_service() {
    local name=$1
    local url=$2
    local expected_content=$3
    
    echo -e "${YELLOW}📡 Testando $name...${NC}"
    
    if response=$(curl -s -w "%{http_code}" --connect-timeout 10 "$url" 2>/dev/null); then
        http_code="${response: -3}"
        content="${response%???}"
        
        if [ "$http_code" = "200" ]; then
            if [ -n "$expected_content" ] && [[ "$content" != *"$expected_content"* ]]; then
                echo -e "   ${RED}❌ $name: Resposta inesperada${NC}"
                return 1
            fi
            echo -e "   ${GREEN}✅ $name: OK (Status: $http_code)${NC}"
            return 0
        else
            echo -e "   ${RED}❌ $name: Status $http_code${NC}"
            return 1
        fi
    else
        echo -e "   ${RED}❌ $name: Erro de conexão${NC}"
        return 1
    fi
}

# Função para testar portas
test_port() {
    local name=$1
    local host=$2
    local port=$3
    
    echo -e "${YELLOW}🔌 Testando porta $name ($host:$port)...${NC}"
    
    if timeout 3 bash -c "</dev/tcp/$host/$port" 2>/dev/null; then
        echo -e "   ${GREEN}✅ $name: Porta acessível${NC}"
        return 0
    else
        echo -e "   ${RED}❌ $name: Porta inacessível${NC}"
        return 1
    fi
}

# Verificar se Docker está rodando
echo -e "${YELLOW}🐳 Verificando Docker...${NC}"
if docker ps >/dev/null 2>&1; then
    echo -e "   ${GREEN}✅ Docker: Funcionando${NC}"
    echo -e "${CYAN}📦 Containers ativos:${NC}"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
else
    echo -e "   ${RED}❌ Docker: Não está rodando ou não acessível${NC}"
fi

echo ""

# Testar serviços
all_services_ok=true

services=(
    "Frontend|http://localhost:5173|Agroer"
    "Agente1 (PDF)|http://localhost:3001/health|"
    "Agente2 (DB)|http://localhost:3002/health|"
    "pgAdmin|http://localhost:8080|pgAdmin"
)

for service in "${services[@]}"; do
    IFS='|' read -r name url content <<< "$service"
    if ! test_service "$name" "$url" "$content"; then
        all_services_ok=false
    fi
done

echo ""

# Testar porta do banco
if ! test_port "PostgreSQL" "localhost" "5432"; then
    all_services_ok=false
fi

echo ""
echo "================================="

if [ "$all_services_ok" = true ]; then
    echo -e "${GREEN}🎉 Todos os serviços estão funcionando!${NC}"
    echo ""
    echo -e "${CYAN}🌐 Acessos disponíveis:${NC}"
    echo -e "   ${WHITE}• Aplicação: http://localhost:5173${NC}"
    echo -e "   ${WHITE}• pgAdmin: http://localhost:8080${NC}"
    echo -e "   ${WHITE}• Agente1: http://localhost:3001${NC}"
    echo -e "   ${WHITE}• Agente2: http://localhost:3002${NC}"
else
    echo -e "${RED}⚠️  Alguns serviços não estão funcionando!${NC}"
    echo -e "   ${YELLOW}Verifique se o Docker está rodando e execute:${NC}"
    echo -e "   ${WHITE}docker-compose up --build${NC}"
fi

echo ""