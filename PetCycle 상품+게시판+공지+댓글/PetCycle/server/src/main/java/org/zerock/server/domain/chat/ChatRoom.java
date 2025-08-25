package org.zerock.server.domain.chat;

import jakarta.persistence.*;
import lombok.*;
import org.zerock.server.domain.product.ProductInfo;
import org.zerock.server.domain.user.UserInfo;

import java.util.HashSet;
import java.util.Set;

@Getter @Setter @Builder
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "tb_chat_room")
public class ChatRoom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long roomId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private ProductInfo product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "buyer_id", nullable = false)
    private UserInfo buyer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id", nullable = false)
    private UserInfo seller;

    // ✅ 소프트 삭제: 엔티티 기본값 false (서비스에서 세팅 불필요)
    @Builder.Default
    @Column(name = "is_deleted", nullable = false)
    private boolean deleted = false;

    @Column(name = "created_at", updatable = false, insertable = false)
    private java.sql.Timestamp createdAt;

    @Column(name = "updated_at", insertable = false)
    private java.sql.Timestamp updatedAt;

    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private Set<ChatMessage> messages = new HashSet<>();
}
