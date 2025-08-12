package org.zerock.server.controller.auth;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.zerock.server.domain.user.UserInfo;
import org.zerock.server.dto.auth.LoginRequest;
import org.zerock.server.dto.auth.LoginResponse;
import org.zerock.server.repository.user.UserInfoRepository;
import org.zerock.server.security.jwt.JwtTokenProvider;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {

    private final UserInfoRepository userRepo;
    private final PasswordEncoder encoder;
    private final JwtTokenProvider jwt;

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest req) {
        UserInfo u = userRepo.findByEmail(req.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 계정"));

        if (!encoder.matches(req.getPassword(), u.getPassword())) {
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        }

        String access = jwt.createAccessToken(u.getEmail(), u.getRole().getRoleName(), u.getUserId());
        String refresh = jwt.createRefreshToken(u.getEmail());

        return LoginResponse.builder()
                .accessToken(access)
                .refreshToken(refresh)
                .userId(u.getUserId())
                .email(u.getEmail())
                .nickname(u.getNickname())
                .role(u.getRole().getRoleName())
                .build();
    }

    @PostMapping("/refresh")
    public Map<String, String> refresh(@RequestBody Map<String, String> body) {
        String refreshToken = body.get("refreshToken");

        if (refreshToken == null) throw new IllegalArgumentException("refreshToken 없음");
        if (!jwt.validate(refreshToken)) throw new IllegalArgumentException("refreshToken 무효");

        String email = jwt.getEmail(refreshToken);
        UserInfo u = userRepo.findByEmail(email).orElseThrow();
        String newAccess = jwt.createAccessToken(u.getEmail(), u.getRole().getRoleName(), u.getUserId());

        return Map.of("accessToken", newAccess);
    }

}
