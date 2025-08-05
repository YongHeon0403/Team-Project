// src/main/java/org/zerock/server/dto/product/ProductLikeResponseDto.java
package org.zerock.server.dto.product;

import lombok.Builder;
import lombok.Data;

/**
 * 상품 찜(Like) 응답 DTO
 */
@Data
@Builder
public class ProductLikeResponseDto {
    private boolean liked;   // 현재 찜 상태 (true=찜함, false=찜안함)
    private Long likeId;     // 찜 PK (찜 해제 상태면 null)
}
