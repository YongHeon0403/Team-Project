package org.zerock.server.repository.product;

import org.zerock.server.domain.product.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;

// 상품 이미지 관련 JPA Repository
public interface ProductImageRepository extends JpaRepository<ProductImage, Long> {
    // 필요시 커스텀 쿼리 추가 가능
}
