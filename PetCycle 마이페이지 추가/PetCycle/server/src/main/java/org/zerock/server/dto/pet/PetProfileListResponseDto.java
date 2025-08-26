package org.zerock.server.dto.pet;

import lombok.*;

@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class PetProfileListResponseDto {
    private Long petId;
    private String name;
    private String breed;
    private String typeName;         // petType.typeName
    private String profileImageUrl;  // 파일명
}
