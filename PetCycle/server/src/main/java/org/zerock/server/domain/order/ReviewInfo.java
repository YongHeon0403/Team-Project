package org.zerock.server.domain.order;

import jakarta.persistence.*;
import lombok.*;
import org.zerock.server.domain.user.UserInfo;

/**
 * 거래 후기를 저장하는 엔티티 (거래 1건당 1후기)
 * 거래(TransactionHistory)와 1:1, 작성자/대상자(UserInfo)와 N:1 관계
 */
@Entity
@Table(name = "tb_review_info")
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ReviewInfo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long reviewId; // 후기 PK

    /**
     * 연결된 거래 내역 (1:1, 후기 1개는 반드시 거래 1건에 속함)
     */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transaction_id", nullable = false, unique = true)
    private TransactionHistory transaction;

    /**
     * 후기 작성자(구매자/판매자 모두 가능, N:1)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewer_id", nullable = false)
    private UserInfo reviewer;

    /**
     * 후기 대상자(상대방, N:1)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewee_id", nullable = false)
    private UserInfo reviewee;

    @Column(nullable = false)
    private int rating; // 평점(1~5)

    @Lob
    private String content; // 후기 내용

    @Column(name = "created_at", updatable = false)
    private java.sql.Timestamp createdAt; // 작성일시

    // setter 필요시 직접 추가
    public void setRating(int rating) { this.rating = rating; }
    public void setContent(String content) { this.content = content; }
}
