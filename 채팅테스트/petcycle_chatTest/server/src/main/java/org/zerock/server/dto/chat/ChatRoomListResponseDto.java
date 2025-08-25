package org.zerock.server.dto.chat;

import lombok.*;
import java.sql.Timestamp;

@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class ChatRoomListResponseDto {
    private Long roomId;
    private String productTitle;
    private String thumbnailUrl;
    private String otherNickname; // 상대방 닉네임
    private String lastMessage;
    private Timestamp lastMessageAt;
    private int unreadCount;
    private boolean isDeleted;
}
