package org.zerock.server.service.pet;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.zerock.server.domain.pet.PetProfile;
import org.zerock.server.domain.pet.PetTypeCategory;
import org.zerock.server.domain.user.UserInfo;
import org.zerock.server.dto.pet.*;
import org.zerock.server.repository.pet.PetProfileRepository;
import org.zerock.server.repository.pet.PetTypeCategoryRepository;
import org.zerock.server.repository.user.UserInfoRepository;

@Service
@RequiredArgsConstructor
@Transactional
public class PetProfileServiceImpl implements PetProfileService {

    private final PetProfileRepository petProfileRepository;
    private final PetTypeCategoryRepository petTypeCategoryRepository;
    private final UserInfoRepository userInfoRepository;

    @Override
    public Long registerPet(PetProfileRegisterRequestDto dto, Long userId) {
        UserInfo user = userInfoRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자 없음"));

        PetTypeCategory type = null;
        if (dto.getPetTypeId() != null) {
            type = petTypeCategoryRepository.findById(dto.getPetTypeId())
                    .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 PetTypeId"));
        }

        // 연관관계는 setter로 넣는다(빌더 제외일 수 있음)
        PetProfile pet = PetProfile.builder()
                .name(dto.getName())
                .age(dto.getAge())
                .bodyType(dto.getBodyType())
                .breed(dto.getBreed())
                .profileImageUrl(dto.getUploadFileName())
                .content(dto.getContent())
                .build();

        pet.setUser(user);                  // 컬럼: user_id
        if (type != null) pet.setPetType(type); // 컬럼: pet_type_id

        return petProfileRepository.save(pet).getPetId();
    }

    @Override
    public void updatePet(Long petId, PetProfileUpdateRequestDto dto, Long userId) {
        PetProfile pet = petProfileRepository.findById(petId)
                .orElseThrow(() -> new IllegalArgumentException("펫 프로필 없음"));

        if (!pet.getUser().getUserId().equals(userId)) {
            throw new SecurityException("수정 권한 없음");
        }

        if (dto.getName() != null) pet.setName(dto.getName());
        if (dto.getAge() != null) pet.setAge(dto.getAge());
        if (dto.getBodyType() != null) pet.setBodyType(dto.getBodyType());
        if (dto.getBreed() != null) pet.setBreed(dto.getBreed());
        if (dto.getContent() != null) pet.setContent(dto.getContent());

        if (dto.getPetTypeId() != null) {
            PetTypeCategory type = petTypeCategoryRepository.findById(dto.getPetTypeId())
                    .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 PetTypeId"));
            pet.setPetType(type);
        }

        if (dto.getUploadFileName() != null) {
            pet.setProfileImageUrl(dto.getUploadFileName());
        }
        petProfileRepository.save(pet);
    }

    @Override
    public void deletePet(Long petId, Long userId) {
        PetProfile pet = petProfileRepository.findById(petId)
                .orElseThrow(() -> new IllegalArgumentException("펫 프로필 없음"));

        if (!pet.getUser().getUserId().equals(userId)) {
            throw new SecurityException("삭제 권한 없음");
        }
        petProfileRepository.delete(pet); // 소프트삭제 쓰면 여기를 변경
    }

    @Override
    @Transactional(readOnly = true)
    public PetProfileDetailResponseDto getPetDetail(Long petId, UserDetails userDetails) {
        PetProfile pet = petProfileRepository.findById(petId)
                .orElseThrow(() -> new IllegalArgumentException("펫 프로필 없음"));
        return toDetailDto(pet);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PetProfileListResponseDto> getPetList(Pageable pageable, Integer petTypeId, Long ownerId, String keyword) {
        if (petTypeId != null) {
            return petProfileRepository.findAllByPetType_PetTypeId(petTypeId, pageable)
                    .map(this::toListDto);
        }
        if (ownerId != null) {
            return petProfileRepository.findAllByUser_UserId(ownerId, pageable)
                    .map(this::toListDto);
        }
        if (keyword != null && !keyword.isBlank()) {
            return petProfileRepository.findAllByNameContaining(keyword, pageable)
                    .map(this::toListDto);
        }
        return petProfileRepository.findAll(pageable).map(this::toListDto);
    }

    private PetProfileListResponseDto toListDto(PetProfile pet) {
        return PetProfileListResponseDto.builder()
                .petId(pet.getPetId())
                .name(pet.getName())
                .breed(pet.getBreed())
                .typeName(pet.getPetType() != null ? pet.getPetType().getTypeName() : null)
                .profileImageUrl(pet.getProfileImageUrl())
                .build();
    }

    private PetProfileDetailResponseDto toDetailDto(PetProfile pet) {
        Integer petTypeId = pet.getPetType() != null ? pet.getPetType().getPetTypeId() : null;
        String typeName = pet.getPetType() != null ? pet.getPetType().getTypeName() : null;

        return PetProfileDetailResponseDto.builder()
                .petId(pet.getPetId())
                .ownerId(pet.getUser() != null ? pet.getUser().getUserId() : null)
                .name(pet.getName())
                .age(pet.getAge())
                .bodyType(pet.getBodyType())
                .breed(pet.getBreed())
                .petTypeId(petTypeId)
                .typeName(typeName)
                .profileImageUrl(pet.getProfileImageUrl())
                .content(pet.getContent())
                .build();
    }
}
