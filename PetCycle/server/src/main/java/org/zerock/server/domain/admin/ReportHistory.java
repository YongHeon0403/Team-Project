package org.zerock.server.domain.admin;

import jakarta.persistence.*;
import lombok.*;
import org.zerock.server.domain.user.UserInfo;

@Entity
@Table(name = "tb_report_history")
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ReportHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long reportId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporter_user_id", nullable = false)
    private UserInfo reporter;

    @Column(nullable = false, length = 50)
    private String reportedType;

    @Column(nullable = false)
    private Long reportedEntityId;

    @Column(nullable = false, length = 255)
    private String reportReason;

    @Lob
    private String reportDetail;

    @Column(length = 50)
    @Builder.Default
    private String reportStatus = "PENDING";

    @Column(name = "reported_at", updatable = false)
    private java.sql.Timestamp reportedAt;

    private java.sql.Timestamp processedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "processor_admin_id")
    private AdminAccount processorAdmin;
}