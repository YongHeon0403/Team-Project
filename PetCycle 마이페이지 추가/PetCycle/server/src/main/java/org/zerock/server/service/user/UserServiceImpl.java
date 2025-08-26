package org.zerock.server.service.user;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.zerock.server.domain.user.UserInfo;
import org.zerock.server.dto.user.UserProfileResponseDto;
import org.zerock.server.dto.user.UserProfileUpdateRequestDto;
import org.zerock.server.repository.user.UserInfoRepository;

@Service
@Log4j2
@RequiredArgsConstructor
@Transactional
public class UserServiceImpl implements UserService {

    private final UserInfoRepository userInfoRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    @Override
    public UserProfileResponseDto getMyProfile(Long userId) {
        UserInfo user = userInfoRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        return UserProfileResponseDto.from(user);
    }

    @Override
    public UserProfileResponseDto updateMyProfile(Long userId, UserProfileUpdateRequestDto req) {
        UserInfo user = userInfoRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // 닉네임 중복 체크 (자기 자신 제외)
        if (req.getNickname() != null && !req.getNickname().isBlank()) {
            boolean exists = userInfoRepository.existsByNickname(req.getNickname());
            if (exists && !req.getNickname().equals(user.getNickname())) {
                throw new IllegalArgumentException("이미 사용 중인 닉네임입니다.");
            }
            user.setNickname(req.getNickname());
        }

        if (req.getRegion() != null) {
            user.setRegion(req.getRegion());
        }

        if (req.getPhoneNumber() != null) {
            user.setPhoneNumber(req.getPhoneNumber());
        }

        // 비밀번호 변경
        if (req.getNewPassword() != null && !req.getNewPassword().isBlank()) {
            if (req.getCurrentPassword() == null || req.getCurrentPassword().isBlank()) {
                throw new IllegalArgumentException("현재 비밀번호를 입력해주세요.");
            }
            if (!passwordEncoder.matches(req.getCurrentPassword(), user.getPassword())) {
                throw new IllegalArgumentException("현재 비밀번호가 일치하지 않습니다.");
            }
            user.setPassword(passwordEncoder.encode(req.getNewPassword()));
        }

        // 변경감지에 의해 저장됨
        return UserProfileResponseDto.from(user);
    }

    @Override
    public void deactivate(Long userId) {
        UserInfo user = userInfoRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        // Lombok boolean 필드명 isActive => setter 는 setActive(...) 형태
        user.setActive(false);
    }
}
