package org.zerock.server.dto.product;

import lombok.Data;

@Data
public class ProductListRequestDto {
    private Integer categoryId;    // 카테고리 필터
    private String status;         // 상품 상태(SELLING, RESERVED, SOLD_OUT 등)
    private String keyword;        // 검색어(제목/설명)
    private int page = 0;          // 페이지 번호 (0부터 시작)
    private int size = 10;         // 한 페이지당 상품 수
}
