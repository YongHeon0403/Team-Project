package org.zerock.server.domain.product;

import jakarta.persistence.*;
import lombok.*;
import org.zerock.server.domain.user.UserInfo;

@Entity
@Table(name = "tb_product_like", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "product_id"})
})
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ProductLike {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long likeId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserInfo userInfo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private ProductInfo product;

    @Column(name = "liked_at", updatable = false)
    private java.sql.Timestamp likedAt;
}