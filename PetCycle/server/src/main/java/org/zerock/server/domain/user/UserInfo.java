package org.zerock.server.domain.user;

import jakarta.persistence.*;
import lombok.*;
import org.zerock.server.domain.product.ProductInfo;
import org.zerock.server.domain.product.ProductLike;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "tb_user_info")
@ToString (exclude = "userRoleList")
public class UserInfo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;

    // 권한부분 수정 (enum 사용, UserRole 테이블 삭제)
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

    @Column(nullable = false)
    private boolean isActive = true;

    // 권한 추가 메서드
    public void addRole(UserRole userRole){
        userRoleList.add(userRole);
    }

    // 상품(판매자 기준) 양방향 관계
    @OneToMany(mappedBy = "seller", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ProductInfo> products = new HashSet<>();

    // 찜한 상품 양방향 관계
    @OneToMany(mappedBy = "userInfo", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ProductLike> likes = new HashSet<>();
}
