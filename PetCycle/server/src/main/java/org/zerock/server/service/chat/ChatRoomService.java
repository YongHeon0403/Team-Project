package org.zerock.server.service.chat;

import org.zerock.server.dto.chat.ChatRoomDto;
import org.zerock.server.domain.chat.ChatRoom;
import org.zerock.server.domain.product.ProductInfo;
import org.zerock.server.domain.user.UserInfo;
import org.zerock.server.repository.chat.ChatRoomRepository;
import org.zerock.server.repository.product.ProductInfoRepository;
import org.zerock.server.repository.user.UserInfoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 채팅방 관련 서비스 구현
 */
@Service
@RequiredArgsConstructor
public class ChatRoomService {

    private final ChatRoomRepository chatRoomRepository;
    private final ProductInfoRepository productInfoRepository;
    private final UserInfoRepository userInfoRepository;

    // 채팅방 생성 or 이미 있으면 반환
    public ChatRoomDto createOrGetChatRoom(Long productId, Long buyerId, Long sellerId) {
        ProductInfo product = productInfoRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("상품 없음"));
        UserInfo buyer = userInfoRepository.findById(buyerId)
                .orElseThrow(() -> new IllegalArgumentException("구매자 없음"));
        UserInfo seller = userInfoRepository.findById(sellerId)
                .orElseThrow(() -> new IllegalArgumentException("판매자 없음"));

        // 이미 방이 있으면 반환, 없으면 생성
        return chatRoomRepository.findByProductAndBuyer(product, buyer)
                .map(this::toDto)
                .orElseGet(() -> {
                    ChatRoom newRoom = ChatRoom.builder()
                            .product(product)
                            .buyer(buyer)
                            .seller(seller)
                            .build();
                    chatRoomRepository.save(newRoom);
                    return toDto(newRoom);
                });
    }

    // 내가 참여 중인 모든 채팅방
    public List<ChatRoomDto> getMyChatRooms(Long userId) {
        UserInfo user = userInfoRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자 없음"));
        return chatRoomRepository.findByBuyerOrSeller(user, user).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    // ChatRoom → DTO 변환
    private ChatRoomDto toDto(ChatRoom room) {
        return ChatRoomDto.builder()
                .roomId(room.getRoomId())
                .productId(room.getProduct().getProductId())
                .productTitle(room.getProduct().getTitle())
                .buyerId(room.getBuyer().getUserId())
                .buyerNickname(room.getBuyer().getNickname())
                .sellerId(room.getSeller().getUserId())
                .sellerNickname(room.getSeller().getNickname())
                .build();
    }
}
