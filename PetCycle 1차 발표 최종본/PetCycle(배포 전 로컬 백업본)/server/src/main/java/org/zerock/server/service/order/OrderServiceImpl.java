package org.zerock.server.service.order;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.zerock.server.domain.order.*;
import org.zerock.server.domain.product.ProductInfo;
import org.zerock.server.domain.user.UserInfo;
import org.zerock.server.domain.user.UserRole; // ✅ enum 기반 권한 체크에 필요
import org.zerock.server.dto.order.*;
import org.zerock.server.dto.product.ProductListResponseDto;
import org.zerock.server.dto.product.ProductSellerDto;
import org.zerock.server.repository.order.*;
import org.zerock.server.repository.product.ProductInfoRepository;
import org.zerock.server.repository.user.UserInfoRepository;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final TransactionHistoryRepository transactionHistoryRepository;
    private final ReviewInfoRepository reviewInfoRepository;
    private final ProductInfoRepository productInfoRepository;
    private final UserInfoRepository userInfoRepository;

    // 거래 등록
    @Transactional
    @Override
    public Long registerTransaction(TransactionRegisterRequestDto dto, UserDetails userDetails) {
        UserInfo buyer = getUser(userDetails);

        ProductInfo product = productInfoRepository.findById(dto.getProductId())
                .orElseThrow(() -> new IllegalArgumentException("상품 없음"));

        // 본인 상품 방지
        if (product.getSeller().getUserId().equals(buyer.getUserId())) {
            throw new IllegalArgumentException("본인 상품은 구매 불가");
        }

        // 1) 같은 구매자가 이미 이 상품에 대해 만든 거래가 있으면 → 새로 만들지 말고 그 거래 ID 반환 (idempotent)
        Optional<TransactionHistory> mine =
                transactionHistoryRepository.findTopByProduct_ProductIdAndBuyer_UserIdOrderByTransactionIdDesc(
                        product.getProductId(), buyer.getUserId());

        if (mine.isPresent()) {
            // → 두 번째 클릭에서도 예외 없이 기존 거래로 이어지도록 함
            return mine.get().getTransactionId();
        }

        // 2) 상품 상태가 이미 판매 가능 상태가 아니면(= 다른 사람에게 예약/거래중) 예외
        if (!"SELLING".equalsIgnoreCase(product.getStatus())) {
            throw new IllegalStateException("이미 예약/거래중인 상품");
        }

        // 3) 새 거래 생성
        TransactionHistory transaction = TransactionHistory.builder()
                .product(product)
                .buyer(buyer)
                .seller(product.getSeller())
                .finalPrice(dto.getFinalPrice())
                .transactionStatus("예약중")
                .build();

        TransactionHistory saved = transactionHistoryRepository.save(transaction);

        // 4) 상품 상태를 'RESERVED' 로(프런트와 일치)
        product.setStatus("RESERVED"); // ← 기존 "예약중" 대신 영문 코드
        productInfoRepository.save(product);

        return saved.getTransactionId();
    }


    // 거래 상세 조회
    @Transactional(readOnly = true)
    @Override
    public TransactionDetailResponseDto getTransactionDetail(Long transactionId, UserDetails userDetails) {
        TransactionHistory t = transactionHistoryRepository.findById(transactionId)
                .orElseThrow(() -> new IllegalArgumentException("거래 없음"));

        return TransactionDetailResponseDto.builder()
                .transactionId(t.getTransactionId())
                .product(ProductListResponseDto.builder()
                        .productId(t.getProduct().getProductId())
                        .title(t.getProduct().getTitle())
                        .price(t.getProduct().getPrice())
                        .thumbnailUrl(null)
                        .conditionStatus(t.getProduct().getConditionStatus())
                        .tradeLocation(t.getProduct().getTradeLocation())
                        .status(t.getProduct().getStatus())
                        .viewCount(t.getProduct().getViewCount())
                        .isLiked(false)
                        .category(null)
                        .seller(null)
                        .tags(null)
                        .build())
                .buyer(ProductSellerDto.builder()
                        .userId(t.getBuyer().getUserId())
                        .nickname(t.getBuyer().getNickname())
                        .region(t.getBuyer().getRegion())
                        .build())
                .seller(ProductSellerDto.builder()
                        .userId(t.getSeller().getUserId())
                        .nickname(t.getSeller().getNickname())
                        .region(t.getSeller().getRegion())
                        .build())
                .transactionDate(t.getTransactionDate())
                .finalPrice(t.getFinalPrice())
                .transactionStatus(t.getTransactionStatus())
                .build();
    }

    // 내가 참여한 거래 목록 (구매자/판매자 모두)
    @Transactional(readOnly = true)
    @Override
    public Page<TransactionListResponseDto> getMyTransactions(Pageable pageable, UserDetails userDetails) {
        UserInfo user = getUser(userDetails);

        Page<TransactionHistory> transactions = transactionHistoryRepository
                .findAllByBuyer_UserIdOrSeller_UserId(user.getUserId(), user.getUserId(), pageable);

        return transactions.map(t -> TransactionListResponseDto.builder()
                .transactionId(t.getTransactionId())
                .productId(t.getProduct().getProductId())
                .productTitle(t.getProduct().getTitle())
                .finalPrice(t.getFinalPrice())
                .transactionStatus(t.getTransactionStatus())
                .transactionDate(t.getTransactionDate())
                .build());
    }

    // 거래 상태 변경 (예약중, 판매완료 등)
    @Transactional
    @Override
    public void updateTransactionStatus(Long transactionId, TransactionStatusUpdateRequestDto dto, UserDetails userDetails) {
        UserInfo user = getUser(userDetails);
        TransactionHistory transaction = transactionHistoryRepository.findById(transactionId)
                .orElseThrow(() -> new IllegalArgumentException("거래 없음"));

        // ✅ enum 기반 관리자 체크
        boolean isAdmin = hasRole(user, UserRole.ADMIN);

        if (!transaction.getBuyer().getUserId().equals(user.getUserId())
                && !transaction.getSeller().getUserId().equals(user.getUserId())
                && !isAdmin) {
            throw new SecurityException("상태 변경 권한 없음");
        }

        transaction.setTransactionStatus(dto.getTransactionStatus());
        transactionHistoryRepository.save(transaction);

        // 상품 상태도 함께 갱신
        ProductInfo product = transaction.getProduct();
        product.setStatus(dto.getTransactionStatus());
        productInfoRepository.save(product);
    }

    // 거래 삭제 (작성자, 관리자만)
    @Transactional
    @Override
    public void deleteTransaction(Long transactionId, UserDetails userDetails) {
        UserInfo user = getUser(userDetails);
        TransactionHistory transaction = transactionHistoryRepository.findById(transactionId)
                .orElseThrow(() -> new IllegalArgumentException("거래 없음"));

        // ✅ enum 기반 관리자 체크
        boolean isAdmin = hasRole(user, UserRole.ADMIN);

        if (!transaction.getBuyer().getUserId().equals(user.getUserId())
                && !transaction.getSeller().getUserId().equals(user.getUserId())
                && !isAdmin) {
            throw new SecurityException("삭제 권한 없음");
        }

        transactionHistoryRepository.delete(transaction);
    }

    // 리뷰 등록 (거래 완료 후만, 중복불가)
    @Transactional
    @Override
    public Long registerReview(ReviewRegisterRequestDto dto, UserDetails userDetails) {
        UserInfo reviewer = getUser(userDetails);

        TransactionHistory transaction = transactionHistoryRepository.findById(dto.getTransactionId())
                .orElseThrow(() -> new IllegalArgumentException("거래 없음"));

        if (!"판매완료".equals(transaction.getTransactionStatus())) {
            throw new IllegalStateException("거래 완료 후에만 리뷰 작성 가능");
        }

        if (reviewInfoRepository.findByTransaction_TransactionId(dto.getTransactionId()).isPresent()) {
            throw new IllegalArgumentException("이미 리뷰가 존재");
        }

        // 리뷰 대상(reviewee): 판매자(구매자 작성 시) 또는 구매자(판매자 작성 시)
        UserInfo reviewee = transaction.getSeller().getUserId().equals(reviewer.getUserId())
                ? transaction.getBuyer() : transaction.getSeller();

        ReviewInfo review = ReviewInfo.builder()
                .transaction(transaction)
                .reviewer(reviewer)
                .reviewee(reviewee)
                .rating(dto.getRating())
                .content(dto.getContent())
                .build();

        ReviewInfo saved = reviewInfoRepository.save(review);
        return saved.getReviewId();
    }

    // 리뷰 삭제 (작성자, 관리자만)
    @Transactional
    @Override
    public void deleteReview(Long reviewId, UserDetails userDetails) {
        UserInfo user = getUser(userDetails);

        ReviewInfo review = reviewInfoRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("리뷰 없음"));

        // ✅ enum 기반 관리자 체크
        boolean isAdmin = hasRole(user, UserRole.ADMIN);

        // 작성자 or 관리자만 삭제 가능 (판매자=reviewee는 삭제 불가!)
        if (!review.getReviewer().getUserId().equals(user.getUserId())
                && !isAdmin) {
            throw new SecurityException("리뷰 삭제 권한 없음");
        }

        reviewInfoRepository.delete(review);
    }

    // 리뷰 상세 조회
    @Transactional(readOnly = true)
    @Override
    public ReviewDetailResponseDto getReviewDetail(Long reviewId) {
        ReviewInfo review = reviewInfoRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("리뷰 없음"));

        return ReviewDetailResponseDto.builder()
                .reviewId(review.getReviewId())
                .transactionId(review.getTransaction().getTransactionId())
                .reviewerNickname(review.getReviewer().getNickname())
                .revieweeNickname(review.getReviewee().getNickname())
                .rating(review.getRating())
                .content(review.getContent())
                .createdAt(review.getCreatedAt())
                .build();
    }

    // 내가 작성한 리뷰 목록 (페이징)
    @Transactional(readOnly = true)
    @Override
    public Page<ReviewListResponseDto> getMyReviews(Pageable pageable, UserDetails userDetails) {
        UserInfo user = getUser(userDetails);

        Page<ReviewInfo> reviews = reviewInfoRepository.findAllByReviewer_UserId(user.getUserId(), pageable);

        return reviews.map(r -> ReviewListResponseDto.builder()
                .reviewId(r.getReviewId())
                .transactionId(r.getTransaction().getTransactionId())
                .reviewerNickname(r.getReviewer().getNickname())
                .rating(r.getRating())
                .content(r.getContent())
                .createdAt(r.getCreatedAt())
                .build());
    }

    // ===== 공통 유틸 =====

    // 인증 유저 정보 가져오기
    private UserInfo getUser(UserDetails userDetails) {
        if (userDetails == null) throw new SecurityException("인증 필요");
        return userInfoRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("사용자 정보 없음"));
    }

    // ✅ enum 기반 권한 체크 헬퍼 (UserInfo.userRoleList 사용)
    private boolean hasRole(UserInfo user, UserRole role) {
        return user.getUserRoleList() != null && user.getUserRoleList().contains(role);
    }
}
