package com.jirolite.auth.service;

import com.jirolite.auth.dto.AuthDtos.AuthResponse;
import com.jirolite.auth.dto.AuthDtos.LoginRequest;
import com.jirolite.auth.dto.AuthDtos.RegisterRequest;
import com.jirolite.auth.dto.AuthDtos.UserResponse;
import com.jirolite.auth.entity.RefreshToken;
import com.jirolite.auth.entity.User;
import com.jirolite.auth.entity.UserRole;
import com.jirolite.auth.repository.RefreshTokenRepository;
import com.jirolite.auth.repository.UserRepository;
import com.jirolite.auth.security.JwtService;
import com.jirolite.common.exception.UnauthorizedException;
import java.time.Instant;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final long refreshDays;

    public AuthService(UserRepository userRepository, RefreshTokenRepository refreshTokenRepository, PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager, JwtService jwtService, @Value("${app.jwt.refresh-token-days}") long refreshDays) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.refreshDays = refreshDays;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmailIgnoreCase(request.email())) {
            throw new IllegalArgumentException("Email is already registered");
        }
        User user = userRepository.save(User.builder()
                .name(request.name())
                .email(request.email().toLowerCase())
                .password(passwordEncoder.encode(request.password()))
                .role(UserRole.MEMBER)
                .build());
        return issueTokens(user);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.email(), request.password()));
        User user = userRepository.findByEmailIgnoreCase(request.email()).orElseThrow(() -> new UnauthorizedException("Invalid credentials"));
        return issueTokens(user);
    }

    @Transactional
    public AuthResponse refresh(String token) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new UnauthorizedException("Invalid refresh token"));
        if (refreshToken.getExpiryDate().isBefore(Instant.now())) {
            refreshTokenRepository.delete(refreshToken);
            throw new UnauthorizedException("Refresh token expired");
        }
        refreshTokenRepository.delete(refreshToken);
        return issueTokens(refreshToken.getUser());
    }

    @Transactional
    public void logout(String token) {
        if (token != null && !token.isBlank()) {
            refreshTokenRepository.deleteByToken(token);
        }
    }

    public long refreshMaxAgeSeconds() {
        return refreshDays * 24 * 60 * 60;
    }

    private AuthResponse issueTokens(User user) {
        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = UUID.randomUUID() + "." + UUID.randomUUID();
        refreshTokenRepository.save(RefreshToken.builder()
                .token(refreshToken)
                .user(user)
                .expiryDate(Instant.now().plusSeconds(refreshMaxAgeSeconds()))
                .build());
        return new AuthResponse(toUserResponse(user), accessToken, refreshToken);
    }

    private UserResponse toUserResponse(User user) {
        return new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getRole());
    }
}
