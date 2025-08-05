package org.zerock.server.dto.order;

import lombok.Data;

/**
 * 후기 등록/수정 요청 DTO
 * - transactionId: 거래 ID (후기는 거래 1건당 1개)
 * - reviewerId: 작성자(본인)
 * - revieweeId: 상대방
 * - rating: 평점 (1~5)
 * - content: 후기 내용
 */
@Data
public class ReviewRequestDto {
    private Long transactionId;
    private Long reviewerId;
    private Long revieweeId;
    private int rating;
    private String content;
}
