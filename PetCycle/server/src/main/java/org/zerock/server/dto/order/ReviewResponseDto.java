package org.zerock.server.dto.order;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 후기 응답 DTO (후기 상세 조회, 목록 조회 등)
 * - reviewId: 후기 PK
 * - transactionId: 거래 ID
 * - reviewerId, reviewerNickname: 작성자 정보
 * - revieweeId, revieweeNickname: 대상자 정보
 * - rating: 평점
 * - content: 내용
 * - createdAt: 작성일시
 */
@Data
@Builder
public class ReviewResponseDto {
    private Long reviewId;
    private Long transactionId;
    private Long reviewerId;
    private String reviewerNickname;
    private Long revieweeId;
    private String revieweeNickname;
    private int rating;
    private String content;
    private LocalDateTime createdAt;
}
