package org.zerock.server.domain.product;

import jakarta.persistence.*;
import lombok.*;
import org.zerock.server.domain.user.UserInfo;
import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "tb_product_info")
public class ProductInfo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long productId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id", nullable = false)
    private UserInfo seller;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private ProductCategory category;

    @Column(nullable = false, length = 255)
    private String title;

    @Lob
    @Column(nullable = false)
    private String description;

    @Column(nullable = false, precision = 10, scale = 0)
    private BigDecimal price;

    @Column(nullable = false, length = 50)
    private String conditionStatus;

    @Column(nullable = false, length = 50)
    private String tradeMethod;

    @Column(length = 255)
    private String tradeLocation;

    @Column(precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(precision = 11, scale = 7)
    private BigDecimal longitude;

    @Column
    private int viewCount = 0;

    @Column(length = 50)
    private String status = "SELLING";

    @Column
    private boolean isDeleted = false;

    // 상품-이미지 양방향
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ProductImage> images = new HashSet<>();

    // 찜 양방향
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ProductLike> likes = new HashSet<>();

    // 태그 조인 양방향
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ProductTagRelation> tagRelations = new HashSet<>();
}
