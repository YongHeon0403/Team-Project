package org.zerock.server.repository.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.zerock.server.domain.user.Role;

import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Integer> {
    Optional<Role> findByRoleName(String roleName);
}