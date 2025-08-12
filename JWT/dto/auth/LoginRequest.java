// src/main/java/org/zerock/server/dto/auth/LoginRequest.java
package org.zerock.server.dto.auth;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class LoginRequest {
    private String email;
    private String password;
}