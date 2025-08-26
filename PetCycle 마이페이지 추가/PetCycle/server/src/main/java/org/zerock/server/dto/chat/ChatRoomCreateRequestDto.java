package org.zerock.server.dto.chat;

import lombok.*;

@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class ChatRoomCreateRequestDto {
    private Long productId;
    private Long buyerId; // 로그인 유저 (구매자)
}
