package org.zerock.server.controller.websocket;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.*;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.zerock.server.dto.chat.ChatMessageRequestDto;
import org.zerock.server.dto.chat.ChatMessageResponseDto;
import org.zerock.server.service.chat.ChatService;
import org.springframework.web.multipart.MultipartFile;

@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatService chatService;

    /**
     * 실시간 메시지 전송 (텍스트/이미지)
     * 클라이언트에서 /pub/chat/message로 전송
     * - dto.content: 텍스트
     * - dto.image: MultipartFile (선택)
     *
     * 결과는 /sub/chat/room/{roomId}로 브로드캐스트
     */
    @MessageMapping("/chat/message")
    public void message(
            @Payload ChatMessageRequestDto dto,
            @Header("roomId") Long roomId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        // 메시지 저장(DB)
        ChatMessageResponseDto savedMsg = chatService.sendMessage(
                roomId, dto.getContent(), dto.getImage(), userDetails);

        // 채팅방 구독중인 모든 유저에게 실시간 전송
        messagingTemplate.convertAndSend(
                "/sub/chat/room/" + roomId,
                savedMsg
        );
    }
}
