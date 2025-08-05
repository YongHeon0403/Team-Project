package org.zerock.server.domain.product;

import jakarta.persistence.*;
import lombok.*;
import org.zerock.server.domain.user.UserInfo;
import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Entity
@Table(name = "tb_product_info")
public class ProductInfo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long productId;

    // 판매자와 다대일 관계 (상품 N : 1 회원)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id", nullable = false)
    private UserInfo seller;

    // 카테고리와 다대일 관계 (상품 N : 1 카테고리)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private ProductCategory category;

    @Column(nullable = false, length = 255)
    private String title; // 상품명

    @Lob
    @Column(nullable = false)
    private String description; // 상세 설명

    @Column(nullable = false, precision = 10, scale = 0)
    private BigDecimal price; // 가격

    @Column(nullable = false, length = 50)
    private String conditionStatus; // 사용 상태

    @Column(nullable = false, length = 50)
    private String tradeMethod; // 거래 방식

    @Column(length = 255)
    private String tradeLocation; // 거래 장소

    @Column(precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(precision = 11, scale = 7)
    private BigDecimal longitude;

    @Column
    private int viewCount = 0;

    @Column(name = "registered_at", updatable = false, insertable = false)
    private java.sql.Timestamp createdAt; // 등록일시(생성일)

    @Column(length = 50)
    private String status = "SELLING"; // 상품 상태

    @Column
    private boolean isDeleted = false; // 삭제 여부(soft delete)

    // 상품-이미지 연관관계 (양방향, 1:N)
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private Set<ProductImage> images = new HashSet<>();
}
