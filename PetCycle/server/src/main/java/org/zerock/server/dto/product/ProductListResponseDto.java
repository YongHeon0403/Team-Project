package org.zerock.server.dto.product;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class ProductListResponseDto {
    private Long productId;
    private String thumbnailUrl;      // 썸네일 이미지 URL
    private String title;             // 상품명
    private String status;            // 상품상태
    private BigDecimal price;         // 가격
    private int viewCount;            // 조회수
    private LocalDateTime registeredAt; // 등록일
}
