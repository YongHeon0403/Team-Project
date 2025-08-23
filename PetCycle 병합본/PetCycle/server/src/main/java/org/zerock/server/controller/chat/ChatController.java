package org.zerock.server.controller.chat;

import lombok.RequiredArgsConstructor;
import org.zerock.server.dto.chat.*;
import org.zerock.server.service.chat.ChatService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/chats")
public class ChatController {

    private final ChatService chatService;

    // 1. 채팅방 생성 or 기존방 반환 (상품 상세 → 채팅하기)
    @PostMapping("/rooms")
    public ResponseEntity<Long> createOrGetChatRoom(
            @RequestBody ChatRoomCreateRequestDto dto,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long roomId = chatService.createOrGetChatRoom(dto.getProductId(), userDetails);
        return ResponseEntity.ok(roomId);
    }

    // 2. 내 채팅방 리스트 (최신순)
    @GetMapping("/rooms")
    public ResponseEntity<List<ChatRoomListResponseDto>> getMyChatRooms(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        List<ChatRoomListResponseDto> list = chatService.getMyChatRooms(userDetails);
        return ResponseEntity.ok(list);
    }

    // 3. 채팅방 상세 (참여자, 상품, 최근 메시지, 안읽음 등)
    @GetMapping("/rooms/{roomId}")
    public ResponseEntity<ChatRoomResponseDto> getChatRoomDetail(
            @PathVariable Long roomId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        ChatRoomResponseDto dto = chatService.getChatRoomDetail(roomId, userDetails);
        return ResponseEntity.ok(dto);
    }

    // 4. 채팅 메시지 목록 (페이징)
    @GetMapping("/rooms/{roomId}/messages")
    public ResponseEntity<Page<ChatMessageListResponseDto>> getMessages(
            @PathVariable Long roomId,
            Pageable pageable,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Page<ChatMessageListResponseDto> page = chatService.getMessages(roomId, pageable, userDetails);
        return ResponseEntity.ok(page);
    }

    // 5. 채팅 메시지 전송 (텍스트 or 이미지)
    @PostMapping("/rooms/{roomId}/messages")
    public ResponseEntity<ChatMessageResponseDto> sendMessage(
            @PathVariable Long roomId,
            @RequestPart(required = false) String content,
            @RequestPart(required = false) MultipartFile image,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        ChatMessageResponseDto dto = chatService.sendMessage(roomId, content, image, userDetails);
        return ResponseEntity.ok(dto);
    }

    // 6. 메시지 읽음 처리 (내가 안읽은 메시지 모두 읽음)
    @PatchMapping("/rooms/{roomId}/read")
    public ResponseEntity<Void> readMessages(
            @PathVariable Long roomId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        chatService.readMessages(roomId, userDetails);
        return ResponseEntity.ok().build();
    }

    // 7. 채팅방 삭제(soft delete, 참여자/관리자)
    @DeleteMapping("/rooms/{roomId}")
    public ResponseEntity<Void> deleteChatRoom(
            @PathVariable Long roomId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        chatService.softDeleteChatRoom(roomId, userDetails);
        return ResponseEntity.ok().build();
    }

    // 8. (관리자/시스템) 상품기준 전체 채팅방 soft delete (거래완료/취소)
    @DeleteMapping("/products/{productId}/rooms")
    public ResponseEntity<Void> deleteAllRoomsByProduct(
            @PathVariable Long productId
    ) {
        chatService.softDeleteAllRoomsByProduct(productId);
        return ResponseEntity.ok().build();
    }
}
