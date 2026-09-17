#!/usr/bin/env bash
# Desliga backend, frontend e o PostgreSQL portátil do projeto (Linux).
RAIZ="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RUNTIME="$RAIZ/.runtime"

parar() { # nome arquivo_pid
  if [[ -f "$2" ]] && kill -0 "$(cat "$2")" 2>/dev/null; then
    kill -- -"$(cat "$2")" 2>/dev/null || kill "$(cat "$2")"   # mata o grupo inteiro (mvnw + java, npm + vite)
    printf '    \033[32mOK\033[0m  %s parado\n' "$1"
  else
    printf '    %s já estava parado\n' "$1"
  fi
  rm -f "$2"
}

parar "Backend" "$RUNTIME/backend.pid"
parar "Frontend" "$RUNTIME/frontend.pid"

if [[ -f "$RUNTIME/pgdata/postmaster.pid" ]]; then
  "$RUNTIME/pgsql/bin/pg_ctl" -D "$RUNTIME/pgdata" -m fast -w stop >/dev/null
  printf '    \033[32mOK\033[0m  PostgreSQL parado (porta 5544)\n'
else
  printf '    PostgreSQL já estava parado\n'
fi

printf '\nTudo parado.\n'
