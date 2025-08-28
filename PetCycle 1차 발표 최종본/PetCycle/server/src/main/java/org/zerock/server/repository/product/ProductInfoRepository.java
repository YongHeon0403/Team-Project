package org.zerock.server.repository.product;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.zerock.server.domain.product.ProductInfo;

public interface ProductInfoRepository extends JpaRepository<ProductInfo, Long> {
    // 기본 CRUD + 페이징
    Page<ProductInfo> findAllByIsDeletedFalse(Pageable pageable);

    // 카테고리별 상품 목록 (삭제 안 된 것만)
    Page<ProductInfo> findAllByCategory_CategoryIdAndIsDeletedFalse(Integer categoryId, Pageable pageable);

    // 판매자별 상품 목록
    Page<ProductInfo> findAllBySeller_UserIdAndIsDeletedFalse(Long userId, Pageable pageable);

    // 상품명(키워드) 검색
    Page<ProductInfo> findAllByTitleContainingAndIsDeletedFalse(String keyword, Pageable pageable);

    // 상태별 상품 목록 (예: SELLING, RESERVED, SOLD 등)
    Page<ProductInfo> findAllByStatusAndIsDeletedFalse(String status, Pageable pageable);
}
