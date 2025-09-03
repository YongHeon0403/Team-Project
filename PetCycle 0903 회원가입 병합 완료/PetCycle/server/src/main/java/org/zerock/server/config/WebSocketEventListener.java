package org.zerock.server.config;

import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

// 현재 사용 안 함
@Component
public class WebSocketEventListener {

    // Set 메서드 add, remove, contains 같은 모든 접근 메서드에 synchronized 락을 걸어줌

    // synchronized ?
    // 동기화 라는 뜻이며, 동기화 시키게 되면 다른 스레드 에서 접근을 할수 없습니다.

    // 따라서 멀티스레드 환경에서 동시에 접근해도 안전(thread-safe)
    private final Set<String> onlineUsers = Collections.synchronizedSet(new HashSet<>());

    public Set<String> getOnlineUsers() {
        return onlineUsers;
    }

    public void addOnlineUser(String username) {
        onlineUsers.add(username);
    }

    public void removeOnlineUser(String username) {
        onlineUsers.remove(username);
    }
}
