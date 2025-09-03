package org.zerock.server.service.chat;

import org.zerock.server.domain.chat.ChatMessage;
import org.zerock.server.domain.chat.ChatRoom;

import java.util.List;

public interface ChatService {

    // 두 유저 사이의 방을 반환. 없으면 생성해서 반환 (두명의 유저는 하나의 방만)
    ChatRoom getOrCreateRoom(Long meId, Long peerId);

    // 내가 참여한 방 목록 (생성 최신순)
    List<ChatRoom> getMyRooms(Long meId);

    // 방의 모든 메세지(최신순) + 내 삭제시각 이후로만
    List<ChatMessage> getRoomMessages(Long roomId, Long meId);

    // 메세지 저장 + 방의 lastMessage/lastMessageAt 갱신
    ChatMessage sendMessage(Long roomId, Long meId, String content);

    // 내 화면에서만 방 삭제
    void deleteRoomForMe(Long roomId, Long meId);
}
