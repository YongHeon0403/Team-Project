// src/main/java/org/zerock/server/service/chat/ChatServiceImpl.java
package org.zerock.server.service.chat;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.zerock.server.domain.chat.ChatMessage;
import org.zerock.server.domain.chat.ChatRoom;
import org.zerock.server.repository.chat.ChatMessageRepository;
import org.zerock.server.repository.chat.ChatRoomRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

/**
 * ChatService 구현체.
 *
 * 설계 핵심:
 *  - "두 유저 1방" 정책: 같은 두 유저 조합으로는 채팅방을 하나만 유지
 *    → 내부에서 항상 (작은ID, 큰ID) 순으로 정규화해 buyerId/sellerId에 저장/조회
 *  - 엔티티는 userId(Long)만 저장 (UserInfo 매핑 X)
 *  - 메시지 시각은 BaseTimeEntity.createdAt 사용
 *  - 트랜잭션:
 *      * 조회 메서드: @Transactional(readOnly = true)
 *      * 쓰기/갱신 메서드: @Transactional  → 원자성 보장(중간 예외 시 전체 롤백)
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ChatServiceImpl implements ChatService {

    private final ChatRoomRepository chatRoomRepository;
    private final ChatMessageRepository chatMessageRepository;

    /**
     * 두 유저 사이의 채팅방을 가져오거나(존재한다면), 없으면 생성해서 반환.
     *
     * 왜 ID를 정렬(min/max)하나?
     *  - 호출자가 (me=5, peer=10) 또는 (me=10, peer=5)로 호출해도
     *    항상 같은 키(buyerId=5, sellerId=10)를 사용하도록 "정규화"해서
     *    중복 방 생성(A,B) vs (B,A)을 원천 차단하기 위함.
     */
    @Override
    @Transactional
    public ChatRoom getOrCreateRoom(Long meId, Long peerId) {
        require(meId, "meId");
        require(peerId, "peerId");

        // 본인과의 대화는 금지
        if (Objects.equals(meId, peerId)) {
            throw new IllegalArgumentException("본인과는 채팅방을 만들 수 없습니다.");
        }

        // (작은ID, 큰ID)로 정규화 → 내부적으로 buyer/seller 자리에 고정
        long buyerId = Math.min(meId, peerId);
        long sellerId = Math.max(meId, peerId);

        // 이미 있으면 그 방을 반환, 없으면 생성
        return chatRoomRepository.findByBuyerIdAndSellerId(buyerId, sellerId)
                .orElseGet(() -> chatRoomRepository.save(
                        ChatRoom.builder()
                                .buyerId(buyerId)
                                .sellerId(sellerId)
                                .build()
                ));

        /*
         * 참고(레이스 컨디션):
         *  - 동시 요청으로 인해 같은 순간에 두 스레드가 모두 방이 없다고 판단하고 insert를 시도할 수 있음.
         *  - 이를 완벽히 막으려면 DB에 (buyer_id, seller_id) 유니크 제약을 추가하고,
         *    제약 위반 예외를 잡아 findBy...로 재조회하는 패턴을 쓰면 안전.
         *  - 지금 단계에서는 단순 구현 유지.
         */
    }

    /**
     * 내가 참여한 모든 방 목록을 반환(생성일 최신순).
     *  - 단순/직관 기준: createdAt 기준 정렬
     *  - 나중에 "최근 메시지 시각" 기준으로 바꾸고 싶으면 Repository 쿼리만 수정하면 됨.
     */
    @Override
    public List<ChatRoom> getMyRooms(Long meId) {
        require(meId, "meId");
        return chatRoomRepository.findMyVisibleRooms(meId, LocalDateTime.of(1970,1,1,0,0));
    }

    /**
     * 해당 방의 모든 메시지를 최신순으로 반환. (삭제 시각 이후의 새 메세지만)
     *  - 프론트에서 오래된→최신 순으로 보여주고 싶다면 reverse() 해서 사용 가능.
     *  - 무한스크롤이 필요해지면 Page<ChatMessage> 기반 메서드를 추가하면 됨.
     */
    @Override
    public List<ChatMessage> getRoomMessages(Long roomId, Long meId) {
        require(roomId, "roomId");
        require(meId, "meId");

        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 채팅방입니다."));

        LocalDateTime cut = room.getBuyerId().equals(meId) ? room.getBuyerClearedAt() : room.getSellerClearedAt();
        if (cut == null) {
            return chatMessageRepository.findByRoom_IdOrderByCreatedAtDesc(roomId);
        }

        return chatMessageRepository.findByRoom_IdAndCreatedAtAfterOrderByCreatedAtDesc(roomId, cut);

    }

    /**
     * 메시지를 저장하고, 방의 lastMessage/lastMessageAt을 갱신.
     *
     * 트랜잭션 처리:
     *  - 메시지 insert와 방 메타 업데이트를 하나의 트랜잭션으로 묶어
     *    중간에 예외가 나면 둘 다 rollback → DB 일관성 유지.
     */
    @Override
    @Transactional
    public ChatMessage sendMessage(Long roomId, Long meId, String content) {
        require(roomId, "roomId");
        require(meId, "meId");

        // 메시지 내용 검증(공백만 들어오는 경우 방지)
        if (content == null || content.trim().isEmpty()) {
            throw new IllegalArgumentException("메시지 내용이 비어 있습니다.");
        }
        String trimmed = content.trim();

        // 방 존재 여부 확인
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 채팅방입니다. roomId=" + roomId));

        // 방 참여자 검증(권한 체크)
        if (!Objects.equals(room.getBuyerId(), meId) && !Objects.equals(room.getSellerId(), meId)) {
            throw new IllegalStateException("해당 방의 참가자가 아닙니다.");
        }

        // 1) 메시지 저장
        ChatMessage saved = chatMessageRepository.save(
                ChatMessage.builder()
                        .room(room)
                        .senderId(meId)
                        .content(trimmed)
                        .build()
        );

        // 2) 방 프리뷰/정렬용 메타 갱신
        //    - 너무 긴 본문은 잘라서 저장(목록 프리뷰에 과도한 데이터 방지)
        room.setLastMessage(trimmed.length() > 500 ? trimmed.substring(0, 500) : trimmed);
        room.setLastMessageAt(LocalDateTime.now());

        // 변경감지(dirty checking)로 update 반영됨.
        // 명시적으로 저장하고 싶다면 아래 한 줄을 사용해도 됨:
        // chatRoomRepository.save(room);

        return saved;
    }

    /** 파라미터 필수값 검증 유틸 */
    private void require(Object v, String name) {
        if (v == null) {
            throw new IllegalArgumentException(name + " is null");
        }
    }

    @Override
    @Transactional
    public void deleteRoomForMe(Long roomId, Long meId) {
        require(roomId, "roomId");
        require(meId, "meId");

        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 채팅방입니다."));

        LocalDateTime now = LocalDateTime.now();

        if (Objects.equals(room.getBuyerId(), meId)){
            room.setBuyerClearedAt(now);
        } else if (Objects.equals(room.getSellerId(), meId)){
            room.setSellerClearedAt(now);
        } else {
            throw new IllegalStateException("해당 방의 참가자가 아닙니다.");
        }

    }
}
