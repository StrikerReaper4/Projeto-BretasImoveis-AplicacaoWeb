package com.bretas.imoveis.controller;

import com.bretas.imoveis.dto.AuthDtos.AuthResponse;
import com.bretas.imoveis.dto.AuthDtos.LoginRequest;
import com.bretas.imoveis.dto.AuthDtos.RegisterRequest;
import com.bretas.imoveis.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService service;

    public AuthController(AuthService service) {
        this.service = service;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse registrar(@RequestBody @Valid RegisterRequest req) {
        return service.registrar(req);
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody @Valid LoginRequest req) {
        return service.login(req);
    }
}
