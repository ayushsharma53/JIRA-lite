package com.jirolite.auth.dto;

import com.jirolite.auth.entity.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.UUID;

public final class AuthDtos {
    private AuthDtos() {}

    public record RegisterRequest(
            @NotBlank String name,
            @Email @NotBlank String email,
            @Size(min = 8) String password
    ) {}

    public record LoginRequest(@Email @NotBlank String email, @NotBlank String password) {}

    public record RefreshRequest(String refreshToken) {}

    public record UserResponse(UUID id, String name, String email, UserRole role) {}

    public record AuthResponse(UserResponse user, String accessToken, String refreshToken) {}
}
