package org.zerock.server.repository.product;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.zerock.server.domain.product.ProductInfo;

import java.util.List;

// 상품 테이블에 대한 기본 CRUD 레포지토리
public interface ProductInfoRepository extends JpaRepository<ProductInfo, Long> {
    // 삭제 안 된 상품만 조회
    List<ProductInfo> findByIsDeletedFalse();

    // 동적 쿼리가 필요하다면 QueryDSL, Specification, @Query 등을 활용함
    @Query("SELECT p FROM ProductInfo p " +
            "WHERE (:categoryId IS NULL OR p.category.categoryId = :categoryId) " +
            "AND (:status IS NULL OR p.status = :status) " +
            "AND (:keyword IS NULL OR (p.title LIKE %:keyword% OR p.description LIKE %:keyword%)) " +
            "AND p.isDeleted = false")
    Page<ProductInfo> searchProductList(
            @Param("categoryId") Integer categoryId,
            @Param("status") String status,
            @Param("keyword") String keyword,
            Pageable pageable
    );
}
