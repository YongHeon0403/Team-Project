package org.zerock.server.service.product;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.zerock.server.domain.product.*;
import org.zerock.server.domain.user.UserInfo;
import org.zerock.server.dto.product.*;
import org.zerock.server.repository.product.ProductInfoRepository;
import org.zerock.server.repository.product.ProductCategoryRepository;
import org.zerock.server.repository.product.ProductLikeRepository;
import org.zerock.server.repository.product.ProductTagRelationRepository;
import org.zerock.server.repository.user.UserInfoRepository;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductInfoRepository productInfoRepository;
    private final ProductCategoryRepository productCategoryRepository;
    private final ProductTagRelationRepository productTagRelationRepository;
    private final ProductLikeRepository productLikeRepository;
    private final UserInfoRepository userInfoRepository;

    // 상품 등록
    @Transactional
    @Override
    public ProductInfo registerProduct(ProductRegisterRequestDto dto) {
        // 판매자(회원) 엔티티 조회 (존재하지 않으면 예외)
        UserInfo seller = userInfoRepository.findById(dto.getSellerId())
                .orElseThrow(() -> new IllegalArgumentException("판매자 정보를 찾을 수 없습니다."));

        // 카테고리 엔티티 조회 (존재하지 않으면 예외)
        ProductCategory category = productCategoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("카테고리를 찾을 수 없습니다."));

        // ProductInfo 엔티티 생성
        ProductInfo product = ProductInfo.builder()
                .seller(seller)
                .category(category)
                .title(dto.getTitle())
                .description(dto.getDescription())
                .price(dto.getPrice())
                .conditionStatus(dto.getConditionStatus())
                .tradeMethod(dto.getTradeMethod())
                .tradeLocation(dto.getTradeLocation())
                .latitude(dto.getLatitude())
                .longitude(dto.getLongitude())
                .build();

        // DB에 저장
        return productInfoRepository.save(product);
    }

    // 상품 수정
    @Transactional
    @Override
    public ProductInfo updateProduct(Long productId, ProductUpdateRequestDto dto) {
        // 기존 상품 조회
        ProductInfo product = productInfoRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("상품이 존재하지 않습니다."));

        // 카테고리 변경 시, 카테고리 엔티티 재조회
        if (dto.getCategoryId() != null) {
            ProductCategory category = productCategoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new IllegalArgumentException("카테고리를 찾을 수 없습니다."));
            product.setCategory(category);
        }

        // 각 필드 null 체크 후 변경
        if (dto.getTitle() != null) product.setTitle(dto.getTitle());
        if (dto.getDescription() != null) product.setDescription(dto.getDescription());
        if (dto.getPrice() != null) product.setPrice(dto.getPrice());
        if (dto.getConditionStatus() != null) product.setConditionStatus(dto.getConditionStatus());
        if (dto.getTradeMethod() != null) product.setTradeMethod(dto.getTradeMethod());
        if (dto.getTradeLocation() != null) product.setTradeLocation(dto.getTradeLocation());
        if (dto.getLatitude() != null) product.setLatitude(dto.getLatitude());
        if (dto.getLongitude() != null) product.setLongitude(dto.getLongitude());

        // JPA dirty checking 자동 반영
        return product;
    }

    // 상품 삭제
    @Override
    @Transactional
    public void deleteProduct(Long productId, Long userId) {
        // 상품 조회
        ProductInfo product = productInfoRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("상품이 존재하지 않습니다."));

        // 소유자 체크
        if (!product.getSeller().getUserId().equals(userId)) {
            throw new IllegalArgumentException("상품 삭제 권한이 없습니다.");
        }

        // 소프트 딜리트
        product.setDeleted(true);

        // JPA dirty checking으로 자동 업데이트 (save 필요 없음)
    }

    // 상품 리스트
    @Override
    public Page<ProductListResponseDto> getProductList(ProductListRequestDto requestDto) {
        // 페이지 정보 생성
        PageRequest pageRequest = PageRequest.of(requestDto.getPage(), requestDto.getSize());

        // 상품 목록 검색
        Page<ProductInfo> productPage = productInfoRepository.searchProductList(
                requestDto.getCategoryId(),
                requestDto.getStatus(),
                requestDto.getKeyword(),
                pageRequest
        );

        // 엔티티 -> DTO 매핑 (대표이미지는 예시로 첫 번째 이미지를 가져옴)
        List<ProductListResponseDto> dtoList = productPage.getContent().stream().map(product -> {
            String thumbnailUrl = null;
            if (product.getImages() != null && !product.getImages().isEmpty()) {
                thumbnailUrl = product.getImages().stream()
                        .filter(ProductImage::isThumbnail)
                        .map(ProductImage::getImageUrl)
                        .findFirst()
                        .orElse(product.getImages().iterator().next().getImageUrl());
            }
            return ProductListResponseDto.builder()
                    .productId(product.getProductId())
                    .thumbnailUrl(thumbnailUrl)
                    .title(product.getTitle())
                    .status(product.getStatus())
                    .price(product.getPrice())
                    .viewCount(product.getViewCount())
                    .registeredAt(product.getCreatedAt() != null ? product.getCreatedAt().toLocalDateTime() : null)
                    .build();
        }).collect(Collectors.toList());

        return new PageImpl<>(dtoList, pageRequest, productPage.getTotalElements());
    }

    // 상품 상세 정보 조회 비즈니스 로직
    @Override
    @Transactional(readOnly = true)
    public ProductDetailResponseDto getProductDetail(Long productId) {
        // 1. 상품 기본 정보 조회
        ProductInfo product = productInfoRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("상품이 존재하지 않습니다."));

        // 2. 상품 이미지 목록 추출 (Set<ProductImage> → List<String>)
        List<String> imageUrls = product.getImages().stream()
                .map(ProductImage::getImageUrl) // ProductImage의 imageUrl 추출
                .toList();

        // 3. 상품에 달린 태그 조회 (조인 테이블 통해)
        List<ProductTagRelation> tagRelations = productTagRelationRepository.findByProduct(product);
        List<String> tags = tagRelations.stream()
                .map(tr -> tr.getTag().getTagName()) // 각 관계에서 태그명 추출
                .toList();

        // 4. DTO 조립 및 반환
        return ProductDetailResponseDto.builder()
                .productId(product.getProductId())
                .title(product.getTitle())
                .description(product.getDescription())
                .price(product.getPrice())
                .conditionStatus(product.getConditionStatus())
                .tradeMethod(product.getTradeMethod())
                .tradeLocation(product.getTradeLocation())
                .latitude(product.getLatitude())
                .longitude(product.getLongitude())
                .status(product.getStatus())
                .viewCount(product.getViewCount())
                // java.sql.Timestamp → LocalDateTime 변환 (null 체크)
                .registeredAt(product.getCreatedAt() != null ? product.getCreatedAt().toLocalDateTime() : null)
                .imageUrls(imageUrls) // 이미지 url 목록
                .tags(tags)           // 태그명 목록
                .sellerId(product.getSeller().getUserId())          // 판매자 아이디
                .sellerNickname(product.getSeller().getNickname())  // 판매자 닉네임 (필드명 실제 UserInfo 엔티티와 맞춰야 함)
                .categoryName(product.getCategory().getCategoryName()) // 카테고리명 (필드명 실제 Category 엔티티와 맞춰야 함)
                .build();
    }

    // 찜/찜 해제(토글)
    @Override
    @Transactional
    public ProductLikeResponseDto toggleProductLike(Long productId, Long userId) {
        // 1. 유저, 상품 조회 (엔티티 소스 없이도 가능)
        UserInfo user = userInfoRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("유저 정보 없음"));
        ProductInfo product = productInfoRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("상품 정보 없음"));

        // 2. 이미 찜했는지 확인
        Optional<ProductLike> likeOpt = productLikeRepository.findByUserInfoAndProduct(user, product);

        if (likeOpt.isPresent()) {
            // 이미 찜 → 해제(삭제)
            productLikeRepository.delete(likeOpt.get());
            return ProductLikeResponseDto.builder()
                    .liked(false)
                    .likeId(null)
                    .build();
        } else {
            // 찜 안함 → 등록
            ProductLike like = ProductLike.builder()
                    .userInfo(user)
                    .product(product)
                    .build();
            ProductLike saved = productLikeRepository.save(like);
            return ProductLikeResponseDto.builder()
                    .liked(true)
                    .likeId(saved.getLikeId())
                    .build();
        }
    }

    // 단건 찜 상태 조회
    @Override
    @Transactional(readOnly = true)
    public ProductLikeResponseDto getProductLikeStatus(Long productId, Long userId) {
        UserInfo user = userInfoRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("유저 정보 없음"));
        ProductInfo product = productInfoRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("상품 정보 없음"));

        Optional<ProductLike> likeOpt = productLikeRepository.findByUserInfoAndProduct(user, product);

        if (likeOpt.isPresent()) {
            return ProductLikeResponseDto.builder()
                    .liked(true)
                    .likeId(likeOpt.get().getLikeId())
                    .build();
        } else {
            return ProductLikeResponseDto.builder()
                    .liked(false)
                    .likeId(null)
                    .build();
        }
    }

}
