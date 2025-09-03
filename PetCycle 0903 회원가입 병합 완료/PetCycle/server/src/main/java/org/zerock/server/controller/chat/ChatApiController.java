// src/main/java/org/zerock/server/controller/chat/ChatApiController.java
package org.zerock.server.controller.chat;

import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.zerock.server.domain.chat.ChatMessage;
import org.zerock.server.domain.chat.ChatRoom;
import org.zerock.server.domain.user.UserInfo;
import org.zerock.server.dto.chat.ChatMessageResponseDTO;
import org.zerock.server.dto.chat.ChatMessageSendRequest;
import org.zerock.server.dto.chat.ChatRoomListItemDTO;
import org.zerock.server.dto.chat.ChatRoomResponse;
import org.zerock.server.dto.chat.RoomCreateRequest;
import org.zerock.server.dto.user.UserInfoDTO; // 이미 보드 컨트롤러에서 쓰는 DTO
import org.zerock.server.repository.user.UserInfoRepository;
import org.zerock.server.service.chat.ChatService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatApiController {

    private final ChatService chatService;
    private final UserInfoRepository userInfoRepository;

    /** 방 생성/획득: peerId만 받으면 됨. meId는 토큰(Principal)에서 */
    @PostMapping("/rooms")
    @PreAuthorize("isAuthenticated()")
    public ChatRoomResponse getOrCreateRoom(@RequestBody RoomCreateRequest req,
                                            @AuthenticationPrincipal UserInfoDTO me) {
        ChatRoom room = chatService.getOrCreateRoom(me.getUserId(), req.getPeerId());
        return ChatRoomResponse.from(room);
    }

    /** 내 방 목록(생성 최신순) — 쿼리 파라미터로 meId 받을 필요 없음 */
    @GetMapping("/rooms")
    @PreAuthorize("isAuthenticated()")
    public List<ChatRoomListItemDTO> getMyRooms(@AuthenticationPrincipal UserInfoDTO me) {
        Long meId = me.getUserId();
        return chatService.getMyRooms(meId)
                .stream()
                .map(r -> ChatRoomListItemDTO.from(r, meId, null)) // 닉네임은 프런트가 처리
                .toList();
    }


    /** 방의 모든 메시지(최신순) — [CHANGE] 내 삭제시각 이후만 내려줌 */
    @GetMapping("/rooms/{roomId}/messages")
    @PreAuthorize("isAuthenticated()")
    public List<ChatMessageResponseDTO> getRoomMessages(@PathVariable Long roomId,
                                                        @AuthenticationPrincipal UserInfoDTO me) {
        // 지금은 단순히 로드만. (참가자 검증을 원하면 서비스 쪽에 메서드 하나만 추가하면 됨)
        // [CHANGE] 단순 roomId 만 넘기던 것을 meId 도 함께 넘겨, 서비스에서 '내 deletedAt 이후'로 필터하게 함
        List<ChatMessage> list = chatService.getRoomMessages(roomId, me.getUserId());
        return list.stream()
                .map(m -> ChatMessageResponseDTO.from(m, null))
                .toList();
    }

    /** 메시지 전송 — 요청 바디의 meId는 무시하고, Principal의 userId만 신뢰 */
    @PostMapping("/messages")
    @PreAuthorize("isAuthenticated()")
    public ChatMessageResponseDTO sendMessage(@RequestBody ChatMessageSendRequest req,
                                              @AuthenticationPrincipal UserInfoDTO me) {
        ChatMessage saved = chatService.sendMessage(req.getRoomId(), me.getUserId(), req.getContent());
        return ChatMessageResponseDTO.from(saved, null);
    }

    // 닉네임 전송
    @GetMapping("/users/{userId}/nickname")
    @PreAuthorize("isAuthenticated()")
    public Map<String, Object> getNickname(@PathVariable Long userId) {
        String nickname = userInfoRepository.findById(userId)
                .map(UserInfo::getNickname) // getId/getNickname 이름 맞춰
                .orElse("");
        return Map.of("userId", userId, "nickname", nickname);
    }

    /** [ADD] 내 화면에서만 방 삭제(숨기기): 내 deletedAt만 갱신 */
    @DeleteMapping("/rooms/{roomId}")
    @PreAuthorize("isAuthenticated()")
    public void deleteRoomForMe(@PathVariable Long roomId,
                                @AuthenticationPrincipal UserInfoDTO me) {
        chatService.deleteRoomForMe(roomId, me.getUserId());
    }
}
