// src/main/java/org/zerock/server/dto/auth/LoginResponse.java
package org.zerock.server.dto.auth;

import lombok.*;

@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class LoginResponse {
    private String accessToken;
    private String refreshToken;
    private Long userId;
    private String email;
    private String nickname;
    private String role;
}