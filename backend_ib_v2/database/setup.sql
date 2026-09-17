-- Rode UMA vez como superusuário "postgres" (pgAdmin > Query Tool, ou psql).
-- As tabelas são criadas automaticamente pelo Spring (JPA ddl-auto=update).
CREATE USER bretas WITH PASSWORD 'bretas123';
CREATE DATABASE imoveis_bretas OWNER bretas;
