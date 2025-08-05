package org.zerock.server.repository.product;

import org.zerock.server.domain.product.ProductTag;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

// 상품 태그 관련 JPA Repository
public interface ProductTagRepository extends JpaRepository<ProductTag, Integer> {

    // 태그명으로 검색 (중복 불가)
    Optional<ProductTag> findByTagName(String tagName);
}
