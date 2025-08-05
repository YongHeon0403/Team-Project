package org.zerock.server.repository.order;

import org.zerock.server.domain.order.TransactionHistory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TransactionHistoryRepository extends JpaRepository<TransactionHistory, Long> {
    // 필요시 커스텀 메소드 추가
}
