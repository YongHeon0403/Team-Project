package org.zerock.server.service.order;

import org.zerock.server.dto.order.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UserDetails;

public interface OrderService {
    // 거래 등록
    Long registerTransaction(TransactionRegisterRequestDto dto, UserDetails userDetails);

    // 거래 상세 조회
    TransactionDetailResponseDto getTransactionDetail(Long transactionId, UserDetails userDetails);

    // 거래 목록 조회 (내가 참여한 거래)
    Page<TransactionListResponseDto> getMyTransactions(Pageable pageable, UserDetails userDetails);

    // 거래 상태 변경 (예약중, 판매완료 등)
    void updateTransactionStatus(Long transactionId, TransactionStatusUpdateRequestDto dto, UserDetails userDetails);

    // 거래 삭제 (작성자, 관리자만)
    void deleteTransaction(Long transactionId, UserDetails userDetails);

    // 리뷰 등록
    Long registerReview(ReviewRegisterRequestDto dto, UserDetails userDetails);

    // 리뷰 삭제 (작성자, 관리자만)
    void deleteReview(Long reviewId, UserDetails userDetails);

    // 리뷰 상세 조회
    ReviewDetailResponseDto getReviewDetail(Long reviewId);

    // 내 거래에 달린 리뷰 목록
    Page<ReviewListResponseDto> getMyReviews(Pageable pageable, UserDetails userDetails);
}
