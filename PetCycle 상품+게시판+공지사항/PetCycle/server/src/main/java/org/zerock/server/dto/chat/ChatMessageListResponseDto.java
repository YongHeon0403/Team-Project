package org.zerock.server.dto.chat;

import lombok.*;

@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class ChatMessageListResponseDto {
    private Long messageId;
    private Long senderId;
    private String senderNickname;
    private String content;
    private String imageUrl;
    private boolean isRead;
    private java.sql.Timestamp sentAt;
}
