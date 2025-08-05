package org.zerock.server.dto.chat;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 채팅 메시지 응답 DTO
 */
@Data
@Builder
public class ChatMessageResponseDto {
    private Long messageId;
    private Long roomId;
    private Long senderId;
    private String senderNickname;
    private String content;
    private LocalDateTime sentAt;
    private boolean isRead;
}
