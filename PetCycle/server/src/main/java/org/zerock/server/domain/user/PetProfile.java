package org.zerock.server.domain.user;

import jakarta.persistence.*;
import lombok.Getter;
import org.zerock.server.domain.BaseTimeEntity;

@Entity
@Table(name = "tb_pet_profile")
@Getter
public class PetProfile extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long petId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserInfo userInfo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pet_type_id", nullable = false)
    private PetTypeCategory petTypeCategory;

    @Column(nullable = false, length = 100)
    private String name;

    private Integer age;

    @Column(length = 100)
    private String breed;

    @Column(length = 50)
    private String bodyType;

    private String profileImageUrl;
}