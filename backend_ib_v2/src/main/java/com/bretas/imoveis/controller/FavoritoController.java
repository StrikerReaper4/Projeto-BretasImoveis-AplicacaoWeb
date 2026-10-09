package com.bretas.imoveis.controller;

import com.bretas.imoveis.model.Imovel;
import com.bretas.imoveis.service.FavoritoService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Favoritos do usuário logado (ROLE_USER). O usuário não é informado na URL:
 * vem do token JWT, então ninguém consegue mexer nos favoritos de outra pessoa.
 */
@RestController
@RequestMapping("/api/favoritos")
public class FavoritoController {

    private final FavoritoService service;

    public FavoritoController(FavoritoService service) {
        this.service = service;
    }

    @GetMapping
    public List<Imovel> listar(Authentication auth) {
        return service.listar(auth.getName());
    }

    @PostMapping("/{imovelId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void adicionar(@PathVariable Long imovelId, Authentication auth) {
        service.adicionar(auth.getName(), imovelId);
    }

    @DeleteMapping("/{imovelId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void remover(@PathVariable Long imovelId, Authentication auth) {
        service.remover(auth.getName(), imovelId);
    }
}
