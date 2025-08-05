// src/main/java/org/zerock/server/controller/order/ReviewController.java
package org.zerock.server.controller.order;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.zerock.server.dto.order.ReviewRequestDto;
import org.zerock.server.dto.order.ReviewResponseDto;
import org.zerock.server.service.order.ReviewService;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    // 후기 등록
    @PostMapping
    public ResponseEntity<ReviewResponseDto> register(@RequestBody ReviewRequestDto dto) {
        return ResponseEntity.ok(reviewService.registerReview(dto));
    }

    // 후기 수정
    @PutMapping("/{reviewId}")
    public ResponseEntity<ReviewResponseDto> update(@PathVariable Long reviewId,
                                                    @RequestBody ReviewRequestDto dto) {
        return ResponseEntity.ok(reviewService.updateReview(reviewId, dto));
    }

    // 후기 삭제
    @DeleteMapping("/{reviewId}")
    public ResponseEntity<Void> delete(@PathVariable Long reviewId,
                                       @RequestParam Long reviewerId) {
        reviewService.deleteReview(reviewId, reviewerId);
        return ResponseEntity.ok().build();
    }

    // 후기 단건 조회
    @GetMapping("/{reviewId}")
    public ResponseEntity<ReviewResponseDto> get(@PathVariable Long reviewId) {
        return ResponseEntity.ok(reviewService.getReview(reviewId));
    }

    // 내가 받은 후기 전체(내가 reviewee)
    @GetMapping("/reviewee/{userId}")
    public ResponseEntity<List<ReviewResponseDto>> getReceived(@PathVariable Long userId) {
        return ResponseEntity.ok(reviewService.getReviewsForUser(userId));
    }

    // 내가 쓴 후기 전체(내가 reviewer)
    @GetMapping("/reviewer/{userId}")
    public ResponseEntity<List<ReviewResponseDto>> getWritten(@PathVariable Long userId) {
        return ResponseEntity.ok(reviewService.getWrittenReviews(userId));
    }
}
