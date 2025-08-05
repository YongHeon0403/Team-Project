package org.zerock.server.controller.product;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.zerock.server.dto.product.*;
import org.zerock.server.domain.product.ProductInfo;
import org.zerock.server.service.product.ProductService;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    // 상품 등록
    @PostMapping
    public ResponseEntity<ProductInfo> registerProduct(@RequestBody ProductRegisterRequestDto dto) {
        // 프론트에서 ProductRegisterRequestDto 구조로 요청 보내야 함
        ProductInfo product = productService.registerProduct(dto);
        return ResponseEntity.ok(product);
    }

    // 상품 수정
    @PutMapping("/{productId}")
    public ResponseEntity<ProductInfo> updateProduct(
            @PathVariable Long productId,
            @RequestBody ProductUpdateRequestDto dto
    ) {
        ProductInfo product = productService.updateProduct(productId, dto);
        return ResponseEntity.ok(product);
    }

    // 상품 삭제
    @DeleteMapping("/{productId}")
    public ResponseEntity<?> deleteProduct(
            @PathVariable Long productId,
            @RequestParam Long userId // ★ 실제론 인증에서 뽑는게 맞음
    ) {
        productService.deleteProduct(productId, userId);
        return ResponseEntity.ok().build();
    }

    // 상품 목록 + 검색/필터
    @GetMapping
    public Page<ProductListResponseDto> getProductList(
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        ProductListRequestDto requestDto = new ProductListRequestDto();
        requestDto.setCategoryId(categoryId);
        requestDto.setStatus(status);
        requestDto.setKeyword(keyword);
        requestDto.setPage(page);
        requestDto.setSize(size);

        return productService.getProductList(requestDto);
    }

    // 상품 상세 조회
    @GetMapping("/{productId}")
    public ResponseEntity<ProductDetailResponseDto> getProductDetail(@PathVariable Long productId) {
        ProductDetailResponseDto dto = productService.getProductDetail(productId);
        return ResponseEntity.ok(dto);
    }

    // 상품 찜 토글
    @PostMapping("/{productId}/like")
    public ResponseEntity<ProductLikeResponseDto> toggleProductLike(
            @PathVariable Long productId,
            @RequestParam Long userId // 실제론 인증에서 추출하는게 정석
    ) {
        ProductLikeResponseDto dto = productService.toggleProductLike(productId, userId);
        return ResponseEntity.ok(dto);
    }

    // 상품 찜 여부 단건 조회
    @GetMapping("/{productId}/like")
    public ResponseEntity<ProductLikeResponseDto> getProductLikeStatus(
            @PathVariable Long productId,
            @RequestParam Long userId
    ) {
        ProductLikeResponseDto dto = productService.getProductLikeStatus(productId, userId);
        return ResponseEntity.ok(dto);
    }

}
