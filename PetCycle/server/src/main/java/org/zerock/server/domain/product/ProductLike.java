package org.zerock.server.domain.product;

import jakarta.persistence.*;
import lombok.*;
import org.zerock.server.domain.user.UserInfo;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "tb_product_like", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "product_id"})
})
public class ProductLike {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long likeId; // PK

    // 어떤 사용자가 찜했는지 (N:1)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserInfo userInfo;

    // 어떤 상품을 찜했는지 (N:1)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private ProductInfo product;

    @Column(name = "liked_at", updatable = false)
    private java.sql.Timestamp likedAt; // 찜한 시각
}
