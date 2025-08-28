package org.zerock.server.domain.admin;

import jakarta.persistence.*;
import lombok.*;
import org.zerock.server.domain.user.UserInfo;

import java.sql.Timestamp;

@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Entity
@Table(name = "tb_report_history")
@ToString(exclude = {"reporter", "processor"})
public class ReportHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long reportId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporter_user_id", nullable = false)
    private UserInfo reporter;

    @Column(nullable = false, length = 50)
    private String reportedType; // POST, COMMENT, PRODUCT, USER

    @Column(nullable = false)
    private Long reportedEntityId;

    @Column(nullable = false, length = 255)
    private String reportReason;

    @Lob
    private String reportDetail;

    @Builder.Default
    @Column(length = 50, nullable = false)
    private String reportStatus = "PENDING";

    @Column(nullable = false, updatable = false, insertable = false)
    private Timestamp reportedAt;

    @Column
    private Timestamp processedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "processor_user_id")
    private UserInfo processor; // 처리한 관리자 (nullable)
}
