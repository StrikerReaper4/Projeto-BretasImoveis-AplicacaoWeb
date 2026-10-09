package com.bretas.imoveis.repository;

import com.bretas.imoveis.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByEmail(String email);

    boolean existsByEmail(String email);

    /**
     * Remove o imóvel da lista de favoritos de todos os usuários.
     * Necessário antes de excluir um imóvel: a chave estrangeira de usuario_favoritos
     * impediria o DELETE em imoveis.
     */
    @Modifying
    @Query(value = "DELETE FROM usuario_favoritos WHERE imovel_id = :imovelId", nativeQuery = true)
    void removerImovelDosFavoritos(@Param("imovelId") Long imovelId);
}
