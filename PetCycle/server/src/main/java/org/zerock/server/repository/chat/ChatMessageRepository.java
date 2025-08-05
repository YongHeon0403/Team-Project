package org.zerock.server.repository.chat;

import org.zerock.server.domain.chat.ChatMessage;
import org.zerock.server.domain.chat.ChatRoom;
import org.zerock.server.domain.user.UserInfo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * 채팅 메시지(JPA) 레포지토리
 */
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    // 특정 채팅방의 모든 메시지(최신순)
    List<ChatMessage> findByChatRoomOrderBySentAtAsc(ChatRoom chatRoom);

    // 읽지 않은 메시지 (읽음 처리에 사용)
    List<ChatMessage> findByChatRoomAndSenderNotAndIsReadFalse(ChatRoom chatRoom, UserInfo sender);

    // 필요시 커스텀 메소드 추가
}
