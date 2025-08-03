package com.suriname.global.security.controller;

import com.suriname.global.security.dto.LoginRequestDto;
import com.suriname.global.security.dto.LoginResponseDto;
import com.suriname.global.security.dto.TokenRefreshRequestDto;
import com.suriname.global.security.dto.TokenRefreshResponseDto;
import com.suriname.global.security.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
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
