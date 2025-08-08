package com.suriname.global.security.controller;

import com.suriname.global.security.dto.*;
import com.suriname.global.security.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> login(@RequestBody LoginRequestDto requestDto) {
        LoginResponseDto responseDto = authService.login(requestDto);
        return ResponseEntity.ok(responseDto);
    }

    @PostMapping("/refresh")
    public ResponseEntity<TokenRefreshResponseDto> refresh(@RequestBody TokenRefreshRequestDto requestDto) {
        TokenRefreshResponseDto responseDto = authService.refreshToken(requestDto);
        return ResponseEntity.ok(responseDto);
    }
}
