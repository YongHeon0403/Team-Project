package org.zerock.server.domain.pet;

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
@Table(name = "tb_pet_profile")
public class PetProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long petId; // 반려동물 고유 ID

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserInfo user; // 소유 사용자

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pet_type_id", nullable = false)
    private PetTypeCategory petType; // 반려동물 종류

    @Column(nullable = false, length = 100)
    private String name; // 반려동물 이름

    @Column
    private Integer age; // 나이 (nullable, 개월/년)

    @Column(length = 100)
    private String breed; // 품종

    @Column(length = 50)
    private String bodyType; // 체형

    @Column(length = 255)
    private String profileImageUrl; // 프로필 이미지

    @Column(name = "created_at", updatable = false, insertable = false)
    private Timestamp createdAt;

    @Column(name = "updated_at", updatable = false, insertable = false)
    private Timestamp updatedAt;
}
