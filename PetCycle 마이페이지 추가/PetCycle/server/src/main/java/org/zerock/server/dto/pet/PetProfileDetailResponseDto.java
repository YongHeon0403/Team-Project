package org.zerock.server.dto.pet;

import lombok.*;

@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class PetProfileDetailResponseDto {
    private Long petId;
    private Long ownerId;            // user.userId
    private String name;
    private Integer age;
    private String bodyType;
    private String breed;
    private Integer petTypeId;
    private String typeName;
    private String profileImageUrl;
    private String content;
}
