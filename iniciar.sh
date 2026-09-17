#!/usr/bin/env bash
# Sobe TUDO do Imóveis Bretas no Linux (x86_64 ou arm64). Precisa de internet na 1ª vez.
#   - Java 17+ e Node.js: usa os instalados; se faltarem, baixa versões portáteis
#   - PostgreSQL: baixa binários portáteis, cria o banco "imoveis_bretas" e o usuário "bretas"
#   - Backend (Spring Boot) e Frontend (React, com npm install)
# Tudo que é baixado fica em .runtime/ (nada é instalado no sistema, não precisa de sudo).
# Uso: bash iniciar.sh            (ou: bash iniciar.sh --portatil  para forçar Java/Node portáteis)
set -euo pipefail

RAIZ="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND="$RAIZ/backend_ib_v2"
FRONTEND="$RAIZ/frontend_ib"
RUNTIME="$RAIZ/.runtime"
mkdir -p "$RUNTIME"

PG_PORTA=5544
PG_VERSAO="17.6.0"
NODE_VERSAO="v22.23.2"
FORCAR_PORTATIL=0
[[ "${1:-}" == "--portatil" ]] && FORCAR_PORTATIL=1

passo() { printf '\n\033[36m==> %s\033[0m\n' "$1"; }
ok()    { printf '    \033[32mOK\033[0m  %s\n' "$1"; }
info()  { printf '    %s\n' "$1"; }
falha() { printf '    \033[31mERRO\033[0m  %s\n' "$1"; exit 1; }

porta_aberta() { (exec 3<>"/dev/tcp/127.0.0.1/$1") 2>/dev/null; }

esperar_porta() { # porta nome segundos log
  for ((i = 0; i < $3; i++)); do
    if porta_aberta "$1"; then ok "$2 no ar (porta $1)"; return; fi
    sleep 1
  done
  falha "$2 não subiu em $3 s. Veja o log: $4"
}

baixar() { # url arquivo
  if command -v curl >/dev/null; then curl -L --fail --progress-bar -o "$2" "$1"
  elif command -v wget >/dev/null; then wget -q --show-progress -O "$2" "$1"
  else falha "Instale curl ou wget."; fi
}

# Baixa um .tar.gz/.tar.xz e extrai em $destino, removendo a pasta raiz do pacote
baixar_tar() { # url destino nome
  [[ -d "$2" ]] && return
  local arquivo="$RUNTIME/$3.tar"
  info "Baixando $3 (só na primeira vez, pode demorar)..."
  baixar "$1" "$arquivo" || falha "Falha ao baixar $3. Verifique a internet."
  info "Extraindo $3..."
  mkdir -p "$2.tmp"
  tar -xf "$arquivo" -C "$2.tmp" --strip-components=1 || falha "Falha ao extrair $3 (o sistema tem xz-utils?)"
  mv "$2.tmp" "$2"
  rm -f "$arquivo"
}

case "$(uname -m)" in
  x86_64|amd64)  ARQ_JDK="x64";     ARQ_NODE="x64";   ARQ_PG="amd64";   ;;
  aarch64|arm64) ARQ_JDK="aarch64"; ARQ_NODE="arm64"; ARQ_PG="arm64v8"; ;;
  *) falha "Arquitetura $(uname -m) não suportada." ;;
esac

[[ "$(id -u)" -eq 0 ]] && falha "Não rode como root (o PostgreSQL recusa). Rode com seu usuário normal."

# ---------------------------------------------------------------- 1. Java
passo "Java 17+"
versao_java() { command -v java >/dev/null && java -version 2>&1 | sed -n 's/.*version "\([0-9]*\).*/\1/p' | head -1 || echo 0; }
if [[ $FORCAR_PORTATIL -eq 0 && "$(versao_java)" -ge 17 ]] 2>/dev/null; then
  ok "Usando o Java instalado (versão $(versao_java))"
else
  baixar_tar "https://api.adoptium.net/v3/binary/latest/17/ga/linux/$ARQ_JDK/jdk/hotspot/normal/eclipse" "$RUNTIME/jdk" "java17"
  export JAVA_HOME="$RUNTIME/jdk"
  export PATH="$JAVA_HOME/bin:$PATH"
  ok "Usando Java portátil ($JAVA_HOME)"
fi

# ---------------------------------------------------------------- 2. Node
passo "Node.js"
if [[ $FORCAR_PORTATIL -eq 0 ]] && command -v npm >/dev/null; then
  ok "Usando o Node instalado ($(node -v))"
