package org.zerock.server.domain.chat;

import jakarta.persistence.*;
import lombok.*;
import org.zerock.server.domain.user.UserInfo;

@Getter @Setter @Builder
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "tb_chat_message")
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

    @Lob
    @Column(nullable = false)
    private String content;

    @Column(name = "sent_at", updatable = false, insertable = false)
    private java.sql.Timestamp sentAt;

    @Column(nullable = false)
    private boolean isRead = false;
}
