// src/main/java/org/zerock/server/security/CustomUserDetailsService.java
package org.zerock.server.security;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;
import org.zerock.server.domain.user.UserInfo;
import org.zerock.server.repository.user.UserInfoRepository;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserInfoRepository userInfoRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        UserInfo u = userInfoRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("no user"));
        String role = "ROLE_" + u.getRole().getRoleName().toUpperCase();
        return org.springframework.security.core.userdetails.User
                .withUsername(u.getEmail())
                .password(u.getPassword())        // BCrypt 저장 전제
                .authorities(role)
                .build();
    }
}
