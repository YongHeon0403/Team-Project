package org.zerock.server.repository;

import lombok.extern.log4j.Log4j2;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.annotation.Commit;
import org.springframework.transaction.annotation.Transactional;
import org.zerock.server.domain.user.UserInfo;
import org.zerock.server.domain.user.UserRole;

import java.util.Collections;
import java.util.Optional;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;

@SpringBootTest
@Log4j2
public class UserInfoRepositoryTests {

    @Autowired
    private UserInfoRepository userInfoRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    @Commit
    public void testInsertUserOne(){
        UserInfo userInfo = UserInfo.builder()
                .email("user00@email.com")
                .password(passwordEncoder.encode("1111"))
                .nickname("USER00")
                .phoneNumber("000-0000-0000")
                .region("Seoul")
                .isActive(true)
                .build();

        userInfo.addRole(UserRole.MANAGER);

        userInfoRepository.save(userInfo);

        log.info("사용자 정보 저장 완료: " + userInfo.getEmail());
    }

    // 새로운 테스트: DB에 저장된 비밀번호가 '1111'과 매칭되는지 확인
    @Test
    @Transactional // 이 테스트는 DB를 변경하지 않고 조회만 하므로 롤백되도록 Transactional을 유지합니다.
    public void testPasswordMatching() {
        log.info("비밀번호 매칭 테스트 시작");

        // 1. 데이터베이스에서 'user00@email.com' 사용자 정보를 조회합니다.
        Optional<UserInfo> userInfoOptional = userInfoRepository.findByEmail("user00@email.com");

        // 2. 사용자가 존재하는지 확인합니다.
        assertThat(userInfoOptional).isPresent();
        UserInfo userInfo = userInfoOptional.get();
        log.info("DB에서 조회된 사용자: " + userInfo.getEmail());
        log.info("DB에 저장된 암호화된 비밀번호: " + userInfo.getPassword());

        // 3. 입력할 평문 비밀번호 '1111'과 DB에 저장된 암호화된 비밀번호를 비교합니다.
        boolean isMatched = passwordEncoder.matches("1111", userInfo.getPassword());

        // 4. 매칭 결과가 true인지 검증합니다.
        assertThat(isMatched).isTrue();
        log.info("비밀번호 매칭 결과: " + isMatched);

        log.info("비밀번호 매칭 테스트 완료");
    }
}
