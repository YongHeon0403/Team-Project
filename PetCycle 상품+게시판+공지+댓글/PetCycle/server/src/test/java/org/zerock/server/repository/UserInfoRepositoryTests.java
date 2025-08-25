package org.zerock.server.repository;

import org.junit.jupiter.api.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.annotation.Commit;
import org.springframework.transaction.annotation.Transactional;
import org.zerock.server.domain.user.UserInfo;
import org.zerock.server.domain.user.UserRole;
import org.zerock.server.repository.user.UserInfoRepository;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class UserInfoRepositoryTests {

    private static final Logger log = LoggerFactory.getLogger(UserInfoRepositoryTests.class);

    @Autowired
    private UserInfoRepository userInfoRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    @Commit
    void testInsertUserOne() {
        UserInfo userInfo = UserInfo.builder()
                .email("user99@email.com")
                .password(passwordEncoder.encode("9999"))
                .nickname("USER99")
                .phoneNumber("011-0000-0001")
                .region("Seoul")
                .isActive(true)
                .build();

        // 권한 부여: 편의 메서드 없이 enum 리스트에 직접 추가
        userInfo.getUserRoleList().add(UserRole.MANAGER);

        userInfoRepository.save(userInfo);
        log.info("사용자 정보 저장 완료: {}", userInfo.getEmail());
    }

    @Test
    @Transactional(readOnly = true)
    void testPasswordMatching() {
        log.info("비밀번호 매칭 테스트 시작");

        Optional<UserInfo> opt = userInfoRepository.findByEmail("user00@email.com");
        assertThat(opt).isPresent();

        UserInfo userInfo = opt.get();
        log.info("DB에서 조회된 사용자: {}", userInfo.getEmail());
        log.info("DB에 저장된 암호화된 비밀번호: {}", userInfo.getPassword());

        boolean matched = passwordEncoder.matches("1111", userInfo.getPassword());
        assertThat(matched).isTrue();

        log.info("비밀번호 매칭 결과: {}", matched);
    }
}
