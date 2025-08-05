package org.zerock.server.dto.product;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 상품 상세 조회 시 응답에 사용할 DTO.
 * - 이미지, 태그, 판매자, 카테고리, 등록시간, 상태 등 상세 정보 포함
 */

@Data
@Builder
public class ProductDetailResponseDto {
    private Long productId;            // 상품 고유 번호
    private String title;              // 상품명
    private String description;        // 상세 설명
    private BigDecimal price;          // 가격
    private String conditionStatus;    // 상태(새상품/중고 등)
    private String tradeMethod;        // 거래 방식(직거래/택배)
    private String tradeLocation;      // 거래 장소(주소)
    private BigDecimal latitude;       // 거래 위치(위도)
    private BigDecimal longitude;      // 거래 위치(경도)
    private String status;             // 상품 상태(판매중/예약중/판매완료 등)
    private int viewCount;             // 조회수
    private LocalDateTime registeredAt;// 등록일시

    // 연관 데이터
    private List<String> imageUrls;    // 상품 이미지 URL 목록
    private List<String> tags;         // 상품에 달린 태그명 목록
    private String sellerNickname;     // 판매자 닉네임(또는 이름)
    private Long sellerId;          // 판매자 아이디
    private String categoryName;       // 카테고리명
}
