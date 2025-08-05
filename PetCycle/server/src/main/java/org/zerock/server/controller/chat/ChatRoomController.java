package org.zerock.server.controller.chat;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.zerock.server.dto.chat.ChatRoomDto;
import org.zerock.server.service.chat.ChatRoomService;

import java.util.List;

/**
 * 채팅방 관련 REST 컨트롤러
 */
@RestController
@RequestMapping("/api/chat/rooms")
@RequiredArgsConstructor
public class ChatRoomController {

    private final ChatRoomService chatRoomService;

    // 채팅방 생성 or 기존 방 조회
    @PostMapping("/create")
    public ResponseEntity<ChatRoomDto> createOrGetRoom(
            @RequestParam Long productId,
            @RequestParam Long buyerId,
            @RequestParam Long sellerId) {
        return ResponseEntity.ok(chatRoomService.createOrGetChatRoom(productId, buyerId, sellerId));
    }

    // 내가 참여 중인 채팅방 목록
    @GetMapping("/my")
    public ResponseEntity<List<ChatRoomDto>> myRooms(@RequestParam Long userId) {
        return ResponseEntity.ok(chatRoomService.getMyChatRooms(userId));
    }
}
