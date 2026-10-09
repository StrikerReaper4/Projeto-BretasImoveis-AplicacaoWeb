# Como rodar (e demonstrar) – Imóveis Bretas

## Rodar
- **Windows 10/11**: dois cliques em **`INICIAR.bat`** (desligar: `PARAR.bat`).
- **Linux** (x86_64 ou arm64, inclusive WSL): `bash iniciar.sh` (desligar: `bash parar.sh`). Não rode como root. Os logs ficam em `.runtime/`.

Não precisa instalar nada antes nem ser administrador/sudo.
Na primeira vez precisa de internet e demora alguns minutos. Depois disso sobe em segundos.

O script faz tudo sozinho:
1. **Java 17+** e **Node.js**: usa os que já existem ou baixa versões portáteis para `.runtime\`.
2. **PostgreSQL**: baixa uma versão portátil, cria o banco `imoveis_bretas` e o usuário `bretas` e sobe na porta **5544**.
3. **Backend** Spring Boot (porta 8080). As tabelas e os dados de exemplo são criados na primeira execução.
4. **Frontend**: roda `npm install` e sobe o React (porta 5173).
5. Abre o site no navegador.

Para desligar tudo (backend, frontend e banco): **`PARAR.bat`**.

## Acessos
| O quê | Endereço | Login |
|---|---|---|
| Site (visitante) | http://localhost:5173 | – |
| Login / Criar conta | http://localhost:5173/login | mesma tela para usuário e admin |
| Usuário comum (favoritos) | http://localhost:5173/login | user@bretas.com / user123 |
| Painel admin | http://localhost:5173/login (ou /admin) | admin@bretas.com / admin123 |
| API | http://localhost:8080/api/imoveis | – |
| Banco (DBeaver) | localhost:**5544**, banco `imoveis_bretas` | bretas / bretas123 |

## Roteiro de demonstração (≈10 min)
1. **IDE**: árvore `model / repository / service / controller / security / config`.
2. **Banco**: DBeaver → nova conexão PostgreSQL (dados acima) → tabela `imoveis`.
3. **Site**: Home lista imóveis vindos da API → filtro → detalhe.
4. **Perfis na mesma tela de login** (`/login`): o perfil não é escolhido, quem decide é o back-end pelo `role` do token.
   - **Visitante**: botão "Entrar como visitante" → vê e filtra os imóveis.
   - **Usuário** (`user@bretas.com`): volta para a Home com o coração nos cards → favorita → menu "Meus Favoritos". Também dá para criar uma conta nova em "Criar conta".
   - **Admin** (`admin@bretas.com`): vai direto para o painel de gerenciamento.
5. **Segurança**: sem token, `DELETE /api/imoveis/1` retorna **401**; como USER retorna **403**; logado como admin → cadastrar, editar e excluir no painel.
6. **Prova de persistência**: cadastre um imóvel no painel e dê F5 na tabela no DBeaver: a linha aparece. Favorite um imóvel como usuário e consulte `SELECT * FROM usuario_favoritos;`.

## Endpoints
| Método | Rota | Acesso |
|---|---|---|
| POST | /api/auth/register, /api/auth/login | público |
| GET | /api/imoveis, /api/imoveis/{id} | público |
| POST | /api/imoveis/filtro | público |
| POST / PUT / DELETE | /api/imoveis[/{id}] | ROLE_ADMIN |
| GET | /api/favoritos | ROLE_USER (favoritos do próprio usuário) |
| POST / DELETE | /api/favoritos/{imovelId} | ROLE_USER |

O usuário dos favoritos vem do token JWT, nunca da URL: ninguém altera os favoritos de outra pessoa.

## Banco de dados
Tabelas criadas pelo Hibernate a partir das entidades:
- `imoveis` e `imovel_imagens` (1:N, fotos do imóvel)
- `usuarios` (e-mail único, senha em hash BCrypt, perfil USER/ADMIN)
- `usuario_favoritos` (N:N entre usuários e imóveis; chave primária composta `usuario_id, imovel_id`)

Ao excluir um imóvel, ele é removido antes dos favoritos de todos os usuários, para a chave estrangeira não bloquear a exclusão.

## Rodar manualmente (sem o script)
Com um PostgreSQL próprio, rode `backend_ib_v2/database/setup.sql` como `postgres` e informe a conexão:
```
set DB_URL=jdbc:postgresql://localhost:5432/imoveis_bretas
cd backend_ib_v2 && mvnw.cmd spring-boot:run
cd frontend_ib && npm install && npm run dev
```
