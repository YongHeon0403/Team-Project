package org.zerock.server.dto.chat;

import lombok.*;

@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class ChatMessageResponseDto {
    private Long messageId;
    private Long roomId;
    private Long senderId;
    private String senderNickname;
    private String content;
    private String imageUrl;
    private boolean isRead;
    private java.sql.Timestamp sentAt;
}
