package org.zerock.server.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.zerock.server.domain.user.Role;
import org.zerock.server.repository.user.RoleRepository;

@Configuration
@RequiredArgsConstructor
public class BootstrapConfig {

    private final RoleRepository roleRepo;

    @Bean
    CommandLineRunner seedRoles() {
        return args -> {
            roleRepo.findByRoleName("USER")
                    .orElseGet(() -> roleRepo.save(Role.builder().roleName("USER").description("일반 사용자").build()));
            roleRepo.findByRoleName("ADMIN")
                    .orElseGet(() -> roleRepo.save(Role.builder().roleName("ADMIN").description("관리자").build()));
        };
    }
}
