package org.zerock.server.service.product;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.zerock.server.domain.product.*;
import org.zerock.server.domain.user.UserInfo;
import org.zerock.server.domain.user.UserRole;
import org.zerock.server.dto.product.*;
import org.zerock.server.repository.product.*;
import org.zerock.server.repository.user.UserInfoRepository;

import java.time.LocalDateTime; // ★ toggleLike에 필요
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductInfoRepository productInfoRepository;
    private final ProductCategoryRepository productCategoryRepository;
    private final ProductImageRepository productImageRepository;
    private final ProductTagRepository productTagRepository;
    private final ProductTagRelationRepository productTagRelationRepository;
    private final ProductLikeRepository productLikeRepository;
    private final UserInfoRepository userInfoRepository;

    /** 권한/유저 헬퍼 */
    private boolean hasRole(UserInfo user, UserRole role) {
        return user.getUserRoleList() != null && user.getUserRoleList().contains(role);
    }
    private UserInfo getUser(UserDetails userDetails) {
        if (userDetails == null) throw new IllegalArgumentException("로그인 필요");
        return userInfoRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("사용자 없음"));
    }
    private UserInfo getUser(Long userId) {
        if (userId == null) throw new IllegalArgumentException("로그인 필요");
        return userInfoRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자 없음"));
    }

    /** 등록: 컨트롤러가 저장한 파일명(dto.uploadFileNames)을 DB에만 기록 */
    @Transactional
    @Override
    public Long registerProduct(ProductRegisterRequestDto dto, Long userId) {
        UserInfo user = getUser(userId);

        ProductCategory category = productCategoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("카테고리 없음"));

        ProductInfo product = ProductInfo.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .price(dto.getPrice())
                .conditionStatus(dto.getConditionStatus())
                .tradeMethod(dto.getTradeMethod())
                .tradeLocation(dto.getTradeLocation())
                .latitude(dto.getLatitude())
                .longitude(dto.getLongitude())
                .seller(user)
                .category(category)
                .build();

        ProductInfo saved = productInfoRepository.save(product);

        // 이미지(파일명 기반)
        List<String> fileNames = dto.getUploadFileNames();
        if (fileNames != null && !fileNames.isEmpty()) {
            boolean first = true;
            for (String fn : fileNames) {
                productImageRepository.save(ProductImage.builder()
                        .product(saved)
                        .imageUrl(fn)          // 컨트롤러가 넘긴 "파일명"만 저장
                        .isThumbnail(first)
                        .build());
                first = false;
            }
        }

        // 태그
        if (dto.getTagNames() != null) {
            for (String tagName : dto.getTagNames()) {
                ProductTag tag = productTagRepository.findByTagName(tagName)
                        .orElseGet(() -> productTagRepository.save(ProductTag.builder().tagName(tagName).build()));
                productTagRelationRepository.save(ProductTagRelation.builder()
                        .product(saved)
                        .tag(tag)
                        .build());
            }
        }

        return saved.getProductId();
    }

    /** 수정: DTO.uploadFileNames = 수정 후 최종 파일 집합 */
    @Transactional
    @Override
    public void updateProduct(Long productId, ProductUpdateRequestDto dto, Long userId) {
        UserInfo user = getUser(userId);

        ProductInfo product = productInfoRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("상품 없음"));

        if (!product.getSeller().getUserId().equals(user.getUserId()) && !hasRole(user, UserRole.ADMIN)) {
            throw new SecurityException("수정 권한 없음");
        }

        // 기본 필드 업데이트
        if (dto.getTitle() != null) product.setTitle(dto.getTitle());
        if (dto.getDescription() != null) product.setDescription(dto.getDescription());
        if (dto.getPrice() != null) product.setPrice(dto.getPrice());
        if (dto.getConditionStatus() != null) product.setConditionStatus(dto.getConditionStatus());
        if (dto.getTradeMethod() != null) product.setTradeMethod(dto.getTradeMethod());
        if (dto.getTradeLocation() != null) product.setTradeLocation(dto.getTradeLocation());
        if (dto.getLatitude() != null) product.setLatitude(dto.getLatitude());
        if (dto.getLongitude() != null) product.setLongitude(dto.getLongitude());
        if (dto.getStatus() != null) product.setStatus(dto.getStatus());
        if (dto.getCategoryId() != null) {
            ProductCategory cat = productCategoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new IllegalArgumentException("카테고리 없음"));
            product.setCategory(cat);
        }

        // --- 이미지 동기화 (DB 레코드 기준) ---
        List<ProductImage> current = productImageRepository.findAllByProduct_ProductId(productId);
        Set<String> currentNames = current.stream()
                .map(ProductImage::getImageUrl)
                .collect(Collectors.toSet());

        List<String> finalNames = (dto.getUploadFileNames() != null) ? dto.getUploadFileNames() : Collections.emptyList();
        Set<String> finalSet = new HashSet<>(finalNames);

        // 삭제 대상(현재 DB엔 있는데 최종 목록엔 없음)
        List<ProductImage> toDelete = current.stream()
                .filter(img -> !finalSet.contains(img.getImageUrl()))
                .collect(Collectors.toList());
        if (!toDelete.isEmpty()) {
            productImageRepository.deleteAll(toDelete);
        }

        // 추가 대상(최종 목록엔 있는데 DB엔 없음)
        List<String> toAdd = finalNames.stream()
                .filter(fn -> !currentNames.contains(fn))
                .collect(Collectors.toList());
        for (String fn : toAdd) {
            productImageRepository.save(ProductImage.builder()
                    .product(product)
                    .imageUrl(fn)
                    .isThumbnail(false) // 썸네일은 아래에서 일괄 재설정
                    .build());
        }

        // 썸네일 재설정: 최종 목록의 첫 번째를 썸네일로
        current = productImageRepository.findAllByProduct_ProductId(productId);
        for (ProductImage img : current) {
            img.setThumbnail(false);
        }
        if (!finalNames.isEmpty()) {
            String thumb = finalNames.get(0);
            for (ProductImage img : current) {
                if (thumb.equals(img.getImageUrl())) {
                    img.setThumbnail(true);
                    break;
                }
            }
        }
        productInfoRepository.save(product);
    }

    /** 삭제: soft delete만 수행 (실제 파일 삭제는 컨트롤러에서) */
    @Transactional
    @Override
    public void deleteProduct(Long productId, Long userId) {
        UserInfo user = getUser(userId);

        ProductInfo product = productInfoRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("상품 없음"));

        if (!product.getSeller().getUserId().equals(user.getUserId()) && !hasRole(user, UserRole.ADMIN)) {
            throw new SecurityException("삭제 권한 없음");
        }
        product.setDeleted(true);
        productInfoRepository.save(product);
    }

    // ===== 기존 구현 그대로 채워 넣음 =====

    @Transactional(readOnly = true)
    @Override
    public ProductDetailResponseDto getProductDetail(Long productId, UserDetails userDetails) {
        ProductInfo product = productInfoRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("상품 없음"));

        if (product.isDeleted()) throw new IllegalArgumentException("삭제된 상품");

        UserInfo currentUser = (userDetails != null) ? getUser(userDetails) : null;

        // 이미지 목록 매핑
        List<ProductImageDto> images = new ArrayList<>();
        productImageRepository.findAllByProduct_ProductId(productId)
                .forEach(img -> images.add(ProductImageDto.builder()
                        .imageId(img.getImageId())
                        .imageUrl(img.getImageUrl())
                        .isThumbnail(img.isThumbnail())
                        .build()));

        // 태그명 목록
        List<String> tagNames = new ArrayList<>();
        productTagRelationRepository.findAllByProduct_ProductId(productId)
                .forEach(rel -> tagNames.add(rel.getTag().getTagName()));

        // 로그인 유저가 찜했는지
        boolean isLiked = false;
        if (currentUser != null) {
            isLiked = productLikeRepository.findByUserInfoAndProduct(currentUser, product).isPresent();
        }

        // 카테고리/판매자 DTO와 함께 반환
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
                .isLiked(isLiked)
                .category(ProductCategoryDto.builder()
                        .categoryId(product.getCategory().getCategoryId())
                        .categoryName(product.getCategory().getCategoryName())
                        .parentCategoryId(product.getCategory().getParentCategory() != null
                                ? product.getCategory().getParentCategory().getCategoryId()
                                : null)
                        .petTypeId(product.getCategory().getPetTypeCategory() != null
                                ? product.getCategory().getPetTypeCategory().getPetTypeId()
                                : null)
                        .build())
                .seller(ProductSellerDto.builder()
                        .userId(product.getSeller().getUserId())
                        .nickname(product.getSeller().getNickname())
                        .region(product.getSeller().getRegion())
                        .build())
                .images(images)
                .tags(tagNames)
                .build();
    }

    @Transactional(readOnly = true)
    @Override
    public Page<ProductListResponseDto> getProductList(
            Pageable pageable,
            Integer categoryId,
            String keyword,
            String status,
            Long sellerId,
            UserDetails userDetails
    ) {
        Page<ProductInfo> productPage;
        if (categoryId != null) {
            productPage = productInfoRepository.findAllByCategory_CategoryIdAndIsDeletedFalse(categoryId, pageable);
        } else if (sellerId != null) {
            productPage = productInfoRepository.findAllBySeller_UserIdAndIsDeletedFalse(sellerId, pageable);
        } else if (keyword != null && !keyword.isBlank()) {
            productPage = productInfoRepository.findAllByTitleContainingAndIsDeletedFalse(keyword, pageable);
        } else if (status != null) {
            productPage = productInfoRepository.findAllByStatusAndIsDeletedFalse(status, pageable);
        } else {
            productPage = productInfoRepository.findAllByIsDeletedFalse(pageable);
        }

        UserInfo currentUser = (userDetails != null) ? getUser(userDetails) : null;

        return productPage.map(product -> {
            // 썸네일
            String thumbnailUrl = null;
            ProductImage thumbnail = productImageRepository.findByProduct_ProductIdAndIsThumbnailTrue(product.getProductId());
            if (thumbnail != null) thumbnailUrl = thumbnail.getImageUrl();

            // 로그인 유저의 찜 여부
            boolean isLiked = false;
            if (currentUser != null) {
                isLiked = productLikeRepository.findByUserInfoAndProduct(currentUser, product).isPresent();
            }

            // 태그명 목록
            List<String> tagNames = new ArrayList<>();
            productTagRelationRepository.findAllByProduct_ProductId(product.getProductId())
                    .forEach(rel -> tagNames.add(rel.getTag().getTagName()));

            return ProductListResponseDto.builder()
                    .productId(product.getProductId())
                    .title(product.getTitle())
                    .price(product.getPrice())
                    .thumbnailUrl(thumbnailUrl)
                    .conditionStatus(product.getConditionStatus())
                    .tradeLocation(product.getTradeLocation())
                    .status(product.getStatus())
                    .viewCount(product.getViewCount())
                    .isLiked(isLiked)
                    .category(ProductCategoryDto.builder()
                            .categoryId(product.getCategory().getCategoryId())
                            .categoryName(product.getCategory().getCategoryName())
                            .parentCategoryId(product.getCategory().getParentCategory() != null
                                    ? product.getCategory().getParentCategory().getCategoryId()
                                    : null)
                            .petTypeId(product.getCategory().getPetTypeCategory() != null
                                    ? product.getCategory().getPetTypeCategory().getPetTypeId()
                                    : null)
                            .build())
                    .seller(ProductSellerDto.builder()
                            .userId(product.getSeller().getUserId())
                            .nickname(product.getSeller().getNickname())
                            .region(product.getSeller().getRegion())
                            .build())
                    .tags(tagNames)
                    .build();
        });
    }

    /** 개별 이미지 삭제: DB에서 지우고, 삭제한 파일명을 반환(컨트롤러가 물리 삭제) */
    @Transactional
    @Override
    public String deleteImageAndReturnFileName(Long imageId, Long userId) {
        UserInfo user = getUser(userId);

        ProductImage image = productImageRepository.findById(imageId)
                .orElseThrow(() -> new IllegalArgumentException("이미지 없음"));
        ProductInfo product = image.getProduct();

        if (!product.getSeller().getUserId().equals(user.getUserId()) && !hasRole(user, UserRole.ADMIN)) {
            throw new SecurityException("삭제 권한 없음");
        }
        String fileName = image.getImageUrl();
        productImageRepository.delete(image);
        return fileName;
    }

    /** 찜/좋아요 토글 */
    @Transactional
    @Override
    public ProductLikeResponseDto toggleLike(Long productId, UserDetails userDetails) {
        // 현재 로그인 사용자 엔티티
        UserInfo user = getUser(userDetails);

        // 상품 조회
        ProductInfo product = productInfoRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("상품 없음"));

        // 유저-상품 조합으로 기존 찜 레코드 조회
        Optional<ProductLike> existing = productLikeRepository.findByUserInfoAndProduct(user, product);

        final boolean liked;
        if (existing.isPresent()) {
            // 이미 찜한 상태 → 취소
            productLikeRepository.delete(existing.get());
            liked = false;
        } else {
            // 아직 안 찜함 → 새로 찜
            ProductLike like = ProductLike.builder()
                    .userInfo(user)
                    .product(product)
                    .likedAt(LocalDateTime.now())
                    .build();
            productLikeRepository.save(like);
            liked = true;
        }

        // 현재 찜 개수
        long count = productLikeRepository.countByProduct(product);

        return ProductLikeResponseDto.builder()
                .productId(productId)
                .liked(liked)
                .likeCount((int) count)
                .build();
    }
}
