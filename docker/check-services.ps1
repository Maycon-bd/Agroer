# Script de Verificação dos Serviços Agroer
# Executa verificações de saúde em todos os serviços

Write-Host "🔍 Verificando Serviços Agroer..." -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# Função para testar conectividade
function Test-Service {
    param(
        [string]$Name,
        [string]$Url,
        [string]$ExpectedContent = ""
    )
    
    Write-Host "📡 Testando $Name..." -ForegroundColor Yellow
    
    try {
        $response = Invoke-WebRequest -Uri $Url -TimeoutSec 10 -UseBasicParsing
        
        if ($response.StatusCode -eq 200) {
            if ($ExpectedContent -and $response.Content -notlike "*$ExpectedContent*") {
                Write-Host "   X $Name`: Resposta inesperada" -ForegroundColor Red
                return $false
            }
            Write-Host "   OK $Name`: OK (Status: $($response.StatusCode))" -ForegroundColor Green
            return $true
        } else {
            Write-Host "   X $Name`: Status $($response.StatusCode)" -ForegroundColor Red
            return $false
        }
    }
    catch {
        Write-Host "   X $Name`: Erro de conexao - $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Função para testar porta
function Test-Port {
    param(
        [string]$ServiceName,
        [string]$HostName,
        [int]$Port
    )
    
    Write-Host "🔌 Testando porta $ServiceName ($HostName`:$Port)..." -ForegroundColor Yellow
    
    try {
        $tcpClient = New-Object System.Net.Sockets.TcpClient
        $tcpClient.ConnectAsync($HostName, $Port).Wait(3000)
        
        if ($tcpClient.Connected) {
            Write-Host "   OK $ServiceName`: Porta acessivel" -ForegroundColor Green
            $tcpClient.Close()
            return $true
        } else {
            Write-Host "   X $ServiceName`: Porta inacessivel" -ForegroundColor Red
            return $false
        }
    }
    catch {
        Write-Host "   X $ServiceName`: Erro ao conectar na porta" -ForegroundColor Red
        return $false
    }
}

# Verificar se Docker está rodando
Write-Host "🐳 Verificando Docker..." -ForegroundColor Yellow
try {
    $dockerStatus = docker ps 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Docker: Funcionando" -ForegroundColor Green
        
        # Listar containers
        Write-Host "📦 Containers ativos:" -ForegroundColor Cyan
        docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    } else {
        Write-Host "   ❌ Docker: Não está rodando" -ForegroundColor Red
    }
}
catch {
    Write-Host "   ❌ Docker: Não instalado ou não acessível" -ForegroundColor Red
}

Write-Host ""

# Testar serviços
$services = @(
    @{ Name = "Frontend"; Url = "http://localhost:5173"; Content = "Agroer" },
    @{ Name = "Agente1 (PDF)"; Url = "http://localhost:3001/health"; Content = "" },
    @{ Name = "Agente2 (DB)"; Url = "http://localhost:3002/health"; Content = "" },
    @{ Name = "pgAdmin"; Url = "http://localhost:8080"; Content = "pgAdmin" }
)

$allServicesOk = $true

foreach ($service in $services) {
    $result = Test-Service -Name $service.Name -Url $service.Url -ExpectedContent $service.Content
    if (-not $result) {
        $allServicesOk = $false
    }
}

Write-Host ""

# Testar porta do banco
$dbResult = Test-Port -ServiceName "PostgreSQL" -HostName "localhost" -Port 5432
if (-not $dbResult) {
    $allServicesOk = $false
}

Write-Host ""
Write-Host "=================================" -ForegroundColor Cyan

if ($allServicesOk) {
    Write-Host "🎉 Todos os serviços estão funcionando!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Acessos disponíveis:" -ForegroundColor Cyan
    Write-Host "   • Aplicação: http://localhost:5173" -ForegroundColor White
    Write-Host "   • pgAdmin: http://localhost:8080" -ForegroundColor White
    Write-Host "   • Agente1: http://localhost:3001" -ForegroundColor White
    Write-Host "   • Agente2: http://localhost:3002" -ForegroundColor White
} else {
    Write-Host "⚠️  Alguns serviços não estão funcionando!" -ForegroundColor Red
    Write-Host "   Verifique se o Docker está rodando e execute:" -ForegroundColor Yellow
    Write-Host "   docker-compose up --build" -ForegroundColor White
}

Write-Host ""