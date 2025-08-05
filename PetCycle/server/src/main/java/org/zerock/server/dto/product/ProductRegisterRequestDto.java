package org.zerock.server.dto.product;

import lombok.Data;
import java.math.BigDecimal;

// 상품 등록 요청 시 사용할 DTO
@Data
public class ProductRegisterRequestDto {
    private Long sellerId; // 회원 PK
    private Integer categoryId; // 카테고리 PK
    private String title;
    private String description;
    private BigDecimal price;
    private String conditionStatus;
    private String tradeMethod;
    private String tradeLocation;
    private BigDecimal latitude;
    private BigDecimal longitude;
}
