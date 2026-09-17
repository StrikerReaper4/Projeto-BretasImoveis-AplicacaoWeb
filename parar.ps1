# Desliga backend (8080), frontend (5173) e o PostgreSQL portátil do projeto (5544).
$runtime = Join-Path $PSScriptRoot ".runtime"
$pgCtl = Join-Path $runtime "pgsql\bin\pg_ctl.exe"
$pgDados = Join-Path $runtime "pgdata"

$servicos = @(@{ Porta = 8080; Nome = "Backend" }, @{ Porta = 5173; Nome = "Frontend" })
foreach ($s in $servicos) {
    $conexoes = Get-NetTCPConnection -LocalPort $s.Porta -State Listen -ErrorAction SilentlyContinue
    if (-not $conexoes) {
        Write-Host "    $($s.Nome) já estava parado" -ForegroundColor Yellow
        continue
    }
    $conexoes | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object {
        Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue
    }
    Write-Host "    OK  $($s.Nome) parado (porta $($s.Porta))" -ForegroundColor Green
}

# Fecha as janelas abertas pelo iniciar.ps1
Get-Process powershell -ErrorAction SilentlyContinue |
    Where-Object { $_.MainWindowTitle -in @("Backend - Spring Boot", "Frontend - React") } |
    Stop-Process -Force -ErrorAction SilentlyContinue

if ((Test-Path $pgCtl) -and (Test-Path (Join-Path $pgDados "postmaster.pid"))) {
    & $pgCtl -D $pgDados -m fast -w stop | Out-Null
    Write-Host "    OK  PostgreSQL parado (porta 5544)" -ForegroundColor Green
} else {
    Write-Host "    PostgreSQL já estava parado" -ForegroundColor Yellow
}

Write-Host "`nTudo parado." -ForegroundColor Cyan
