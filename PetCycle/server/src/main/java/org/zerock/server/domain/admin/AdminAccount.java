package org.zerock.server.domain.admin;

import jakarta.persistence.*;
import lombok.*;
import org.zerock.server.domain.BaseTimeEntity;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "tb_admin_account")
public class AdminAccount extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long adminId;

    @Column(unique = true, nullable = false, length = 100)
    private String username;

    @Column(nullable = false, length = 255)
    private String password;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 50)
    private String role;

    @Builder.Default
    private boolean isActive = true;
}
