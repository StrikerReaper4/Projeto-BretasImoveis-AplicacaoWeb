package com.bretas.imoveis.service;

import com.bretas.imoveis.dto.FiltroImovel;
import com.bretas.imoveis.model.Imovel;
import com.bretas.imoveis.repository.ImovelRepository;
import com.bretas.imoveis.repository.UsuarioRepository;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class ImovelService {

    private final ImovelRepository repository;
    private final UsuarioRepository usuarios;

    public ImovelService(ImovelRepository repository, UsuarioRepository usuarios) {
        this.repository = repository;
        this.usuarios = usuarios;
    }

    public List<Imovel> listar() {
        return repository.findAll(Sort.by("id"));
    }

    public Imovel buscar(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Imóvel não encontrado"));
    }

    public List<Imovel> filtrar(FiltroImovel filtro) {
        return repository.findAll(ImovelRepository.comFiltro(filtro), Sort.by("id"));
    }

    public Imovel criar(Imovel imovel) {
        imovel.setId(null);
        return repository.save(imovel);
    }

    public Imovel atualizar(Long id, Imovel dados) {
        buscar(id);
        dados.setId(id);
        return repository.save(dados);
    }

    /** Remove o imóvel dos favoritos antes de excluí-lo (a chave estrangeira bloquearia o DELETE). */
    @Transactional
    public void deletar(Long id) {
        Imovel imovel = buscar(id);
        usuarios.removerImovelDosFavoritos(id);
        repository.delete(imovel);
    }
}
