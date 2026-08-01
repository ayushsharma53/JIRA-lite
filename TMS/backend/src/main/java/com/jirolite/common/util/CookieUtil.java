package com.jirolite.common.util;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.Arrays;
import java.util.Optional;
import org.springframework.http.ResponseCookie;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class CookieUtil {
    private final boolean secure;

    public CookieUtil(@Value("${app.cookie.secure:false}") boolean secure) {
        this.secure = secure;
    }

    public void addAuthCookies(HttpServletResponse response, String accessToken, String refreshToken, long refreshMaxAgeSeconds) {
        response.addHeader("Set-Cookie", cookie("accessToken", accessToken, 15 * 60).toString());
        response.addHeader("Set-Cookie", cookie("refreshToken", refreshToken, refreshMaxAgeSeconds).toString());
    }

    public void clearAuthCookies(HttpServletResponse response) {
        response.addHeader("Set-Cookie", cookie("accessToken", "", 0).toString());
        response.addHeader("Set-Cookie", cookie("refreshToken", "", 0).toString());
    }

    public Optional<String> readCookie(HttpServletRequest request, String name) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return Optional.empty();
        }
        return Arrays.stream(cookies).filter(cookie -> name.equals(cookie.getName())).map(Cookie::getValue).findFirst();
    }

    private ResponseCookie cookie(String name, String value, long maxAgeSeconds) {
        return ResponseCookie.from(name, value)
                .httpOnly(true)
                .secure(secure)
                .sameSite("Lax")
                .path("/")
                .maxAge(maxAgeSeconds)
                .build();
    }
}
