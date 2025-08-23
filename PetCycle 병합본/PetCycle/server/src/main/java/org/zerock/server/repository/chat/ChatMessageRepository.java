package org.zerock.server.repository.chat;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.zerock.server.domain.chat.ChatMessage;
import org.zerock.server.domain.chat.ChatRoom;
import org.zerock.server.domain.user.UserInfo;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    // 페이징 목록
    Page<ChatMessage> findAllByRoomOrderBySentAtAsc(ChatRoom room, Pageable pageable);

    // 마지막 메시지
    ChatMessage findTop1ByRoomOrderBySentAtDesc(ChatRoom room);

    // 안읽은 개수 (상대 기준) — boolean 파생 쿼리는 IsReadFalse/ReadFalse 둘 다 종종 쓰임
    Long countByRoomAndIsReadFalseAndSenderNot(ChatRoom room, UserInfo user);

    // 방이 삭제되지 않은 메시지
    List<ChatMessage> findAllByRoomAndRoom_DeletedFalse(ChatRoom room);

    // ---------- 기존 이름 호환 브리지
    default List<ChatMessage> findAllByRoomAndRoom_IsDeletedFalse(ChatRoom room) {
        return findAllByRoomAndRoom_DeletedFalse(room);
    }
}
