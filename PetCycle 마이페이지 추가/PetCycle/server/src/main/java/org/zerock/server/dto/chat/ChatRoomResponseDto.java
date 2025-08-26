package org.zerock.server.dto.chat;

import lombok.*;
import org.zerock.server.dto.product.ProductListResponseDto;
import org.zerock.server.dto.product.ProductSellerDto;

@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class ChatRoomResponseDto {
    private Long roomId;
    private ProductListResponseDto product;
    private ProductSellerDto buyer;
    private ProductSellerDto seller;
    private boolean isDeleted;
    private java.sql.Timestamp createdAt;
    private java.sql.Timestamp updatedAt;
    private String lastMessage;
    private java.sql.Timestamp lastMessageAt;
    private int unreadCount;
}
