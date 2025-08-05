package org.zerock.server.controller.chat;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.zerock.server.dto.chat.ChatMessageRequestDto;
import org.zerock.server.dto.chat.ChatMessageResponseDto;
import org.zerock.server.service.chat.ChatMessageService;

import java.util.List;

/**
 * 채팅 메시지 관련 REST 컨트롤러
 */
@RestController
@RequestMapping("/api/chat/messages")
@RequiredArgsConstructor
public class ChatMessageController {

    private final ChatMessageService chatMessageService;

    // 메시지 전송
    @PostMapping
    public ResponseEntity<ChatMessageResponseDto> send(@RequestBody ChatMessageRequestDto dto) {
        return ResponseEntity.ok(chatMessageService.sendMessage(dto));
    }

    // 특정 채팅방의 메시지 전체 조회
    @GetMapping("/{roomId}")
    public ResponseEntity<List<ChatMessageResponseDto>> getMessages(@PathVariable Long roomId) {
        return ResponseEntity.ok(chatMessageService.getMessages(roomId));
    }
}
