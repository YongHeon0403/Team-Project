package org.zerock.server.service.product;

import org.springframework.data.domain.Page;
import org.zerock.server.dto.product.*;
import org.zerock.server.domain.product.ProductInfo;

// 서비스 인터페이스 (비즈니스 로직 추상화)
public interface ProductService {
    // 상품 등록
    ProductInfo registerProduct(ProductRegisterRequestDto dto);

    // 상품 수정
    ProductInfo updateProduct(Long productId, ProductUpdateRequestDto dto);

    // 상품 삭제
    void deleteProduct(Long productId, Long userId);

    // 상품 리스트
    Page<ProductListResponseDto> getProductList(ProductListRequestDto requestDto);

    // 상품 상세 조회
    ProductDetailResponseDto getProductDetail(Long productId);

    // 상품 찜/찜해제(토글)
    ProductLikeResponseDto toggleProductLike(Long productId, Long userId);

    // 찜 상태 단건 조회
    ProductLikeResponseDto getProductLikeStatus(Long productId, Long userId);

}
