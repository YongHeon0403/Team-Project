package org.zerock.server.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // 서버 주소가 http://localhost:8080 이라면,
        // 클라이언트는 http://localhost:8080/ws 로 연결을 시도
        // 연결이 되면 프로토콜이 업그레이드 되고,
        // ws://localhost:8080/ws 경로를 유지
        // 이후부터는 HTTP 요청/응답이 아니라 양방향 WebSocket 프레임을 주고받게 됨

        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")      // CORS 허용
                .withSockJS();                      // 구형 브러우저 호환용
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // 클라이언트가 구독(subscribe)할 수 있는 경로(prefix)를 지정
        // 서버 -> 클라이언트로 메세지 보낼 떄
        registry.enableSimpleBroker("/topic");  // 1:N


        // 클라이언트 -> 서버 메세지 보낼 때
        // 클라이언트가 send() 하는 경로중에
        // /app 으로 시작하는 메세지는 @MessageMapping 메서드로 라우팅하라는 뜻
        registry.setApplicationDestinationPrefixes("/app");
    }
}
