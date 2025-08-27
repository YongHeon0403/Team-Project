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
@ToString(exclude = "userRoleList")
public class UserInfo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;

    @ElementCollection
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

    // 소셜로그인 유무
    private boolean social;

    // ✅ @Builder.Default 로 빌더 생성 시에도 기본값 유지
    @Builder.Default
    @Column(nullable = false)
    private boolean isActive = true;

    // 권한 추가 메서드
    public void addRole(UserRole userRole){
        userRoleList.add(userRole);
    }

    public void changeNickname(String nickname){
        this.nickname = nickname;
    }

    public void changePassword(String password){
        this.password = password;
    }

    public void changeSocial(boolean social){
        this.social = social;
    }

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