package com.suriname.global.security.service;

import com.suriname.employee.entity.Employee;
import com.suriname.employee.repository.EmployeeRepository;
import com.suriname.global.security.dto.LoginRequestDto;
import com.suriname.global.security.dto.LoginResponseDto;
import com.suriname.global.security.dto.TokenRefreshRequestDto;
import com.suriname.global.security.dto.TokenRefreshResponseDto;
import com.suriname.global.security.principal.EmployeeDetails;
import com.suriname.global.security.provider.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final EmployeeRepository employeeRepository;

    public LoginResponseDto login(LoginRequestDto requestDto) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        requestDto.getLoginId(),
                        requestDto.getPassword()
                )
        );

        EmployeeDetails employeeDetails = (EmployeeDetails) authentication.getPrincipal();
        Employee employee = employeeDetails.getEmployee();

        String accessToken = jwtTokenProvider.createToken(
                employee.getLoginId(),
                employee.getRole().name()
        );

        String refreshToken = jwtTokenProvider.createRefreshToken(employee.getLoginId());

        return new LoginResponseDto(accessToken, refreshToken);
    }

    public TokenRefreshResponseDto refreshToken(TokenRefreshRequestDto requestDto) {
        String refreshToken = requestDto.getRefreshToken();

        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new RuntimeException("유효하지 않은 리프레시 토큰입니다.");
        }

        String loginId = jwtTokenProvider.getLoginId(refreshToken);
        Employee employee = employeeRepository.findByLoginId(loginId)
                .orElseThrow(() -> new RuntimeException("존재하지 않는 사용자입니다."));

        String newAccessToken = jwtTokenProvider.createToken(
                employee.getLoginId(),
                employee.getRole().name()
        );

        String newRefreshToken = jwtTokenProvider.createRefreshToken(employee.getLoginId());

        return new TokenRefreshResponseDto(newAccessToken, newRefreshToken);
    }
}
