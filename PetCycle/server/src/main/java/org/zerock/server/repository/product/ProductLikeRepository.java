package org.zerock.server.repository.product;

import org.zerock.server.domain.product.ProductLike;
import org.zerock.server.domain.product.ProductInfo;
import org.zerock.server.domain.user.UserInfo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

// 상품 찜(Like) 관련 JPA Repository
public interface ProductLikeRepository extends JpaRepository<ProductLike, Long> {

    // 유저가 특정 상품을 찜했는지 체크
    Optional<ProductLike> findByUserInfoAndProduct(UserInfo userInfo, ProductInfo product);

    // 유저가 찜한 상품 리스트, 상품별 찜 수 등 추가 쿼리 작성 가능
}
