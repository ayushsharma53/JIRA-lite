package com.jirolite.auth.controller;

import com.jirolite.auth.dto.AuthDtos.AuthResponse;
import com.jirolite.auth.dto.AuthDtos.LoginRequest;
import com.jirolite.auth.dto.AuthDtos.RefreshRequest;
import com.jirolite.auth.dto.AuthDtos.RegisterRequest;
import com.jirolite.auth.service.AuthService;
import com.jirolite.common.exception.UnauthorizedException;
import com.jirolite.common.util.CookieUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;
    private final CookieUtil cookieUtil;

    public AuthController(AuthService authService, CookieUtil cookieUtil) {
        this.authService = authService;
        this.cookieUtil = cookieUtil;
    }

    @PostMapping("/register")
    AuthResponse register(@Valid @RequestBody RegisterRequest request,
                           HttpServletRequest servletRequest,
                           HttpServletResponse response) {
        // Debug: log raw request body as received by Spring/Jackson (helps diagnose JSON escaping issues)
        try {
            servletRequest.getInputStream().readAllBytes();
        } catch (Exception ignored) {
            // input stream may have been consumed by Jackson already
        }
        AuthResponse auth = authService.register(request);
        cookieUtil.addAuthCookies(response, auth.accessToken(), auth.refreshToken(), authService.refreshMaxAgeSeconds());
        return auth;
    }

    @PostMapping("/login")
    AuthResponse login(@Valid @RequestBody LoginRequest request, HttpServletResponse response) {
        AuthResponse auth = authService.login(request);
        cookieUtil.addAuthCookies(response, auth.accessToken(), auth.refreshToken(), authService.refreshMaxAgeSeconds());
        return auth;
    }

    @PostMapping("/refresh")
    AuthResponse refresh(@RequestBody(required = false) RefreshRequest request, HttpServletRequest servletRequest, HttpServletResponse response) {
        String token = request != null && request.refreshToken() != null
                ? request.refreshToken()
                : cookieUtil.readCookie(servletRequest, "refreshToken").orElseThrow(() -> new UnauthorizedException("Missing refresh token"));
        AuthResponse auth = authService.refresh(token);
        cookieUtil.addAuthCookies(response, auth.accessToken(), auth.refreshToken(), authService.refreshMaxAgeSeconds());
        return auth;
    }

    @PostMapping("/logout")
    void logout(HttpServletRequest request, HttpServletResponse response) {
        authService.logout(cookieUtil.readCookie(request, "refreshToken").orElse(null));
        cookieUtil.clearAuthCookies(response);
    }
}
