package com.bretas.imoveis.service;

import com.bretas.imoveis.dto.AuthDtos.AuthResponse;
import com.bretas.imoveis.dto.AuthDtos.LoginRequest;
import com.bretas.imoveis.dto.AuthDtos.RegisterRequest;
import com.bretas.imoveis.model.Role;
import com.bretas.imoveis.model.Usuario;
import com.bretas.imoveis.repository.UsuarioRepository;
import com.bretas.imoveis.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

    private final UsuarioRepository repository;
    private final PasswordEncoder encoder;
    private final JwtService jwtService;

    public AuthService(UsuarioRepository repository, PasswordEncoder encoder, JwtService jwtService) {
        this.repository = repository;
        this.encoder = encoder;
        this.jwtService = jwtService;
    }

    /** Cadastro público: sempre cria ROLE_USER. Admins só via seed/banco. */
    public AuthResponse registrar(RegisterRequest req) {
        if (repository.existsByEmail(req.email())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "E-mail já cadastrado");
        }
        Usuario u = repository.save(new Usuario(req.nome(), req.email(), encoder.encode(req.senha()), Role.USER));
        return resposta(u);
    }

    public AuthResponse login(LoginRequest req) {
        Usuario u = repository.findByEmail(req.email())
                .filter(user -> encoder.matches(req.senha(), user.getSenha()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "E-mail ou senha inválidos"));
        return resposta(u);
    }

    private AuthResponse resposta(Usuario u) {
        return new AuthResponse(jwtService.gerarToken(u), u.getNome(), u.getEmail(), u.getRole().name());
    }
}
