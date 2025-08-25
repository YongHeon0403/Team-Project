package org.zerock.server.service.chat;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.zerock.server.domain.chat.ChatMessage;
import org.zerock.server.domain.chat.ChatRoom;
import org.zerock.server.domain.product.ProductInfo;
import org.zerock.server.domain.user.UserInfo;
import org.zerock.server.domain.user.UserRole;
import org.zerock.server.dto.chat.*;
import org.zerock.server.dto.product.ProductListResponseDto;
import org.zerock.server.dto.product.ProductSellerDto;
import org.zerock.server.repository.chat.ChatMessageRepository;
import org.zerock.server.repository.chat.ChatRoomRepository;
import org.zerock.server.repository.product.ProductInfoRepository;
import org.zerock.server.repository.user.UserInfoRepository;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatServiceImpl implements ChatService {

    private final ChatRoomRepository chatRoomRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final ProductInfoRepository productInfoRepository;
    private final UserInfoRepository userInfoRepository;

    @Transactional
    @Override
    public Long createOrGetChatRoom(Long productId, UserDetails userDetails) {
        UserInfo buyer = getUser(userDetails);
        ProductInfo product = productInfoRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("상품 없음"));
        UserInfo seller = product.getSeller();

        if (buyer.getUserId().equals(seller.getUserId()))
            throw new IllegalArgumentException("본인 상품 채팅 불가");

        Optional<ChatRoom> existRoom = chatRoomRepository
                .findByProductAndBuyerAndSellerAndDeletedFalse(product, buyer, seller);
        if (existRoom.isPresent()) {
            return existRoom.get().getRoomId();
        }

        ChatRoom room = ChatRoom.builder()
                .product(product)
                .buyer(buyer)
                .seller(seller)
                .build(); // deleted=false 기본값

        ChatRoom saved = chatRoomRepository.save(room);
        return saved.getRoomId();
    }

    @Transactional(readOnly = true)
    @Override
    public List<ChatRoomListResponseDto> getMyChatRooms(UserDetails userDetails) {
        UserInfo user = getUser(userDetails);
        List<ChatRoom> rooms = chatRoomRepository.findAllByBuyerOrSellerAndDeletedFalse(user, user);

        return rooms.stream().map(room -> {
            ChatMessage lastMsg = chatMessageRepository.findTop1ByRoomOrderBySentAtDesc(room);
            UserInfo other = room.getBuyer().getUserId().equals(user.getUserId())
                    ? room.getSeller() : room.getBuyer();

            long unread = chatMessageRepository.countByRoomAndIsReadFalseAndSenderNot(room, user);

            return ChatRoomListResponseDto.builder()
                    .roomId(room.getRoomId())
                    .productTitle(room.getProduct().getTitle())
                    .thumbnailUrl(room.getProduct().getImages().stream().findFirst()
                            .map(img -> img.getImageUrl()).orElse(null))
                    .otherNickname(other.getNickname())
                    .lastMessage(lastMsg != null ? (lastMsg.getContent() != null ? lastMsg.getContent() : "[이미지]") : "")
                    .lastMessageAt(lastMsg != null ? lastMsg.getSentAt() : null)
                    .unreadCount(Math.toIntExact(unread))
                    .isDeleted(room.isDeleted())
                    .build();
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    @Override
    public ChatRoomResponseDto getChatRoomDetail(Long roomId, UserDetails userDetails) {
        UserInfo user = getUser(userDetails);
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("채팅방 없음"));

        if (!room.getBuyer().getUserId().equals(user.getUserId()) && !room.getSeller().getUserId().equals(user.getUserId())) {
            throw new SecurityException("채팅방 접근 권한 없음");
        }

        ChatMessage lastMsg = chatMessageRepository.findTop1ByRoomOrderBySentAtDesc(room);

        return ChatRoomResponseDto.builder()
                .roomId(room.getRoomId())
                .product(ProductListResponseDto.builder()
                        .productId(room.getProduct().getProductId())
                        .title(room.getProduct().getTitle())
                        .price(room.getProduct().getPrice())
                        .thumbnailUrl(room.getProduct().getImages().stream().findFirst()
                                .map(img -> img.getImageUrl()).orElse(null))
                        .build())
                .buyer(ProductSellerDto.builder()
                        .userId(room.getBuyer().getUserId())
                        .nickname(room.getBuyer().getNickname())
                        .region(room.getBuyer().getRegion())
                        .build())
                .seller(ProductSellerDto.builder()
                        .userId(room.getSeller().getUserId())
                        .nickname(room.getSeller().getNickname())
                        .region(room.getSeller().getRegion())
                        .build())
                .isDeleted(room.isDeleted())
                .createdAt(room.getCreatedAt())
                .updatedAt(room.getUpdatedAt())
                .lastMessage(lastMsg != null ? (lastMsg.getContent() != null ? lastMsg.getContent() : "[이미지]") : "")
                .lastMessageAt(lastMsg != null ? lastMsg.getSentAt() : null)
                .unreadCount(Math.toIntExact(chatMessageRepository.countByRoomAndIsReadFalseAndSenderNot(room, user)))
                .build();
    }

    @Transactional(readOnly = true)
    @Override
    public Page<ChatMessageListResponseDto> getMessages(Long roomId, Pageable pageable, UserDetails userDetails) {
        UserInfo user = getUser(userDetails);
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("채팅방 없음"));

        if (!room.getBuyer().getUserId().equals(user.getUserId()) && !room.getSeller().getUserId().equals(user.getUserId())) {
            throw new SecurityException("채팅방 접근 권한 없음");
        }

        Page<ChatMessage> messages = chatMessageRepository.findAllByRoomOrderBySentAtAsc(room, pageable);

        return messages.map(msg -> ChatMessageListResponseDto.builder()
                .messageId(msg.getMessageId())
                .senderId(msg.getSender().getUserId())
                .senderNickname(msg.getSender().getNickname())
                .content(msg.getContent())
                .imageUrl(msg.getImageUrl())
                .isRead(msg.isRead())
                .sentAt(msg.getSentAt())
                .build());
    }

    @Transactional
    @Override
    public ChatMessageResponseDto sendMessage(Long roomId, String content, MultipartFile image, UserDetails userDetails) {
        UserInfo sender = getUser(userDetails);
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("채팅방 없음"));

        if (!room.getBuyer().getUserId().equals(sender.getUserId()) && !room.getSeller().getUserId().equals(sender.getUserId())) {
            throw new SecurityException("채팅방 메시지 전송 권한 없음");
        }

        String imageUrl = null;
        if (image != null && !image.isEmpty()) {
            imageUrl = "/uploads/chat/" + image.getOriginalFilename();
        }

        ChatMessage msg = ChatMessage.builder()
                .room(room)
                .sender(sender)
                .content(content)     // 이미지 전용이면 null 허용
                .imageUrl(imageUrl)
                .isRead(false)
                .build();

        ChatMessage saved = chatMessageRepository.save(msg);

        return ChatMessageResponseDto.builder()
                .messageId(saved.getMessageId())
                .roomId(room.getRoomId())
                .senderId(sender.getUserId())
                .senderNickname(sender.getNickname())
                .content(saved.getContent())
                .imageUrl(saved.getImageUrl())
                .isRead(saved.isRead())
                .sentAt(saved.getSentAt())
                .build();
    }

    @Transactional
    @Override
    public void readMessages(Long roomId, UserDetails userDetails) {
        UserInfo user = getUser(userDetails);
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("채팅방 없음"));

        var unread = chatMessageRepository.findAllByRoomAndRoom_IsDeletedFalse(room).stream()
                .filter(msg -> !msg.isRead() && !msg.getSender().getUserId().equals(user.getUserId()))
                .collect(Collectors.toList());

        for (ChatMessage msg : unread) {
            msg.setRead(true);
        }
        chatMessageRepository.saveAll(unread);
    }

    @Transactional
    @Override
    public void softDeleteChatRoom(Long roomId, UserDetails userDetails) {
        UserInfo user = getUser(userDetails);
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("채팅방 없음"));

        // ✅ enum 기반 권한 체크
        boolean isAdmin = user.getUserRoleList() != null && user.getUserRoleList().contains(UserRole.ADMIN);


        if (!room.getBuyer().getUserId().equals(user.getUserId())
                && !room.getSeller().getUserId().equals(user.getUserId())
                && !isAdmin) {
            throw new SecurityException("삭제 권한 없음");
        }

        room.setDeleted(true);
        chatRoomRepository.save(room);
    }

    @Transactional
    @Override
    public void softDeleteAllRoomsByProduct(Long productId) {
        ProductInfo product = productInfoRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("상품 없음"));
        List<ChatRoom> rooms = chatRoomRepository.findAllByProduct(product);
        for (ChatRoom room : rooms) {
            room.setDeleted(true);
        }
        chatRoomRepository.saveAll(rooms);
    }

    private UserInfo getUser(UserDetails userDetails) {
        if (userDetails == null) throw new SecurityException("인증 필요");
        return userInfoRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("사용자 정보 없음"));
    }
}
