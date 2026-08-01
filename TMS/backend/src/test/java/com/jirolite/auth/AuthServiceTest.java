package com.jirolite.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.jirolite.auth.dto.AuthDtos.RegisterRequest;
import com.jirolite.auth.entity.User;
import com.jirolite.auth.entity.UserRole;
import com.jirolite.auth.repository.RefreshTokenRepository;
import com.jirolite.auth.repository.UserRepository;
import com.jirolite.auth.security.JwtService;
import com.jirolite.auth.service.AuthService;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {
    @Mock UserRepository userRepository;
    @Mock RefreshTokenRepository refreshTokenRepository;
    @Mock AuthenticationManager authenticationManager;
    @Mock JwtService jwtService;

    @Test
    void registerCreatesUserAndTokens() {
        AuthService service = new AuthService(userRepository, refreshTokenRepository, new BCryptPasswordEncoder(), authenticationManager, jwtService, 30);
        when(userRepository.existsByEmailIgnoreCase("avery@example.com")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(refreshTokenRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(jwtService.generateAccessToken(any(User.class))).thenReturn("access");

        var response = service.register(new RegisterRequest("Avery", "avery@example.com", "password123"));

        assertThat(response.accessToken()).isEqualTo("access");
        assertThat(response.user().role()).isEqualTo(UserRole.MEMBER);
    }

    @Test
    void duplicateEmailFailsFast() {
        AuthService service = new AuthService(userRepository, refreshTokenRepository, new BCryptPasswordEncoder(), authenticationManager, jwtService, 30);
        when(userRepository.existsByEmailIgnoreCase("avery@example.com")).thenReturn(true);

        assertThatThrownBy(() -> service.register(new RegisterRequest("Avery", "avery@example.com", "password123")))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
