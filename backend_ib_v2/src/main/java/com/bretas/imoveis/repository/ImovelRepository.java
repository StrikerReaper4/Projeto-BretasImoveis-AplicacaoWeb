package com.bretas.imoveis.repository;

import com.bretas.imoveis.dto.FiltroImovel;
import com.bretas.imoveis.model.Imovel;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.ArrayList;
import java.util.List;

public interface ImovelRepository extends JpaRepository<Imovel, Long>, JpaSpecificationExecutor<Imovel> {

    /** Monta o WHERE dinamicamente (equivalente ao "where 1=1 and ..." da versão em Go). */
    static Specification<Imovel> comFiltro(FiltroImovel f) {
        return (root, query, cb) -> {
            List<Predicate> p = new ArrayList<>();
            if (preenchido(f.situacao())) p.add(cb.equal(root.get("situacao"), f.situacao()));
            if (preenchido(f.tipo())) p.add(cb.equal(root.get("tipo"), f.tipo()));
            if (preenchido(f.estado())) p.add(cb.equal(root.get("estado"), f.estado()));
            if (preenchido(f.cidade())) p.add(cb.like(cb.lower(root.get("cidade")), "%" + f.cidade().toLowerCase() + "%"));
            if (preenchido(f.bairro())) p.add(cb.like(cb.lower(root.get("bairro")), "%" + f.bairro().toLowerCase() + "%"));
            if (f.valorMin() != null) p.add(cb.greaterThanOrEqualTo(root.get("valor"), f.valorMin()));
            if (f.valorMax() != null) p.add(cb.lessThanOrEqualTo(root.get("valor"), f.valorMax()));
            if (f.quartos() != null) p.add(cb.greaterThanOrEqualTo(root.get("quartos"), f.quartos()));
            if (f.banheiros() != null) p.add(cb.greaterThanOrEqualTo(root.get("banheiros"), f.banheiros()));
            if (f.vagas() != null) p.add(cb.greaterThanOrEqualTo(root.get("vagas"), f.vagas()));
            return cb.and(p.toArray(new Predicate[0]));
        };
    }

    private static boolean preenchido(String s) {
        return s != null && !s.isBlank();
    }
}
