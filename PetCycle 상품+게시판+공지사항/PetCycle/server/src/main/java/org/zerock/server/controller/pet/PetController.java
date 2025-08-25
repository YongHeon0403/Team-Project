package org.zerock.server.controller.pet;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.zerock.server.dto.pet.*;
import org.zerock.server.dto.user.UserInfoDTO;
import org.zerock.server.service.pet.PetProfileService;
import org.zerock.server.util.CustomFileUtil;

import java.util.Collections;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/pets")
public class PetController {

    private final PetProfileService petProfileService;
    private final CustomFileUtil customFileUtil;

    /** 업로드 파일 보기 (product/board 동일 스타일) */
    @GetMapping("/view/{fileName:.+}")
    public ResponseEntity<Resource> viewFile(@PathVariable String fileName) {
        return customFileUtil.getFile(fileName);
    }

    /** 등록: @ModelAttribute + @RequestParam(image), RequestPart 미사용 */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Long> registerPet(
            @ModelAttribute PetProfileRegisterRequestDto dto,
            @RequestParam(value = "image", required = false) MultipartFile image,
            @AuthenticationPrincipal UserInfoDTO user
    ) {
        String fileName = null;
        if (image != null && !image.isEmpty()) {
            fileName = customFileUtil.saveFiles(Collections.singletonList(image))
                    .stream().findFirst().orElse(null);
        }
        dto.setUploadFileName(fileName);

        Long petId = petProfileService.registerPet(dto, user != null ? user.getUserId() : null);
        return ResponseEntity.ok(petId);
    }

    /** 상세 */
    @GetMapping("/{petId}")
    public ResponseEntity<PetProfileDetailResponseDto> getDetail(
            @PathVariable Long petId,
            @AuthenticationPrincipal UserInfoDTO user
    ) {
        return ResponseEntity.ok(petProfileService.getPetDetail(petId, user));
    }

    /** 수정: 새 이미지 오면 저장 후 파일명 교체, 기존 파일 삭제 */
    @PutMapping(value = "/{petId}",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Void> updatePet(
            @PathVariable Long petId,
            @ModelAttribute PetProfileUpdateRequestDto dto,
            @RequestParam(value = "image", required = false) MultipartFile newImage,
            @AuthenticationPrincipal UserInfoDTO user
    ) {
        String oldFileName = null;
        PetProfileDetailResponseDto before = petProfileService.getPetDetail(petId, user);
        if (before != null) oldFileName = before.getProfileImageUrl();

        String newFileName = null;
        if (newImage != null && !newImage.isEmpty()) {
            newFileName = customFileUtil.saveFiles(Collections.singletonList(newImage))
                    .stream().findFirst().orElse(null);
            dto.setUploadFileName(newFileName);
        }

        petProfileService.updatePet(petId, dto, user != null ? user.getUserId() : null);

        if (newFileName != null && oldFileName != null && !newFileName.equals(oldFileName)) {
            customFileUtil.deleteFiles(Collections.singletonList(oldFileName));
        }
        return ResponseEntity.ok().build();
    }

    /** 삭제 (기본 물리삭제; 소프트삭제 쓰려면 ServiceImpl에서 변경) */
    @DeleteMapping("/{petId}")
    public ResponseEntity<Void> deletePet(
            @PathVariable Long petId,
            @AuthenticationPrincipal UserInfoDTO user
    ) {
        petProfileService.deletePet(petId, user != null ? user.getUserId() : null);
        return ResponseEntity.ok().build();
    }

    /** 목록: pageable + 필터 */
    @GetMapping
    public ResponseEntity<Page<PetProfileListResponseDto>> list(
            Pageable pageable,
            @RequestParam(value = "petTypeId", required = false) Integer petTypeId,
            @RequestParam(value = "ownerId", required = false) Long ownerId,
            @RequestParam(value = "keyword", required = false) String keyword
    ) {
        return ResponseEntity.ok(
                petProfileService.getPetList(pageable, petTypeId, ownerId, keyword)
        );
    }
}
