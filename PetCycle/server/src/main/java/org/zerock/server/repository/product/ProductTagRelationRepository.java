package org.zerock.server.repository.product;

import org.zerock.server.domain.product.ProductTagRelation;
import org.zerock.server.domain.product.ProductInfo;
import org.zerock.server.domain.product.ProductTag;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

// 상품-태그 관계(조인) 관련 JPA Repository
public interface ProductTagRelationRepository extends JpaRepository<ProductTagRelation, Long> {

    // 특정 상품에 달린 태그들 조회
    List<ProductTagRelation> findByProduct(ProductInfo product);

    // 특정 태그가 달린 상품들 조회
    List<ProductTagRelation> findByTag(ProductTag tag);

    // (필요시) 상품과 태그 조합으로 단일 조회
    ProductTagRelation findByProductAndTag(ProductInfo product, ProductTag tag);

    // 특정 상품의 태그 전체 삭제
    void deleteByProduct(ProductInfo product);
}
