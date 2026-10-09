package com.bretas.imoveis.service;

import com.bretas.imoveis.model.Imovel;
import com.bretas.imoveis.model.Usuario;
import com.bretas.imoveis.repository.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Comparator;
import java.util.List;

/** Favoritos do usuário comum. O usuário é sempre o dono do token (e-mail no "subject" do JWT). */
@Service
public class FavoritoService {

    private final UsuarioRepository usuarios;
    private final ImovelService imoveis;

    public FavoritoService(UsuarioRepository usuarios, ImovelService imoveis) {
        this.usuarios = usuarios;
        this.imoveis = imoveis;
    }

    @Transactional(readOnly = true)
    public List<Imovel> listar(String email) {
        return usuario(email).getFavoritos().stream()
                .sorted(Comparator.comparing(Imovel::getId))
                .toList();
    }

    /** Idempotente: favoritar duas vezes o mesmo imóvel não duplica. */
    @Transactional
    public void adicionar(String email, Long imovelId) {
        Usuario u = usuario(email);
        boolean jaFavorito = u.getFavoritos().stream().anyMatch(i -> i.getId().equals(imovelId));
        if (!jaFavorito) {
            u.getFavoritos().add(imoveis.buscar(imovelId)); // 404 se o imóvel não existir
        }
    }

    @Transactional
    public void remover(String email, Long imovelId) {
        usuario(email).getFavoritos().removeIf(i -> i.getId().equals(imovelId));
    }

    private Usuario usuario(String email) {
        return usuarios.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário não encontrado"));
    }
}
