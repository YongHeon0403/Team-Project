package org.zerock.server.repository.chat;

import org.springframework.data.jpa.repository.JpaRepository;
import org.zerock.server.domain.chat.ChatRoom;
import org.zerock.server.domain.product.ProductInfo;
import org.zerock.server.domain.user.UserInfo;

import java.util.List;
import java.util.Optional;

public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {

    // ✅ 표준: 'deleted' 필드명 기준
    List<ChatRoom> findAllByBuyerOrSellerAndDeletedFalse(UserInfo buyer, UserInfo seller);

    Optional<ChatRoom> findByProductAndBuyerAndSellerAndDeletedFalse(
            ProductInfo product, UserInfo buyer, UserInfo seller);

    List<ChatRoom> findAllByProductAndDeletedFalse(ProductInfo product);

    // soft delete 포함 전체
    List<ChatRoom> findAllByBuyerOrSeller(UserInfo buyer, UserInfo seller);
    List<ChatRoom> findAllByProduct(ProductInfo product);

    // ---------- 기존 메서드명 호환 브리지 (필요 시 유지, 점진 제거 권장)
    default List<ChatRoom> findAllByBuyerOrSellerAndIsDeletedFalse(UserInfo buyer, UserInfo seller) {
        return findAllByBuyerOrSellerAndDeletedFalse(buyer, seller);
    }
    default Optional<ChatRoom> findByProductAndBuyerAndSellerAndIsDeletedFalse(
            ProductInfo product, UserInfo buyer, UserInfo seller) {
        return findByProductAndBuyerAndSellerAndDeletedFalse(product, buyer, seller);
    }
    default List<ChatRoom> findAllByProductAndIsDeletedFalse(ProductInfo product) {
        return findAllByProductAndDeletedFalse(product);
    }
}
