package org.zerock.server.repository.chat;

import org.zerock.server.domain.chat.ChatRoom;
import org.zerock.server.domain.product.ProductInfo;
import org.zerock.server.domain.user.UserInfo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * 채팅방(JPA) 레포지토리
 */
public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {
    // 특정 상품 + 구매자 조합으로 채팅방 1개만 허용
    Optional<ChatRoom> findByProductAndBuyer(ProductInfo product, UserInfo buyer);

    // 특정 사용자(구매자/판매자)가 속한 모든 채팅방 조회 (마이페이지용)
    List<ChatRoom> findByBuyerOrSeller(UserInfo buyer, UserInfo seller);

    // 상품 기준 채팅방 모두 조회 (상품 판매자가 확인할 때)
    List<ChatRoom> findByProduct(ProductInfo product);
}
