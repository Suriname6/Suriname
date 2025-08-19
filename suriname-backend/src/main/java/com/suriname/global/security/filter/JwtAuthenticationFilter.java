package com.suriname.global.security.filter;

import com.suriname.global.security.provider.JwtTokenProvider;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

	private final JwtTokenProvider jwtTokenProvider;

	@Override
	protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
		String path = request.getRequestURI();
		String method = request.getMethod();

		/*
		 * return path.equals("/api/auth/login") || path.equals("/api/auth/refresh") ||
		 * (path.equals("/api/users") && method.equals("POST"));
		 */

		boolean shouldSkip = path.equals("/api/auth/login") || path.equals("/api/auth/refresh")
				|| (path.equals("/api/users") && method.equals("POST"));

		System.out.println("=== JWT FILTER ===");
		System.out.println("URI: " + path);
		System.out.println("METHOD: " + method);
		System.out.println("shouldNotFilter: " + shouldSkip);

		return shouldSkip;
	}

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");
        String token = jwtTokenProvider.resolveToken(request);

        System.out.println("=== JWT FILTER doFilterInternal ===");
        System.out.println("Request URI: " + request.getRequestURI());
        System.out.println("Authorization Header: " + authHeader);
        System.out.println("Extracted Token: " + token);

		if (token != null && jwtTokenProvider.validateToken(token)) {
			Authentication authentication = jwtTokenProvider.getAuthentication(token);

			if (authentication instanceof AbstractAuthenticationToken tokenAuth) {
				tokenAuth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
			}

            SecurityContext context = SecurityContextHolder.createEmptyContext();
            context.setAuthentication(authentication);
            SecurityContextHolder.setContext(context);
		}

		filterChain.doFilter(request, response);
	}
}
