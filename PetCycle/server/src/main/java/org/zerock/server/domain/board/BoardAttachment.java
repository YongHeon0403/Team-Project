package org.zerock.server.domain.board;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tb_board_attachment")
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class BoardAttachment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long attachmentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private BoardPost boardPost;

    @Column(nullable = false, length = 255)
    private String fileUrl;

    @Column(nullable = false, length = 50)
    private String fileType;

    @Column(name = "uploaded_at", updatable = false)
    private java.sql.Timestamp uploadedAt;
}