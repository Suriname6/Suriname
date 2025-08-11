package com.suriname.global.security.filter;

import com.suriname.global.security.provider.JwtTokenProvider;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.Authentication;
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

        boolean isApi = path.startsWith("/api/");

        boolean authWhitelist =
                path.equals("/api/auth/login") ||
                        path.equals("/api/auth/refresh") ||
                        (path.equals("/api/users") && "POST".equals(method)) ||
                        (path.equals("/api/payments/webhook/toss") && "POST".equals(method));

        boolean staticWhitelist =
                path.equals("/") ||
                        path.equals("/index.html") ||
                        path.startsWith("/assets/") ||
                        path.equals("/favicon.ico") ||
                        path.startsWith("/static/");

        boolean shouldSkip = !isApi || authWhitelist || staticWhitelist;

        System.out.println("=== JWT FILTER ===");
        System.out.println("URI: " + path + " | METHOD: " + method + " | shouldNotFilter: " + shouldSkip);

        return shouldSkip;
	}

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {
		String token = jwtTokenProvider.resolveToken(request);

		if (token != null && jwtTokenProvider.validateToken(token)) {
			Authentication authentication = jwtTokenProvider.getAuthentication(token);

			if (authentication instanceof AbstractAuthenticationToken tokenAuth) {
				tokenAuth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
			}

			SecurityContextHolder.getContext().setAuthentication(authentication);
		}

		filterChain.doFilter(request, response);
	}
}
