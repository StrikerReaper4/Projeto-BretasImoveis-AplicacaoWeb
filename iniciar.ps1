# Sobe TUDO do Imóveis Bretas em qualquer Windows 10/11 (precisa de internet na 1ª vez):
#   - Java 17+ e Node.js: usa os instalados; se faltarem, baixa versões portáteis
#   - PostgreSQL: baixa uma versão portátil, cria o banco "imoveis_bretas" e o usuário "bretas"
#   - Backend (Spring Boot) e Frontend (React, com npm install)
# Tudo que é baixado fica em .runtime\ (nada é instalado no sistema, não precisa de administrador).
param([switch]$ForcarPortatil)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$raiz = $PSScriptRoot
$backend = Join-Path $raiz "backend_ib_v2"
$frontend = Join-Path $raiz "frontend_ib"
$runtime = Join-Path $raiz ".runtime"
$tarExe = Join-Path $env:SystemRoot "System32\tar.exe"
$curlExe = Join-Path $env:SystemRoot "System32\curl.exe"

$PG_PORTA = 5544
$PG_URL = "https://get.enterprisedb.com/postgresql/postgresql-17.6-1-windows-x64-binaries.zip"
$JDK_URL = "https://api.adoptium.net/v3/binary/latest/17/ga/windows/x64/jdk/hotspot/normal/eclipse"
$NODE_VERSAO = "v22.23.2"
$NODE_URL = "https://nodejs.org/dist/$NODE_VERSAO/node-$NODE_VERSAO-win-x64.zip"

function Passo($msg) { Write-Host "`n==> $msg" -ForegroundColor Cyan }
function Ok($msg) { Write-Host "    OK  $msg" -ForegroundColor Green }
function Info($msg) { Write-Host "    $msg" }
function Falha($msg) {
    Write-Host "    ERRO  $msg" -ForegroundColor Red
    if ([Environment]::UserInteractive -and -not [Console]::IsInputRedirected) { Read-Host "`nPressione Enter para sair" }
    exit 1
}

function PortaAberta($porta) {
    [bool](Get-NetTCPConnection -LocalPort $porta -State Listen -ErrorAction SilentlyContinue)
}

function EsperarPorta($porta, $nome, $segundos) {
    for ($i = 0; $i -lt $segundos; $i++) {
        if (PortaAberta $porta) { Ok "$nome no ar (porta $porta)"; return }
        Start-Sleep 1
    }
    Falha "$nome não subiu em $segundos s. Veja a janela dele para o erro."
}

# Baixa um .zip e extrai em $destino (uma vez só)
function BaixarEExtrair($url, $destino, $nome) {
    if (Test-Path $destino) { return }
    New-Item -ItemType Directory -Force $runtime | Out-Null
    $arquivo = Join-Path $runtime "$nome.zip"
    Info "Baixando $nome (só na primeira vez, pode demorar)..."
    if (Test-Path $curlExe) {
        & $curlExe -L --fail --progress-bar -o $arquivo $url
        if ($LASTEXITCODE -ne 0) { Falha "Falha ao baixar $nome. Verifique a internet." }
    } else {
        Invoke-WebRequest $url -OutFile $arquivo -UseBasicParsing
    }
    Info "Extraindo $nome..."
    $tmp = "$destino.tmp"
    if (Test-Path $tmp) { Remove-Item $tmp -Recurse -Force }
    New-Item -ItemType Directory -Force $tmp | Out-Null
    & $tarExe -xf $arquivo -C $tmp
    if ($LASTEXITCODE -ne 0) { Falha "Falha ao extrair $nome." }
    # Os zips trazem uma pasta raiz (pgsql, jdk-17..., node-v22...): ela vira o $destino
    $interna = Get-ChildItem $tmp -Directory | Select-Object -First 1
    Move-Item $interna.FullName $destino
    Remove-Item $tmp -Recurse -Force
    Remove-Item $arquivo -Force
}

function VersaoJava {
    if (-not (Get-Command java -ErrorAction SilentlyContinue)) { return 0 }
    $saida = (cmd /c "java -version 2>&1") -join " "
    if ($saida -match 'version "(\d+)') { return [int]$Matches[1] }
    return 0
}

# ---------------------------------------------------------------- 1. Java
Passo "Java 17+"
if (-not $ForcarPortatil -and (VersaoJava) -ge 17) {
    Ok "Usando o Java instalado (versão $(VersaoJava))"
} else {
    $jdk = Join-Path $runtime "jdk"
    BaixarEExtrair $JDK_URL $jdk "java17"
    $env:JAVA_HOME = $jdk
    $env:PATH = "$jdk\bin;$env:PATH"
    Ok "Usando Java portátil ($jdk)"
}

