package org.zerock.server.dto.product;

import lombok.Data;
import java.math.BigDecimal;

// 상품 수정 요청 시 사용할 DTO
@Data
public class ProductUpdateRequestDto {
    private String title;
    private String description;
    private BigDecimal price;
    private String conditionStatus;
    private String tradeMethod;
    private String tradeLocation;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private Integer categoryId;
}
