package org.zerock.server.domain.chat;

import jakarta.persistence.*;
import lombok.*;
import org.zerock.server.domain.user.UserInfo;

@Getter @Setter @Builder
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "tb_chat_message")
@ToString(exclude = {"room", "sender"})
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long messageId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private ChatRoom room;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private UserInfo sender;

    // ✅ 텍스트(이미지 전용 메시지면 null 허용)
    @Lob
    @Column(nullable = true)
    private String content;

    // ✅ 이미지 URL (없으면 null)
    @Column(length = 500)
    private String imageUrl;

    @Column(name = "sent_at", updatable = false, insertable = false)
    private java.sql.Timestamp sentAt;

    // ✅ 읽음 플래그 (기본 false)
    @Builder.Default
    @Column(name = "is_read", nullable = false)
    private boolean isRead = false;
}
