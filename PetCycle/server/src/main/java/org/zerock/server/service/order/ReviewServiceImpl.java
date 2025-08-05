package org.zerock.server.service.order;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.zerock.server.domain.order.ReviewInfo;
import org.zerock.server.domain.order.TransactionHistory;
import org.zerock.server.domain.user.UserInfo;
import org.zerock.server.dto.order.ReviewRequestDto;
import org.zerock.server.dto.order.ReviewResponseDto;
import org.zerock.server.repository.order.ReviewInfoRepository;
import org.zerock.server.repository.order.TransactionHistoryRepository;
import org.zerock.server.repository.user.UserInfoRepository;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 거래 후기(Review) 관련 서비스 구현체
 */
@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    // 후기 저장소 (JPA)
    private final ReviewInfoRepository reviewInfoRepository;
    private final UserInfoRepository userInfoRepository;
    private final TransactionHistoryRepository transactionHistoryRepository;

    /**
     * 후기 등록
     * - 거래 1건당 1개만 등록 가능
     */
    @Transactional
    @Override
    public ReviewResponseDto registerReview(ReviewRequestDto dto) {
        TransactionHistory transaction = transactionHistoryRepository.findById(dto.getTransactionId())
                .orElseThrow(() -> new IllegalArgumentException("거래 내역 없음"));
        UserInfo reviewer = userInfoRepository.findById(dto.getReviewerId())
                .orElseThrow(() -> new IllegalArgumentException("작성자 없음"));
        UserInfo reviewee = userInfoRepository.findById(dto.getRevieweeId())
                .orElseThrow(() -> new IllegalArgumentException("대상자 없음"));

        // 이미 해당 거래에 대한 후기가 있다면 예외 처리
        if (reviewInfoRepository.findByTransaction_TransactionId(dto.getTransactionId()).isPresent()) {
            throw new IllegalStateException("이미 후기가 작성된 거래입니다.");
        }

        ReviewInfo review = ReviewInfo.builder()
                .transaction(transaction)
                .reviewer(reviewer)
                .reviewee(reviewee)
                .rating(dto.getRating())
                .content(dto.getContent())
                .build();

        reviewInfoRepository.save(review);

        return toResponseDto(review);
    }

    /**
     * 후기 수정
     * - 작성자(본인)만 가능
     */
    @Transactional
    @Override
    public ReviewResponseDto updateReview(Long reviewId, ReviewRequestDto dto) {
        ReviewInfo review = reviewInfoRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("후기 없음"));
        if (!review.getReviewer().getUserId().equals(dto.getReviewerId())) {
            throw new IllegalArgumentException("본인만 수정 가능");
        }
        review.setRating(dto.getRating());
        review.setContent(dto.getContent());

        return toResponseDto(review);
    }

    /**
     * 후기 삭제
     * - 작성자(본인)만 가능
     */
    @Transactional
    @Override
    public void deleteReview(Long reviewId, Long reviewerId) {
        ReviewInfo review = reviewInfoRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("후기 없음"));
        if (!review.getReviewer().getUserId().equals(reviewerId)) {
            throw new IllegalArgumentException("본인만 삭제 가능");
        }
        reviewInfoRepository.delete(review);
    }

    /**
     * 후기 단건 조회 (PK 기준)
     */
    @Transactional(readOnly = true)
    @Override
    public ReviewResponseDto getReview(Long reviewId) {
        ReviewInfo review = reviewInfoRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("후기 없음"));
        return toResponseDto(review);
    }

    /**
     * 내가 받은 후기(내가 reviewee) 전체 조회
     */
    @Transactional(readOnly = true)
    @Override
    public List<ReviewResponseDto> getReviewsForUser(Long revieweeId) {
        return reviewInfoRepository.findByReviewee_UserId(revieweeId).stream()
                .map(this::toResponseDto)
                .collect(Collectors.toList());
    }

    /**
     * 내가 쓴 후기(내가 reviewer) 전체 조회
     */
    @Transactional(readOnly = true)
    @Override
    public List<ReviewResponseDto> getWrittenReviews(Long reviewerId) {
        return reviewInfoRepository.findByReviewer_UserId(reviewerId).stream()
                .map(this::toResponseDto)
                .collect(Collectors.toList());
    }

    /**
     * 엔티티 → 응답 DTO 매핑
     */
    private ReviewResponseDto toResponseDto(ReviewInfo review) {
        return ReviewResponseDto.builder()
                .reviewId(review.getReviewId())
                .transactionId(review.getTransaction().getTransactionId())
                .reviewerId(review.getReviewer().getUserId())
                .reviewerNickname(review.getReviewer().getNickname())
                .revieweeId(review.getReviewee().getUserId())
                .revieweeNickname(review.getReviewee().getNickname())
                .rating(review.getRating())
                .content(review.getContent())
                .createdAt(review.getCreatedAt() != null
                        ? review.getCreatedAt().toLocalDateTime()
                        : null)
                .build();
    }
}
