package org.zerock.server.domain.admin;

import jakarta.persistence.*;
import lombok.*;
import org.zerock.server.domain.user.UserInfo;

@Entity
@Table(name = "tb_notification_log")
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class NotificationLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long notificationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserInfo userInfo;

    @Column(nullable = false, length = 50)
    private String type;

    @Lob
    @Column(nullable = false)
    private String content;

    private Long relatedId;

    @Builder.Default
    private boolean isRead = false;

    @Column(name = "created_at", updatable = false)
    private java.sql.Timestamp createdAt;
}