package org.zerock.server.repository.user;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.zerock.server.domain.user.UserInfo;

import java.util.Optional;

public interface UserInfoRepository extends JpaRepository<UserInfo, Long> {
    Optional<UserInfo> findByEmail(String email);

    Optional<UserInfo> findByNickname(String nickname);
    boolean existsByEmail(String email);
    boolean existsByNickname(String nickname);
    boolean existsByPhoneNumber(String phoneNumber);

    // 사용자 정보와 함께 userRoleList를 즉시 로딩하는 쿼리
    // email로 UserInfo를 조회하면서 userRoleList를 EntityGraph로 함께 로딩
    @EntityGraph(attributePaths = {"userRoleList"}) // UserInfo 엔티티의 userRoleList 필드명과 일치해야함
    @Query("select u from UserInfo u where u.email = :email") // UserInfo 엔티티의 별칭을 u로 사용
    Optional<UserInfo> getWithRoles(@Param("email") String email); // 반환 타입을 Optional<UserInfo>로 변경하는 것이 안전
}