package org.zerock.server.domain.user;

import jakarta.persistence.*;
import lombok.*;
import org.zerock.server.domain.product.ProductInfo;
import org.zerock.server.domain.product.ProductLike;

import java.util.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "tb_user_info")
@ToString(exclude = {"userRoleList", "products", "likes"})
public class UserInfo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;

    /**
     * 권한 (Enum 기반)
     * - ElementCollection은 별도 엔티티 없이 값 컬렉션을 저장(조인 테이블은 생김)
     * - ORDINAL 대신 STRING으로 저장하여 안전(추후 enum 순서 변경에도 안전)
     */
    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(
            name = "tb_user_roles",
            joinColumns = @JoinColumn(name = "user_id")
    )
    @Column(name = "role_name", length = 50, nullable = false)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private List<UserRole> userRoleList = new ArrayList<>();

    @Column(unique = true, nullable = false, length = 255)
    private String email;

    @Column(length = 20)
    private String phoneNumber;

    @Column(nullable = false, length = 255)
    private String password;

    @Column(unique = true, nullable = false, length = 50)
    private String nickname;

    @Column(nullable = false, length = 100)
    private String region;

    // ✅ @Builder.Default 로 빌더 생성 시에도 기본값 유지
    @Builder.Default
    @Column(nullable = false)
    private boolean isActive = true;

    // ===== 연관관계 =====

    // 상품(판매자 기준)
    @OneToMany(mappedBy = "seller", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private Set<ProductInfo> products = new HashSet<>();

    // 찜한 상품
    @OneToMany(mappedBy = "userInfo", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private Set<ProductLike> likes = new HashSet<>();

}
