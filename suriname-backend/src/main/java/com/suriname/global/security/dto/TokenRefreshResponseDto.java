package com.suriname.global.security.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class TokenRefreshResponseDto {
    private String accessToken;
    private String refreshToken;
}
