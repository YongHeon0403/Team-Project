package org.zerock.server.service.chat;

import org.zerock.server.dto.chat.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ChatService {
    Long createOrGetChatRoom(Long productId, UserDetails userDetails);
    List<ChatRoomListResponseDto> getMyChatRooms(UserDetails userDetails);
    ChatRoomResponseDto getChatRoomDetail(Long roomId, UserDetails userDetails);
    Page<ChatMessageListResponseDto> getMessages(Long roomId, Pageable pageable, UserDetails userDetails);
    ChatMessageResponseDto sendMessage(Long roomId, String content, MultipartFile image, UserDetails userDetails);
    void readMessages(Long roomId, UserDetails userDetails);
    void softDeleteChatRoom(Long roomId, UserDetails userDetails);
    void softDeleteAllRoomsByProduct(Long productId);
}
