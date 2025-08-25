package org.zerock.server.dto.pet;

import lombok.*;

@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class PetProfileUpdateRequestDto {
    private String name;
    private Integer age;
    private String bodyType;
    private String breed;
    private Integer petTypeId;
    private String uploadFileName; // 새 이미지 파일명(선택)
}
