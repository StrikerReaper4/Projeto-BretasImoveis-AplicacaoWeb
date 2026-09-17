package com.bretas.imoveis.controller;

import com.bretas.imoveis.dto.FiltroImovel;
import com.bretas.imoveis.model.Imovel;
import com.bretas.imoveis.service.ImovelService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/imoveis")
public class ImovelController {

    private final ImovelService service;

    public ImovelController(ImovelService service) {
        this.service = service;
    }

    @GetMapping
    public List<Imovel> listar() {
        return service.listar();
    }

    @GetMapping("/{id}")
    public Imovel buscar(@PathVariable Long id) {
        return service.buscar(id);
    }

    @PostMapping("/filtro")
    public List<Imovel> filtrar(@RequestBody FiltroImovel filtro) {
        return service.filtrar(filtro);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Imovel criar(@RequestBody @Valid Imovel imovel) {
        return service.criar(imovel);
    }

    @PutMapping("/{id}")
    public Imovel atualizar(@PathVariable Long id, @RequestBody @Valid Imovel imovel) {
        return service.atualizar(id, imovel);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletar(@PathVariable Long id) {
        service.deletar(id);
    }
}
