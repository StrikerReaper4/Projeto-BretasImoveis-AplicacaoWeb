package com.bretas.imoveis.config;

import com.bretas.imoveis.model.Imovel;
import com.bretas.imoveis.model.Role;
import com.bretas.imoveis.model.Usuario;
import com.bretas.imoveis.repository.ImovelRepository;
import com.bretas.imoveis.repository.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

/** Popula o banco na primeira execução (usuários de teste + imóveis de exemplo). */
@Component
public class DataSeeder implements CommandLineRunner {

    private static final List<String> FOTOS =
            List.of("/placeholder_house.jpg", "/placeholder_house_2.jpg", "/placeholder_house_3.png");

    private final UsuarioRepository usuarios;
    private final ImovelRepository imoveis;
    private final PasswordEncoder encoder;

    public DataSeeder(UsuarioRepository usuarios, ImovelRepository imoveis, PasswordEncoder encoder) {
        this.usuarios = usuarios;
        this.imoveis = imoveis;
        this.encoder = encoder;
    }

    @Override
    public void run(String... args) {
        if (usuarios.count() == 0) {
            usuarios.save(new Usuario("Administrador", "admin@bretas.com", encoder.encode("admin123"), Role.ADMIN));
            usuarios.save(new Usuario("Usuário Comum", "user@bretas.com", encoder.encode("user123"), Role.USER));
        }
        if (imoveis.count() == 0) {
            imoveis.saveAll(List.of(
                    imovel("Casa", "Aluguel", "Rua das Flores", "123", 2000, 2, 1, 1, 500000,
                            "Uma casa espaçosa e confortável, ideal para famílias grandes."),
                    imovel("Apartamento", "Compra", "Avenida Central", "456", 120, 3, 2, 2, 750000,
                            "Um apartamento moderno e aconchegante, perfeito para famílias pequenas."),
                    imovel("Terreno", "Compra", "Rua do Campo", "987", 1000, 0, 0, 0, 300000,
                            "Um terreno espaçoso ideal para construir a casa dos seus sonhos."),
                    imovel("Casa", "Aluguel", "Rua das Palmeiras", "321", 2500, 4, 3, 2, 1200000,
                            "Casa ampla com área de lazer."),
                    imovel("Apartamento", "Compra", "Avenida dos Lírios", "654", 100, 2, 1, 1, 600000,
                            "Apartamento bem localizado, próximo ao centro.")
            ));
        }
    }

    private Imovel imovel(String tipo, String situacao, String rua, String numero, int area,
                          int quartos, int banheiros, int vagas, double valor, String descricao) {
        Imovel i = new Imovel();
        i.setTipo(tipo);
        i.setSituacao(situacao);
        i.setRua(rua);
        i.setNumero(numero);
        i.setBairro("Jardim Exemplos");
        i.setCidade("Campo Grande");
        i.setEstado("MS");
        i.setArea(area);
        i.setQuartos(quartos);
        i.setBanheiros(banheiros);
        i.setVagas(vagas);
        i.setValor(valor);
        i.setDescricao(descricao);
        i.setImagens(FOTOS);
        return i;
    }
}
