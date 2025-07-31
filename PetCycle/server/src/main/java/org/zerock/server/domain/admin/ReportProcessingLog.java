package org.zerock.server.domain.admin;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tb_report_processing_log")
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ReportProcessingLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long logId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "report_id", nullable = false)
    private ReportHistory report;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "processor_admin_id", nullable = false)
    private AdminAccount processorAdmin;

    @Column(nullable = false, length = 100)
    private String processingAction;

    @Lob
    private String actionDetail;

    @Column(name = "action_date", updatable = false)
    private java.sql.Timestamp actionDate;
}