// src/main/java/org/zerock/server/service/order/ReviewService.java
package org.zerock.server.service.order;

import org.zerock.server.dto.order.ReviewRequestDto;
import org.zerock.server.dto.order.ReviewResponseDto;

import java.util.List;

public interface ReviewService {
    ReviewResponseDto registerReview(ReviewRequestDto dto);                // 후기 등록
    ReviewResponseDto updateReview(Long reviewId, ReviewRequestDto dto);    // 후기 수정
    void deleteReview(Long reviewId, Long reviewerId);                     // 후기 삭제
    ReviewResponseDto getReview(Long reviewId);                            // 후기 단건 조회
    List<ReviewResponseDto> getReviewsForUser(Long revieweeId);            // 내가 받은 후기 전체
    List<ReviewResponseDto> getWrittenReviews(Long reviewerId);            // 내가 쓴 후기 전체
}
