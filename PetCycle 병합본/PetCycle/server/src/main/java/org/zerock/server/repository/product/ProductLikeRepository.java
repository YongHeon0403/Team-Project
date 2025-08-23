package org.zerock.server.repository.product;

import org.springframework.data.jpa.repository.JpaRepository;
import org.zerock.server.domain.product.ProductLike;
import org.zerock.server.domain.product.ProductInfo;
import org.zerock.server.domain.user.UserInfo;

import java.util.Optional;

public interface ProductLikeRepository extends JpaRepository<ProductLike, Long> {
    // 특정 상품에 대한 특정 유저의 찜 정보 조회 (토글용)
    Optional<ProductLike> findByUserInfoAndProduct(UserInfo userInfo, ProductInfo product);

    // 특정 상품의 찜 개수 조회
    Long countByProduct(ProductInfo product);

    // 특정 유저가 찜한 상품 전체 조회
    java.util.List<ProductLike> findAllByUserInfo_UserId(Long userId);
}
