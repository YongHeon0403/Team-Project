package org.zerock.server.domain.product;

import jakarta.persistence.*;
import lombok.*;

/**
 * 상품과 태그의 다대다(N:M) 관계를 1:N + N:1 구조로 풀기 위한 조인 엔티티
 * 한 상품(ProductInfo)에 여러 태그(ProductTag) 가능,
 * 한 태그(ProductTag)가 여러 상품(ProductInfo)에 달릴 수 있음
 */
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "tb_product_tag_relation",
        uniqueConstraints = @UniqueConstraint(columnNames = {"product_id", "tag_id"}))
public class ProductTagRelation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // 단일 PK

    // 연결된 상품(필수, N:1)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private ProductInfo product;

    // 연결된 태그(필수, N:1)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tag_id", nullable = false)
    private ProductTag tag;
}
