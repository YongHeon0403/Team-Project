package org.zerock.server.domain.product;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "tb_product_image")
public class ProductImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long imageId; // 이미지 PK

    // 상품과 다대일 관계 (상품 1개당 여러 이미지)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private ProductInfo product;

    @Column(nullable = false, length = 255)
    private String imageUrl; // 이미지 파일 URL

    @Builder.Default
    private boolean isThumbnail = false; // 대표 이미지 여부

    @Column(name = "uploaded_at", updatable = false)
    private java.sql.Timestamp uploadedAt; // 업로드 시각(일반적으로 DB default current_timestamp)
}
