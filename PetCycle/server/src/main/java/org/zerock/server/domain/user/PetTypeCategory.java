package org.zerock.server.domain.user;

import jakarta.persistence.*;
import lombok.Getter;

@Entity
@Table(name = "tb_pet_type_category")
@Getter
public class PetTypeCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer petTypeId;

    @Column(unique = true, nullable = false, length = 50)
    private String typeName;
}