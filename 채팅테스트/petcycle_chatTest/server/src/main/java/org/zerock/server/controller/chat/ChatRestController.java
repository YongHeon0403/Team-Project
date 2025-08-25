package org.zerock.server.controller.chat;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ChatRestController {
    // 채팅 참여자 리스트나 채팅방 리스트용
    @GetMapping("/rooms")
    public List<String> getRooms() {
        return List.of("general", "team", "project"); // 예시 데이터
    }

    @GetMapping("/users")
    public List<String> getUsers() {
        return List.of("alice", "bob", "charlie");
    }
}
