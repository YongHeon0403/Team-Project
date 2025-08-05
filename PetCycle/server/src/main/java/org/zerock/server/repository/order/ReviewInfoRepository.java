// src/main/java/org/zerock/server/repository/order/ReviewInfoRepository.java
package org.zerock.server.repository.order;

import org.zerock.server.domain.order.ReviewInfo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReviewInfoRepository extends JpaRepository<ReviewInfo, Long> {
    // 거래 기준으로 단일 후기
    Optional<ReviewInfo> findByTransaction_TransactionId(Long transactionId);

    // 내가 받은 후기(내가 reviewee) 목록
    List<ReviewInfo> findByReviewee_UserId(Long revieweeId);

    // 내가 쓴 후기(내가 reviewer) 목록
    List<ReviewInfo> findByReviewer_UserId(Long reviewerId);
}
