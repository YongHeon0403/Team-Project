package org.zerock.server.controller.chat;

import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import org.zerock.server.dto.ChatMessageDTO;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequiredArgsConstructor
@Log
public class ChatController {

    // 온라인 유저 목록 관리하는 Set (중복 허용 x)
    // ConcurrentHashMap.newKeySet(); : 키만 관리하는 Set을 생성. Set<K>를 리턴
    private static final Set<String> onlineUsers = ConcurrentHashMap.newKeySet();

    private final SimpMessagingTemplate messagingTemplate;

    // 클라이언트가 /app/chat.addUser 로 JOIN 메시지를 보낼 때 처리(사용자가 채팅방 입장시 처리)
    @MessageMapping("/chat.addUser")
    public void addUser(@Payload ChatMessageDTO chatMessageDTO, SimpMessageHeaderAccessor headerAccessor) {
        /**************************************************************
         * 기존의 JWT 와 시큐리를 사용하고 있는데
         * WebSocket 세션을 따로 사용해야 하는 이유 ?
         * JWT 는 WebSocket 연결 초기 인증에 유용하게 사용되지만,
         * 연결 이후 지속적인 보안 유지를 위해 별도의 WebSocket 세션을 사용해
         * 사용자의 인증 상태를 관리하는 것이 필수적입니다.
         * 이를 통해 효율적이고 안전한 채팅 프로그램을 구현할 수 있습니다.
         **************************************************************/

        // 사용자 이름을 세션에 저장
        headerAccessor.getSessionAttributes().put("username", chatMessageDTO.getSender());

        // 온라인 유저 목록에 추가
        onlineUsers.add(chatMessageDTO.getSender());

        // JOIN 메시지 브로드캐스트

        // 업데이트된 전체 온라인 유저 목록을 모든 클라이언트에게 브로드캐스트
        messagingTemplate.convertAndSend("/topic/onlineUsers", onlineUsers);
    }

    /***************************************************************
     * @EventListener ?
     * 애플리케이션 내부에서 발생하는 이벤트(ApplicationEvent) 를 감지해서
     * 특정 메서드가 실행되도록 해주는 기능
     * 발행된 이벤트(Publish Event)를 구독(Subscribe)해서 처리할 수 있게 해주는 어노테이션
     * @EventListener 메서드는 반환값이 없어야 함 (void).
     * 이벤트 타입(MyCustomEvent)을 매개변수로 받아 처리.(여기서는 SessionDisconnectEvent 를 사용)
     * @Async 와 함께 쓰면 비동기 이벤트 처리 가능.
     ***************************************************************/
    // 여기서는 웹소켓 연결이 끊어질 때 자동으로 실행되는 이벤트 리스너 역할을 한다.

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        //SimpMessageHeaderAccessor ?
        //STOMP 메시지의 헤더에 접근/수정할 수 있는 유틸리티 클래스
        //메시지 전송 시점에, 세션 ID, 사용자 정보, 커스텀 헤더 등을 꺼내거나 추가할 수 있음
        SimpMessageHeaderAccessor headerAccessor = SimpMessageHeaderAccessor.wrap(event.getMessage());
        String username = (String) headerAccessor.getSessionAttributes().get("username");

        if (username != null) {
            onlineUsers.remove(username);

            ChatMessageDTO chatMessageDTO = new ChatMessageDTO();
            chatMessageDTO.setSender(username);
            chatMessageDTO.setType(ChatMessageDTO.MessageType.LEAVE);
            chatMessageDTO.setContent(username + "님이 퇴장하셨습니다.");

            // 퇴장후 업데이트된 전체 온라인 유저 목록을 모든 클라이언트에게 브로드캐스트
            messagingTemplate.convertAndSend("/topic/onlineUsers", onlineUsers);
        }
    }

    // 1:1 메세지 : receiver에게만 전송 (서버 브로드캐스트는 그대로 둠)
    // 클라이언트가 /app/chat.dm 으로 메세지 전송하면 여기서 처리
    @MessageMapping("/chat.dm")
    public void directMessage(@Payload ChatMessageDTO chatMessageDTO, SimpMessageHeaderAccessor headerAccessor) {
        // 수신자 ID (누구에게 보낼지)
        String to = chatMessageDTO.getReceiver();
        // 발신자 ID (누가 보냈는지)
        String from = chatMessageDTO.getSender();

        // 수신자가 없으면 무시
        if (to == null || to.isBlank()){
            return;
        }

        // 수신자의 개인 구독 주소로만 보내기
        messagingTemplate.convertAndSend("/topic/inbox." + to, chatMessageDTO);

        // (선택) 보낸 사람도 자기 대화창에서 즉시 보이도록 echo (UX용)
        if (from != null && !from.isBlank()){
            messagingTemplate.convertAndSend("/topic/inbox." + from, chatMessageDTO);
        }
    }



}