# ---------------------------------------------------------------- 2. Node
Passo "Node.js"
if (-not $ForcarPortatil -and (Get-Command npm -ErrorAction SilentlyContinue)) {
    Ok "Usando o Node instalado ($(node -v))"
} else {
    $node = Join-Path $runtime "node"
    BaixarEExtrair $NODE_URL $node "node"
    $env:PATH = "$node;$env:PATH"
    Ok "Usando Node portátil ($node)"
}

# ---------------------------------------------------------------- 3. Banco
Passo "PostgreSQL (porta $PG_PORTA)"
$pg = Join-Path $runtime "pgsql"
$pgBin = Join-Path $pg "bin"
$pgDados = Join-Path $runtime "pgdata"
BaixarEExtrair $PG_URL $pg "postgresql"

if (-not (Test-Path (Join-Path $pgDados "PG_VERSION"))) {
    Info "Criando cluster do banco..."
    & "$pgBin\initdb.exe" -D $pgDados -U postgres -A trust -E UTF8 --no-locale | Out-Null
    if ($LASTEXITCODE -ne 0) { Falha "initdb falhou." }
}

if (PortaAberta $PG_PORTA) {
    Ok "PostgreSQL já estava rodando"
} else {
    # Start-Process: o postgres não herda a saída deste script (senão o script trava esperando)
    $log = Join-Path $runtime "postgres.log"
    Start-Process -FilePath "$pgBin\pg_ctl.exe" -WindowStyle Hidden `
        -ArgumentList "-D `"$pgDados`" -l `"$log`" -o `"-p $PG_PORTA`" start"
    EsperarPorta $PG_PORTA "PostgreSQL" 60
    Start-Sleep 2
}

$psql = "$pgBin\psql.exe"
$temUsuario = & $psql -h localhost -p $PG_PORTA -U postgres -tAc "SELECT 1 FROM pg_roles WHERE rolname='bretas'"
if ($temUsuario -ne "1") {
    & $psql -h localhost -p $PG_PORTA -U postgres -qc "CREATE USER bretas WITH PASSWORD 'bretas123'" | Out-Null
}
$temBanco = & $psql -h localhost -p $PG_PORTA -U postgres -tAc "SELECT 1 FROM pg_database WHERE datname='imoveis_bretas'"
if ($temBanco -ne "1") {
    & $psql -h localhost -p $PG_PORTA -U postgres -qc "CREATE DATABASE imoveis_bretas OWNER bretas" | Out-Null
}
Ok "Banco imoveis_bretas e usuário bretas prontos"

# ---------------------------------------------------------------- 4. Backend
Passo "Backend (Spring Boot)"
if (PortaAberta 8080) {
    Ok "Backend já estava rodando"
} else {
    Info "Na primeira vez o Maven baixa as dependências (1-3 min)..."
    Start-Process powershell -WorkingDirectory $backend -ArgumentList "-NoExit", "-Command",
        "`$host.UI.RawUI.WindowTitle='Backend - Spring Boot'; .\mvnw.cmd spring-boot:run"
    EsperarPorta 8080 "Backend" 420
}

# ---------------------------------------------------------------- 5. Frontend
Passo "Frontend (React)"
Push-Location $frontend
Info "npm install..."
cmd /c "npm install --no-audit --no-fund --loglevel=error"
$codigo = $LASTEXITCODE
Pop-Location
if ($codigo -ne 0) { Falha "npm install falhou." }
Ok "Dependências do frontend instaladas"

if (PortaAberta 5173) {
    Ok "Frontend já estava rodando"
} else {
    Start-Process powershell -WorkingDirectory $frontend -ArgumentList "-NoExit", "-Command",
        "`$host.UI.RawUI.WindowTitle='Frontend - React'; npm run dev"
    EsperarPorta 5173 "Frontend" 90
}

# ---------------------------------------------------------------- 6. Pronto
Passo "Tudo pronto!"
Info "Site:   http://localhost:5173"
Info "Admin:  http://localhost:5173/admin  (admin@bretas.com / admin123)"
Info "API:    http://localhost:8080/api/imoveis"
Info "Banco:  localhost:$PG_PORTA  banco imoveis_bretas  usuário bretas / bretas123"
Info "Para desligar tudo: PARAR.bat"
Start-Process "http://localhost:5173"
