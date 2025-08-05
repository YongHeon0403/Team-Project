package org.zerock.server.dto.chat;

import lombok.Builder;
import lombok.Data;

/**
 * 채팅방 정보 DTO
 */
@Data
@Builder
public class ChatRoomDto {
    private Long roomId;
    private Long productId;
    private Long buyerId;
    private String buyerNickname;
    private Long sellerId;
    private String sellerNickname;
    private String productTitle;
    // 추가로 썸네일, 최근 메시지 등 넣어도 됨
}
