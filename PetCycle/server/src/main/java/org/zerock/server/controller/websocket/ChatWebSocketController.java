package org.zerock.server.controller.websocket;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.zerock.server.dto.chat.ChatMessageRequestDto;
import org.zerock.server.dto.chat.ChatMessageResponseDto;
import org.zerock.server.service.chat.ChatMessageService;

/**
 * WebSocket 기반 채팅 메시지 실시간 전송 컨트롤러
 */
@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatMessageService chatMessageService;

    // 클라이언트에서 /pub/chat/message로 메시지 보내면
    @MessageMapping("/chat/message")
    public void message(@Payload ChatMessageRequestDto dto) {
        // 1. 메시지 저장(DB)
        ChatMessageResponseDto savedMsg = chatMessageService.sendMessage(dto);
        // 2. 해당 채팅방 구독중인 모든 유저에게 실시간 전송(Publish)
        messagingTemplate.convertAndSend(
                "/sub/chat/room/" + dto.getRoomId(),
                savedMsg
        );
    }
}
