package org.zerock.server.dto.pet;

import lombok.*;
import org.zerock.server.domain.pet.PetProfile;

@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class PetProfileListResponseDto {
    private Long petId;
    private String name;
    private String breed;
    private String typeName;         // petType.typeName
    private String profileImageUrl;  // 파일명(뷰 URL 아님)

    /** 엔티티 → DTO (리스트용) */
    public static PetProfileListResponseDto of(PetProfile pet) {
        return PetProfileListResponseDto.builder()
                .petId(pet.getPetId())
                .name(pet.getName())
                .breed(pet.getBreed())
                .typeName(pet.getPetType() != null ? pet.getPetType().getTypeName() : null)
                .profileImageUrl(pet.getProfileImageUrl())
                .build();
    }
}
