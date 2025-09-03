package org.zerock.server.dto.chat;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.zerock.server.domain.chat.ChatRoom;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder

// 방 목록 아이템 DTO
public class ChatRoomListItemDTO {

    private Long roomId;
    private Long meId;
    private Long peerId;
    private String peerNickname;     // 선택: 서버에서 붙여주면 좋음 (없으면 null)
    private String lastMessage;      // 목록 프리뷰
    private LocalDateTime lastMessageAt;
    private LocalDateTime createdAt;

    public static ChatRoomListItemDTO from(ChatRoom r, Long meId, String peerNickname) {
        Long peerId = r.getBuyerId().equals(meId) ? r.getSellerId() : r.getBuyerId();
        return ChatRoomListItemDTO.builder()
                .roomId(r.getId())
                .meId(meId)
                .peerId(peerId)
                .peerNickname(peerNickname) // null 가능
                .lastMessage(r.getLastMessage())
                .lastMessageAt(r.getLastMessageAt())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
