// src/main/java/org/zerock/server/domain/chat/ChatRoom.java
package org.zerock.server.domain.chat;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.zerock.server.domain.BaseTimeEntity;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "tb_chat_room")
public class ChatRoom extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "room_id")
    private Long id;

//    /** 상품 연결(선택) — 상품과 묶는 방일 경우 사용, 아니면 null 허용 */
//    @Column(name = "product_id")
//    private Long productId;

    /** 참여자: UserInfo 매핑 대신 ID만 저장 */
    @Column(name = "buyer_id", nullable = false)
    private Long buyerId;

    @Column(name = "seller_id", nullable = false)
    private Long sellerId;

    /** 목록 프리뷰/정렬용(선택) */
    @Column(length = 500)
    private String lastMessage;

    private LocalDateTime lastMessageAt;

    /** 각 사용자별 내 화면에서 삭제 시간 (이전 메세지는 숨김) */
    private LocalDateTime buyerClearedAt;
    private LocalDateTime sellerClearedAt;


}
