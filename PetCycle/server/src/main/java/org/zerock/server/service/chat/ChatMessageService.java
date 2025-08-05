package org.zerock.server.service.chat;

import org.zerock.server.domain.chat.ChatMessage;
import org.zerock.server.domain.chat.ChatRoom;
import org.zerock.server.domain.user.UserInfo;
import org.zerock.server.dto.chat.ChatMessageRequestDto;
import org.zerock.server.dto.chat.ChatMessageResponseDto;
import org.zerock.server.repository.chat.ChatMessageRepository;
import org.zerock.server.repository.chat.ChatRoomRepository;
import org.zerock.server.repository.user.UserInfoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 채팅 메시지 관련 서비스 구현
 */
@Service
@RequiredArgsConstructor
public class ChatMessageService {

    private final ChatMessageRepository chatMessageRepository;
    private final ChatRoomRepository chatRoomRepository;
    private final UserInfoRepository userInfoRepository;

    // 메시지 저장(전송)
    public ChatMessageResponseDto sendMessage(ChatMessageRequestDto dto) {
        ChatRoom room = chatRoomRepository.findById(dto.getRoomId())
                .orElseThrow(() -> new IllegalArgumentException("채팅방 없음"));
        UserInfo sender = userInfoRepository.findById(dto.getSenderId())
                .orElseThrow(() -> new IllegalArgumentException("보낸사람 없음"));

        ChatMessage message = ChatMessage.builder()
                .chatRoom(room)
                .sender(sender)
                .content(dto.getContent())
                .sentAt(new Timestamp(System.currentTimeMillis()))
                .isRead(false)
                .build();

        chatMessageRepository.save(message);
        return toDto(message);
    }

    // 채팅방의 모든 메시지 조회 (최신순)
    public List<ChatMessageResponseDto> getMessages(Long roomId) {
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("채팅방 없음"));
        return chatMessageRepository.findByChatRoomOrderBySentAtAsc(room).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    // 메시지 → DTO 변환
    private ChatMessageResponseDto toDto(ChatMessage msg) {
        return ChatMessageResponseDto.builder()
                .messageId(msg.getMessageId())
                .roomId(msg.getChatRoom().getRoomId())
                .senderId(msg.getSender().getUserId())
                .senderNickname(msg.getSender().getNickname())
                .content(msg.getContent())
                .sentAt(msg.getSentAt() != null ? msg.getSentAt().toLocalDateTime() : null)
                .isRead(msg.isRead())
                .build();
    }
}
