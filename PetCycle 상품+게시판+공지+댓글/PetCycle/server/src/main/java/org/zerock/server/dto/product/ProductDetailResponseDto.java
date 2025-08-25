package org.zerock.server.dto.product;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class ProductDetailResponseDto {
    private Long productId;
    private String title;
    private String description;
    private BigDecimal price;
    private String conditionStatus;
    private String tradeMethod;
    private String tradeLocation;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String status;
    private int viewCount;
    private boolean isLiked;
    private ProductCategoryDto category;
    private ProductSellerDto seller;
    private List<ProductImageDto> images;
    private List<String> tags;
}