else
  baixar_tar "https://nodejs.org/dist/$NODE_VERSAO/node-$NODE_VERSAO-linux-$ARQ_NODE.tar.xz" "$RUNTIME/node" "node"
  export PATH="$RUNTIME/node/bin:$PATH"
  ok "Usando Node portátil ($RUNTIME/node)"
fi

# ---------------------------------------------------------------- 3. Banco
passo "PostgreSQL (porta $PG_PORTA)"
PG="$RUNTIME/pgsql"
PG_DADOS="$RUNTIME/pgdata"
if [[ ! -x "$PG/bin/postgres" ]]; then
  info "Baixando PostgreSQL portátil (só na primeira vez)..."
  JAR="$RUNTIME/pg.jar"
  baixar "https://repo1.maven.org/maven2/io/zonky/test/postgres/embedded-postgres-binaries-linux-$ARQ_PG/$PG_VERSAO/embedded-postgres-binaries-linux-$ARQ_PG-$PG_VERSAO.jar" "$JAR" \
    || falha "Falha ao baixar o PostgreSQL."
  mkdir -p "$PG" "$RUNTIME/pgjar"
  (cd "$RUNTIME/pgjar" && jar xf "$JAR")          # o .jar traz um .txz com os binários
  tar -xJf "$(ls "$RUNTIME"/pgjar/*.txz | head -1)" -C "$PG" || falha "Falha ao extrair o PostgreSQL."
  rm -rf "$RUNTIME/pgjar" "$JAR"
fi

if [[ ! -f "$PG_DADOS/PG_VERSION" ]]; then
  info "Criando cluster do banco..."
  "$PG/bin/initdb" -D "$PG_DADOS" -U postgres -A trust -E UTF8 --no-locale >"$RUNTIME/initdb.log" 2>&1 \
    || falha "initdb falhou. Veja $RUNTIME/initdb.log"
fi

# Usuário e banco: criados em modo single-user (não precisa de psql)
if [[ ! -f "$RUNTIME/.banco_criado" ]]; then
  printf "CREATE USER bretas WITH PASSWORD 'bretas123';\nCREATE DATABASE imoveis_bretas OWNER bretas;\n" \
    | "$PG/bin/postgres" --single -D "$PG_DADOS" postgres >"$RUNTIME/setup.log" 2>&1 \
    || falha "Falha ao criar banco. Veja $RUNTIME/setup.log"
  touch "$RUNTIME/.banco_criado"
fi

if porta_aberta $PG_PORTA; then
  ok "PostgreSQL já estava rodando"
else
  "$PG/bin/pg_ctl" -D "$PG_DADOS" -l "$RUNTIME/postgres.log" -o "-p $PG_PORTA -k /tmp" start >/dev/null
  esperar_porta $PG_PORTA "PostgreSQL" 60 "$RUNTIME/postgres.log"
fi
ok "Banco imoveis_bretas e usuário bretas prontos"

# ---------------------------------------------------------------- 4. Backend
passo "Backend (Spring Boot)"
if porta_aberta 8080; then
  ok "Backend já estava rodando"
else
  info "Na primeira vez o Maven baixa as dependências (1-3 min)..."
  (cd "$BACKEND" && setsid bash mvnw spring-boot:run >"$RUNTIME/backend.log" 2>&1 & echo $! >"$RUNTIME/backend.pid")
  esperar_porta 8080 "Backend" 420 "$RUNTIME/backend.log"
fi

# ---------------------------------------------------------------- 5. Frontend
passo "Frontend (React)"
info "npm install..."
(cd "$FRONTEND" && npm install --no-audit --no-fund --loglevel=error) || falha "npm install falhou."
ok "Dependências do frontend instaladas"
if porta_aberta 5173; then
  ok "Frontend já estava rodando"
else
  (cd "$FRONTEND" && setsid npm run dev >"$RUNTIME/frontend.log" 2>&1 & echo $! >"$RUNTIME/frontend.pid")
  esperar_porta 5173 "Frontend" 90 "$RUNTIME/frontend.log"
fi

# ---------------------------------------------------------------- 6. Pronto
passo "Tudo pronto!"
info "Site:   http://localhost:5173"
info "Admin:  http://localhost:5173/admin  (admin@bretas.com / admin123)"
info "API:    http://localhost:8080/api/imoveis"
info "Banco:  localhost:$PG_PORTA  banco imoveis_bretas  usuário bretas / bretas123"
info "Logs:   $RUNTIME/backend.log e frontend.log"
info "Para desligar tudo: bash parar.sh"
command -v xdg-open >/dev/null && xdg-open "http://localhost:5173" >/dev/null 2>&1 || true
