package org.zerock.server.domain.product;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tb_product_image")
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ProductImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long imageId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private ProductInfo product;

    @Column(nullable = false, length = 255)
    private String imageUrl;

    @Builder.Default
    private boolean isThumbnail = false;

    @Column(name = "uploaded_at", updatable = false)
    private java.sql.Timestamp uploadedAt;
}