package org.zerock.server.dto.pet;

import lombok.*;

@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class PetProfileRegisterRequestDto {
    private String name;
    private Integer age;
    private String bodyType;
    private String breed;
    private Integer petTypeId;     // FK
    private String uploadFileName; // 컨트롤러에서 저장한 파일명
}
