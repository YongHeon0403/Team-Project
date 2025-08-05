package org.zerock.server.dto.chat;

import lombok.Data;

/**
 * 채팅 메시지 전송 요청 DTO
 * (WebSocket/REST 둘 다에서 사용 가능)
 */
@Data
public class ChatMessageRequestDto {
    private Long roomId;
    private Long senderId;
    private String content;
}
