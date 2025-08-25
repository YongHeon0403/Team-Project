package org.zerock.server.dto.chat;

import lombok.*;
import org.springframework.web.multipart.MultipartFile;

@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class ChatMessageRequestDto {
    private Long roomId;
    private String content;      // 텍스트 메시지
    private MultipartFile image; // 이미지(선택)
}
