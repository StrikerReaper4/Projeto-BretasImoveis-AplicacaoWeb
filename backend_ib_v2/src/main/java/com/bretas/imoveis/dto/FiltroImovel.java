package com.bretas.imoveis.dto;

/** Todos os campos são opcionais: só entram na consulta os que vierem preenchidos. */
public record FiltroImovel(
        String situacao,
        String tipo,
        String estado,
        String cidade,
        String bairro,
        Double valorMin,
        Double valorMax,
        Integer quartos,
        Integer banheiros,
        Integer vagas
) {}
