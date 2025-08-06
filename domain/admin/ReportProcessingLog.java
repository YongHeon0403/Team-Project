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
@Table(name = "tb_report_processing_log")
public class ReportProcessingLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long logId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "report_id", nullable = false)
    private ReportHistory report;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "processor_user_id", nullable = false)
    private UserInfo processor;

    @Column(nullable = false, length = 100)
    private String processingAction; // 예: 계정 정지, 게시글 삭제

    @Lob
    private String actionDetail;

    @Column(nullable = false, updatable = false, insertable = false)
    private Timestamp actionDate;
}
